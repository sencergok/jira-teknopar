export interface Project {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
  created_by_id: string;
  owner_id: string;
  is_private: boolean;
}

export interface ProjectMember {
  id: string;
  project_id: string;
  user_id: string;
  role: 'OWNER' | 'ADMIN' | 'MEMBER';
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
  project: Project;
  metrics: ProjectMetrics;
}

export interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  project?: Project;
  onProjectUpdate?: () => void;
} 