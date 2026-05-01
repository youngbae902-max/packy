import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface AdminBadge {
  id: string;
  name: string;
  description: string | null;
  image_url: string;
  is_active: boolean;
  created_at: string;
}

export interface UserAdminBadge {
  id: string;
  user_id: string;
  badge_id: string;
  granted_at: string;
  badge?: AdminBadge;
}

export function useAdminBadges() {
  const { user, isAdmin } = useAuth();
  const qc = useQueryClient();

  const { data: badges = [] } = useQuery({
    queryKey: ['admin-badges'],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('admin_badges')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []) as AdminBadge[];
    },
  });

  const uploadBadgeImage = async (file: File) => {
    const safe = file.name.replace(/[^a-zA-Z0-9._-]/g, '-');
    const path = `${user?.id || 'admin'}/${Date.now()}-${safe}`;
    const { error } = await supabase.storage.from('badges').upload(path, file, { upsert: true });
    if (error) throw error;
    return supabase.storage.from('badges').getPublicUrl(path).data.publicUrl;
  };

  const createBadge = useMutation({
    mutationFn: async ({ name, description, file }: { name: string; description?: string; file: File }) => {
      if (!isAdmin) throw new Error('Apenas ADM');
      const image_url = await uploadBadgeImage(file);
      const { error } = await (supabase as any).from('admin_badges').insert({
        name: name.trim(),
        description: description?.trim() || null,
        image_url,
        created_by: user?.id,
      });
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-badges'] }); toast.success('Selo criado'); },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteBadge = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any).from('admin_badges').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-badges'] }); qc.invalidateQueries({ queryKey: ['user-admin-badges'] }); toast.success('Selo removido'); },
  });

  const grantBadge = useMutation({
    mutationFn: async ({ user_id, badge_id }: { user_id: string; badge_id: string }) => {
      if (!isAdmin) throw new Error('Apenas ADM');
      const { error } = await (supabase as any).from('user_admin_badges').insert({
        user_id, badge_id, granted_by: user?.id,
      });
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['user-admin-badges'] }); toast.success('Selo enviado'); },
    onError: (e: Error) => toast.error(e.message),
  });

  return { badges, createBadge: createBadge.mutateAsync, deleteBadge: deleteBadge.mutate, grantBadge: grantBadge.mutateAsync, isCreating: createBadge.isPending };
}

export function useUserAdminBadges(userId?: string) {
  const { data = [] } = useQuery({
    queryKey: ['user-admin-badges', userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('user_admin_badges')
        .select('*, badge:admin_badges(*)')
        .eq('user_id', userId);
      if (error) throw error;
      return (data || []) as UserAdminBadge[];
    },
  });
  return { badges: data };
}
