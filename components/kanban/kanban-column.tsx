import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Task, TaskStatus } from '@/types';
import { TaskCard } from './task-card';
import { Button } from "@/components/ui/button";
import { PlusIcon } from "@radix-ui/react-icons";
import { TaskModal } from "@/components/modals/task-modal";
import { useState } from 'react';

const columnColors = {
  todo: '#6366F1',
  in_progress: '#F59E0B',
  in_review: '#8B5CF6',
  done: '#10B981',
};

interface KanbanColumnProps {
  id: TaskStatus;
  title: string;
  tasks: Task[];
  onTaskClick: (taskId: string) => void;
  projectId: string;
}

export function KanbanColumn({ id, title, tasks, onTaskClick, projectId }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id,
  });

  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

  return (
    <div
      ref={setNodeRef}
      className={`bg-gray-50 rounded-lg p-4 shadow-sm transition-colors duration-200
        ${isOver ? 'bg-gray-100 ring-2 ring-indigo-500/20' : ''}
      `}
    >
      <h3 className="text-sm font-medium text-gray-900 mb-4 flex items-center">
        <span className="w-2 h-2 rounded-full mr-2" 
          style={{ backgroundColor: columnColors[id] }}
        ></span>
        {title}
      </h3>
      <div className="space-y-3 min-h-[120px]">
        <SortableContext items={tasks.map(task => task.id)} strategy={verticalListSortingStrategy}>
          {tasks.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              onTaskClick={onTaskClick}
            />
          ))}
        </SortableContext>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsTaskModalOpen(true)}
        className="w-full mt-3 text-gray-500 hover:text-gray-900 hover:bg-gray-100"
      >
        <PlusIcon className="mr-2 h-4 w-4" />
        Yeni Görev
      </Button>

      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        projectId={projectId}
        initialStatus={id}
        onSuccess={() => setIsTaskModalOpen(false)}
      />
    </div>
  );
} 