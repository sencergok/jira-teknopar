// Main chart component - Renders 3 data visualizations for task metrics
// calculateMetrics() - Computes status/priority distributions and weekly progress
// useEffect() - Triggers metric calculations when tasks change
// Pie/Bar Charts - Visualization components from Recharts library

'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TaskStatus, TaskPriority } from '@/types/task';
import { useProjectDetails } from '@/lib/hooks/use-project-details';

interface TaskMetrics {
  statusDistribution: { name: string; value: number; color: string; }[];
  priorityDistribution: { name: string; value: number; color: string; }[];
  weeklyProgress: { name: string; completed: number; total: number; }[];
}

interface TaskMetricsChartsProps {
  projectId: string;
}

// Status and priority labels/colors
const STATUS_LABELS: Record<TaskStatus, string> = {
  [TaskStatus.TODO]: 'Yapılacak',
  [TaskStatus.IN_PROGRESS]: 'Devam Ediyor',
  [TaskStatus.IN_REVIEW]: 'İncelemede',
  [TaskStatus.DONE]: 'Tamamlandı'
};

const STATUS_COLORS: Record<TaskStatus, string> = {
  [TaskStatus.TODO]: '#6366F1', // Indigo
  [TaskStatus.IN_PROGRESS]: '#F59E0B', // Amber
  [TaskStatus.IN_REVIEW]: '#8B5CF6', // Purple
  [TaskStatus.DONE]: '#10B981' // Emerald
};

const PRIORITY_LABELS: Record<TaskPriority, string> = {
  low: 'Düşük',
  medium: 'Orta',
  high: 'Yüksek'
};

const PRIORITY_COLORS: Record<TaskPriority, string> = {
  low: '#60A5FA', // Blue
  medium: '#F59E0B', // Amber
  high: '#EF4444' // Red
};

// Main chart component - Renders 3 data visualizations for task metrics
const TaskMetricsCharts: React.FC<TaskMetricsChartsProps> = ({ projectId }) => {
  // useProjectDetails hook'u ile realtime güncellemeleri otomatik alacak
  const { tasks } = useProjectDetails(projectId);
  
  const [metrics, setMetrics] = useState<TaskMetrics>({
    statusDistribution: [],
    priorityDistribution: [],
    weeklyProgress: []
  });

  // calculateMetrics() - Computes status/priority distributions and weekly progress
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
      
      // Initialize array for each day of the week
      const weekDays = Array.from({ length: 7 }, (_, i) => {
        const date = new Date(weekStart);
        date.setDate(date.getDate() + i);
        return {
          date,
          name: date.toLocaleDateString('tr-TR', { weekday: 'short' }),
          completed: 0,
          total: 0
        };
      });

      // Count tasks for each day
      tasks.forEach(task => {
        const createdAt = new Date(task.created_at);
        const dayIndex = Math.floor((createdAt.getTime() - weekStart.getTime()) / (1000 * 60 * 60 * 24));
        
        if (dayIndex >= 0 && dayIndex < 7) {
          weekDays[dayIndex].total += 1;
          if (task.status === TaskStatus.DONE) {
            weekDays[dayIndex].completed += 1;
          }
        }
      });

      const weeklyProgress = weekDays.map(day => ({
        name: day.name,
        completed: day.completed,
        total: day.total
      }));

      setMetrics({
        statusDistribution,
        priorityDistribution,
        weeklyProgress
      });
    };

    calculateMetrics();
  }, [tasks]);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <Card className="border-none bg-white shadow-sm">
          <CardContent className="p-6">
            <h3 className="text-sm font-medium text-gray-700 mb-4">Görev Durumu Dağılımı</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={metrics.statusDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {metrics.statusDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} görev`, 'Miktar']} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Priority Distribution */}
        <Card className="border-none bg-white shadow-sm">
          <CardContent className="p-6">
            <h3 className="text-sm font-medium text-gray-700 mb-4">Öncelik Dağılımı</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={metrics.priorityDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {metrics.priorityDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} görev`, 'Miktar']} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Progress */}
      <Card className="border-none bg-white shadow-sm">
        <CardContent className="p-6">
          <h3 className="text-sm font-medium text-gray-700 mb-4">Haftalık İlerleme</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={metrics.weeklyProgress}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="total" name="Toplam Görev" fill="#94A3B8" />
                <Bar dataKey="completed" name="Tamamlanan" fill="#10B981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TaskMetricsCharts;