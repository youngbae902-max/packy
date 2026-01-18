import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface UserProfile {
  id: string;
  user_id: string;
  username: string | null;
  artist_name: string | null;
  avatar_url: string | null;
  is_banned: boolean;
  is_online: boolean;
  last_seen: string | null;
  username_changes_today: number;
  last_username_change_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserRole {
  id: string;
  user_id: string;
  role: 'admin' | 'user';
  created_at: string;
}

export function useUserManagement() {
  const { isAdmin, user } = useAuth();
  const queryClient = useQueryClient();

  // Get all users (admin only)
  const { data: users = [], isLoading } = useQuery({
    queryKey: ['all_users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as UserProfile[];
    },
    enabled: isAdmin,
  });

  // Get user roles
  const { data: userRoles = [] } = useQuery({
    queryKey: ['user_roles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_roles')
        .select('*');
      
      if (error) throw error;
      return data as UserRole[];
    },
    enabled: isAdmin,
  });

  const isUserAdmin = (userId: string) => {
    return userRoles.some(r => r.user_id === userId && r.role === 'admin');
  };

  const banUserMutation = useMutation({
    mutationFn: async ({ userId, ban }: { userId: string; ban: boolean }) => {
      const { data, error } = await supabase.rpc('set_user_ban_status', {
        target_user_id: userId,
        ban_status: ban,
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_, { ban }) => {
      queryClient.invalidateQueries({ queryKey: ['all_users'] });
      toast.success(ban ? 'Usuário banido!' : 'Usuário desbanido!');
    },
    onError: (error: Error) => {
      toast.error('Erro: ' + error.message);
    },
  });

  const sendGiftMutation = useMutation({
    mutationFn: async ({ userId, packId, message }: { userId: string; packId: string; message?: string }) => {
      const { data, error } = await supabase.rpc('send_gift', {
        target_user_id: userId,
        gift_pack_id: packId,
        gift_message: message || null,
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Presente enviado com sucesso!');
    },
    onError: (error: Error) => {
      toast.error('Erro ao enviar presente: ' + error.message);
    },
  });

  const toggleAdminMutation = useMutation({
    mutationFn: async ({ userId, makeAdmin }: { userId: string; makeAdmin: boolean }) => {
      if (makeAdmin) {
        const { error } = await supabase
          .from('user_roles')
          .insert({ user_id: userId, role: 'admin' });
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('user_roles')
          .delete()
          .eq('user_id', userId)
          .eq('role', 'admin');
        if (error) throw error;
      }
    },
    onSuccess: (_, { makeAdmin }) => {
      queryClient.invalidateQueries({ queryKey: ['user_roles'] });
      toast.success(makeAdmin ? 'Usuário promovido a admin!' : 'Admin removido!');
    },
    onError: (error: Error) => {
      toast.error('Erro: ' + error.message);
    },
  });

  const updateUsernameMutation = useMutation({
    mutationFn: async (newUsername: string) => {
      const { data, error } = await supabase.rpc('update_username', {
        new_username: newUsername,
      });
      
      if (error) throw error;
      
      const result = data as { success: boolean; error?: string; remaining_changes?: number };
      if (!result.success) {
        throw new Error(result.error || 'Erro ao atualizar username');
      }
      
      return result;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast.success(`@ atualizado! Você pode alterar mais ${data.remaining_changes} vez(es) hoje.`);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  // Update online status
  const updateOnlineStatusMutation = useMutation({
    mutationFn: async (isOnline: boolean) => {
      const { error } = await supabase.rpc('update_online_status', {
        online_status: isOnline,
      });
      
      if (error) throw error;
    },
  });

  const sendGiftToAllMutation = useMutation({
    mutationFn: async ({ packId, message }: { packId: string; message?: string }) => {
      const { data, error } = await supabase.rpc('send_gift_to_all', {
        gift_pack_id: packId,
        gift_message: message || null,
      });
      
      if (error) throw error;
      return data as number;
    },
    onSuccess: (count) => {
      toast.success(`Presente enviado para ${count} usuários!`);
    },
    onError: (error: Error) => {
      toast.error('Erro ao enviar presentes: ' + error.message);
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      const { data, error } = await supabase.rpc('admin_delete_user', {
        target_user_id: userId,
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all_users'] });
      toast.success('Usuário excluído!');
    },
    onError: (error: Error) => {
      toast.error('Erro ao excluir: ' + error.message);
    },
  });

  const deleteMyAccountMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.rpc('delete_my_account');
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Conta excluída com sucesso');
    },
    onError: (error: Error) => {
      toast.error('Erro ao excluir conta: ' + error.message);
    },
  });

  const toggleSpotifyBadgeMutation = useMutation({
    mutationFn: async ({ userId, enabled }: { userId: string; enabled: boolean }) => {
      const { error } = await supabase
        .from('profiles')
        .update({ has_spotify_badge: enabled })
        .eq('user_id', userId);
      
      if (error) throw error;
    },
    onSuccess: (_, { enabled }) => {
      queryClient.invalidateQueries({ queryKey: ['all_users'] });
      toast.success(enabled ? 'Badge Spotify ativada!' : 'Badge Spotify removida');
    },
    onError: (error: Error) => {
      toast.error('Erro: ' + error.message);
    },
  });

  const isMainAdmin = (email?: string) => {
    return email?.toLowerCase() === 'youngbae902@gmail.com';
  };

  return {
    users,
    userRoles,
    isLoading,
    isUserAdmin,
    isMainAdmin,
    banUser: banUserMutation.mutate,
    sendGift: sendGiftMutation.mutate,
    sendGiftToAll: sendGiftToAllMutation.mutate,
    toggleAdmin: toggleAdminMutation.mutate,
    updateUsername: updateUsernameMutation.mutate,
    updateOnlineStatus: updateOnlineStatusMutation.mutate,
    deleteUser: deleteUserMutation.mutate,
    deleteMyAccount: deleteMyAccountMutation.mutate,
    toggleSpotifyBadge: toggleSpotifyBadgeMutation.mutate,
  };
}
