import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface ProfileDecoration {
  id: string;
  name: string;
  image_url: string;
  is_active: boolean;
  created_at: string;
}

export function useDecorations() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const decorationsQuery = useQuery({
    queryKey: ['profile-decorations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profile_decorations' as any)
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []) as unknown as ProfileDecoration[];
    },
  });

  const uploadDecoration = async (file: File, name: string) => {
    if (!user) throw new Error('Not authenticated');
    const ext = file.name.split('.').pop();
    const path = `${user.id}/${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage.from('decorations').upload(path, file, { upsert: true });
    if (upErr) throw upErr;
    const { data: { publicUrl } } = supabase.storage.from('decorations').getPublicUrl(path);
    const { error } = await supabase.from('profile_decorations' as any).insert({
      name,
      image_url: publicUrl,
      created_by: user.id,
      is_active: true,
    } as any);
    if (error) throw error;
  };

  const createMutation = useMutation({
    mutationFn: async ({ file, name }: { file: File; name: string }) => uploadDecoration(file, name),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['profile-decorations'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('profile_decorations' as any).delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['profile-decorations'] }),
  });

  return {
    decorations: decorationsQuery.data || [],
    isLoading: decorationsQuery.isLoading,
    createDecoration: createMutation.mutateAsync,
    deleteDecoration: deleteMutation.mutateAsync,
  };
}
