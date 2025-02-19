'use client';

import { useAuth } from '@/lib/hooks/use-auth';
import Image from 'next/image';
import TaskMetricsCharts from '@/components/task-metrics-charts';
import { createClient } from '@/lib/supabase/client';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { MemberModal } from '@/components/modals/member-modal';
import { KanbanBoard } from '@/components/kanban/board';
import { TaskModal } from '@/components/modals/task-modal';
import { ProjectModal } from '@/components/modals/project-modal';
import { useProjectPermissions } from '@/lib/hooks/use-project-permissions';
import { ConfirmModal } from '@/components/modals/confirm-modal';
import { ProjectSummary } from '@/components/project/project-summary';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { PlusIcon, Pencil1Icon, TrashIcon, PersonIcon } from "@radix-ui/react-icons";

type Project = {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  created_by_id: string;
};

type ProjectMember = {
  id: string;
  role: string;
  user: {
    id: string;
    name: string;
    email: string;
    avatar_url: string | null;
  };
};

type Task = {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  task_order: string;
  created_by_id: string;
  assigned_to_id: string | null;
  assignedTo: { id: string; name: string; avatar_url: string | null; } | null;
};

type PayloadType = {
  eventType: string;
  new: Record<string, unknown>;
  old: Record<string, unknown>;
};

interface DatabaseError {
  message: string;
}

