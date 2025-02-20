import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';


// This is the callback route for the OAuth flow.
// It exchanges the code for a session and redirects to the dashboard.
export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (code) {

    // Create a new Supabase client with the cookies from the request
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: { path?: string; expires?: Date; maxAge?: number; domain?: string; secure?: boolean; sameSite?: boolean | 'lax' | 'strict' | 'none' }) {
            cookieStore.set({ name, value, ...options });
          },
          remove(name: string, options: { path?: string; domain?: string }) {
            cookieStore.set({ name, value: '', ...options });
          },
        },
      }
    );
    // Exchange the code for a session
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Redirect to the dashboard
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }
// If there is no code, redirect to the login page
  return NextResponse.redirect(new URL('/auth/login', request.url));
}