import { TaskStatus } from './task';
import { Task } from './task';

export type Project = {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  created_by_id: string;
  owner?: {
    id: string;
    name: string;
    avatar_url: string | null;
  };
  members?: ProjectMember[];
  project_members?: { user_id: string }[];
};

export interface ProjectMemberWithUser {
  user: {
    id: string;
    name: string;
  };
}

export interface DatabaseError {
  message: string;
}

export interface ProjectCardProps {
  project: Project;
}

export interface ProjectListProps {
  projects: Project[];
}

export interface ProjectHeaderProps {
  projectCount: number;
}

export interface ProjectMember {
  id: string;
  project_id: string;
  user_id: string;
  role: ProjectRole;
  joined_at: string;
  user: {
    id: string;
    name: string;
    email: string;
    avatar_url: string | null;
  };
}

export interface ProjectMetrics {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  todoTasks: number;
  completionRate: number;
}

export interface ProjectSummaryProps {
  projectId: string;
}

export type ProjectModalProps = {
  isOpen: boolean;
  onClose: () => void;
  existingProject?: {
    id: string;
    name: string;
    description: string | null;
  };
  onSuccess: () => void;
};

export type ProjectRole = 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER';

export interface ProjectPermissions {
  canEditProject: boolean;
  canDeleteProject: boolean;
  canManageMembers: boolean;
  canCreateTasks: boolean;
  canEditTasks: boolean;
  canDeleteTasks: boolean;
  canAssignTasks: boolean;
  canComment: boolean;
}

export interface ProjectTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  existingTask?: Task;
  initialStatus?: TaskStatus;
  permissions?: {
    canEditTask: boolean;
    canDeleteTask: boolean;
    canAssignTasks: boolean;
  };
  onSuccess?: () => void;
} 