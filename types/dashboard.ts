import { Project, ProjectMember, ProjectRole } from './project';
import { Task } from './task';

export interface ProjectRecord {
  id: string;
}

export interface TaskStatusRecord {
  status: string;
}

export interface DashboardStats {
  totalProjects: number;
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
}

export interface ProjectDetailPageProps {
  project: Project | null;
  tasks: Task[];
  members: ProjectMember[];
  loading: boolean;
  error: string | null;
}

export interface ProjectHeaderProps {
  project: Project | null;
  permissions: {
    canCreateTasks?: boolean;
    canEditProject?: boolean;
    canDeleteProject?: boolean;
  };
  onNewTask: () => void;
  onEditProject: () => void;
  onDeleteProject: () => void;
}

export interface ProjectContentProps {
  projectId: string;
  tasks: Task[];
  members: ProjectMember[];
  onTaskMove: (taskId: string, newStatus: string) => void;
  onTaskClick: (taskId: string) => void;
  onMemberClick: (member: ProjectMember | null) => void;
  permissions?: {
    canManageMembers?: boolean;
  };
}

export interface ProjectModalsProps {
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