import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { PersonIcon } from "@radix-ui/react-icons";
import Image from 'next/image';
import { KanbanBoard } from '@/components/kanban/board';
import { ProjectSummary } from '@/components/metrics/project-summary';
import TaskMetricsCharts from '@/components/metrics/task-metrics-charts';
import { Task, TaskStatus } from '@/types/task';
import { ProjectMember } from '@/types/project';
import { useState } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useMediaQuery } from "@/lib/hooks/use-media-query";

interface ProjectContentProps {
  projectId: string;
  tasks: Task[];
  members: ProjectMember[];
  onTaskMove: (taskId: string, newStatus: TaskStatus) => void;
  onTaskClick: (taskId: string) => void;
  onMemberClick: (member: ProjectMember | null) => void;
  permissions?: {
    canManageMembers?: boolean;
  };
}

export function ProjectContent({
  projectId,
  tasks,
  members,
  onTaskMove,
  onTaskClick,
  onMemberClick,
  permissions
}: ProjectContentProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const isMobile = useMediaQuery("(max-width: 768px)");

  const tabContent = {
    overview: {
      title: "Genel Bakış",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 mr-2">
          <path d="M10 12.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" />
          <path fillRule="evenodd" d="M.664 10.59a1.651 1.651 0 010-1.186A10.004 10.004 0 0110 3c4.257 0 7.893 2.66 9.336 6.41.147.381.146.804 0 1.186A10.004 10.004 0 0110 17c-4.257 0-7.893-2.66-9.336-6.41zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
        </svg>
      ),
      content: (
        <Card className="border-none bg-white/50 backdrop-blur-sm shadow-sm">
          <CardHeader>
            <CardTitle>Proje Özeti</CardTitle>
            <CardDescription>Projenin genel durumu ve özet bilgileri</CardDescription>
          </CardHeader>
          <CardContent>
            <ProjectSummary projectId={projectId} />
          </CardContent>
        </Card>
      )
    },
    tasks: {
      title: "Görevler",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 mr-2">
          <path fillRule="evenodd" d="M6 4.75A.75.75 0 016.75 4h10.5a.75.75 0 010 1.5H6.75A.75.75 0 016 4.75zM6 10a.75.75 0 01.75-.75h10.5a.75.75 0 010 1.5H6.75A.75.75 0 016 10zm0 5.25a.75.75 0 01.75-.75h10.5a.75.75 0 010 1.5H6.75a.75.75 0 01-.75-.75zM1.99 4.75a1 1 0 011-1h.01a1 1 0 010 2h-.01a1 1 0 01-1-1zm1 5.25a1 1 0 100 2h.01a1 1 0 100-2h-.01zm1 5.25a1 1 0 11-2 0 1 1 0 012 0z" clipRule="evenodd" />
        </svg>
      ),
      content: (
        <Card className="border-none bg-white/50 backdrop-blur-sm shadow-sm">
          <CardHeader>
            <CardTitle>Görevler</CardTitle>
            <CardDescription>Projedeki tüm görevler ve durumları</CardDescription>
          </CardHeader>
          <CardContent>
            <KanbanBoard
              projectId={projectId}
              tasks={tasks}
              onTaskMove={onTaskMove}
              onTaskClick={onTaskClick}
            />
          </CardContent>
        </Card>
      )
    },
    metrics: {
      title: "Metrikler",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 mr-2">
          <path d="M15.5 2A1.5 1.5 0 0014 3.5v13a1.5 1.5 0 001.5 1.5h1a1.5 1.5 0 001.5-1.5v-13A1.5 1.5 0 0016.5 2h-1zM9.5 6A1.5 1.5 0 008 7.5v9A1.5 1.5 0 009.5 18h1a1.5 1.5 0 001.5-1.5v-9A1.5 1.5 0 0010.5 6h-1zM3.5 10A1.5 1.5 0 002 11.5v5A1.5 1.5 0 003.5 18h1A1.5 1.5 0 006 16.5v-5A1.5 1.5 0 004.5 10h-1z" />
        </svg>
      ),
      content: (
        <Card className="border-none bg-white/50 backdrop-blur-sm shadow-sm">
          <CardHeader>
            <CardTitle>Metrikler</CardTitle>
            <CardDescription>Proje metrikleri ve istatistikleri</CardDescription>
          </CardHeader>
          <CardContent>
            <TaskMetricsCharts tasks={tasks} />
          </CardContent>
        </Card>
      )
    },
    members: {
      title: `Üyeler (${members.length})`,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 mr-2">
          <path d="M7 8a3 3 0 100-6 3 3 0 000 6zM14.5 9a2.5 2.5 0 100-5 2.5 2.5 0 000 5zM1.615 16.428a1.224 1.224 0 01-.569-1.175 6.002 6.002 0 0111.908 0c.058.467-.172.92-.57 1.174A9.953 9.953 0 017 18a9.953 9.953 0 01-5.385-1.572zM14.5 16h-.106c.07-.297.088-.611.048-.933a7.47 7.47 0 00-1.588-3.755 4.502 4.502 0 015.874 2.636.818.818 0 01-.36.98A7.465 7.465 0 0114.5 16z" />
        </svg>
      ),
      content: (
        <Card className="border-none bg-white/50 backdrop-blur-sm shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle>Proje Üyeleri</CardTitle>
              <CardDescription>Projede çalışan ekip üyeleri</CardDescription>
            </div>
            {permissions?.canManageMembers && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => onMemberClick(null)}
              >
                <PersonIcon className="mr-2 h-4 w-4" />
                Üye Ekle
              </Button>
            )}
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px] pr-4">
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
                <div className="space-y-4">
                  {members.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between p-4 rounded-lg bg-white/50 hover:bg-white/80 transition-colors duration-200"
                    >
                      <div className="flex items-center min-w-0">
                        <div className="h-10 w-10 flex-shrink-0">
                          {member.user?.avatar_url ? (
                            <Image
                              className="h-10 w-10 rounded-full"
                              src={member.user.avatar_url}
                              alt={member.user?.name || 'Kullanıcı'}
                              width={40}
                              height={40}
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
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
                        <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                          {member.role === 'OWNER' ? 'Proje Sahibi' :
                           member.role === 'ADMIN' ? 'Yönetici' : 
                           member.role === 'MEMBER' ? 'Üye' : 
                           'İzleyici'}
                        </span>
                        {permissions?.canManageMembers && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onMemberClick(member)}
                            className="hover:bg-primary/10 hover:text-primary"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                              <path d="M5.433 13.917l1.262-3.155A4 4 0 017.58 9.42l6.92-6.918a2.121 2.121 0 013 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 01-.65-.65z" />
                              <path d="M3.5 5.75c0-.69.56-1.25 1.25-1.25H10A.75.75 0 0010 3H4.75A2.75 2.75 0 002 5.75v9.5A2.75 2.75 0 004.75 18h9.5A2.75 2.75 0 0017 15.25V10a.75.75 0 00-1.5 0v5.25c0 .69-.56 1.25-1.25 1.25h-9.5c-.69 0-1.25-.56-1.25-1.25v-9.5z" />
                            </svg>
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
      )
    }
  };

  if (isMobile) {
    return (
      <div className="w-full space-y-4">
        <Accordion type="single" defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
          {Object.entries(tabContent).map(([key, { title, icon, content }]) => (
            <AccordionItem key={key} value={key} className="border rounded-lg bg-white/50 backdrop-blur-sm">
              <AccordionTrigger className="px-4 py-2">
                <div className="flex items-center">
                  {icon}
                  <span>{title}</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                {content}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    );
  }

  return (
    <Tabs defaultValue="overview" className="w-full">
      <TabsList className="flex w-full justify-between bg-white/50 backdrop-blur-sm shadow-sm rounded-lg p-1 mb-6">
        {Object.entries(tabContent).map(([key, { title, icon }]) => (
          <TabsTrigger 
            key={key}
            value={key} 
            className="flex-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-md transition-all duration-200"
          >
            <div className="flex items-center justify-center">
              {icon}
              <span>{title}</span>
            </div>
          </TabsTrigger>
        ))}
      </TabsList>

      <div className="mt-6">
        {Object.entries(tabContent).map(([key, { content }]) => (
          <TabsContent key={key} value={key} className="focus-visible:outline-none focus-visible:ring-0">
            {content}
          </TabsContent>
        ))}
      </div>
    </Tabs>
  );
} 