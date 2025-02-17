'use client';

import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/hooks/use-auth';

type Project = {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  created_by_id: string;
  project_members?: { user_id: string }[];
};

interface DatabaseError {
  message: string;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      if (!user) {
        setError('Oturum bulunamadı. Lütfen tekrar giriş yapın.');
        setLoading(false);
        return;
      }

      try {
        const supabase = createClient();
        const { data: memberProjects, error: memberError } = await supabase
          .from('project_members')
          .select('project_id')
          .eq('user_id', user.id);

        if (memberError) {
          throw memberError;
        }

        const projectIds = memberProjects?.map((p: { project_id: string }) => p.project_id) || [];

        const { data, error: projectError } = await supabase
          .from('projects')
          .select(`
            id,
            name,
            description,
            created_at,
            created_by_id,
            project_members!inner (
              user_id
            )
          `)
          .or(`id.in.(${projectIds.join(',')}),created_by_id.eq.${user.id}`)
          .order('created_at', { ascending: false });

        if (projectError) {
          throw projectError;
        }

        setProjects(data || []);
      } catch (err: unknown) {
        const error = err as DatabaseError;
        console.error('Beklenmeyen hata:', error);
        setError('Projeler yüklenirken bir hata oluştu');
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-8">
            <div className="h-12 w-48 bg-gray-200 rounded-lg"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl p-6 border border-gray-100">
                  <div className="h-6 w-2/3 bg-gray-200 rounded mb-4"></div>
                  <div className="h-4 w-full bg-gray-100 rounded mb-2"></div>
                  <div className="h-4 w-3/4 bg-gray-100 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-rose-50 border border-rose-200 rounded-xl p-6">
            <div className="flex items-center gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-rose-500">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
              </svg>
              <h3 className="text-lg font-semibold text-rose-700">Hata</h3>
            </div>
            <p className="mt-2 text-rose-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
              Projelerim
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              Toplam {projects.length} proje
            </p>
          </div>
          <Link
            href="/dashboard/projects/new"
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
              <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
            </svg>
            Yeni Proje
          </Link>
        </div>

        {projects.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="px-4 py-12 sm:px-6 text-center">
              <svg
                className="mx-auto h-16 w-16 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                  d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                />
              </svg>
              <h3 className="mt-4 text-lg font-medium text-gray-900">Henüz proje yok</h3>
              <p className="mt-2 text-sm text-gray-500 max-w-sm mx-auto">
                Yeni bir proje oluşturarak takımınızla birlikte çalışmaya başlayın.
              </p>
              <div className="mt-6">
                <Link
                  href="/dashboard/projects/new"
                  className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                    <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
                  </svg>
                  Yeni Proje Oluştur
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <Link
                key={project.id}
                href={`/dashboard/projects/${project.id}`}
                className="group bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md hover:border-gray-200 transition-all"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="h-12 w-12 rounded-lg bg-indigo-600 flex items-center justify-center group-hover:bg-indigo-500 transition-colors">
                    <span className="text-xl font-bold text-white">
                      {project.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="inline-flex items-center rounded-md bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-700 ring-1 ring-inset ring-indigo-700/10">
                    {project.project_members?.length || 0} üye
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                  {project.name}
                </h3>
                <p className="mt-2 text-sm text-gray-500 line-clamp-2">
                  {project.description || 'Açıklama eklenmemiş'}
                </p>
                <div className="mt-4 flex items-center text-sm text-gray-500">
                  <svg className="mr-1.5 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.75 2a.75.75 0 01.75.75V4h7V2.75a.75.75 0 011.5 0V4h.25A2.75 2.75 0 0118 6.75v8.5A2.75 2.75 0 0115.25 18H4.75A2.75 2.75 0 012 15.25v-8.5A2.75 2.75 0 014.75 4H5V2.75A.75.75 0 015.75 2zm-1 5.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h10.5c.69 0 1.25-.56 1.25-1.25v-6.5c0-.69-.56-1.25-1.25-1.25H4.75z" clipRule="evenodd" />
                  </svg>
                  {new Date(project.created_at).toLocaleDateString('tr-TR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}