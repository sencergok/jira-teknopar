'use client';

import { useAuth } from '@/lib/hooks/use-auth';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { useProjectPermissions } from '@/lib/hooks/use-project-permissions';
import { Task, TaskStatus } from '@/types';
import { Project, ProjectMember } from '@/types';
import { ProjectService } from '@/lib/services/project-service';
import { RealtimeService } from '@/lib/services/realtime-service';
import { RealtimeTaskPayload, RealtimeMemberPayload } from '@/types/realtime';
import { ProjectHeader } from '../../../../views/views/projects-header';
import { ProjectContent } from '../../../../views/views/project-content';
import { ProjectModals } from '../../../../views/views/modals';
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function ProjectDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [selectedMember, setSelectedMember] = useState<ProjectMember | null>(null);
  const { permissions } = useProjectPermissions(params.id as string, user?.id || '');

  const fetchProjectDetails = useCallback(async () => {
    try {
      const { project: projectData, tasks: tasksData, members: membersData } = 
        await ProjectService.getProjectDetails(params.id as string);

      setProject(projectData);
      setTasks(tasksData);
      setMembers(membersData);
      setLoading(false);
    } catch (err) {
      console.error('Beklenmeyen hata:', err);
      setError('Beklenmeyen bir hata oluştu.');
      setLoading(false);
    }
  }, [params.id]);

  const handleTaskMove = async (taskId: string, newStatus: TaskStatus) => {
    try {
      await ProjectService.updateTaskStatus(taskId, newStatus, params.id as string);
      setTasks(tasks.map(task =>
        task.id === taskId ? { ...task, status: newStatus } : task
      ));
    } catch (error) {
      console.error('Error moving task:', error);
    }
  };

  const handleTaskClick = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      setSelectedTask(task);
      setIsTaskModalOpen(true);
    }
  };

  const handleMemberClick = (member: ProjectMember | null) => {
    setSelectedMember(member);
    setIsMemberModalOpen(true);
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
      setIsDeleteModalOpen(false);
    }
  };

  useEffect(() => {
    fetchProjectDetails();
  }, [fetchProjectDetails]);

  useEffect(() => {
    const cleanup = RealtimeService.subscribeToProjectUpdates(
      params.id as string,
      handleRealtimeTaskUpdate,
      handleRealtimeMemberUpdate
    );

    return () => {
      cleanup();
    };
  }, [params.id, handleRealtimeTaskUpdate, handleRealtimeMemberUpdate]);

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-8">
      <div className="max-w-7xl mx-auto">
        <Card className="w-full">
          <CardHeader>
            <div className="space-y-2 animate-pulse">
              <div className="h-6 w-1/4 bg-gray-200 rounded"></div>
              <div className="h-4 w-1/2 bg-gray-100 rounded"></div>
            </div>
          </CardHeader>
        </Card>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-8">
      <div className="max-w-7xl mx-auto">
        <Card className="w-full border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-700">Hata</CardTitle>
            <CardDescription className="text-red-600">{error}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <ProjectHeader
          project={project}
          permissions={{
            canCreateTasks: permissions?.canCreateTasks || false,
            canEditProject: permissions?.canEditProject || false,
            canDeleteProject: permissions?.canDeleteProject || false
          }}
          onNewTask={() => setIsTaskModalOpen(true)}
          onEditProject={() => setIsProjectModalOpen(true)}
          onDeleteProject={() => setIsDeleteModalOpen(true)}
        />

        <ProjectContent
          projectId={params.id as string}
          tasks={tasks}
          members={members}
          onTaskMove={handleTaskMove}
          onTaskClick={handleTaskClick}
          onMemberClick={handleMemberClick}
          permissions={{
            canManageMembers: permissions?.canManageMembers || false
          }}
        />

        <ProjectModals
          // Task Modal Props
          isTaskModalOpen={isTaskModalOpen}
          onTaskModalClose={() => {
            setIsTaskModalOpen(false);
            setSelectedTask(null);
          }}
          selectedTask={selectedTask}
          projectId={params.id as string}
          projectMembers={members}
          onTaskSuccess={fetchProjectDetails}
          taskPermissions={{
            canEditTask: permissions?.canEditTasks || false,
            canDeleteTask: permissions?.canDeleteTasks || false,
            canAssignTasks: permissions?.canAssignTasks || false
          }}

          // Project Modal Props
          isProjectModalOpen={isProjectModalOpen}
          onProjectModalClose={() => setIsProjectModalOpen(false)}
          project={project}
          onProjectSuccess={fetchProjectDetails}

          // Member Modal Props
          isMemberModalOpen={isMemberModalOpen}
          onMemberModalClose={() => {
            setIsMemberModalOpen(false);
            setSelectedMember(null);
          }}
          selectedMember={selectedMember}
          onMemberSuccess={fetchProjectDetails}

          // Delete Modal Props
          isDeleteModalOpen={isDeleteModalOpen}
          onDeleteModalClose={() => setIsDeleteModalOpen(false)}
          onProjectDelete={handleProjectDelete}
          deleteLoading={deleteLoading}
        />
      </div>
    </div>
  );
}