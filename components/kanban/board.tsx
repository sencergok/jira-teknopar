'use client';

import { useState, useMemo, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
  DndContext, 
  DragOverlay,
  useSensor,
  useSensors,
  MouseSensor,
  TouchSensor,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
  UniqueIdentifier,
  rectIntersection,
} from '@dnd-kit/core';
import { createPortal } from 'react-dom';
import { TaskCard } from './task-card';
import { TaskModal } from "@/components/modals/task-modal";
import { Task, TaskStatus } from '@/types';
import { KanbanColumn } from './kanban-column';
import { useDebounce } from '@/lib/hooks/use-debounce';

const COLUMNS = [
  { id: 'todo' as TaskStatus, title: 'Yapılacak' },
  { id: 'in_progress' as TaskStatus, title: 'Devam Ediyor' },
  { id: 'in_review' as TaskStatus, title: 'İncelemede' },
  { id: 'done' as TaskStatus, title: 'Tamamlandı' },
] as const;

interface KanbanBoardProps {
  projectId: string;
  tasks: Task[];
  onTaskMove: (taskId: string, newStatus: Task['status']) => void;
  onTaskClick: (taskId: string) => void;
}

export function KanbanBoard({ projectId, tasks: initialTasks, onTaskMove, onTaskClick }: KanbanBoardProps) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<'all' | Task['priority']>('all');
  const [assigneeFilter, setAssigneeFilter] = useState<string>('all');
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);


  // Debounce search term and filters it is updated after 1 second
  const debouncedSearchTerm = useDebounce(searchTerm, 1000);
  const debouncedPriorityFilter = useDebounce(priorityFilter, 1000);
  const debouncedAssigneeFilter = useDebounce(assigneeFilter, 1000);


  // Realtime subscription
  useEffect(() => {
    const supabase = createClient();
    const taskSubscription = supabase
      .channel('public:tasks')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, (payload: { new: { id: string; status: TaskStatus } }) => {
        console.log('Task değişikliği:', payload);
        onTaskMove(payload.new.id, payload.new.status);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(taskSubscription);
    };
  }, [onTaskMove]);

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 5,
      },
    })
  );

  // Benzersiz atanan kişileri al
  const assignees = useMemo(() => {
    const uniqueAssignees = new Set();
    tasks.forEach(task => {
      if (task.assignedTo) {
        uniqueAssignees.add(JSON.stringify(task.assignedTo));
      }
    });
    return Array.from(uniqueAssignees).map(assignee => JSON.parse(assignee as string));
  }, [tasks]);

  // Filtered tasks with search term and filters with the help of useMemo and debounced values which is coming from useDebounce customize hook
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const matchesSearch = task.title.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        (task.description?.toLowerCase() || '').includes(debouncedSearchTerm.toLowerCase());
  
      const matchesPriority = debouncedPriorityFilter === 'all' || task.priority === debouncedPriorityFilter;
      
      const matchesAssignee = debouncedAssigneeFilter === 'all' ||
        (debouncedAssigneeFilter === 'unassigned' && !task.assignedTo) ||
        (task.assignedTo?.id === debouncedAssigneeFilter);
  
      return matchesSearch && matchesPriority && matchesAssignee;
    });
  }, [tasks, debouncedSearchTerm, debouncedPriorityFilter, debouncedAssigneeFilter]);
  

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeTask = tasks.find(t => t.id === active.id);
    const overColumn = COLUMNS.find(col => col.id === over.id);

    if (!activeTask || !overColumn) return;

    // If the task is already in this column, do nothing
    if (activeTask.status === overColumn.id) return;

    onTaskMove(activeTask.id, overColumn.id);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) return;

    const activeTask = tasks.find(t => t.id === active.id);
    const overColumn = COLUMNS.find(col => col.id === over.id);

    if (!activeTask || !overColumn) return;

    try {
      const supabase = createClient();
      
      const { data: columnTasks, error: fetchError } = await supabase
        .from('tasks')
        .select('id, task_order')
        .eq('status', overColumn.id)
        .eq('project_id', projectId)
        .order('task_order', { ascending: true });

      if (fetchError) throw fetchError;

      let newOrder: number;
      
      if (columnTasks.length === 0) {
        // Kolon boşsa, başlangıç değeri
        newOrder = 1000;
      } else if (columnTasks.length === 1) {
        // Kolonda tek görev varsa, onun altına ekle
        newOrder = parseInt(columnTasks[0].task_order) + 1000;
      } else {
        // Görevler arasına eklemek için ortalama al
        const lastTask = columnTasks[columnTasks.length - 1];
        const secondLastTask = columnTasks[columnTasks.length - 2];
        newOrder = (parseInt(lastTask.task_order) + parseInt(secondLastTask.task_order)) / 2;
      }

      const { error: updateError } = await supabase
        .from('tasks')
        .update({
          status: overColumn.id,
          task_order: String(newOrder),
        })
        .eq('id', activeTask.id);

      if (updateError) throw updateError;

    } catch (error) {
      console.error('Task update error:', error);
    }

    setActiveId(null);
  };

  // Görev tıklama işleyicisi
  const handleTaskClick = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      setSelectedTask(task);
      setIsTaskModalOpen(true);
    }
  };

  return (
    <div className="space-y-6">
      {/* Filtreler */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <label htmlFor="search" className="block text-sm font-medium text-gray-700">
            Ara
          </label>
          <input
            type="text"
            id="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Görev ara..."
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="priority" className="block text-sm font-medium text-gray-700">
            Öncelik
          </label>
          <select
            id="priority"
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value as 'all' | Task['priority'])}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            <option value="all">Tümü</option>
            <option value="low">Düşük</option>
            <option value="medium">Orta</option>
            <option value="high">Yüksek</option>
          </select>
        </div>

        <div>
          <label htmlFor="assignee" className="block text-sm font-medium text-gray-700">
            Atanan Kişi
          </label>
          <select
            id="assignee"
            value={assigneeFilter}
            onChange={(e) => setAssigneeFilter(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            <option value="all">Tümü</option>
            <option value="unassigned">Atanmamış</option>
            {assignees.map((assignee: any) => (
              <option key={assignee.id} value={assignee.id}>
                {assignee.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Kanban Board */}
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        collisionDetection={rectIntersection}
      >
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {COLUMNS.map(column => (
            <KanbanColumn
              key={column.id}
              id={column.id}
              title={column.title}
              tasks={filteredTasks.filter(task => task.status === column.id)}
              onTaskClick={handleTaskClick}
              projectId={projectId}
            />
          ))}
        </div>

        {typeof document !== 'undefined' && createPortal(
          <DragOverlay>
            {activeId && tasks.find(task => task.id === activeId) ? (
              <TaskCard
                task={tasks.find(task => task.id === activeId)!}
                onTaskClick={handleTaskClick}
                isDragging
              />
            ) : null}
          </DragOverlay>,
          document.body
        )}
      </DndContext>

      {/* Task Modal for editing */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false);
          setSelectedTask(null);
        }}
        projectId={projectId}
        existingTask={selectedTask || undefined}
        onSuccess={() => {
          setIsTaskModalOpen(false);
          setSelectedTask(null);
        }}
        permissions={{
          canEditTask: true,
          canDeleteTask: true,
          canAssignTasks: true
        }}
      />
    </div>
  );
}