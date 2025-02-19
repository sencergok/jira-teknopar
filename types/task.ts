export type TaskStatus = 'todo' | 'in_progress' | 'in_review' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface AssignedUser {
  id: string;
  name: string;
  avatar_url: string | null;
}

export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  task_order: string;
  created_by_id: string;
  assigned_to_id: string | null;
  project_id: string;
  created_at: string;
  updated_at: string;
  assignedTo: AssignedUser | null;
}

export interface TaskMetrics {
  total: number;
  completed: number;
  inProgress: number;
  inReview: number;
  todo: number;
}

export interface TaskCardProps {
  task: Task;
  onTaskClick: (taskId: string) => void;
  isDragging?: boolean;
}

export interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  existingTask?: Task;
  initialStatus?: TaskStatus;
  onSuccess?: () => void;
  permissions?: {
    canEditTask: boolean;
    canDeleteTask: boolean;
    canAssignTasks: boolean;
  };
} 