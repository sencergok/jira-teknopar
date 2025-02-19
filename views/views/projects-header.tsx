import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PlusIcon, Pencil1Icon, TrashIcon } from "@radix-ui/react-icons";
import { Project } from "@/types/project";

interface ProjectHeaderProps {
  project: Project | null;
  permissions: {
    canCreateTasks?: boolean;
    canEditProject?: boolean;
    canDeleteProject?: boolean;
  };
  onNewTask: () => void;
  onEditProject: () => void;
  onDeleteProject: () => void;
}

export function ProjectHeader({
  project,
  permissions,
  onNewTask,
  onEditProject,
  onDeleteProject
}: ProjectHeaderProps) {
  return (
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
                onClick={onNewTask} 
                size="sm" 
                className="shadow-sm hover:shadow-md transition-all duration-200"
              >
                <PlusIcon className="mr-2 h-4 w-4" /> Yeni Görev
              </Button>
            )}
            {permissions?.canEditProject && (
              <Button 
                variant="outline" 
                onClick={onEditProject} 
                size="sm" 
                className="shadow-sm hover:shadow-md transition-all duration-200"
              >
                <Pencil1Icon className="mr-2 h-4 w-4" /> Projeyi Düzenle
              </Button>
            )}
            {permissions?.canDeleteProject && (
              <Button 
                variant="destructive" 
                onClick={onDeleteProject} 
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
  );
} 