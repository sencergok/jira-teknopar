import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value: '',
            ...options,
          });
        },
      },
    }
  );

  const { data: { session } } = await supabase.auth.getSession();

  // Kullanıcı oturum açmışsa ve users tablosunda kaydı yoksa oluştur
  if (session?.user) {
    try {
      // Önce kullanıcının varlığını kontrol et
      const { data: existingUser, error: userCheckError } = await supabase
        .from('users')
        .select('id')
        .eq('id', session.user.id)
        .maybeSingle();

      if (userCheckError) {
        console.error('Kullanıcı kontrolü hatası:', userCheckError);
      } else if (!existingUser) {
        // E-posta kontrolü yap
        const { data: emailCheck, error: emailCheckError } = await supabase
          .from('users')
          .select('id')
          .eq('email', session.user.email)
          .maybeSingle();

        if (emailCheckError) {
          console.error('E-posta kontrolü hatası:', emailCheckError);
        } else if (!emailCheck) {
          // Kullanıcıyı oluştur
          const { error: createError } = await supabase
            .from('users')
            .insert([{
              id: session.user.id,
              email: session.user.email,
              name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0],
              avatar_url: session.user.user_metadata?.avatar_url,
            }]);

          if (createError) {
            console.error('Kullanıcı oluşturma hatası:', createError);
          }
        }
      }
    } catch (error) {
      console.error('Kullanıcı işlemi hatası:', error);
    }
  }

  // Auth koruması gereken rotalar
  if (!session && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  // Giriş yapmış kullanıcılar auth sayfalarına erişemez
  if (session && (request.nextUrl.pathname.startsWith('/auth'))) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}; 