import { createClient } from '@/lib/supabase/client';
import { Task } from '@/types/task';
import { ProjectMember, Project } from '@/types/project';
import { RealtimeTaskPayload, RealtimeMemberPayload, RealtimeProjectPayload, SupabaseRealtimePayload } from '@/types/realtime';

export class RealtimeService {
  private static supabase = createClient();

  static subscribeToProjectUpdates(
    projectId: string,
    onTaskUpdate: (payload: RealtimeTaskPayload) => void,
    onMemberUpdate: (payload: RealtimeMemberPayload) => void,
    onProjectUpdate: (payload: RealtimeProjectPayload) => void
  ) {
    const taskSubscription = this.supabase
      .channel('tasks')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks',
          filter: `project_id=eq.${projectId}`
        },
        (payload: SupabaseRealtimePayload<Task>) => {
          onTaskUpdate({
            eventType: payload.eventType,
            new: payload.new,
            old: payload.old
          });
        }
      )
      .subscribe();

    const memberSubscription = this.supabase
      .channel('members')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'project_members',
          filter: `project_id=eq.${projectId}`
        },
        (payload: SupabaseRealtimePayload<ProjectMember>) => {
          onMemberUpdate({
            eventType: payload.eventType,
            new: payload.new,
            old: payload.old
          });
        }
      )
      .subscribe();
      
    // Proje güncellemeleri için yeni kanal
    const projectSubscription = this.supabase
      .channel('project')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'projects',
          filter: `id=eq.${projectId}`
        },
        (payload: SupabaseRealtimePayload<Project>) => {
          onProjectUpdate({
            eventType: payload.eventType,
            new: payload.new,
            old: payload.old
          });
        }
      )
      .subscribe();

    return () => {
      this.supabase.removeChannel(taskSubscription);
      this.supabase.removeChannel(memberSubscription);
      this.supabase.removeChannel(projectSubscription);
    };
  }
} 