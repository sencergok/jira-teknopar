'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Task, TaskStatus, TaskPriority } from '@/types/task';

interface TaskMetrics {
  statusDistribution: { name: string; value: number; color: string; }[];
  priorityDistribution: { name: string; value: number; color: string; }[];
  weeklyProgress: { name: string; completed: number; total: number; }[];
}

const STATUS_COLORS = {
  [TaskStatus.TODO]: '#94a3b8',
  [TaskStatus.IN_PROGRESS]: '#3b82f6',
  [TaskStatus.IN_REVIEW]: '#f59e0b',
  [TaskStatus.DONE]: '#22c55e'
};

const PRIORITY_COLORS = {
  [TaskPriority.LOW]: '#94a3b8',
  [TaskPriority.MEDIUM]: '#f59e0b',
  [TaskPriority.HIGH]: '#ef4444'
};

const STATUS_LABELS = {
  [TaskStatus.TODO]: 'Yapılacak',
  [TaskStatus.IN_PROGRESS]: 'Devam Eden',
  [TaskStatus.IN_REVIEW]: 'İncelemede',
  [TaskStatus.DONE]: 'Tamamlandı'
};

const PRIORITY_LABELS = {
  [TaskPriority.LOW]: 'Düşük',
  [TaskPriority.MEDIUM]: 'Orta',
  [TaskPriority.HIGH]: 'Yüksek'
};

interface TaskMetricsChartsProps {
  projectId: string;
  tasks: Task[];
}

const TaskMetricsCharts: React.FC<TaskMetricsChartsProps> = ({ projectId, tasks }) => {
  const [metrics, setMetrics] = useState<TaskMetrics>({
    statusDistribution: [],
    priorityDistribution: [],
    weeklyProgress: []
  });

  useEffect(() => {
    const calculateMetrics = () => {
      // Calculate status distribution
      const statusCounts = tasks.reduce<Record<TaskStatus, number>>((acc, task) => {
        acc[task.status] = (acc[task.status] || 0) + 1;
        return acc;
      }, {} as Record<TaskStatus, number>);

      const statusDistribution = Object.entries(statusCounts).map(([status, count]) => ({
        name: STATUS_LABELS[status as TaskStatus],
        value: count,
        color: STATUS_COLORS[status as TaskStatus]
      }));

      // Calculate priority distribution
      const priorityCounts = tasks.reduce<Record<TaskPriority, number>>((acc, task) => {
        acc[task.priority] = (acc[task.priority] || 0) + 1;
        return acc;
      }, {} as Record<TaskPriority, number>);

      const priorityDistribution = Object.entries(priorityCounts).map(([priority, count]) => ({
        name: PRIORITY_LABELS[priority as TaskPriority],
        value: count,
        color: PRIORITY_COLORS[priority as TaskPriority]
      }));

      // Calculate weekly progress
      const now = new Date();
      const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
      const weeklyProgress = Array.from({ length: 7 }, (_, i) => {
        const date = new Date(weekStart);
        date.setDate(date.getDate() + i);
        const dayTasks = tasks.filter(task => {
          const taskDate = new Date(task.created_at);
          return taskDate.getDate() === date.getDate() &&
                 taskDate.getMonth() === date.getMonth() &&
                 taskDate.getFullYear() === date.getFullYear();
        });
        const completedTasks = dayTasks.filter(task => task.completed_at && new Date(task.completed_at).getDate() === date.getDate());
        return {
          name: date.toLocaleDateString('tr-TR', { weekday: 'short' }),
          completed: completedTasks.length,
          total: dayTasks.length
        };
      });

      setMetrics({
        statusDistribution,
        priorityDistribution,
        weeklyProgress
      });
    };

    calculateMetrics();
  }, [tasks]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="border-none bg-white shadow-sm">
        <CardContent className="p-6">
          <h3 className="text-sm font-medium text-gray-900 mb-4">Görev Durumları</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={metrics.statusDistribution}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={(entry) => `${entry.name}: ${entry.value}`}
                >
                  {metrics.statusDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="border-none bg-white shadow-sm">
        <CardContent className="p-6">
          <h3 className="text-sm font-medium text-gray-900 mb-4">Öncelik Dağılımı</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={metrics.priorityDistribution}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={(entry) => `${entry.name}: ${entry.value}`}
                >
                  {metrics.priorityDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="col-span-1 lg:col-span-2 border-none bg-white shadow-sm">
        <CardContent className="p-6">
          <h3 className="text-sm font-medium text-gray-900 mb-4">Haftalık İlerleme</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metrics.weeklyProgress}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="completed" name="Tamamlanan" fill="#22c55e" />
                <Bar dataKey="total" name="Toplam" fill="#94a3b8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TaskMetricsCharts;