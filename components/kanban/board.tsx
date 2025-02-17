'use client';

import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { useState, useMemo, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import Image from 'next/image';

interface Assignee {
  id: string;
  name: string;
  avatar_url: string | null;
}

type Task = {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  assignedTo: {
    id: string;
    name: string;
    avatar_url: string | null;
  } | null;
};

type KanbanBoardProps = {
  projectId: string;
  tasks: Task[];
  onTaskMove: (taskId: string, newStatus: string) => void;
  onTaskClick: (taskId: string) => void;
};

type Column = {
  id: string;
  title: string;
};

const columns: Column[] = [
  { id: 'todo', title: 'Yapılacak' },
  { id: 'in_progress', title: 'Devam Ediyor' },
  { id: 'in_review', title: 'İncelemede' },
  { id: 'done', title: 'Tamamlandı' },
];

export function KanbanBoard({ projectId, tasks, onTaskMove, onTaskClick }: KanbanBoardProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [assigneeFilter, setAssigneeFilter] = useState<string>('all');

  useEffect(() => {
    const supabase = createClient();

    // Realtime abonelik
    const taskSubscription = supabase
      .channel('public:tasks')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, (payload: { new: { id: string; status: string } }) => {
        console.log('Task değişikliği:', payload);
        onTaskMove(payload.new.id, payload.new.status);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(taskSubscription);
    };
  }, [onTaskMove]);

  // Benzersiz atanan kişileri al
  const assignees = useMemo(() => {
    const uniqueAssignees = new Set();
    tasks.forEach(task => {
      if (task.assignedTo) {
        uniqueAssignees.add(JSON.stringify(task.assignedTo));
      }
    });
    return Array.from(uniqueAssignees).map(assignee => JSON.parse(assignee as string) as Assignee);
  }, [tasks]);

  // Filtrelenmiş görevler
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (task.description?.toLowerCase() || '').includes(searchTerm.toLowerCase());
      
      const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
      
      const matchesAssignee = assigneeFilter === 'all' ||
        (assigneeFilter === 'unassigned' && !task.assignedTo) ||
        (task.assignedTo?.id === assigneeFilter);

      return matchesSearch && matchesPriority && matchesAssignee;
    });
  }, [tasks, searchTerm, priorityFilter, assigneeFilter]);

  // Sürükle-bırak işleyicisi
  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;

    const { draggableId, source, destination } = result;
    
    if (source.droppableId === destination.droppableId && 
        source.index === destination.index) {
      return;
    }

    // Görev durumunu güncelle
    const newStatus = destination.droppableId;
    onTaskMove(draggableId, newStatus);

    try {
      const supabase = createClient();
      
      // Hedef kolondaki görevleri al
      const { data: columnTasks, error: fetchError } = await supabase
        .from('tasks')
        .select('id, task_order')
        .eq('status', newStatus)
        .eq('project_id', projectId)
        .order('task_order', { ascending: true });

      if (fetchError) {
        console.error('Görevler alınırken hata:', fetchError);
        return;
      }

      // Yeni sıra değerini hesapla
      let newOrder: number;
      
      if (columnTasks.length === 0) {
        newOrder = 1000;
      } else if (destination.index === 0) {
        newOrder = columnTasks[0].task_order / 2;
      } else if (destination.index >= columnTasks.length) {
        newOrder = columnTasks[columnTasks.length - 1].task_order + 1000;
      } else {
        const prevOrder = columnTasks[destination.index - 1].task_order;
        const nextOrder = columnTasks[destination.index].task_order;
        newOrder = (prevOrder + nextOrder) / 2;
      }

      // Görevin durumunu ve sırasını güncelle
      const { error: updateError } = await supabase
        .from('tasks')
        .update({
          status: newStatus,
          task_order: newOrder,
        })
        .eq('id', draggableId);

      if (updateError) {
        console.error('Görev sıralaması güncellenirken hata:', updateError);
      }
    } catch (error) {
      console.error('Sıralama güncellenirken hata:', error);
    }
  };

  return (
    <div className="space-y-4">
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
            onChange={(e) => setPriorityFilter(e.target.value)}
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
            {assignees.map((assignee: Assignee) => (
              <option key={assignee.id} value={assignee.id}>
                {assignee.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Kanban Board */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {columns.map((column) => (
            <div key={column.id} className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-900 mb-4">{column.title}</h3>
              <Droppable droppableId={column.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`space-y-2 min-h-[100px] ${
                      snapshot.isDraggingOver ? 'bg-gray-100' : ''
                    }`}
                  >
                    {filteredTasks
                      .filter((task) => task.status === column.id)
                      .map((task, index) => (
                        <Draggable key={task.id} draggableId={task.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              onClick={() => onTaskClick(task.id)}
                              className={`bg-white p-3 rounded-md shadow-sm hover:shadow cursor-pointer ${
                                snapshot.isDragging ? 'shadow-lg' : ''
                              }`}
                            >
                              {/* Görev Başlığı */}
                              <div className="text-sm font-medium text-gray-900">
                                {task.title}
                              </div>

                              {/* Görev Açıklaması */}
                              {task.description && (
                                <div className="mt-1">
                                  <p className="text-sm text-gray-600 line-clamp-3">
                                    {task.description}
                                  </p>
                                </div>
                              )}

                              {/* Atanan Kişi */}
                              {task.assignedTo && (
                                <div className="mt-2 flex items-center">
                                  {task.assignedTo?.avatar_url ? (
                                    <Image
                                      src={task.assignedTo.avatar_url}
                                      alt={task.assignedTo.name}
                                      width={32}
                                      height={32}
                                      className="h-8 w-8 rounded-full"
                                    />
                                  ) : (
                                    <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                                      <span className="text-sm font-medium text-gray-600">
                                        {task.assignedTo?.name?.charAt(0).toUpperCase()}
                                      </span>
                                    </div>
                                  )}
                                  <span className="ml-2 text-xs text-gray-500">
                                    {task.assignedTo.name}
                                  </span>
                                </div>
                              )}

                              {/* Öncelik */}
                              <div className="mt-2">
                                <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium
                                  ${task.priority === 'high' ? 'bg-red-50 text-red-700 ring-red-600/20' :
                                    task.priority === 'medium' ? 'bg-yellow-50 text-yellow-700 ring-yellow-600/20' :
                                    'bg-green-50 text-green-700 ring-green-600/20'} ring-1 ring-inset`}>
                                  {task.priority === 'high' ? 'Yüksek' :
                                    task.priority === 'medium' ? 'Orta' : 'Düşük'}
                                </span>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
}