import { useState, useMemo, useEffect } from 'react';
import { Task, TaskStatus, TaskPriority, KanbanColumn, TASK_STATUS_LABELS } from '@/types';
import { DragStartEvent, DragEndEvent, DragOverEvent, UniqueIdentifier } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { useDebounce } from './use-debounce';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/lib/hooks/use-toast';
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js';

export const COLUMNS: KanbanColumn[] = [
  { id: TaskStatus.TODO, title: TASK_STATUS_LABELS[TaskStatus.TODO] },
  { id: TaskStatus.IN_PROGRESS, title: TASK_STATUS_LABELS[TaskStatus.IN_PROGRESS] },
  { id: TaskStatus.IN_REVIEW, title: TASK_STATUS_LABELS[TaskStatus.IN_REVIEW] },
  { id: TaskStatus.DONE, title: TASK_STATUS_LABELS[TaskStatus.DONE] },
];

type SortDirection = 'asc' | 'desc';

interface UseTaskManagementProps {
  projectId: string;
  tasks: Task[];
  onTaskMove: (taskId: string, newStatus: TaskStatus) => void;
}

export function useTaskManagement({ projectId, tasks: initialTasks, onTaskMove }: UseTaskManagementProps) {
  // Drag & Drop State
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
  const [overId, setOverId] = useState<UniqueIdentifier | null>(null);
  const { toast } = useToast();
  
  // Task State
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

  // Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<'all' | TaskPriority>('all');
  const [assigneeFilter, setAssigneeFilter] = useState<string>('all');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  // Debounced Filters
  const debouncedSearchTerm = useDebounce(searchTerm, 1000);
  const debouncedPriorityFilter = useDebounce(priorityFilter, 1000);
  const debouncedAssigneeFilter = useDebounce(assigneeFilter, 1000);

  // Computed Values
  const assignees = useMemo(() => {
    const uniqueAssignees = new Set();
    tasks.forEach(task => {
      if (task.assignedTo) {
        uniqueAssignees.add(JSON.stringify(task.assignedTo));
      }
    });
    return Array.from(uniqueAssignees).map(assignee => JSON.parse(assignee as string));
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    return tasks
      .filter(task => {
        const matchesSearch = task.title.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
          (task.description?.toLowerCase() || '').includes(debouncedSearchTerm.toLowerCase());
    
        const matchesPriority = debouncedPriorityFilter === 'all' || task.priority === debouncedPriorityFilter;
        
        const matchesAssignee = debouncedAssigneeFilter === 'all' ||
          (debouncedAssigneeFilter === 'unassigned' && !task.assignedTo) ||
          (task.assignedTo?.id === debouncedAssigneeFilter);
    
        return matchesSearch && matchesPriority && matchesAssignee;
      })
      .sort((a, b) => {
        let comparison = 0;

        // Önce seçili filtreye göre sırala
        if (debouncedPriorityFilter !== 'all') {
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          comparison = (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
        } else if (debouncedAssigneeFilter !== 'all') {
          if (debouncedAssigneeFilter === 'unassigned') {
            comparison = (a.assignedTo ? 1 : -1) - (b.assignedTo ? 1 : -1);
          } else {
            comparison = (a.assignedTo?.id === debouncedAssigneeFilter ? -1 : 1) -
                        (b.assignedTo?.id === debouncedAssigneeFilter ? -1 : 1);
          }
        }

        // Sonra task_order'a göre sırala
        if (comparison === 0 && a.status === b.status) {
          comparison = a.task_order.localeCompare(b.task_order);
        }

        return sortDirection === 'asc' ? comparison : -comparison;
      });
  }, [tasks, debouncedSearchTerm, debouncedPriorityFilter, debouncedAssigneeFilter, sortDirection]);

  // Update tasks when initialTasks changes, but preserve realtime updates
  useEffect(() => {
    setTasks(prevTasks => {
      // Mevcut task'ları ID'lerine göre map'leyelim
      const taskMap = new Map(prevTasks.map(task => [task.id, task]));
      
      // initialTasks'dan gelen her task için:
      // - Eğer task zaten varsa ve güncellenmişse, mevcut task'ı koru
      // - Yoksa yeni task'ı ekle
      initialTasks.forEach(task => {
        const existingTask = taskMap.get(task.id);
        if (!existingTask || existingTask.updated_at < task.updated_at) {
          taskMap.set(task.id, task);
        }
      });
      
      return Array.from(taskMap.values())
        .sort((a, b) => a.task_order.localeCompare(b.task_order));
    });
  }, [initialTasks]);

  // Realtime subscription
  useEffect(() => {
    const supabase = createClient();
    
    const channel = supabase
      .channel(`project_tasks:${projectId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'tasks',
        filter: `project_id=eq.${projectId}`
      }, (payload: RealtimePostgresChangesPayload<Task>) => {
        if (payload.eventType === 'UPDATE' && payload.new && payload.old) {
          // Önce local state'i güncelle
          setTasks(prevTasks => {
            const updatedTasks = prevTasks.map(task => 
              task.id === payload.new.id ? { ...task, ...payload.new } : task
            );
            return updatedTasks;
          });

          // Seçili task güncellendiyse modal içeriğini güncelle
          if (selectedTask?.id === payload.new.id) {
            setSelectedTask(prev => prev ? { ...prev, ...payload.new } : null);
          }

          // Status değişikliği varsa onTaskMove'u çağır
          if (payload.new.status !== payload.old.status) {
            onTaskMove(payload.new.id, payload.new.status as TaskStatus);
          }
        } else if (payload.eventType === 'DELETE' && payload.old && payload.old.id && payload.old.status) {
          // Silinen taskı local state'den kaldır
          setTasks(prevTasks => prevTasks.filter(task => task.id !== payload.old.id));
          
          // Silinen task seçiliyse modalı kapat
          if (selectedTask?.id === payload.old.id) {
            setSelectedTask(null);
            setIsTaskModalOpen(false);
          }

          // onTaskMove'u çağır
          onTaskMove(payload.old.id, payload.old.status as TaskStatus);
        } else if (payload.eventType === 'INSERT' && payload.new && payload.new.id && payload.new.status) {
          // Yeni taskı local state'e ekle
          setTasks(prevTasks => [...prevTasks, payload.new]);
          
          // onTaskMove'u çağır
          onTaskMove(payload.new.id, payload.new.status as TaskStatus);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [projectId, onTaskMove, selectedTask]);

  // Event Handlers
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveId(active.id);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeTask = tasks.find(t => t.id === active.id);
    const overTask = tasks.find(t => t.id === over.id);
    const overColumn = COLUMNS.find(col => col.id === over.id);

    if (!activeTask) return;

    // Sadece görsel feedback için over state'i güncelle
    if (overTask || overColumn) {
      setOverId(over.id);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) {
      setActiveId(null);
      setOverId(null);
      return;
    }

    const activeTask = tasks.find(t => t.id === active.id);
    const overTask = tasks.find(t => t.id === over.id);
    const overColumn = COLUMNS.find(col => col.id === over.id);

    if (!activeTask) {
      setActiveId(null);
      setOverId(null);
      return;
    }

    const supabase = createClient();
    let retryCount = 0;
    const maxRetries = 3;

    const updateTasks = async () => {
      try {
        // Optimistic update
        const updatedTasks = [...tasks];
        const activeTaskIndex = updatedTasks.findIndex(t => t.id === activeTask.id);
        
        if (overTask) {
          // Reorder within the same status
          const tasksInSameStatus = updatedTasks
            .filter(t => t.status === overTask.status)
            .sort((a, b) => a.task_order.localeCompare(b.task_order));
          
          const oldIndex = tasksInSameStatus.findIndex(t => t.id === activeTask.id);
          const newIndex = tasksInSameStatus.findIndex(t => t.id === overTask.id);
          
          if (oldIndex !== -1 && newIndex !== -1) {
            const newStatus = overTask.status;
            const statusChanged = activeTask.status !== newStatus;

            // Update local state first
            if (statusChanged) {
              updatedTasks[activeTaskIndex].status = newStatus;
            }
            
            const newTasks = arrayMove(tasksInSameStatus, oldIndex, newIndex);
            const taskOrders = newTasks.map((_, index) => 
              ((index + 1) * 1000).toString().padStart(8, '0')
            );

            // Batch update for better performance
            const updates = newTasks.map((task, index) => ({
              id: task.id,
              task_order: taskOrders[index],
              status: overTask.status,
              title: task.title,
              updated_at: new Date().toISOString()
            }));

            const { error: batchError } = await supabase
              .from('tasks')
              .upsert(updates, {
                onConflict: 'id'
              });

            if (batchError) {
              throw new Error(batchError.message || 'Görevler güncellenirken bir hata oluştu');
            }

            // Notify about the move if status changed
            if (activeTask.status !== overTask.status) {
              onTaskMove(activeTask.id, overTask.status);
            }
          }
        } else if (overColumn) {
          // Move to a new status
          const tasksInTargetStatus = updatedTasks
            .filter(t => t.status === overColumn.id)
            .sort((a, b) => a.task_order.localeCompare(b.task_order));

          // Calculate new order with a large gap
          let newOrder: string;
          if (tasksInTargetStatus.length === 0) {
            newOrder = '10000000';
          } else {
            const lastOrder = parseInt(tasksInTargetStatus[tasksInTargetStatus.length - 1].task_order);
            newOrder = (lastOrder + 1000).toString().padStart(8, '0');
          }

          // Update local state first
          updatedTasks[activeTaskIndex].status = overColumn.id;
          updatedTasks[activeTaskIndex].task_order = newOrder;

          const { error: updateError } = await supabase
            .from('tasks')
            .update({
              status: overColumn.id,
              task_order: newOrder,
              title: activeTask.title,
              updated_at: new Date().toISOString()
            })
            .eq('id', activeTask.id);

          if (updateError) {
            throw new Error(updateError.message || 'Görev durumu güncellenirken bir hata oluştu');
          }

          // Notify about the move
          onTaskMove(activeTask.id, overColumn.id);
        }
      } catch (error: any) {
        if (retryCount < maxRetries) {
          retryCount++;
          await new Promise(resolve => setTimeout(resolve, 1000 * retryCount)); // Exponential backoff
          return updateTasks();
        }
        throw error;
      }
    };

    try {
      await updateTasks();
    } catch (error: any) {
      console.error('Task update error:', error);
      toast({
        title: "Görev Güncelleme Hatası",
        description: error.message || "Görev güncellenirken beklenmeyen bir hata oluştu. Lütfen sayfayı yenileyip tekrar deneyin.",
        variant: "destructive"
      });
    } finally {
      setActiveId(null);
      setOverId(null);
    }
  };

  const handleTaskClick = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      setSelectedTask(task);
      setIsTaskModalOpen(true);
    }
  };

  return {
    // State
    activeId,
    overId,
    selectedTask,
    isTaskModalOpen,
    searchTerm,
    priorityFilter,
    assigneeFilter,
    sortDirection,
    
    // Setters
    setIsTaskModalOpen,
    setSelectedTask,
    setSearchTerm,
    setPriorityFilter,
    setAssigneeFilter,
    setSortDirection,
    
    // Computed Values
    assignees,
    filteredTasks,
    COLUMNS,
    
    // Event Handlers
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    handleTaskClick,
  };
} 