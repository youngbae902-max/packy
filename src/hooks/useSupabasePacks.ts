import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Pack {
  id: string;
  user_id: string | null;
  title: string;
  author_name: string | null;
  pack_type: 'samples' | 'presets' | 'drumkit' | 'loops' | 'project' | 'other';
  download_url: string;
  cover_url: string | null;
  credit_channel_url: string | null;
  is_exclusive: boolean;
  is_anonymous: boolean;
  is_premium: boolean;
  is_admin_pack: boolean;
  is_pinned: boolean;
  price: number | null;
  status: 'pending' | 'approved' | 'rejected';
  likes_count: number;
  created_at: string;
  updated_at: string;
}

export function useSupabasePacks() {
  const { user, isAdmin } = useAuth();
  const queryClient = useQueryClient();

  // Fetch approved packs (public)
  const { data: approvedPacks = [], isLoading: isLoadingApproved } = useQuery({
    queryKey: ['packs', 'approved'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('packs')
        .select('*')
        .eq('status', 'approved')
        .eq('is_premium', false)
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Pack[];
    },
  });

  // Fetch premium packs (public)
  const { data: premiumPacks = [], isLoading: isLoadingPremium } = useQuery({
    queryKey: ['packs', 'premium'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('packs')
        .select('*')
        .eq('status', 'approved')
        .eq('is_premium', true)
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Pack[];
    },
  });

  // Fetch pending packs (admin only)
  const { data: pendingPacks = [] } = useQuery({
    queryKey: ['packs', 'pending'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('packs')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Pack[];
    },
    enabled: isAdmin,
  });

  // Fetch user's own packs
  const { data: userPacks = [] } = useQuery({
    queryKey: ['packs', 'user', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('packs')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Pack[];
    },
    enabled: !!user,
  });

  // Add pack mutation
  const addPackMutation = useMutation({
    mutationFn: async (pack: Omit<Pack, 'id' | 'created_at' | 'updated_at' | 'likes_count' | 'status'>) => {
      const { data, error } = await supabase
        .from('packs')
        .insert({
          ...pack,
          user_id: user?.id,
          status: 'pending',
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['packs'] });
    },
  });

  // Update pack mutation
  const updatePackMutation = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Pack> & { id: string }) => {
      const { data, error } = await supabase
        .from('packs')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['packs'] });
    },
  });

  // Delete pack mutation
  const deletePackMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('packs')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['packs'] });
    },
  });

  return {
    approvedPacks,
    premiumPacks,
    pendingPacks,
    userPacks,
    isLoading: isLoadingApproved || isLoadingPremium,
    addPack: addPackMutation.mutateAsync,
    updatePack: updatePackMutation.mutateAsync,
    deletePack: deletePackMutation.mutateAsync,
    approvePack: (id: string) => updatePackMutation.mutateAsync({ id, status: 'approved' }),
    rejectPack: (id: string) => updatePackMutation.mutateAsync({ id, status: 'rejected' }),
    pinPack: (id: string, pinned: boolean) => updatePackMutation.mutateAsync({ id, is_pinned: pinned }),
  };
}
