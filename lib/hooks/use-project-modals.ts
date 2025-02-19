import { useState } from 'react';
import { Task, ProjectMember } from '@/types';

export function useProjectModals(tasks: Task[]) {
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [selectedMember, setSelectedMember] = useState<ProjectMember | null>(null);

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

  const closeTaskModal = () => {
    setIsTaskModalOpen(false);
    setSelectedTask(null);
  };

  const closeMemberModal = () => {
    setIsMemberModalOpen(false);
    setSelectedMember(null);
  };

  return {
    // Modal states
    isTaskModalOpen,
    isProjectModalOpen,
    isMemberModalOpen,
    isDeleteModalOpen,
    selectedTask,
    selectedMember,

    // Setters
    setIsTaskModalOpen,
    setIsProjectModalOpen,
    setIsMemberModalOpen,
    setIsDeleteModalOpen,

    // Handlers
    handleTaskClick,
    handleMemberClick,
    closeTaskModal,
    closeMemberModal
  };
} 