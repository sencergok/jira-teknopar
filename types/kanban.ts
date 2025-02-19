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

export interface KanbanFilterState {
  searchTerm: string;
  priorityFilter: 'all' | Task['priority'];
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