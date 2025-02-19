export enum TaskStatus {
  TODO = 'todo',
  IN_PROGRESS = 'in_progress',
  IN_REVIEW = 'in_review',
  DONE = 'done'
}

export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high'
}

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
  completed_at?: string | null;
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

export interface KanbanColumnProps {
  id: TaskStatus;
  title: string;
  tasks: Task[];
  onTaskClick: (taskId: string) => void;
  projectId: string;
}

export interface KanbanBoardProps {
  projectId: string;
  tasks: Task[];
  onTaskMove: (taskId: string, newStatus: TaskStatus) => void;
  onTaskClick: (taskId: string) => void;
}

export interface KanbanFilterState {
  searchTerm: string;
  priorityFilter: 'all' | TaskPriority;
  assigneeFilter: string;
}

export interface KanbanDragState {
  activeId: string | null;
  overId: string | null;
}

export type KanbanColumn = {
  id: TaskStatus;
  title: string;
};

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
  projectMembers?: Array<{
    user: {
      id: string;
      name: string;
      avatar_url: string | null;
    };
  }>;
}

export const TASK_STATUS_LABELS = {
  [TaskStatus.TODO]: 'Yapılacak',
  [TaskStatus.IN_PROGRESS]: 'Devam Eden',
  [TaskStatus.IN_REVIEW]: 'İncelemede',
  [TaskStatus.DONE]: 'Tamamlandı'
} as const;

export const TASK_PRIORITY_LABELS = {
  [TaskPriority.LOW]: 'Düşük',
  [TaskPriority.MEDIUM]: 'Orta',
  [TaskPriority.HIGH]: 'Yüksek'
} as const;

export const TASK_STATUS_COLORS = {
  [TaskStatus.TODO]: '#94a3b8',
  [TaskStatus.IN_PROGRESS]: '#3b82f6',
  [TaskStatus.IN_REVIEW]: '#f59e0b',
  [TaskStatus.DONE]: '#22c55e'
} as const;

export const TASK_PRIORITY_COLORS = {
  [TaskPriority.LOW]: '#94a3b8',
  [TaskPriority.MEDIUM]: '#f59e0b',
  [TaskPriority.HIGH]: '#ef4444'
} as const; 