export default function ProjectDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [selectedMember, setSelectedMember] = useState<ProjectMember | null>(null);
  const { permissions } = useProjectPermissions(params.id as string, user?.id || '');

  const fetchProjectDetails = useCallback(async () => {
    try {
      const supabase = createClient();
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .select('*')
        .eq('id', params.id)
        .single();

      if (projectError) throw projectError;

      const { data: tasksData, error: tasksError } = await supabase
        .from('tasks')
        .select(`
          id,
          title,
          description,
          status,
          priority,
          task_order,
          created_by_id,
          assigned_to_id,
          assignedTo:assigned_to_id (
            id,
            name,
            avatar_url
          )
        `)
        .eq('project_id', params.id);

      if (tasksError) throw tasksError;

      const { data: membersData, error: membersError } = await supabase
        .from('project_members')
        .select(`
          id,
          role,
          user:user_id (
            id,
            name,
            email,
            avatar_url
          )
        `)
        .eq('project_id', params.id);

      if (membersError) throw membersError;

      setProject(projectData);
      setTasks(tasksData);
      setMembers(membersData);
      setLoading(false);
    } catch (err) {
      console.error('Beklenmeyen hata:', err);
      setError('Beklenmeyen bir hata oluştu.');
      setLoading(false);
    }
  }, [params.id]);

  const handleRealtimeTaskUpdate = useCallback((payload: PayloadType) => {
    console.log('Task değişikliği:', payload);
    
    setTasks(prevTasks => {
      const updatedTasks = [...prevTasks];
      
      switch (payload.eventType) {
        case 'INSERT':
          updatedTasks.push(payload.new as Task);
          break;
        case 'UPDATE':
          return updatedTasks.map(task => 
            task.id === (payload.new as Task).id ? { ...task, ...(payload.new as Task) } : task
          );
        case 'DELETE':
          return updatedTasks.filter(task => task.id !== (payload.old as Task).id);
      }
      return updatedTasks;
    });
  }, []);

  const handleRealtimeMemberUpdate = useCallback((payload: PayloadType) => {
    console.log('Member değişikliği:', payload);
    
    switch (payload.eventType) {
      case 'INSERT': {
        const newMember = payload.new as ProjectMember;
        setMembers(prev => [...prev, newMember]);
        break;
      }
      case 'UPDATE': {
        const updatedMember = payload.new as ProjectMember;
        setMembers(prev => prev.map(member => 
          member.id === updatedMember.id ? updatedMember : member
        ));
        break;
      }
      case 'DELETE': {
        const deletedMember = payload.old as ProjectMember;
        setMembers(prev => prev.filter(member => member.id !== deletedMember.id));
        break;
      }
    }
  }, []);

  useEffect(() => {
    fetchProjectDetails();

    const supabase = createClient();

    const taskSubscription = supabase
      .channel(`project-${params.id}-tasks`)
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'tasks',
          filter: `project_id=eq.${params.id}`
        }, 
        handleRealtimeTaskUpdate
      )
      .on('postgres_changes', 
        { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'tasks',
          filter: `project_id=eq.${params.id}`
        }, 
        handleRealtimeTaskUpdate
      )
      .on('postgres_changes', 
        { 
          event: 'DELETE', 
          schema: 'public', 
          table: 'tasks',
          filter: `project_id=eq.${params.id}`
        }, 
        handleRealtimeTaskUpdate
      )
      .subscribe();

    const memberSubscription = supabase
      .channel(`project-${params.id}-members`)
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'project_members',
          filter: `project_id=eq.${params.id}`
        }, 
        handleRealtimeMemberUpdate
      )
      .on('postgres_changes', 
        { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'project_members',
          filter: `project_id=eq.${params.id}`
        }, 
        handleRealtimeMemberUpdate
      )
      .on('postgres_changes', 
        { 
          event: 'DELETE', 
          schema: 'public', 
          table: 'project_members',
          filter: `project_id=eq.${params.id}`
        }, 
        handleRealtimeMemberUpdate
      )
      .subscribe();

    return () => {
      supabase.removeChannel(taskSubscription);
      supabase.removeChannel(memberSubscription);
    };
  }, [params.id, handleRealtimeTaskUpdate, handleRealtimeMemberUpdate, fetchProjectDetails]);

  const handleTaskMove = async (taskId: string, newStatus: string) => {
    try {
      const supabase = createClient();
      const taskToUpdate = tasks.find(t => t.id === taskId);
      
      if (!taskToUpdate) return;

      setTasks(prev => prev.map(task => 
        task.id === taskId ? { ...task, status: newStatus } : task
      ));

      handleRealtimeTaskUpdate({
        eventType: 'UPDATE',
        new: { ...taskToUpdate, status: newStatus },
        old: taskToUpdate
      });

      const { error: updateError } = await supabase
        .from('tasks')
        .update({ status: newStatus })
        .eq('id', taskId);

      if (updateError) {
        setTasks(prev => prev.map(task => 
          task.id === taskId ? { ...task, status: taskToUpdate.status } : task
        ));
        throw updateError;
      }
    } catch (err: unknown) {
      const error = err as DatabaseError;
      console.error('Görev güncelleme hatası:', error);
    }
  };

  const handleTaskClick = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      setSelectedTask(task);
      setIsTaskModalOpen(true);
    }
  };

  const handleMemberModalSuccess = useCallback(() => {
    fetchProjectDetails();
  }, [fetchProjectDetails]);

  const handleProjectDelete = async () => {
    if (!project) return;
    setDeleteLoading(true);

    try {
      const supabase = createClient();

      const { error: tasksDeleteError } = await supabase
        .from('tasks')
        .delete()
        .eq('project_id', project.id);

      if (tasksDeleteError) throw tasksDeleteError;

      const { error: membersDeleteError } = await supabase
        .from('project_members')
        .delete()
        .eq('project_id', project.id);

      if (membersDeleteError) throw membersDeleteError;

      const { error: projectDeleteError } = await supabase
        .from('projects')
        .delete()
        .eq('id', project.id);

      if (projectDeleteError) throw projectDeleteError;

      router.push('/dashboard');
    } catch (err: unknown) {
      const error = err as DatabaseError;
      console.error('Proje silme hatası:', error);
      setError('Proje silinirken bir hata oluştu.');
    } finally {
      setDeleteLoading(false);
      setIsDeleteModalOpen(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-8">
      <div className="max-w-7xl mx-auto">
        <Card className="w-full">
          <CardHeader>
            <div className="space-y-2 animate-pulse">
              <div className="h-6 w-1/4 bg-gray-200 rounded"></div>
              <div className="h-4 w-1/2 bg-gray-100 rounded"></div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="h-32 bg-gray-100 rounded-lg"></div>
              <div className="h-64 bg-gray-100 rounded-lg"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-8">
      <div className="max-w-7xl mx-auto">
        <Card className="w-full border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-700">Hata</CardTitle>
            <CardDescription className="text-red-600">{error}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Proje Başlığı ve Eylemler */}
        <Card className="mb-8 border-none bg-white/50 backdrop-blur-sm shadow-lg">
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <span className="text-xl font-bold text-primary">
                      {project?.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <CardTitle className="text-2xl font-bold">{project?.name}</CardTitle>
                    <CardDescription className="mt-1 line-clamp-2">
                      {project?.description || 'Açıklama eklenmemiş'}
                    </CardDescription>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                {permissions?.canCreateTasks && (
                  <Button 
                    onClick={() => setIsTaskModalOpen(true)} 
                    size="sm" 
                    className="shadow-sm hover:shadow-md transition-all duration-200"
                  >
                    <PlusIcon className="mr-2 h-4 w-4" /> Yeni Görev
                  </Button>
                )}
                {permissions?.canEditProject && (
                  <Button 
                    variant="outline" 
                    onClick={() => setIsProjectModalOpen(true)} 
                    size="sm" 
                    className="shadow-sm hover:shadow-md transition-all duration-200"
                  >
                    <Pencil1Icon className="mr-2 h-4 w-4" /> Projeyi Düzenle
                  </Button>
                )}
                {permissions?.canDeleteProject && (
                  <Button 
                    variant="destructive" 
                    onClick={() => setIsDeleteModalOpen(true)} 
                    size="sm" 
                    className="shadow-sm hover:shadow-md transition-all duration-200"
                  >
                    <TrashIcon className="mr-2 h-4 w-4" /> Sil
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Ana İçerik */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8 p-1 bg-white/50 backdrop-blur-sm shadow-sm rounded-xl">
            <TabsTrigger value="overview" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg transition-all duration-200">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 mr-2">
                <path d="M10 12.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" />
                <path fillRule="evenodd" d="M.664 10.59a1.651 1.651 0 010-1.186A10.004 10.004 0 0110 3c4.257 0 7.893 2.66 9.336 6.41.147.381.146.804 0 1.186A10.004 10.004 0 0110 17c-4.257 0-7.893-2.66-9.336-6.41zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
              </svg>
              Genel Bakış
            </TabsTrigger>
            <TabsTrigger value="tasks" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg transition-all duration-200">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 mr-2">
                <path fillRule="evenodd" d="M6 4.75A.75.75 0 016.75 4h10.5a.75.75 0 010 1.5H6.75A.75.75 0 016 4.75zM6 10a.75.75 0 01.75-.75h10.5a.75.75 0 010 1.5H6.75A.75.75 0 016 10zm0 5.25a.75.75 0 01.75-.75h10.5a.75.75 0 010 1.5H6.75a.75.75 0 01-.75-.75zM1.99 4.75a1 1 0 011-1h.01a1 1 0 010 2h-.01a1 1 0 01-1-1zm1 5.25a1 1 0 100 2h.01a1 1 0 100-2h-.01zm1 5.25a1 1 0 11-2 0 1 1 0 012 0z" clipRule="evenodd" />
              </svg>
              Görevler
            </TabsTrigger>
            <TabsTrigger value="metrics" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg transition-all duration-200">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 mr-2">
                <path d="M15.5 2A1.5 1.5 0 0014 3.5v13a1.5 1.5 0 001.5 1.5h1a1.5 1.5 0 001.5-1.5v-13A1.5 1.5 0 0016.5 2h-1zM9.5 6A1.5 1.5 0 008 7.5v9A1.5 1.5 0 009.5 18h1a1.5 1.5 0 001.5-1.5v-9A1.5 1.5 0 0010.5 6h-1zM3.5 10A1.5 1.5 0 002 11.5v5A1.5 1.5 0 003.5 18h1A1.5 1.5 0 006 16.5v-5A1.5 1.5 0 004.5 10h-1z" />
              </svg>
              Metrikler
            </TabsTrigger>
            <TabsTrigger value="members" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg transition-all duration-200">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 mr-2">
                <path d="M7 8a3 3 0 100-6 3 3 0 000 6zM14.5 9a2.5 2.5 0 100-5 2.5 2.5 0 000 5zM1.615 16.428a1.224 1.224 0 01-.569-1.175 6.002 6.002 0 0111.908 0c.058.467-.172.92-.57 1.174A9.953 9.953 0 017 18a9.953 9.953 0 01-5.385-1.572zM14.5 16h-.106c.07-.297.088-.611.048-.933a7.47 7.47 0 00-1.588-3.755 4.502 4.502 0 015.874 2.636.818.818 0 01-.36.98A7.465 7.465 0 0114.5 16z" />
              </svg>
              Üyeler ({members.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6 focus-visible:outline-none focus-visible:ring-0">
            <Card className="border-none bg-white/50 backdrop-blur-sm shadow-lg">
              <CardHeader>
                <CardTitle>Proje Özeti</CardTitle>
                <CardDescription>
                  Projenin genel durumu ve özet bilgileri
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ProjectSummary projectId={params.id as string} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tasks" className="focus-visible:outline-none focus-visible:ring-0">
            <Card className="border-none bg-white/50 backdrop-blur-sm shadow-lg">
              <CardHeader>
                <CardTitle>Görevler</CardTitle>
                <CardDescription>
                  Projedeki tüm görevler ve durumları
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <KanbanBoard
                  projectId={params.id as string}
                  tasks={tasks}
                  onTaskMove={handleTaskMove}
                  onTaskClick={handleTaskClick}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="metrics" className="focus-visible:outline-none focus-visible:ring-0">
            <Card className="border-none bg-white/50 backdrop-blur-sm shadow-lg">
              <CardHeader>
                <CardTitle>Metrikler</CardTitle>
                <CardDescription>
                  Proje metrikleri ve istatistikleri
                </CardDescription>
              </CardHeader>
              <CardContent>
                <TaskMetricsCharts projectId={params.id as string} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="members" className="focus-visible:outline-none focus-visible:ring-0">
            <Card className="border-none bg-white/50 backdrop-blur-sm shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <div>
                  <CardTitle>Proje Üyeleri</CardTitle>
                  <CardDescription>
                    Projede çalışan ekip üyeleri
                  </CardDescription>
                </div>
                {permissions?.canManageMembers && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setSelectedMember(null);
                      setIsMemberModalOpen(true);
                    }}
                    className="shadow-sm hover:shadow-md transition-all duration-200"
                  >
                    <PersonIcon className="mr-2 h-4 w-4" />
                    Üye Ekle
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px] pr-4">
                  {members.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="mx-auto h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <PersonIcon className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="mt-4 text-sm font-medium text-gray-900">Henüz üye yok</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        Projeye üye ekleyerek başlayın
                      </p>
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      {members.map((member) => (
                        <div
                          key={member.id}
                          className="flex items-center justify-between p-4 rounded-lg bg-white/50 hover:bg-white/80 transition-colors duration-200 border border-gray-100/50 shadow-sm hover:shadow-md"
                        >
                          <div className="flex items-center min-w-0">
                            <div className="h-10 w-10 flex-shrink-0">
                              {member.user?.avatar_url ? (
                                <Image
                                  className="h-10 w-10 rounded-full ring-2 ring-white"
                                  src={member.user.avatar_url}
                                  alt={member.user?.name || 'Kullanıcı'}
                                  width={40}
                                  height={40}
                                />
                              ) : (
                                <div className="h-10 w-10 rounded-full bg-primary/10 ring-2 ring-white flex items-center justify-center">
                                  <span className="text-sm font-medium text-primary">
                                    {member.user?.name?.charAt(0)?.toUpperCase() || '?'}
                                  </span>
                                </div>
                              )}
                            </div>
                            <div className="ml-3 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {member.user?.name || 'İsimsiz Kullanıcı'}
                              </p>
                              <p className="text-sm text-gray-500 truncate">
                                {member.user?.email || 'E-posta yok'}
                              </p>
                            </div>
                          </div>
                          <div className="ml-3 flex items-center gap-3">
                            <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary ring-1 ring-inset ring-primary/20">
                              {member.role === 'admin' ? 'Yönetici' : 
                               member.role === 'member' ? 'Üye' : 'Görüntüleyici'}
                            </span>
                            {permissions?.canManageMembers && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  setSelectedMember(member);
                                  setIsMemberModalOpen(true);
                                }}
                                className="hover:bg-primary/10 hover:text-primary"
                              >
                                <Pencil1Icon className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Modallar */}
        <MemberModal
          isOpen={isMemberModalOpen}
          onClose={() => {
            setIsMemberModalOpen(false);
            setSelectedMember(null);
          }}
          projectId={params.id as string}
          existingMember={selectedMember || undefined}
          onSuccess={handleMemberModalSuccess}
        />

        <TaskModal
          isOpen={isTaskModalOpen}
          onClose={() => {
            setIsTaskModalOpen(false);
            setSelectedTask(null);
          }}
          projectId={params.id as string}
          projectMembers={members.filter(member => member?.user?.id != null).map(member => ({
            user: {
              id: member.user.id,
              name: member.user.name,
              avatar_url: member.user.avatar_url
            }
          }))}
          existingTask={selectedTask || undefined}
          onSuccess={fetchProjectDetails}
          permissions={permissions || undefined}
        />

        <ProjectModal
          isOpen={isProjectModalOpen}
          onClose={() => setIsProjectModalOpen(false)}
          existingProject={project || undefined}
          onSuccess={fetchProjectDetails}
        />

        <ConfirmModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleProjectDelete}
          title="Projeyi Sil"
          message="Bu projeyi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz ve projedeki tüm görevler silinecektir."
          confirmButtonText="Evet, Sil"
          loading={deleteLoading}
        />
      </div>
    </div>
  );
}