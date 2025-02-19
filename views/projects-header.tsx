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
    <Card className="border-none bg-white/50 backdrop-blur-sm shadow-sm">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="text-2xl font-semibold text-gray-900">
              {project?.name}
            </CardTitle>
            <CardDescription className="mt-1 text-gray-500">
              {project?.description || 'Açıklama eklenmemiş'}
            </CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            {permissions?.canCreateTasks && (
              <Button 
                onClick={onNewTask}
                size="sm"
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <PlusIcon className="mr-2 h-4 w-4" />
                Yeni Görev
              </Button>
            )}
            {permissions?.canEditProject && (
              <Button 
                variant="outline"
                onClick={onEditProject}
                size="sm"
                className="text-gray-700 hover:text-gray-900"
              >
                <Pencil1Icon className="mr-2 h-4 w-4" />
                Düzenle
              </Button>
            )}
            {permissions?.canDeleteProject && (
              <Button 
                variant="destructive"
                onClick={onDeleteProject}
                size="sm"
                className="bg-red-600 hover:bg-red-700"
              >
                <TrashIcon className="mr-2 h-4 w-4" />
                Sil
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
    </Card>
  );
} 