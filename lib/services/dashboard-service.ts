import { createClient } from '@/lib/supabase/client';
import { DashboardStats, ProjectRecord, TaskStatusRecord } from '@/types/dashboard';
import { Project, ProjectMember } from '@/types/project';
import { Task, TaskStatus } from '@/types/task';

export class DashboardService {
  private static supabase = createClient();

  static async getDashboardStats(userId: string): Promise<DashboardStats> {
    try {
      // Get user's projects
      const { data: projects, error: projectsError } = await this.supabase
        .from('projects')
        .select('id')
        .or(`owner_id.eq.${userId},project_members.user_id.eq.${userId}`)
        .order('created_at', { ascending: false });

      if (projectsError) throw projectsError;

      // Get tasks from user's projects
      const { data: tasks, error: tasksError } = await this.supabase
        .from('tasks')
        .select('status')
        .in('project_id', projects.map((p: ProjectRecord) => p.id));

      if (tasksError) throw tasksError;

      return {
        totalProjects: projects.length,
        totalTasks: tasks.length,
        completedTasks: tasks.filter((t: TaskStatusRecord) => t.status === TaskStatus.DONE).length,
        inProgressTasks: tasks.filter((t: TaskStatusRecord) => t.status === TaskStatus.IN_PROGRESS).length
      };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  }

  static async getUserProjects(userId: string): Promise<Project[]> {
    try {
      const { data: projects, error: projectsError } = await this.supabase
        .from('projects')
        .select(`
          *,
          owner:users!owner_id (
            id,
            name,
            avatar_url
          ),
          members:project_members (
            id,
            role,
            user:users (
              id,
              name,
              avatar_url
            )
          )
        `)
        .or(`owner_id.eq.${userId},project_members.user_id.eq.${userId}`)
        .order('created_at', { ascending: false });

      if (projectsError) throw projectsError;

      // Transform the data to match the Project interface
      return projects.map((project: any) => ({
        ...project,
        members: project.members.map((member: any) => ({
          id: member.id,
          role: member.role,
          user: member.user
        }))
      }));
    } catch (error) {
      console.error('Error fetching user projects:', error);
      throw error;
    }
  }

  static async getRecentTasks(userId: string): Promise<Task[]> {
    try {
      const { data, error } = await this.supabase
        .from('tasks')
        .select(`
          *,
          project:projects (
            id,
            name
          ),
          assignedTo:users!assigned_to_id (
            id,
            name,
            avatar_url
          )
        `)
        .or(`created_by_id.eq.${userId},assigned_to_id.eq.${userId}`)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching recent tasks:', error);
      throw error;
    }
  }
} 