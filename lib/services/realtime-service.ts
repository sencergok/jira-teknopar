import { createClient } from '@/lib/supabase/client';
import { Task, TaskStatus } from '@/types/task';
import { ProjectMember } from '@/types/project';
import { RealtimeTaskPayload, RealtimeMemberPayload, SupabaseRealtimePayload } from '@/types/realtime';

export class RealtimeService {
  private static supabase = createClient();

  static subscribeToProjectUpdates(
    projectId: string,
    onTaskUpdate: (payload: RealtimeTaskPayload) => void,
    onMemberUpdate: (payload: RealtimeMemberPayload) => void
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

    return () => {
      this.supabase.removeChannel(taskSubscription);
      this.supabase.removeChannel(memberSubscription);
    };
  }
} 