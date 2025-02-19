import { useEffect } from 'react';
import { TaskStatus } from '@/types';
import { RealtimeService } from '@/lib/services/realtime-service';

export function useRealtimeSubscription(
  projectId: string,
  onTaskMove: (taskId: string, newStatus: TaskStatus) => void,
  onMemberUpdate?: () => void
) {
  useEffect(() => {
    const cleanup = RealtimeService.subscribeToProjectUpdates(
      projectId,
      (payload) => {
        if (payload.eventType === 'UPDATE' && payload.new && payload.new.id) {
          onTaskMove(payload.new.id, payload.new.status);
        } else if (payload.eventType === 'DELETE' && payload.old && payload.old.id) {
          onTaskMove(payload.old.id, payload.old.status);
        } else if (payload.eventType === 'INSERT' && payload.new && payload.new.id) {
          onTaskMove(payload.new.id, payload.new.status);
        }
      },
      onMemberUpdate || (() => {})
    );

    return () => cleanup();
  }, [projectId, onTaskMove, onMemberUpdate]);
} 