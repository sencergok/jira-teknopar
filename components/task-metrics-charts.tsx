'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { AlertCircle, CheckCircle, Clock, PieChart as PieChartIcon, BarChart as BarChartIcon, ListTodo } from "lucide-react";

interface TaskMetricsChartsProps {
  projectId: string;
}

interface Task {
  status: 'todo' | 'in_progress' | 'in_review' | 'done';
}

interface Metrics {
  total: number;
  todo: number;
  in_progress: number;
  in_review: number;
  done: number;
}

interface RealtimePayload {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  new: { status: string; } & Record<string, unknown>;
  old: { status: string; } & Record<string, unknown>;
}

interface SubscriptionStatus {
  state: string;
  subscription_id: string;
}

interface ChartDataItem {
  name: string;
  value: number;
  color: string;
  total: number;
}

interface TooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: ChartDataItem;
  }>;
}

interface FetchError {
  message: string;
}

const STATUS_CONFIG = [
  { 
    name: 'Yapılacak', 
    key: 'todo', 
    color: '#e11d48', 
    bgColor: 'bg-rose-100', 
    textColor: 'text-rose-700',
    icon: <ListTodo className="h-5 w-5 text-rose-500" /> 
  },
  { 
    name: 'Devam Eden', 
    key: 'in_progress', 
    color: '#fb923c', 
    bgColor: 'bg-orange-100', 
    textColor: 'text-orange-700',
    icon: <Clock className="h-5 w-5 text-orange-500" /> 
  },
  { 
    name: 'İncelemede', 
    key: 'in_review', 
    color: '#0ea5e9', 
    bgColor: 'bg-sky-100', 
    textColor: 'text-sky-700',
    icon: <AlertCircle className="h-5 w-5 text-sky-500" /> 
  },
  { 
    name: 'Tamamlanan', 
    key: 'done', 
    color: '#16a34a', 
    bgColor: 'bg-green-100', 
    textColor: 'text-green-700',
    icon: <CheckCircle className="h-5 w-5 text-green-500" /> 
  },
];

const CustomTooltip = ({ active, payload }: TooltipProps) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const config = STATUS_CONFIG.find(s => s.name === data.name);
    
    return (
      <div className={`${config?.bgColor} border rounded-lg p-3 shadow-lg`}>
        <p className={`text-sm font-semibold flex items-center gap-2 ${config?.textColor}`}>
          {config?.icon}
          {data.name}
        </p>
        <p className={`text-sm ${config?.textColor} mt-1`}>
          {data.value} görev ({((data.value / data.total) * 100).toFixed(1)}%)
        </p>
      </div>
    );
  }
  return null;
};

