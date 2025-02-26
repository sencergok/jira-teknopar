import { useEffect } from 'react';
import { RealtimeService } from '@/lib/services/realtime-service';
import { RealtimeTaskPayload, RealtimeMemberPayload, RealtimeProjectPayload } from '@/types/realtime';

// Enhanced realtime - Handles all CRUD events
// payloadHandler - Processes INSERT/UPDATE/DELETE
// taskSync - Maintains UI consistency

export function useRealtimeSubscription(
  projectId: string,
  onTaskUpdate: (payload: RealtimeTaskPayload) => void,
  onMemberUpdate: (payload: RealtimeMemberPayload) => void,
  onProjectUpdate: (payload: RealtimeProjectPayload) => void
) {
  useEffect(() => {
    const cleanup = RealtimeService.subscribeToProjectUpdates(
      projectId,
      onTaskUpdate,
      onMemberUpdate,
      onProjectUpdate
    );

    return cleanup;
  }, [projectId, onTaskUpdate, onMemberUpdate, onProjectUpdate]);
} 