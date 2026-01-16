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
}

export function useAcapellas() {
  const { user, isAdmin } = useAuth();
  const queryClient = useQueryClient();

  // Fetch all acapellas (public)
  const { data: acapellas = [], isLoading } = useQuery({
    queryKey: ['acapellas'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('acapellas')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Acapella[];
    },
  });

  // Add acapella mutation (admin only)
  const addAcapellaMutation = useMutation({
    mutationFn: async (acapella: Omit<Acapella, 'id' | 'created_at' | 'created_by'>) => {
      const { data, error } = await supabase
        .from('acapellas')
        .insert({
          ...acapella,
          created_by: user?.id,
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
    isLoading,
    addAcapella: addAcapellaMutation.mutateAsync,
    deleteAcapella: deleteAcapellaMutation.mutateAsync,
  };
}
