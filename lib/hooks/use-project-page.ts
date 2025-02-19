import { useAuth } from '@/lib/hooks/use-auth';
import { useParams } from 'next/navigation';
import { useProjectPermissions } from '@/lib/hooks/use-project-permissions';
import { useProjectDetails } from '@/lib/hooks/use-project-details';
import { useProjectModals } from '@/lib/hooks/use-project-modals';

export function useProjectPage() {
  const params = useParams();
  const { user } = useAuth();
  const { permissions, role } = useProjectPermissions(params.id as string, user?.id || '');

  const {
    project,
    tasks,
    members,
    loading,
    error,
    deleteLoading,
    handleTaskMove,
    handleProjectDelete,
    fetchProjectDetails
  } = useProjectDetails(params.id as string);

  const {
    isTaskModalOpen,
    isProjectModalOpen,
    isMemberModalOpen,
    isDeleteModalOpen,
    selectedTask,
    selectedMember,
    setIsTaskModalOpen,
    setIsProjectModalOpen,
    setIsDeleteModalOpen,
    handleTaskClick,
    handleMemberClick,
    closeTaskModal,
    closeMemberModal
  } = useProjectModals(tasks);

  const headerProps = {
    project,
    permissions: {
      canCreateTasks: permissions?.canCreateTasks || false,
      canEditProject: permissions?.canEditProject || false,
      canDeleteProject: permissions?.canDeleteProject || false
    },
    onNewTask: () => setIsTaskModalOpen(true),
    onEditProject: () => setIsProjectModalOpen(true),
    onDeleteProject: () => setIsDeleteModalOpen(true)
  };

  const contentProps = {
    projectId: params.id as string,
    tasks,
    members,
    onTaskMove: handleTaskMove,
    onTaskClick: handleTaskClick,
    onMemberClick: handleMemberClick,
    permissions: {
      canManageMembers: permissions?.canManageMembers || false
    }
  };

  const modalProps = {
    // Task Modal Props
    isTaskModalOpen,
    onTaskModalClose: closeTaskModal,
    selectedTask,
    projectId: params.id as string,
    projectMembers: members,
    onTaskSuccess: fetchProjectDetails,
    taskPermissions: {
      canEditTask: permissions?.canEditTasks || false,
      canDeleteTask: permissions?.canDeleteTasks || false,
      canAssignTasks: permissions?.canAssignTasks || false
    },

    // Project Modal Props
    isProjectModalOpen,
    onProjectModalClose: () => setIsProjectModalOpen(false),
    project,
    onProjectSuccess: fetchProjectDetails,

    // Member Modal Props
    isMemberModalOpen,
    onMemberModalClose: closeMemberModal,
    selectedMember,
    onMemberSuccess: fetchProjectDetails,
    userRole: role,

    // Delete Modal Props
    isDeleteModalOpen,
    onDeleteModalClose: () => setIsDeleteModalOpen(false),
    onProjectDelete: handleProjectDelete,
    deleteLoading
  };

  return {
    loading,
    error,
    headerProps,
    contentProps,
    modalProps
  };
} 