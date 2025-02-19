import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import Image from 'next/image';
import { useState } from 'react';
import { Task, TaskCardProps, TASK_PRIORITY_COLORS, TASK_PRIORITY_LABELS } from '@/types';
import { TaskModal } from './task-modal';
import { useProjectPermissions } from '@/lib/hooks/use-project-permissions';
import { useAuth } from '@/lib/hooks/use-auth';

export function TaskCard({ task, onTaskClick, isDragging = false }: TaskCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { user } = useAuth();
  const { permissions } = useProjectPermissions(task.project_id, user?.id);

  const taskModalPermissions = {
    canEditTask: permissions.canEditTasks,
    canDeleteTask: permissions.canDeleteTasks,
    canAssignTasks: permissions.canAssignTasks,
  };

  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({
    id: task.id,
    data: {
      type: 'task',
      task,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging || isSortableDragging ? '0.5' : undefined,
    cursor: isDragging || isSortableDragging ? 'grabbing' : 'grab',
    position: 'relative' as const,
    zIndex: isDragging || isSortableDragging ? 999 : undefined,
  };

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        className="bg-white rounded-lg shadow-sm p-4 border border-gray-200 hover:border-indigo-500/20 hover:shadow-md transition-all duration-200"
        onClick={() => setIsModalOpen(true)}
      >
        <div className="text-sm font-medium text-gray-900 mb-1">
          {task.title}
        </div>
        
        {task.description && (
          <p className="text-sm text-gray-500 line-clamp-2 mb-3">
            {task.description}
          </p>
        )}

        <div className="flex items-center justify-between">
          {task.assignedTo && (
            <div className="flex items-center">
              {task.assignedTo.avatar_url ? (
                <Image
                  src={task.assignedTo.avatar_url}
                  alt={task.assignedTo.name}
                  width={24}
                  height={24}
                  className="h-6 w-6 rounded-full ring-2 ring-white"
                />
              ) : (
                <div className="h-6 w-6 rounded-full bg-indigo-100 flex items-center justify-center ring-2 ring-white">
                  <span className="text-xs font-medium text-indigo-600">
                    {task.assignedTo.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <span className="ml-2 text-xs text-gray-500 truncate max-w-[80px]">
                {task.assignedTo.name}
              </span>
            </div>
          )}

          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${getPriorityStyles(task.priority)}`}>
            {TASK_PRIORITY_LABELS[task.priority]}
          </span>
        </div>
      </div>

      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        projectId={task.project_id}
        existingTask={task}
        onSuccess={() => {
          setIsModalOpen(false);
        }}
        permissions={taskModalPermissions}
      />
    </>
  );
}

function getPriorityStyles(priority: Task['priority']): string {
  const color = TASK_PRIORITY_COLORS[priority];
  return `bg-${color}/10 text-${color}`;
} 