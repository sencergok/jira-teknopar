import { Task } from '../task';
import { Project } from '../project';

export interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
}

export interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  existingTask?: Task;
  initialStatus?: Task['status'];
  onSuccess?: () => void;
  permissions?: {
    canEditTask: boolean;
    canDeleteTask: boolean;
    canAssignTasks: boolean;
  };
  projectMembers?: Array<{
    user: {
      id: string;
      name: string;
      avatar_url: string | null;
    };
  }>;
}

export interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  project?: Project;
  onProjectUpdate?: () => void;
}

export interface MemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  onMemberUpdate?: () => void;
} 