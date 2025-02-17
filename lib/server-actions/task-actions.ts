'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function addTaskReview(formData: FormData) {
  const taskId = formData.get('taskId') as string;
  const status = formData.get('status') as string;
  const comment = formData.get('comment') as string;

  if (!taskId || !status) {
    throw new Error('Gerekli alanlar eksik');
  }

  const supabase = await createClient();

  const { data: session } = await supabase.auth.getSession();
  if (!session) {
    throw new Error('Oturum bulunamadı');
  }

  const { data: review, error: reviewError } = await supabase
    .from('task_reviews')
    .insert({
      task_id: taskId,
      reviewer_id: session.session?.user.id,
      status,
      comment,
    })
    .select('task_id')
    .single();

  if (reviewError || !review) {
    throw new Error('İnceleme eklenirken bir hata oluştu');
  }

  const { data: task, error: taskError } = await supabase
    .from('tasks')
    .select('project_id')
    .eq('id', review.task_id)
    .single();

  if (taskError || !task) {
    throw new Error('Görev bulunamadı');
  }

  revalidatePath(`/dashboard/projects/${task.project_id}`);
} 