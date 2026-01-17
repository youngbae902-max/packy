import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Acapella {
  id: string;
  artist_name: string;
  audio_url: string;
  download_url: string;
  duration_seconds: number | null;
  created_by: string | null;
  created_at: string;
  status: 'pending' | 'approved' | 'rejected';
}

export function useAcapellas() {
  const { user, isAdmin } = useAuth();
  const queryClient = useQueryClient();

  // Fetch approved acapellas (public)
  const { data: acapellas = [], isLoading } = useQuery({
    queryKey: ['acapellas', 'approved'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('acapellas')
        .select('*')
        .eq('status', 'approved')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Acapella[];
    },
  });

  // Fetch pending acapellas (admin only)
  const { data: pendingAcapellas = [] } = useQuery({
    queryKey: ['acapellas', 'pending'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('acapellas')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Acapella[];
    },
    enabled: isAdmin,
  });

  // Fetch rejected acapellas (admin only)
  const { data: rejectedAcapellas = [] } = useQuery({
    queryKey: ['acapellas', 'rejected'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('acapellas')
        .select('*')
        .eq('status', 'rejected')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Acapella[];
    },
    enabled: isAdmin,
  });

  // Add acapella mutation (admin only)
  const addAcapellaMutation = useMutation({
    mutationFn: async (acapella: Omit<Acapella, 'id' | 'created_at' | 'created_by' | 'status'>) => {
      const { data, error } = await supabase
        .from('acapellas')
        .insert({
          ...acapella,
          created_by: user?.id,
          status: 'pending',
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['acapellas'] });
    },
  });

  // Update acapella mutation (admin only)
  const updateAcapellaMutation = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Acapella> & { id: string }) => {
      const { data, error } = await supabase
        .from('acapellas')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['acapellas'] });
    },
  });

  // Delete acapella mutation (admin only)
  const deleteAcapellaMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('acapellas')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['acapellas'] });
    },
  });

  return {
    acapellas,
    pendingAcapellas,
    rejectedAcapellas,
    isLoading,
    addAcapella: addAcapellaMutation.mutateAsync,
    updateAcapella: updateAcapellaMutation.mutateAsync,
    deleteAcapella: deleteAcapellaMutation.mutateAsync,
    approveAcapella: (id: string) => updateAcapellaMutation.mutateAsync({ id, status: 'approved' }),
    rejectAcapella: (id: string) => updateAcapellaMutation.mutateAsync({ id, status: 'rejected' }),
  };
}
