'use client';

import { useAuth } from '@/lib/hooks/use-auth';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function NewProjectPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!user) {
      setError('Oturum bulunamadı. Lütfen tekrar giriş yapın.');
      setLoading(false);
      return;
    }

    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;

    try {
      const supabase = createClient();

      // Önce oturumu kontrol edelim
      const { data: { session }, error: authError } = await supabase.auth.getSession();
      if (authError) {
        console.error('Auth hatası:', authError);
        setError('Oturum bilgisi alınamadı: ' + authError.message);
        return;
      }

      if (!session) {
        setError('Aktif oturum bulunamadı. Lütfen tekrar giriş yapın.');
        return;
      }

      console.log('Kullanıcı ID:', user.id);
      console.log('Session User ID:', session.user.id);

      // Önce kullanıcının varlığını kontrol edelim
      const { data: existingUser, error: userCheckError } = await supabase
        .from('users')
        .select('id')
        .eq('id', session.user.id)
        .maybeSingle();

      if (userCheckError) {
        console.error('Kullanıcı kontrolü hatası:', userCheckError);
        setError('Kullanıcı kontrolü yapılırken hata oluştu.');
        return;
      }

      // Kullanıcı yoksa, e-posta kontrolü yapalım
      if (!existingUser) {
        const { data: emailCheck, error: emailCheckError } = await supabase
          .from('users')
          .select('id')
          .eq('email', session.user.email)
          .maybeSingle();

        if (emailCheckError) {
          console.error('E-posta kontrolü hatası:', emailCheckError);
          setError('Kullanıcı kontrolü yapılırken hata oluştu.');
          return;
        }

        // E-posta ile kayıtlı kullanıcı varsa, hata ver
        if (emailCheck) {
          setError('Bu e-posta adresi ile kayıtlı başka bir kullanıcı bulunmaktadır.');
          return;
        }

        // Yeni kullanıcı oluştur
        const { error: userInsertError } = await supabase
          .from('users')
          .insert([{
            id: session.user.id,
            email: session.user.email,
            name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0],
            avatar_url: session.user.user_metadata?.avatar_url,
          }]);

        if (userInsertError) {
          console.error('Kullanıcı oluşturma hatası:', userInsertError);
          setError('Kullanıcı oluşturulurken hata: ' + userInsertError.message);
          return;
        }
      }

      // Projeyi oluşturalım
      const { data: projectData, error: insertError } = await supabase
        .from('projects')
        .insert([
          {
            name,
            description,
            created_by_id: session.user.id,
          },
        ])
        .select()
        .single();

      console.log('Oluşturulan proje için created_by_id:', session.user.id);

      if (insertError) {
        console.error('Proje oluşturma hatası:', insertError);
        setError('Proje oluşturulurken hata: ' + insertError.message);
        return;
      }

      if (!projectData) {
        setError('Proje oluşturuldu fakat veri alınamadı.');
        return;
      }

      // Proje üyesi olarak ekleyelim
      const { error: memberError } = await supabase
        .from('project_members')
        .insert([
          {
            project_id: projectData.id,
            user_id: session.user.id,
            role: 'OWNER',
          },
        ]);

      if (memberError) {
        console.error('Proje üyesi ekleme hatası:', memberError);
        setError('Proje üyesi eklenirken hata: ' + memberError.message);
        return;
      }

      // Görev oluşturma işlemi
      const {error: taskError } = await supabase
        .from('tasks')
        .insert([
          {
            title: 'Görev Başlığı',
            description: 'Görev Açıklaması',
            created_by_id: session.user.id,
            project_id: projectData.id,
            status: 'todo',
            priority: 'medium',
            task_order: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (taskError) {
        console.error('Görev oluşturma hatası:', taskError);
        setError('Görev oluşturulurken hata: ' + taskError.message);
        return;
      }

      router.push('/dashboard');
      router.refresh();
    } catch (error) {
      console.error("Görev oluşturma hatası:", error);
      if (error instanceof Error) {
        setError('Hata: ' + error.message);
      } else {
        setError('Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.');
      }
      // Hata nesnesinin detaylarını konsola yazdır
      console.error("Hata detayları:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="py-6">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Oturum bulunamadı. Lütfen tekrar giriş yapın.
                </h3>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-6">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-sm rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="md:flex md:items-center md:justify-between md:space-x-4 xl:border-b xl:pb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Yeni Proje</h2>
                <p className="mt-2 text-sm text-gray-500">
                  Yeni bir proje oluşturun ve takımınızla çalışmaya başlayın.
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="mt-6 space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Proje Adı
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="name"
                    id="name"
                    required
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    placeholder="Örn: Web Sitesi Yenileme"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Açıklama
                </label>
                <div className="mt-1">
                  <textarea
                    id="description"
                    name="description"
                    rows={4}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    placeholder="Proje hakkında kısa bir açıklama yazın..."
                  />
                </div>
              </div>

              {error && (
                <div className="rounded-md bg-red-50 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">{error}</h3>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Oluşturuluyor...' : 'Proje Oluştur'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
} 