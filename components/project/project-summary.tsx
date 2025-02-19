import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';

type ProjectSummaryProps = {
  projectId: string;
};

type Task = {
  status: string;
  priority: string;
};

type ProjectMetrics = {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  todoTasks: number;
  inReviewTasks: number;
  totalMembers: number;
  tasksByPriority: {
    high: number;
    medium: number;
    low: number;
  };
};

type PayloadType = {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  new: Task;
  old: Task;
};

export function ProjectSummary({ projectId }: ProjectSummaryProps) {
  const [metrics, setMetrics] = useState<ProjectMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchMetrics = useCallback(async () => {
    const supabase = createClient();

    try {
      // Görev sayıları
      const { data: taskCounts, error: taskError } = await supabase
        .from('tasks')
        .select('status, priority')
        .eq('project_id', projectId);

      if (taskError) throw taskError;

      // Üye sayısı
      const { count: memberCount, error: memberError } = await supabase
        .from('project_members')
        .select('*', { count: 'exact' })
        .eq('project_id', projectId);

      if (memberError) throw memberError;

      // Metrikleri hesapla
      const newMetrics: ProjectMetrics = {
        totalTasks: taskCounts?.length || 0,
        completedTasks: taskCounts?.filter((t: Task) => t.status === 'done').length || 0,
        inProgressTasks: taskCounts?.filter((t: Task) => t.status === 'in_progress').length || 0,
        todoTasks: taskCounts?.filter((t: Task) => t.status === 'todo').length || 0,
        inReviewTasks: taskCounts?.filter((t: Task) => t.status === 'in_review').length || 0,
        totalMembers: memberCount || 0,
        tasksByPriority: {
          high: taskCounts?.filter((t: Task) => t.priority === 'high').length || 0,
          medium: taskCounts?.filter((t: Task) => t.priority === 'medium').length || 0,
          low: taskCounts?.filter((t: Task) => t.priority === 'low').length || 0,
        },
      };

      setMetrics(newMetrics);
    } catch (error) {
      console.error('Metrikler alınırken hata:', error);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchMetrics();

    const supabase = createClient();

    // Tasks kanalı
    const tasksChannel = supabase.channel(`project-${projectId}-summary-tasks`)
      .on('postgres_changes', 
        { 
          event: '*',
          schema: 'public',
          table: 'tasks',
          filter: `project_id=eq.${projectId}`
        },
        (payload: PayloadType) => {
          console.log('Task değişikliği algılandı:', payload.eventType, {
            eski: payload.old?.status,
            yeni: payload.new?.status
          });
          fetchMetrics();
        }
      )
      .subscribe();

    // Members kanalı
    const membersChannel = supabase.channel(`project-${projectId}-summary-members`)
      .on('postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'project_members',
          filter: `project_id=eq.${projectId}`
        },
        () => {
          console.log('Üye değişikliği algılandı, metrikler güncelleniyor...');
          fetchMetrics();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(tasksChannel);
      supabase.removeChannel(membersChannel);
    };
  }, [projectId, fetchMetrics]);

  if (loading) {
    return (
      <div className="bg-white/50 backdrop-blur-sm shadow-lg rounded-lg p-6 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-20 bg-gray-100 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!metrics) return null;

  const completionRate = ((metrics.completedTasks / metrics.totalTasks) * 100) || 0;

  return (
    <div className="space-y-6">
      {/* Özet Kartları */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Toplam Görev */}
        <div className="bg-white/50 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-200 rounded-lg p-4">
          <div className="text-sm font-medium text-primary">Toplam Görev</div>
          <div className="mt-2 text-3xl font-semibold text-gray-900">
            {metrics.totalTasks}
          </div>
        </div>

        {/* Tamamlanma Oranı */}
        <div className="bg-white/50 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-200 rounded-lg p-4">
          <div className="text-sm font-medium text-primary">Tamamlanma Oranı</div>
          <div className="mt-2 text-3xl font-semibold text-gray-900">
            {completionRate.toFixed(1)}%
          </div>
        </div>

        {/* Aktif Görevler */}
        <div className="bg-white/50 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-200 rounded-lg p-4">
          <div className="text-sm font-medium text-primary">Devam Eden</div>
          <div className="mt-2 text-3xl font-semibold text-gray-900">
            {metrics.inProgressTasks}
          </div>
        </div>

        {/* Toplam Üye */}
        <div className="bg-white/50 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-200 rounded-lg p-4">
          <div className="text-sm font-medium text-primary">Toplam Üye</div>
          <div className="mt-2 text-3xl font-semibold text-gray-900">
            {metrics.totalMembers}
          </div>
        </div>
      </div>

      {/* Detaylı İstatistikler */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Görev Durumları */}
        <div className="bg-white/50 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-200 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-gray-900 mb-3">Görev Durumları</h4>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Yapılacak</span>
              <span className="text-sm font-medium text-gray-900">{metrics.todoTasks}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Devam Ediyor</span>
              <span className="text-sm font-medium text-gray-900">{metrics.inProgressTasks}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">İncelemede</span>
              <span className="text-sm font-medium text-gray-900">{metrics.inReviewTasks}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Tamamlandı</span>
              <span className="text-sm font-medium text-gray-900">{metrics.completedTasks}</span>
            </div>
          </div>
        </div>

        {/* Öncelik Dağılımı */}
        <div className="bg-white/50 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-200 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-gray-900 mb-3">Öncelik Dağılımı</h4>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-red-600">Yüksek</span>
              <span className="text-sm font-medium text-red-600">{metrics.tasksByPriority.high}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-yellow-600">Orta</span>
              <span className="text-sm font-medium text-yellow-600">{metrics.tasksByPriority.medium}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-green-600">Düşük</span>
              <span className="text-sm font-medium text-green-600">{metrics.tasksByPriority.low}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}