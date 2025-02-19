import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TaskModalProps } from '@/types/project';
import { TaskPriority, TaskStatus, TASK_PRIORITY_LABELS, TASK_STATUS_LABELS } from '@/types/task';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/lib/hooks/use-toast';

export function TaskModal({ 
  isOpen, 
  onClose, 
  projectId, 
  existingTask,
  initialStatus,
  permissions,
  onSuccess 
}: TaskModalProps) {
  const [title, setTitle] = useState(existingTask?.title || '');
  const [description, setDescription] = useState(existingTask?.description || '');
  const [status, setStatus] = useState<TaskStatus>(existingTask?.status || initialStatus || TaskStatus.TODO);
  const [priority, setPriority] = useState<TaskPriority>(existingTask?.priority || TaskPriority.MEDIUM);
  const [assignedToId, setAssignedToId] = useState<string | null>(existingTask?.assigned_to_id || null);
  const [projectMembers, setProjectMembers] = useState<Array<{
    user: { id: string; name: string; }
  }>>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Reset form when modal opens/closes or existingTask changes
  useEffect(() => {
    if (existingTask) {
      setTitle(existingTask.title);
      setDescription(existingTask.description || '');
      setStatus(existingTask.status);
      setPriority(existingTask.priority);
      setAssignedToId(existingTask.assigned_to_id);
    } else {
      setTitle('');
      setDescription('');
      setStatus(initialStatus || TaskStatus.TODO);
      setPriority(TaskPriority.MEDIUM);
      setAssignedToId(null);
    }
  }, [existingTask, initialStatus]);

  useEffect(() => {
    const fetchProjectMembers = async () => {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('project_members')
          .select(`
            user:users!user_id (
              id,
              name
            )
          `)
          .eq('project_id', projectId)
          .not('role', 'eq', 'VIEWER');

        if (error) throw error;

        if (data) {
          setProjectMembers(data.filter((member: any) => member?.user));
        }
      } catch (error) {
        console.error('Project members fetch error:', error);
        toast({
          title: "Hata",
          description: "Proje üyeleri yüklenirken bir hata oluştu",
          variant: "destructive"
        });
      }
    };

    if (isOpen) {
      fetchProjectMembers();
    }
  }, [projectId, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast({
        title: "Hata",
        description: "Görev başlığı boş olamaz",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();
      
      const taskData = {
        title,
        description,
        status,
        priority,
        assigned_to_id: assignedToId,
        updated_at: new Date().toISOString()
      };
      
      if (existingTask?.id) {
        // Update existing task
        const { error } = await supabase
          .from('tasks')
          .update(taskData)
          .eq('id', existingTask.id);

        if (error) throw error;
        toast({
          title: "Başarılı",
          description: "Görev güncellendi",
        });
      } else {
        // Create new task
        const { error } = await supabase
          .from('tasks')
          .insert([{
            ...taskData,
            project_id: projectId,
            task_order: Date.now().toString()
          }]);

        if (error) throw error;
        toast({
          title: "Başarılı",
          description: "Görev oluşturuldu",
        });
      }

      onSuccess?.();
      onClose();
    } catch (error: any) {
      console.error('Task operation error:', error);
      toast({
        title: "Hata",
        description: error.message || "İşlem sırasında bir hata oluştu",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!existingTask?.id || !permissions?.canDeleteTask) return;

    if (!confirm('Bu görevi silmek istediğinize emin misiniz?')) return;

    setLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', existingTask.id);

      if (error) throw error;

      toast({
        title: "Başarılı",
        description: "Görev silindi",
      });
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Task delete error:', error);
      toast({
        title: "Hata",
        description: "Görev silinirken bir hata oluştu",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{existingTask ? 'Görevi Düzenle' : 'Yeni Görev'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium">
              Başlık
            </label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Görev başlığı"
              disabled={Boolean(loading || (existingTask && !permissions?.canEditTask))}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium">
              Açıklama
            </label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Görev açıklaması"
              disabled={Boolean(loading || (existingTask && !permissions?.canEditTask))}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="status" className="text-sm font-medium">
                Durum
              </label>
              <Select
                value={status}
                onValueChange={(value) => setStatus(value as TaskStatus)}
                disabled={Boolean(loading || (existingTask && !permissions?.canEditTask))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(TASK_STATUS_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label htmlFor="priority" className="text-sm font-medium">
                Öncelik
              </label>
              <Select
                value={priority}
                onValueChange={(value) => setPriority(value as TaskPriority)}
                disabled={Boolean(loading || (existingTask && !permissions?.canEditTask))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(TASK_PRIORITY_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {permissions?.canAssignTasks && (
            <div className="space-y-2">
              <label htmlFor="assignedTo" className="text-sm font-medium">
                Atanan Kişi
              </label>
              <Select
                value={assignedToId || "unassigned"}
                onValueChange={(value) => setAssignedToId(value === "unassigned" ? null : value)}
                disabled={Boolean(loading || (existingTask && !permissions?.canEditTask))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Görev atanacak kişiyi seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">Atanmamış</SelectItem>
                  {projectMembers.map((member) => (
                    member.user && (
                      <SelectItem 
                        key={member.user.id} 
                        value={member.user.id}
                      >
                        {member.user.name}
                      </SelectItem>
                    )
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex justify-between pt-4">
            {existingTask && permissions?.canDeleteTask && (
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
                disabled={loading}
              >
                Görevi Sil
              </Button>
            )}
            <div className="flex gap-2 ml-auto">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={loading}
              >
                İptal
              </Button>
              {(!existingTask || permissions?.canEditTask) && (
                <Button type="submit" disabled={loading}>
                  {existingTask ? 'Güncelle' : 'Oluştur'}
                </Button>
              )}
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 