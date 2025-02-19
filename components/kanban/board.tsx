'use client';

import { useState, useEffect, ChangeEvent } from 'react';
import {
  DndContext, 
  DragOverlay,
  useSensor,
  useSensors,
  MouseSensor,
  TouchSensor,
  rectIntersection,
} from '@dnd-kit/core';
import { createPortal } from 'react-dom';
import { TaskCard } from "@/components/task/task-card";
import { TaskModal } from "@/components/modals/task-modal";
import { Task, KanbanBoardProps, TaskPriority } from '@/types';
import { KanbanColumn } from './column';
import { useTaskManagement } from '@/lib/hooks/use-task-management';
import { useRealtimeSubscription } from '@/lib/hooks/use-realtime-subscription';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  PersonIcon,
  MixerHorizontalIcon,
} from "@radix-ui/react-icons";

const priorityOptions = [
  { value: 'all', label: 'Tüm Öncelikler' },
  { value: 'high', label: 'Yüksek Öncelik' },
  { value: 'medium', label: 'Orta Öncelik' },
  { value: 'low', label: 'Düşük Öncelik' },
] as const;

export function KanbanBoard({ projectId, tasks: initialTasks, onTaskMove }: KanbanBoardProps) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);

  useEffect(() => {
    setTasks(initialTasks);
  }, [initialTasks]);

  const {
    // State
    activeId,
    selectedTask,
    isTaskModalOpen,
    searchTerm,
    priorityFilter,
    assigneeFilter,
    sortDirection,
    
    // Setters
    setIsTaskModalOpen,
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
  } = useTaskManagement({ 
    projectId, 
    tasks, 
    onTaskMove 
  });

  useRealtimeSubscription(projectId, onTaskMove);

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

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="search">Ara</Label>
          <input
            id="search"
            type="text"
            value={searchTerm}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
            placeholder="Görev ara..."
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="space-y-2">
          <Label>Öncelik</Label>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-between"
              >
                <div className="flex items-center gap-2">
                  <MixerHorizontalIcon className="h-4 w-4" />
                  <span>
                    {priorityOptions.find(opt => opt.value === priorityFilter)?.label || 'Tüm Öncelikler'}
                  </span>
                </div>
                {sortDirection === 'asc' ? (
                  <ArrowUpIcon className="h-4 w-4 ml-2" />
                ) : (
                  <ArrowDownIcon className="h-4 w-4 ml-2" />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Önceliğe Göre Sırala</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {priorityOptions.map((option) => (
                <DropdownMenuItem
                  key={option.value}
                  onClick={() => {
                    if (priorityFilter === option.value) {
                      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
                    } else {
                      setPriorityFilter(option.value as TaskPriority | 'all');
                    }
                  }}
                  className="flex items-center justify-between"
                >
                  <span>{option.label}</span>
                  {priorityFilter === option.value && (
                    sortDirection === 'asc' ? (
                      <ArrowUpIcon className="h-4 w-4" />
                    ) : (
                      <ArrowDownIcon className="h-4 w-4" />
                    )
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="space-y-2">
          <Label>Atanan Kişi</Label>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-between"
              >
                <div className="flex items-center gap-2">
                  <PersonIcon className="h-4 w-4" />
                  <span>
                    {assigneeFilter === 'all' ? 'Tüm Kişiler' :
                     assigneeFilter === 'unassigned' ? 'Atanmamış' :
                     assignees.find(a => a.id === assigneeFilter)?.name || 'Tüm Kişiler'}
                  </span>
                </div>
                {sortDirection === 'asc' ? (
                  <ArrowUpIcon className="h-4 w-4 ml-2" />
                ) : (
                  <ArrowDownIcon className="h-4 w-4 ml-2" />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Kişiye Göre Sırala</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  if (assigneeFilter === 'all') {
                    setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
                  } else {
                    setAssigneeFilter('all');
                  }
                }}
                className="flex items-center justify-between"
              >
                <span>Tüm Kişiler</span>
                {assigneeFilter === 'all' && (
                  sortDirection === 'asc' ? (
                    <ArrowUpIcon className="h-4 w-4" />
                  ) : (
                    <ArrowDownIcon className="h-4 w-4" />
                  )
                )}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  if (assigneeFilter === 'unassigned') {
                    setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
                  } else {
                    setAssigneeFilter('unassigned');
                  }
                }}
                className="flex items-center justify-between"
              >
                <span>Atanmamış</span>
                {assigneeFilter === 'unassigned' && (
                  sortDirection === 'asc' ? (
                    <ArrowUpIcon className="h-4 w-4" />
                  ) : (
                    <ArrowDownIcon className="h-4 w-4" />
                  )
                )}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {assignees.map((assignee) => (
                <DropdownMenuItem
                  key={assignee.id}
                  onClick={() => {
                    if (assigneeFilter === assignee.id) {
                      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
                    } else {
                      setAssigneeFilter(assignee.id);
                    }
                  }}
                  className="flex items-center justify-between"
                >
                  <span>{assignee.name}</span>
                  {assigneeFilter === assignee.id && (
                    sortDirection === 'asc' ? (
                      <ArrowUpIcon className="h-4 w-4" />
                    ) : (
                      <ArrowDownIcon className="h-4 w-4" />
                    )
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
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

      {/* Task Modal */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        projectId={projectId}
        existingTask={selectedTask || undefined}
        onSuccess={() => {
          setIsTaskModalOpen(false);
          if (selectedTask) {
            onTaskMove(selectedTask.id, selectedTask.status);
          }
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