export default function TaskMetricsCharts({ projectId }: TaskMetricsChartsProps) {
  const [metrics, setMetrics] = useState<Metrics>({
    total: 0,
    todo: 0,
    in_progress: 0,
    in_review: 0,
    done: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = useCallback(async () => {
    const supabase = createClient();
    try {
      const { data, error: tasksError } = await supabase
        .from('tasks')
        .select('status')
        .eq('project_id', projectId);

      if (tasksError) throw tasksError;

      const todo = data?.filter((task: Task) => task.status === 'todo').length ?? 0;
      const in_progress = data?.filter((task: Task) => task.status === 'in_progress').length ?? 0;
      const in_review = data?.filter((task: Task) => task.status === 'in_review').length ?? 0;
      const done = data?.filter((task: Task) => task.status === 'done').length ?? 0;
      
      const total = todo + in_progress + in_review + done;

      const newMetrics = {
        total,
        todo,
        in_progress,
        in_review,
        done
      };

      setMetrics(newMetrics);
      console.log('Initial metrics:', newMetrics);
    } catch (err: unknown) {
      const fetchError = err as FetchError;
      console.error('Görev metrikleri çekilirken hata:', fetchError);
      setError(fetchError.message);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchMetrics();

    const supabase = createClient();
    
    const channel = supabase.channel(`tasks-${projectId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks',
          filter: `project_id=eq.${projectId}`
        },
        (payload: RealtimePayload) => {
          console.log('Task change detected:', payload);
          fetchMetrics();
        }
      )
      .subscribe((status: SubscriptionStatus) => {
        console.log(`Metrics subscription status for project ${projectId}:`, status);
      });

    return () => {
      console.log(`Unsubscribing from metrics updates for project ${projectId}`);
      supabase.removeChannel(channel);
    };
  }, [projectId, fetchMetrics]);

  if (loading) return (
    <Card className="w-full bg-card/30 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-primary">
          <div className="h-6 w-6 animate-pulse bg-primary/20 rounded-full"></div>
          <div className="h-4 w-32 animate-pulse bg-primary/20 rounded"></div>
        </CardTitle>
        <CardDescription>
          <div className="h-3 w-24 animate-pulse bg-muted rounded"></div>
        </CardDescription>
      </CardHeader>
    </Card>
  );

  if (error) return (
    <Card className="w-full border-rose-200 bg-rose-50 dark:bg-rose-950/20">
      <CardHeader>
        <CardTitle className="text-rose-500 flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          Hata Oluştu
        </CardTitle>
        <CardDescription className="text-rose-400">{error}</CardDescription>
      </CardHeader>
    </Card>
  );

  const chartData = STATUS_CONFIG.map(status => ({
    name: status.name,
    value: metrics[status.key as keyof Omit<Metrics, 'total'>],
    color: status.color,
    total: metrics.total
  }));

  return (
    <Card className="w-full overflow-hidden border-none bg-gradient-to-br from-card/50 to-card/80 backdrop-blur-sm shadow-xl">
      <CardHeader className="pb-0">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="text-xl font-bold tracking-tight">
              Görev Metrikleri
            </CardTitle>
            <CardDescription className="text-muted-foreground/80">
              Projenin durumu ve ilerleme detayları
            </CardDescription>
          </div>
          <Badge className="self-start bg-primary/10 text-primary hover:bg-primary/20 h-7 px-3 text-sm">
            Toplam {metrics.total} görev
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="pt-6">
        <Tabs defaultValue="cards" className="w-full">
          <TabsList className="grid w-full grid-cols-3 h-12 rounded-xl p-1 bg-muted/50">
            <TabsTrigger value="cards" className="rounded-lg">
              <span className="flex items-center gap-2">
                <ListTodo className="h-4 w-4" />
                <span className="hidden sm:inline">Kartlar</span>
              </span>
            </TabsTrigger>
            <TabsTrigger value="pie" className="rounded-lg">
              <span className="flex items-center gap-2">
                <PieChartIcon className="h-4 w-4" />
                <span className="hidden sm:inline">Pasta Grafik</span>
              </span>
            </TabsTrigger>
            <TabsTrigger value="bar" className="rounded-lg">
              <span className="flex items-center gap-2">
                <BarChartIcon className="h-4 w-4" />
                <span className="hidden sm:inline">Çubuk Grafik</span>
              </span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="cards" className="mt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {STATUS_CONFIG.map((status) => {
                const metricValue = metrics[status.key as keyof Omit<Metrics, 'total'>];
                const percentage = metrics.total > 0 ? (metricValue / metrics.total) * 100 : 0;
                
                return (
                  <Card key={status.key} className={`${status.bgColor} border-none`}>
                    <CardHeader className="pb-2">
                      <CardTitle className={`text-base font-medium flex items-center gap-2 ${status.textColor}`}>
                        {status.icon}
                        {status.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-col gap-1">
                        <p className={`text-3xl font-bold ${status.textColor}`}>{metricValue}</p>
                        <p className={`text-sm ${status.textColor}/70`}>Toplam görevlerin {percentage.toFixed(1)}%&apos;i</p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
          
          <TabsContent value="pie" className="mt-6">
            <div className="h-[400px] w-full flex flex-col md:flex-row items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={100}
                    outerRadius={140}
                    paddingAngle={5}
                    dataKey="value"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                  >
                    {chartData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.color} 
                        stroke="none"
                        className="hover:opacity-90 transition-opacity"
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
          
          <TabsContent value="bar" className="mt-6">
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart 
                  data={chartData} 
                  layout="vertical" 
                  margin={{ left: 20, right: 20, top: 20, bottom: 20 }}
                >
                  <XAxis type="number" />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    width={100}
                    tick={({ x, y, payload }) => {
                      const config = STATUS_CONFIG.find(s => s.name === payload.value);
                      return (
                        <g transform={`translate(${x},${y})`}>
                          <text x={-28} y={0} dy={4} textAnchor="end" fill={config?.color} className="text-xs font-medium">
                            {payload.value}
                          </text>
                        </g>
                      );
                    }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.color} 
                        className="hover:opacity-90 transition-opacity" 
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}