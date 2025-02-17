import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function addComment(formData: FormData) {
  'use server';

  const taskId = formData.get('taskId') as string;
  const content = formData.get('content') as string;
  const mentionedUsers = formData.get('mentionedUsers') as string;

  if (!taskId || !content) {
    throw new Error('Gerekli alanlar eksik');
  }

  const supabase = await createClient();

  const { data: task, error: taskError } = await supabase
    .from('tasks')
    .select('project_id')
    .eq('id', taskId)
    .single();

  if (taskError || !task) {
    throw new Error('Görev bulunamadı');
  }

  const { data: session, error: sessionError } = await supabase.auth.getSession();
  if (sessionError || !session) {
    throw new Error('Oturum bulunamadı');
  }

  const { error: commentError } = await supabase
    .from('comments')
    .insert({
      task_id: taskId,
      user_id: session.session?.user.id,
      content,
      mentioned_users: mentionedUsers ? JSON.parse(mentionedUsers) : [],
    });

  if (commentError) {
    throw new Error('Yorum eklenirken bir hata oluştu');
  }

  revalidatePath(`/dashboard/projects/${task.project_id}`);
}

export async function updateComment(formData: FormData) {
  'use server';

  const commentId = formData.get('commentId') as string;
  const content = formData.get('content') as string;
  const mentionedUsers = formData.get('mentionedUsers') as string;

  if (!commentId || !content) {
    throw new Error('Gerekli alanlar eksik');
  }

  const supabase = await createClient();

  const { data: comment, error: commentError } = await supabase
    .from('comments')
    .update({
      content,
      mentioned_users: mentionedUsers ? JSON.parse(mentionedUsers) : [],
      updated_at: new Date().toISOString(),
    })
    .eq('id', commentId)
    .select('task_id')
    .single();

  if (commentError || !comment) {
    throw new Error('Yorum güncellenirken bir hata oluştu');
  }

  const { data: task, error: taskError } = await supabase
    .from('tasks')
    .select('project_id')
    .eq('id', comment.task_id)
    .single();

  if (taskError || !task) {
    throw new Error('Görev bulunamadı');
  }

  revalidatePath(`/dashboard/projects/${task.project_id}`);
}

export async function deleteComment(formData: FormData) {
  'use server';

  const commentId = formData.get('commentId') as string;

  if (!commentId) {
    throw new Error('Yorum ID\'si gerekli');
  }

  const supabase = await createClient();

  const { data: comment, error: commentError } = await supabase
    .from('comments')
    .delete()
    .eq('id', commentId)
    .select('task_id')
    .single();

  if (commentError || !comment) {
    throw new Error('Yorum silinirken bir hata oluştu');
  }

  const { data: task, error: taskError } = await supabase
    .from('tasks')
    .select('project_id')
    .eq('id', comment.task_id)
    .single();

  if (taskError || !task) {
    throw new Error('Görev bulunamadı');
  }

  revalidatePath(`/dashboard/projects/${task.project_id}`);
}

export async function addTaskReview(formData: FormData) {
  'use server';

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