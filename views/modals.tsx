import { TaskModal } from '@/components/modals/task-modal';
import { ProjectModal } from '@/components/modals/project-modal';
import { MemberModal } from '@/components/modals/member-modal';
import { ConfirmModal } from '@/components/modals/confirm-modal';
import { Project, ProjectMember, ProjectRole } from '@/types/project';
import { Task } from '@/types/task';

interface ProjectModalsProps {
  // Task Modal Props
  isTaskModalOpen: boolean;
  onTaskModalClose: () => void;
  selectedTask: Task | null;
  projectId: string;
  projectMembers: ProjectMember[];
  onTaskSuccess: () => void;
  taskPermissions?: {
    canEditTask: boolean;
    canDeleteTask: boolean;
    canAssignTasks: boolean;
  };

  // Project Modal Props
  isProjectModalOpen: boolean;
  onProjectModalClose: () => void;
  project: Project | null;
  onProjectSuccess: () => void;

  // Member Modal Props
  isMemberModalOpen: boolean;
  onMemberModalClose: () => void;
  selectedMember: ProjectMember | null;
  onMemberSuccess: () => void;
  userRole?: ProjectRole | null;

  // Delete Modal Props
  isDeleteModalOpen: boolean;
  onDeleteModalClose: () => void;
  onProjectDelete: () => void;
  deleteLoading: boolean;
}

export function ProjectModals({
  // Task Modal Props
  isTaskModalOpen,
  onTaskModalClose,
  selectedTask,
  projectId,
  projectMembers,
  onTaskSuccess,
  taskPermissions,

  // Project Modal Props
  isProjectModalOpen,
  onProjectModalClose,
  project,
  onProjectSuccess,

  // Member Modal Props
  isMemberModalOpen,
  onMemberModalClose,
  selectedMember,
  onMemberSuccess,
  userRole,

  // Delete Modal Props
  isDeleteModalOpen,
  onDeleteModalClose,
  onProjectDelete,
  deleteLoading
}: ProjectModalsProps) {
  return (
    <>
      <MemberModal
        isOpen={isMemberModalOpen}
        onClose={() => {
          onMemberModalClose();
        }}
        projectId={projectId}
        existingMember={selectedMember || undefined}
        onSuccess={onMemberSuccess}
        userRole={userRole}
      />

      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => {
          onTaskModalClose();
        }}
        projectId={projectId}
        projectMembers={projectMembers}
        existingTask={selectedTask || undefined}
        onSuccess={onTaskSuccess}
        permissions={taskPermissions}
      />

      <ProjectModal
        isOpen={isProjectModalOpen}
        onClose={onProjectModalClose}
        existingProject={project || undefined}
        onSuccess={onProjectSuccess}
      />

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={onDeleteModalClose}
        onConfirm={onProjectDelete}
        title="Projeyi Sil"
        message="Bu projeyi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz ve projedeki tüm görevler silinecektir."
        confirmButtonText="Evet, Sil"
        loading={deleteLoading}
      />
    </>
  );
} 