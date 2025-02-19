'use client';

import { createClient } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/hooks/use-auth';
import { Project, DatabaseError } from '@/types/project';
import { ProjectHeader } from '@/components/project/project-header';
import { ProjectList } from '@/components/project/project-list';

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
        <ProjectHeader projectCount={projects.length} />
        <ProjectList projects={projects} />
      </div>
    </div>
  );
}