import { useCallback, useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { ProjectRole, ProjectRoleType } from '@/lib/db/schema/schema';

export type ProjectPermissions = {
  canEditProject: boolean;
  canDeleteProject: boolean;
  canManageMembers: boolean;
  canCreateTasks: boolean;
  canEditTasks: boolean;
  canDeleteTasks: boolean;
  canAssignTasks: boolean;
  canComment: boolean;
};

export function useProjectPermissions(projectId: string, userId: string | undefined) {
  const [permissions, setPermissions] = useState<ProjectPermissions | null>(null);
  const [role, setRole] = useState<ProjectRoleType | null>(null);

  const checkRole = useCallback(async () => {
    if (!userId) {
      setRole(null);
      return;
    }

    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('project_members')
        .select('role')
        .eq('project_id', projectId)
        .eq('user_id', userId)
        .single();

      if (error || !data) {
        setRole(null);
        return;
      }
      
      setRole(data.role as ProjectRoleType);
    } catch (error) {
      console.error('Rol kontrolü hatası:', error);
      setRole(null);
    }
  }, [projectId, userId]);

  useEffect(() => {
    checkRole();
  }, [checkRole]);

  useEffect(() => {
    // Varsayılan olarak tüm izinler kapalı
    const defaultPermissions: ProjectPermissions = {
      canEditProject: false,
      canDeleteProject: false,
      canManageMembers: false,
      canCreateTasks: false,
      canEditTasks: false,
      canDeleteTasks: false,
      canAssignTasks: false,
      canComment: false,
    };

    // Kullanıcı projede değilse veya rolü yoksa
    if (!role) {
      setPermissions(defaultPermissions);
      return;
    }

    switch (role) {
      case ProjectRole.ADMIN:
        // Admin tüm yetkilere sahip
        setPermissions({
          canEditProject: true,
          canDeleteProject: true,
          canManageMembers: true,
          canCreateTasks: true,
          canEditTasks: true,
          canDeleteTasks: true,
          canAssignTasks: true,
          canComment: true,
        });
        break;

      case ProjectRole.MEMBER:
        // Member sınırlı yetkilere sahip
        setPermissions({
          canEditProject: false,
          canDeleteProject: false,
          canManageMembers: false,
          canCreateTasks: true,
          canEditTasks: true,
          canDeleteTasks: false,
          canAssignTasks: true,
          canComment: true,
        });
        break;

      case ProjectRole.VIEWER:
        // Viewer sadece görüntüleme ve yorum yapma yetkisine sahip
        setPermissions({
          ...defaultPermissions,
          canComment: true,
        });
        break;

      default:
        setPermissions(defaultPermissions);
    }
  }, [role]);

  return {
    permissions,
    role,
    checkRole,
  };
} 