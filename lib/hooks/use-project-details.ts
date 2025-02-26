import { useState, useCallback, useEffect } from 'react';
import { Project, ProjectMember } from '@/types/project';
import { Task, TaskStatus } from '@/types/task';
import { ProjectService } from '@/lib/services/project-service';
import { RealtimeService } from '@/lib/services/realtime-service';
import { RealtimeTaskPayload, RealtimeMemberPayload, RealtimeProjectPayload } from '@/types/realtime';
import { useRouter } from 'next/navigation';

export function useProjectDetails(projectId: string) {
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchProjectDetails = useCallback(async () => {
    try {
      const { project: projectData, tasks: tasksData, members: membersData } = 
        await ProjectService.getProjectDetails(projectId);

      setProject(projectData);
      setTasks(tasksData);
      setMembers(membersData);
      setLoading(false);
    } catch (err) {
      console.error('Beklenmeyen hata:', err);
      setError('Beklenmeyen bir hata oluştu.');
      setLoading(false);
    }
  }, [projectId]);

  const handleTaskMove = async (taskId: string, newStatus: TaskStatus) => {
    try {
      await ProjectService.updateTaskStatus(taskId, newStatus, projectId);
      setTasks(tasks.map(task =>
        task.id === taskId ? { ...task, status: newStatus } : task
      ));
    } catch (error) {
      console.error('Error moving task:', error);
    }
  };

  const handleProjectDelete = async () => {
    if (!project) return;
    setDeleteLoading(true);

    try {
      await ProjectService.deleteProject(project.id);
      router.push('/dashboard');
    } catch (err) {
      console.error('Proje silme hatası:', err);
      setError('Proje silinirken bir hata oluştu.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleRealtimeTaskUpdate = useCallback((payload: RealtimeTaskPayload) => {
    if (payload.eventType === 'INSERT') {
      setTasks(prev => [...prev, payload.new]);
    } else if (payload.eventType === 'UPDATE') {
      setTasks(prev => prev.map(task => 
        task.id === payload.new.id ? payload.new : task
      ));
    } else if (payload.eventType === 'DELETE') {
      setTasks(prev => prev.filter(task => task.id !== payload.old.id));
    }
  }, []);

  const handleRealtimeMemberUpdate = useCallback((payload: RealtimeMemberPayload) => {
    if (payload.eventType === 'INSERT') {
      setMembers(prev => [...prev, payload.new]);
    } else if (payload.eventType === 'UPDATE') {
      setMembers(prev => prev.map(member => 
        member.id === payload.new.id ? payload.new : member
      ));
    } else if (payload.eventType === 'DELETE') {
      setMembers(prev => prev.filter(member => member.id !== payload.old.id));
    }
  }, []);

  const handleRealtimeProjectUpdate = useCallback((payload: RealtimeProjectPayload) => {
    if ((payload.eventType === 'UPDATE' || payload.eventType === 'INSERT') && payload.new) {
      setProject(payload.new);
    }
  }, []);

  useEffect(() => {
    fetchProjectDetails();
  }, [fetchProjectDetails]);

  useEffect(() => {
    const cleanup = RealtimeService.subscribeToProjectUpdates(
      projectId,
      handleRealtimeTaskUpdate,
      handleRealtimeMemberUpdate,
      handleRealtimeProjectUpdate
    );

    return cleanup;
  }, [projectId, handleRealtimeTaskUpdate, handleRealtimeMemberUpdate, handleRealtimeProjectUpdate]);

  return {
    project,
    tasks,
    members,
    loading,
    error,
    deleteLoading,
    handleTaskMove,
    handleProjectDelete,
    fetchProjectDetails
  };
} 