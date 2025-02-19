import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import Image from 'next/image';

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

interface KanbanItemProps {
  task: Task;
  onTaskClick: (taskId: string) => void;
  isDragging?: boolean;
}

export function KanbanItem({ task, onTaskClick, isDragging = false }: KanbanItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
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

  const style = transform ? {
    transform: CSS.Translate.toString(transform),
    transition: transition || undefined,
    opacity: isDragging ? '0.5' : undefined,
    cursor: isDragging ? 'grabbing' : 'grab',
  } : undefined;

  const isCurrentlyDragging = isDragging || isSortableDragging;

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      onClick={() => onTaskClick(task.id)}
      className={`bg-white p-4 rounded-md select-none touch-none ${
        isCurrentlyDragging
          ? 'shadow-lg ring-2 ring-indigo-500 ring-opacity-50 cursor-grabbing z-50'
          : 'shadow-sm hover:shadow transition-shadow duration-200 cursor-grab'
      }`}
      style={style}
    >
      {/* Görev Başlığı */}
      <div className="text-sm font-medium text-gray-900 line-clamp-2">
        {task.title}
      </div>

      {/* Görev Açıklaması */}
      {task.description && (
        <div className="mt-2">
          <p className="text-sm text-gray-600 line-clamp-2">
            {task.description}
          </p>
        </div>
      )}

      <div className="mt-3 flex items-center justify-between">
        {/* Atanan Kişi */}
        <div className="flex items-center">
          {task.assignedTo && (
            <>
              {task.assignedTo?.avatar_url ? (
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
                    {task.assignedTo?.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <span className="ml-2 text-xs text-gray-500 truncate max-w-[80px]">
                {task.assignedTo.name}
              </span>
            </>
          )}
        </div>

        {/* Öncelik */}
        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium
          ${task.priority === 'high' ? 'bg-red-100 text-red-800' :
            task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
            'bg-green-100 text-green-800'}`}>
          {task.priority === 'high' ? 'Yüksek' :
            task.priority === 'medium' ? 'Orta' : 'Düşük'}
        </span>
      </div>
    </div>
  );
} 