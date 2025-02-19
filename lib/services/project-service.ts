import { createClient } from '@/lib/supabase/client';
import { Project, ProjectMember } from '@/types/project';
import { Task } from '@/types/task';

export class ProjectService {
  private static supabase = createClient();

  static async getProjectDetails(projectId: string): Promise<{
    project: Project;
    tasks: Task[];
    members: ProjectMember[];
  }> {
    try {
      // Fetch project details
      const { data: projectData, error: projectError } = await this.supabase
        .from('projects')
        .select(`
          id,
          name,
          description,
          created_by_id,
          created_at,
          updated_at
        `)
        .eq('id', projectId)
        .single();

      if (projectError) throw projectError;

      // Fetch tasks with assigned users
      const { data: tasksData, error: tasksError } = await this.supabase
        .from('tasks')
        .select(`
          id,
          title,
          description,
          status,
          priority,
          task_order,
          created_by_id,
          assigned_to_id,
          project_id,
          created_at,
          updated_at,
          assigned_user:users!assigned_to_id (
            id,
            name,
            avatar_url
          )
        `)
        .eq('project_id', projectId)
        .order('task_order', { ascending: true });

      if (tasksError) throw tasksError;

      // Fetch project members with user details
      const { data: membersData, error: membersError } = await this.supabase
        .from('project_members')
        .select(`
          id,
          project_id,
          user_id,
          role,
          created_at,
          user:users!user_id (
            id,
            name,
            email,
            avatar_url
          )
        `)
        .eq('project_id', projectId);

      if (membersError) throw membersError;

      // Transform the data to match our types
      const transformedMembers = membersData.map((member: any) => ({
        id: member.id,
        project_id: member.project_id,
        user_id: member.user_id,
        role: member.role,
        joined_at: member.created_at,
        user: {
          id: member.user.id,
          name: member.user.name,
          email: member.user.email,
          avatar_url: member.user.avatar_url
        }
      })) as ProjectMember[];

      const transformedTasks = tasksData.map((task: any) => ({
        id: task.id,
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        task_order: task.task_order,
        created_by_id: task.created_by_id,
        assigned_to_id: task.assigned_to_id,
        project_id: task.project_id,
        created_at: task.created_at,
        updated_at: task.updated_at,
        assignedTo: task.assigned_user ? {
          id: task.assigned_user.id,
          name: task.assigned_user.name,
          avatar_url: task.assigned_user.avatar_url
        } : null
      })) as Task[];

      return {
        project: projectData,
        tasks: transformedTasks,
        members: transformedMembers
      };
    } catch (error) {
      console.error('Project details fetch error:', error);
      throw error;
    }
  }

  static async updateTaskStatus(
    taskId: string, 
    newStatus: string, 
    projectId: string
  ): Promise<void> {
    try {
      // Önce mevcut sıralamayı al
      const { data: columnTasks, error: fetchError } = await this.supabase
        .from('tasks')
        .select('id, task_order')
        .eq('status', newStatus)
        .eq('project_id', projectId)
        .order('task_order', { ascending: true });

      if (fetchError) throw fetchError;

      let newOrder: string;
      if (!columnTasks || columnTasks.length === 0) {
        newOrder = '1000';
      } else if (columnTasks.length === 1) {
        newOrder = String(parseInt(columnTasks[0].task_order) + 1000);
      } else {
        const lastTask = columnTasks[columnTasks.length - 1];
        const secondLastTask = columnTasks[columnTasks.length - 2];
        newOrder = String((parseInt(lastTask.task_order) + parseInt(secondLastTask.task_order)) / 2);
      }

      const { error } = await this.supabase
        .from('tasks')
        .update({ 
          status: newStatus,
          task_order: newOrder
        })
        .eq('id', taskId);

      if (error) throw error;
    } catch (error) {
      console.error('Task status update error:', error);
      throw error;
    }
  }

  static async deleteProject(projectId: string): Promise<void> {
    try {
      const { error: tasksDeleteError } = await this.supabase
        .from('tasks')
        .delete()
        .eq('project_id', projectId);

      if (tasksDeleteError) throw tasksDeleteError;

      const { error: membersDeleteError } = await this.supabase
        .from('project_members')
        .delete()
        .eq('project_id', projectId);

      if (membersDeleteError) throw membersDeleteError;

      const { error: projectDeleteError } = await this.supabase
        .from('projects')
        .delete()
        .eq('id', projectId);

      if (projectDeleteError) throw projectDeleteError;
    } catch (error) {
      console.error('Project delete error:', error);
      throw error;
    }
  }

  static async updateTaskOrder(taskId: string, status: string, taskIds: string[]) {
    const supabase = createClient();

    // Calculate new task orders
    const newTaskOrders = taskIds.map((id, index) => ({
      id,
      task_order: `${index + 1}`.padStart(5, '0') // 00001, 00002, etc.
    }));

    // Update all tasks in the transaction
    const { error } = await supabase.rpc('update_task_orders', {
      p_task_ids: taskIds,
      p_task_orders: newTaskOrders.map(t => t.task_order),
      p_status: status
    });

    if (error) {
      throw error;
    }

    return true;
  }
} 