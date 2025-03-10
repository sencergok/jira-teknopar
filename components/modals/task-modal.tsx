'use client';

import { Fragment, useState, useEffect, useCallback } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/lib/hooks/use-auth';
import { ConfirmModal } from './confirm-modal';
import { TaskStatus, TaskPriority, TaskModalProps } from '@/types/task';

// Task management modal - Create/update tasks with status/priority/assignment
export function TaskModal({
  isOpen,
  onClose,
  projectId,
  projectMembers,
  existingTask,
  onSuccess,
  permissions,
  initialStatus,
}: TaskModalProps) {
  const { user } = useAuth();
  const [title, setTitle] = useState(existingTask?.title || '');
  const [description, setDescription] = useState(existingTask?.description || '');
  const [priority, setPriority] = useState<TaskPriority>(existingTask?.priority || TaskPriority.MEDIUM);
  const [status, setStatus] = useState<TaskStatus>(existingTask?.status || initialStatus || TaskStatus.TODO);
  const [assignedToId, setAssignedToId] = useState<string | null>(existingTask?.assigned_to_id || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Form verilerini sıfırla - useCallback ile memoize ediyoruz
  const resetForm = useCallback(() => {
    setTitle('');
    setDescription('');
    setStatus(initialStatus || TaskStatus.TODO);
    setPriority(TaskPriority.MEDIUM);
    setAssignedToId(null);
    setError(null);
  }, [initialStatus]);

  // Modal açıldığında veya existingTask değiştiğinde form verilerini güncelle
  useEffect(() => {
    if (existingTask) {
      setTitle(existingTask.title);
      setDescription(existingTask.description || '');
      setStatus(existingTask.status);
      setPriority(existingTask.priority);
      setAssignedToId(existingTask.assigned_to_id || '');
    } else {
      resetForm();
    }
  }, [existingTask, initialStatus, resetForm]);

  // Modal kapandığında formu sıfırla
  useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen, resetForm]);

  // initialStatus değiştiğinde status'u güncelle
  useEffect(() => {
    if (!existingTask && initialStatus) {
      setStatus(initialStatus);
    }
  }, [initialStatus, existingTask]);

  // Yetki kontrolü
  const canEdit = !existingTask || (existingTask && permissions?.canEditTask);
  const canAssign = permissions?.canAssignTasks;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const taskData = {
        title,
        description,
        status,
        priority,
        task_order: existingTask?.task_order || `${Date.now()}`,
        project_id: projectId,
        assigned_to_id: assignedToId || null,
        created_by_id: user?.id, // Bunu ekliyoruz - önemli!
        updated_at: new Date().toISOString()
      };

      if (existingTask) {
        const { error: updateError } = await supabase
          .from('tasks')
          .update(taskData)
          .eq('id', existingTask.id);

        if (updateError) {
          console.error('Update error details:', updateError);
          throw updateError;
        }
      } else {
        // Yeni görev oluştururken created_by_id'yi ekleyelim
        const { error: insertError } = await supabase
          .from('tasks')
          .insert([{
            ...taskData,
            created_by_id: user?.id, // Yeni görev için zorunlu alan
            created_at: new Date().toISOString()
          }]);

        if (insertError) {
          console.error('Insert error details:', insertError);
          throw insertError;
        }
      }

      onSuccess?.();
      onClose();
    } catch (err) {
      console.error('Görev işlemi hatası:', err);
      if (err instanceof Error) {
        setError(`İşlem hatası: ${err.message}`);
      } else {
        setError('Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!existingTask) return;
    setDeleteLoading(true);

    try {
      const supabase = createClient();
      const { error: deleteError } = await supabase
        .from('tasks')
        .delete()
        .eq('id', existingTask.id);

      if (deleteError) throw deleteError;

      onSuccess?.();
      onClose();
    } catch (err) {
      console.error('Görev silme hatası:', err);
      setError('Görev silinirken bir hata oluştu.');
    } finally {
      setDeleteLoading(false);
      setIsDeleteModalOpen(false);
    }
  };

  return (
    <>
      <Transition.Root show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={onClose}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
          </Transition.Child>

          <div className="fixed inset-0 z-10 overflow-y-auto">
            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                enterTo="opacity-100 translate-y-0 sm:scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              >
                <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                  <form onSubmit={handleSubmit} className="mt-6 space-y-6">
                    <div>
                      <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                        Başlık
                      </label>
                      <div className="mt-1">
                        <input
                          type="text"
                          name="title"
                          id="title"
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          required
                          disabled={!canEdit}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                        Açıklama
                      </label>
                      <div className="mt-1">
                        <textarea
                          id="description"
                          name="description"
                          rows={4}
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                          Durum
                        </label>
                        <div className="mt-1">
                          <select
                            id="status"
                            name="status"
                            value={status}
                            onChange={(e) => setStatus(e.target.value as TaskStatus)}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          >
                            <option value={TaskStatus.TODO}>Yapılacak</option>
                            <option value={TaskStatus.IN_PROGRESS}>Devam Ediyor</option>
                            <option value={TaskStatus.IN_REVIEW}>İncelemede</option>
                            <option value={TaskStatus.DONE}>Tamamlandı</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label htmlFor="priority" className="block text-sm font-medium text-gray-700">
                          Öncelik
                        </label>
                        <div className="mt-1">
                          <select
                            id="priority"
                            name="priority"
                            value={priority}
                            onChange={(e) => setPriority(e.target.value as TaskPriority)}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          >
                            <option value={TaskPriority.LOW}>Düşük</option>
                            <option value={TaskPriority.MEDIUM}>Orta</option>
                            <option value={TaskPriority.HIGH}>Yüksek</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label htmlFor="assignedTo" className="block text-sm font-medium text-gray-700">
                        Atanan Kişi
                      </label>
                      <div className="mt-1">
                        <select
                          id="assignedTo"
                          name="assignedTo"
                          value={assignedToId ?? ''}
                          onChange={(e) => {
                            const value = e.target.value;
                            setAssignedToId(value === '' ? null : value);
                          }}
                          disabled={!canAssign}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                        >
                          <option value="">Atanmadı</option>
                          {projectMembers?.filter(member => member.user).map((member) => (
                            <option key={member.id} value={member.user_id}>
                              {member.user.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {error && (
                      <div className="rounded-md bg-red-50 p-4">
                        <div className="flex">
                          <div className="ml-3">
                            <h3 className="text-sm font-medium text-red-800">{error}</h3>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
                      {canEdit && (
                        <button
                          type="submit"
                          disabled={loading}
                          className="inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 sm:col-start-2"
                        >
                          {loading ? 'İşleniyor...' : existingTask ? 'Güncelle' : 'Oluştur'}
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={onClose}
                        className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:col-start-1 sm:mt-0"
                      >
                        İptal
                      </button>
                    </div>

                    {existingTask && permissions?.canDeleteTask && (
                      <div className="mt-4 border-t pt-4">
                        <button
                          type="button"
                          onClick={() => setIsDeleteModalOpen(true)}
                          className="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500"
                        >
                          Görevi Sil
                        </button>
                      </div>
                    )}
                  </form>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition.Root>

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Görevi Sil"
        message="Bu görevi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz."
        confirmButtonText="Evet, Sil"
        loading={deleteLoading}
      />
    </>
  );
}