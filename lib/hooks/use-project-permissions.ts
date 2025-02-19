import { useCallback, useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { ProjectRole, ProjectPermissions } from '@/types/project';

export function useProjectPermissions(projectId: string, userId: string | undefined) {
  const [permissions, setPermissions] = useState<ProjectPermissions>({
    canEditProject: false,
    canDeleteProject: false,
    canManageMembers: false,
    canCreateTasks: false,
    canEditTasks: false,
    canDeleteTasks: false,
    canAssignTasks: false,
    canComment: false
  });
  const [role, setRole] = useState<ProjectRole | null>(null);
  const [isOwner, setIsOwner] = useState(false);

  const checkRole = useCallback(async () => {
    if (!userId) {
      setRole(null);
      setIsOwner(false);
      return;
    }

    try {
      const supabase = createClient();
      
      // Projenin sahibini kontrol et
      const { data: projectData } = await supabase
        .from('projects')
        .select('created_by_id')
        .eq('id', projectId)
        .single();

      const isProjectOwner = projectData?.created_by_id === userId;
      setIsOwner(isProjectOwner);

      // Kullanıcının proje üyeliğini kontrol et
      const { data: memberData, error: memberError } = await supabase
        .from('project_members')
        .select('role')
        .eq('project_id', projectId)
        .eq('user_id', userId)
        .single();

      // Rol ataması
      let currentRole: ProjectRole | null = null;

      if (isProjectOwner) {
        currentRole = 'OWNER';
      } else if (memberData && !memberError) {
        currentRole = memberData.role as ProjectRole;
      }

      setRole(currentRole);

      // Yetkileri role göre ayarla
      const newPermissions: ProjectPermissions = {
        canEditProject: false,
        canDeleteProject: false,
        canManageMembers: false,
        canCreateTasks: false,
        canEditTasks: false,
        canDeleteTasks: false,
        canAssignTasks: false,
        canComment: false
      };

      if (currentRole === 'OWNER') {
        // OWNER - Tüm yetkiler
        Object.keys(newPermissions).forEach(key => {
          newPermissions[key as keyof ProjectPermissions] = true;
        });
      } else if (currentRole === 'ADMIN') {
        // ADMIN - Üye yönetimi ve görev yönetimi yetkileri
        newPermissions.canEditProject = true;
        newPermissions.canDeleteProject = false; // Sadece OWNER silebilir
        newPermissions.canManageMembers = true;
        newPermissions.canCreateTasks = true;
        newPermissions.canEditTasks = true;
        newPermissions.canDeleteTasks = true;
        newPermissions.canAssignTasks = true;
        newPermissions.canComment = true;
      } else if (currentRole === 'MEMBER') {
        // MEMBER - Sadece görev yönetimi yetkileri
        newPermissions.canEditProject = false;
        newPermissions.canDeleteProject = false;
        newPermissions.canManageMembers = false;
        newPermissions.canCreateTasks = true;
        newPermissions.canEditTasks = true;
        newPermissions.canDeleteTasks = false;
        newPermissions.canAssignTasks = true;
        newPermissions.canComment = true;
      } else if (currentRole === 'VIEWER') {
        // VIEWER - Sadece görüntüleme yetkileri
        Object.keys(newPermissions).forEach(key => {
          newPermissions[key as keyof ProjectPermissions] = false;
        });
        newPermissions.canComment = true; // Viewer sadece yorum yapabilir
      }

      setPermissions(newPermissions);
    } catch (error) {
      console.error('Rol kontrolü hatası:', error);
      setRole(null);
      setIsOwner(false);
      setPermissions({
        canEditProject: false,
        canDeleteProject: false,
        canManageMembers: false,
        canCreateTasks: false,
        canEditTasks: false,
        canDeleteTasks: false,
        canAssignTasks: false,
        canComment: false
      });
    }
  }, [projectId, userId]);

  useEffect(() => {
    checkRole();
  }, [checkRole]);

  return { permissions, role, isOwner, checkRole };
} 