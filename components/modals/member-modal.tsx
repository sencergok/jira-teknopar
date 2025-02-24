'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useEffect } from 'react';
import { toast } from "sonner";
import { AlertCircle, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ProjectRole } from '@/types/project';
import { ProjectService } from '@/lib/services/project-service';
import { User } from '@/types/user';

interface MemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  existingMember?: {
    id: string;
    role: ProjectRole;
    user: {
      id: string;
      name: string;
      email: string;
    };
  };
  onSuccess: () => void;
  userRole?: ProjectRole | null;
}

// Member management modal - Handles add/edit/delete of project members
export function MemberModal({
  isOpen,
  onClose,
  projectId,
  existingMember,
  onSuccess,
  userRole
}: MemberModalProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [selectedRole, setSelectedRole] = useState<string>('member');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Yetki kontrolleri
  const canManageRoles = userRole === 'OWNER' || userRole === 'ADMIN';
  const canDeleteMember = userRole === 'OWNER' || (userRole === 'ADMIN' && existingMember?.role !== 'ADMIN');
  const availableRoles = (() => {
    if (userRole === 'OWNER') {
      return ['ADMIN', 'MEMBER', 'VIEWER'];
    }
    if (userRole === 'ADMIN') {
      return ['MEMBER', 'VIEWER'];
    }
    return [];
  })();

  // Kullanıcıları yükle
  useEffect(() => {
    if (isOpen) {
      const fetchUsers = async () => {
        try {
          const availableUsers = await ProjectService.getAvailableUsers(
            projectId,
            existingMember?.user.id
          );
          setUsers(availableUsers);
        } catch (err) {
          console.error('Kullanıcılar yüklenirken hata:', err);
          setError('Kullanıcılar yüklenirken bir hata oluştu.');
        }
      };

      fetchUsers();
      if (existingMember) {
        setSelectedUserId(existingMember.user.id);
        setSelectedRole(existingMember.role);
      } else {
        setSelectedUserId('');
        setSelectedRole('member');
      }
    }
  }, [isOpen, existingMember, projectId]);

  const handleSubmit = async () => {
    if (!selectedUserId || !selectedRole) {
      setError('Lütfen tüm alanları doldurun.');
      return;
    }

    if (!canManageRoles) {
      setError('Bu işlem için yetkiniz yok.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (existingMember) {
        // Admin sayısı kontrolü
        if (existingMember.role === 'ADMIN' && selectedRole !== 'ADMIN') {
          const adminCount = await ProjectService.getProjectAdminCount(projectId);
          if (adminCount === 1) {
            setError('Projenin son admin üyesinin rolünü değiştiremezsiniz.');
            return;
          }
        }

        // Admin, başka bir adminin rolünü değiştiremez
        if (userRole === 'ADMIN' && existingMember.role === 'ADMIN') {
          setError('Admin olarak başka bir adminin rolünü değiştiremezsiniz.');
          return;
        }

        await ProjectService.updateProjectMember(existingMember.id, projectId, selectedRole);
        toast.success('Üye rolü başarıyla güncellendi');
      } else {
        await ProjectService.addProjectMember(projectId, selectedUserId, selectedRole);
        toast.success('Üye başarıyla eklendi');
      }

      onSuccess();
      handleClose();
    } catch (err) {
      console.error('Üye işlemi sırasında hata:', err);
      setError(err instanceof Error ? err.message : 'İşlem sırasında bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!existingMember || !canDeleteMember) return;

    setIsDeleting(true);
    setError(null);

    try {
      if (existingMember.role === 'ADMIN') {
        const adminCount = await ProjectService.getProjectAdminCount(projectId);
        if (adminCount === 1) {
          setError('Projenin son admin üyesini silemezsiniz.');
          return;
        }
      }

      await ProjectService.deleteProjectMember(existingMember.id, projectId);
      toast.success('Üye başarıyla silindi');
      onSuccess();
      handleClose();
    } catch (err) {
      console.error('Üye silinirken hata:', err);
      setError(err instanceof Error ? err.message : 'Üye silinirken bir hata oluştu.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleClose = () => {
    setSelectedUserId('');
    setSelectedRole('member');
    setError(null);
    setLoading(false);
    setIsDeleting(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {existingMember ? 'Üye Düzenle' : 'Yeni Üye Ekle'}
          </DialogTitle>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="user">Kullanıcı</Label>
            <Select
              value={selectedUserId}
              onValueChange={setSelectedUserId}
              disabled={loading || isDeleting || !!existingMember || !canManageRoles}
            >
              <SelectTrigger>
                <SelectValue placeholder="Kullanıcı seçin" />
              </SelectTrigger>
              <SelectContent>
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.name} ({user.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="role">Rol</Label>
            <Select
              value={selectedRole}
              onValueChange={setSelectedRole}
              disabled={loading || isDeleting || !canManageRoles}
            >
              <SelectTrigger>
                <SelectValue placeholder="Rol seçin" />
              </SelectTrigger>
              <SelectContent>
                {availableRoles.map(role => (
                  <SelectItem key={role} value={role}>
                    {role === 'ADMIN' ? 'Yönetici' :
                     role === 'MEMBER' ? 'Üye' : 'İzleyici'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex justify-between">
          {existingMember && canDeleteMember && (
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={loading || isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Siliniyor
                </>
              ) : (
                'Üyeyi Sil'
              )}
            </Button>
          )}
          <div className="flex gap-2 ml-auto">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading || isDeleting}
            >
              İptal
            </Button>
            {canManageRoles && (
              <Button
                type="submit"
                onClick={handleSubmit}
                disabled={loading || isDeleting}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {existingMember ? 'Güncelleniyor' : 'Ekleniyor'}
                  </>
                ) : (
                  existingMember ? 'Güncelle' : 'Ekle'
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 