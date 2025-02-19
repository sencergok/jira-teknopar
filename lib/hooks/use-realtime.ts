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
        if (payload.eventType === 'UPDATE' && payload.new.status) {
          onTaskMove(payload.new.id, payload.new.status);
        }
      },
      onMemberUpdate || (() => {})
    );

    return () => cleanup();
  }, [projectId, onTaskMove, onMemberUpdate]);
} 