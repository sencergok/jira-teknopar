import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { TaskStatus, KanbanColumnProps } from '@/types';
import { TaskCard } from '@/components/task/task-card';
import { Button } from "@/components/ui/button";
import { PlusIcon } from "@radix-ui/react-icons";
import { TaskModal } from "@/components/modals/task-modal";
import { useState } from 'react';

export function KanbanColumn({ id, title, tasks, onTaskClick, projectId }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id,
  });

  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

  // Sort tasks by task_order
  const sortedTasks = [...tasks].sort((a, b) => 
    a.task_order.localeCompare(b.task_order)
  );

  return (
    <div
      ref={setNodeRef}
      className={`bg-gray-50 rounded-lg p-4 shadow-sm transition-colors duration-200
        ${isOver ? 'bg-gray-100 ring-2 ring-indigo-500/20' : ''}
      `}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-900 flex items-center">
          <span className="w-2 h-2 rounded-full mr-2" 
            style={{ backgroundColor: getColumnColor(id) }}
          ></span>
          {title}
          <span className="ml-2 text-xs text-gray-500">({tasks.length})</span>
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsTaskModalOpen(true)}
          className="text-gray-500 hover:text-gray-900 hover:bg-gray-100"
        >
          <PlusIcon className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-3 min-h-[120px]">
        <SortableContext items={sortedTasks.map(task => task.id)} strategy={verticalListSortingStrategy}>
          {sortedTasks.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              onTaskClick={onTaskClick}
            />
          ))}
        </SortableContext>
      </div>

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

function getColumnColor(status: TaskStatus): string {
  switch (status) {
    case TaskStatus.TODO:
      return '#6366F1'; // Indigo
    case TaskStatus.IN_PROGRESS:
      return '#F59E0B'; // Amber
    case TaskStatus.IN_REVIEW:
      return '#8B5CF6'; // Purple
    case TaskStatus.DONE:
      return '#10B981'; // Emerald
    default:
      return '#94A3B8'; // Gray
  }
} 