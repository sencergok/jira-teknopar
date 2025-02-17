'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createClient } from '@/lib/supabase/client';
import { useState, useEffect, useCallback } from 'react';
import { toast } from "sonner";
import { AlertCircle, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface MemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  existingMember?: {
    id: string;
    role: string;
    user: {
      id: string;
      name: string;
      email: string;
    };
  };
  onSuccess: () => void;
}

type User = {
  id: string;
  name: string;
  email: string;
};

interface DatabaseError {
  message: string;
}

interface ProjectMember {
  user_id: string;
  id: string;
}

export function MemberModal({
  isOpen,
  onClose,
  projectId,
  existingMember,
  onSuccess,
}: MemberModalProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [selectedRole, setSelectedRole] = useState<string>('member');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchUsers = useCallback(async () => {
    try {
      const supabase = createClient();
      const { data: projectMembers, error: membersError } = await supabase
        .from('project_members')
        .select('user_id')
        .eq('project_id', projectId);

      if (membersError) throw membersError;

      const existingUserIds = (projectMembers || []).map((member: ProjectMember) => member.user_id);

      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('id, name, email')
        .order('name');

      if (usersError) throw usersError;

      const availableUsers = (usersData || []).filter((user: User) => 
        !existingUserIds.includes(user.id) || 
        (existingMember && user.id === existingMember.user.id)
      );

      setUsers(availableUsers);
    } catch (err) {
      console.error('Kullanıcılar yüklenirken hata:', err);
      setError('Kullanıcılar yüklenirken bir hata oluştu.');
    }
  }, [projectId, existingMember]);

  useEffect(() => {
    if (isOpen) {
      fetchUsers();
      if (existingMember) {
        setSelectedUserId(existingMember.user.id);
        setSelectedRole(existingMember.role);
      } else {
        setSelectedUserId('');
        setSelectedRole('member');
      }
    }
  }, [isOpen, existingMember, fetchUsers]);

  const handleSubmit = async () => {
    if (!selectedUserId || !selectedRole) {
      setError('Lütfen tüm alanları doldurun.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();

      if (existingMember) {
        // Üye güncelleme
        const { error: updateError } = await supabase
          .from('project_members')
          .update({
            role: selectedRole
          })
          .eq('id', existingMember.id)
          .eq('project_id', projectId); // Ek güvenlik kontrolü

        if (updateError) {
          console.error('Güncelleme hatası:', updateError);
          throw updateError;
        }
        toast.success('Üye başarıyla güncellendi');
      } else {
        // Önce üyelik kontrolü yap
        const { data: existingCheck, error: checkError } = await supabase
          .from('project_members')
          .select('id')
          .eq('project_id', projectId)
          .eq('user_id', selectedUserId)
          .maybeSingle();

        if (checkError) throw checkError;

        if (existingCheck) {
          setError('Bu kullanıcı zaten projede üye.');
          return;
        }

        // Yeni üye ekleme
        const { error: insertError } = await supabase
          .from('project_members')
          .insert({
            project_id: projectId,
            user_id: selectedUserId,
            role: selectedRole
          });

        if (insertError) {
          console.error('Ekleme hatası:', insertError);
          throw insertError;
        }
        toast.success('Üye başarıyla eklendi');
      }

      onSuccess();
      handleClose();
    } catch (err: unknown) {
      const error = err as DatabaseError;
      console.error('Üye işlemi sırasında hata:', error);
      setError(error.message || 'İşlem sırasında bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!existingMember) return;

    setIsDeleting(true);
    setError(null);

    try {
      const supabase = createClient();
      
      // Projedeki son admin kontrolü
      if (existingMember.role === 'admin') {
        const { data: adminCount, error: countError } = await supabase
          .from('project_members')
          .select('id', { count: 'exact' })
          .eq('project_id', projectId)
          .eq('role', 'admin');

        if (countError) throw countError;

        if (adminCount?.length === 1) {
          setError('Projenin son admin üyesini silemezsiniz.');
          return;
        }
      }

      const { error: deleteError } = await supabase
        .from('project_members')
        .delete()
        .eq('id', existingMember.id)
        .eq('project_id', projectId); // Ek güvenlik kontrolü

      if (deleteError) {
        console.error('Silme hatası:', deleteError);
        throw deleteError;
      }

      toast.success('Üye başarıyla silindi');
      onSuccess();
      handleClose();
    } catch (err: unknown) {
      const error = err as DatabaseError;
      console.error('Üye silinirken hata:', error);
      setError(error.message || 'Üye silinirken bir hata oluştu.');
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
              disabled={loading || isDeleting || !!existingMember}
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
              disabled={loading || isDeleting}
            >
              <SelectTrigger>
                <SelectValue placeholder="Rol seçin" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Yönetici</SelectItem>
                <SelectItem value="member">Üye</SelectItem>
                <SelectItem value="viewer">Görüntüleyici</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex justify-between">
          <div className="flex gap-2">
            <Button
              variant="secondary"
              onClick={handleClose}
              disabled={loading || isDeleting}
            >
              İptal
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={loading || isDeleting}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {existingMember ? 'Güncelle' : 'Ekle'}
            </Button>
          </div>

          {existingMember && (
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={loading || isDeleting}
            >
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Sil
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
} 