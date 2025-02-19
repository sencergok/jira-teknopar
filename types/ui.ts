import { ToasterProps } from 'sonner';
import { Task, TaskStatus } from './task';

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

export interface KanbanItemProps {
  task: Task;
  index: number;
}

export interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
}

export interface MemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  onMemberUpdate?: () => void;
}

export interface ChartContextProps {
  width: number;
  height: number;
}

export interface TooltipProps {
  active?: boolean;
  payload?: unknown[];
  label?: string;
}

export type ToastProps = ToasterProps & {
  id: string;
  title?: string;
  description?: string;
  action?: React.ReactNode;
} 