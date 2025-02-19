import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import Image from 'next/image';
import { Task } from '@/types';

const priorityColors = {
  low: 'bg-emerald-100 text-emerald-700',
  medium: 'bg-amber-100 text-amber-700',
  high: 'bg-rose-100 text-rose-700',
};

const priorityText = {
  low: 'Düşük',
  medium: 'Orta',
  high: 'Yüksek',
};

interface TaskCardProps {
  task: Task;
  onTaskClick: (taskId: string) => void;
  isDragging?: boolean;
}

export function TaskCard({ task, onTaskClick, isDragging = false }: TaskCardProps) {
  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging: isSortableDragging,
    over,
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
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={style}
      onClick={() => onTaskClick(task.id)}
      className={`
        bg-white rounded-lg p-4 
        ${isDragging || isSortableDragging 
          ? 'shadow-lg ring-2 ring-indigo-500/50 scale-105' 
          : 'shadow-sm hover:shadow-md hover:scale-[1.02]'
        }
        ${over ? 'translate-y-2' : ''}
        transition-all duration-200 ease-in-out
        select-none touch-none
        transform-gpu
      `}
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

        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${priorityColors[task.priority as keyof typeof priorityColors]}`}>
          {priorityText[task.priority as keyof typeof priorityText]}
        </span>
      </div>
    </div>
  );
} 