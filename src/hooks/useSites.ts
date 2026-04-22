import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Site {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  site_url: string;
  display_order: number | null;
  is_active: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export function useSites() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: sites = [], isLoading } = useQuery({
    queryKey: ['sites'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sites')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true })
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Site[];
    },
  });

  const addSite = useMutation({
    mutationFn: async (site: Omit<Site, 'id' | 'created_at' | 'updated_at' | 'created_by' | 'is_active'>) => {
      const { data, error } = await supabase
        .from('sites')
        .insert({ ...site, created_by: user?.id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['sites'] }),
  });

  const updateSite = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Site> & { id: string }) => {
      const { data, error } = await supabase
        .from('sites')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['sites'] }),
  });

  const deleteSite = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('sites').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['sites'] }),
  });

  const uploadSiteImage = async (file: File): Promise<string> => {
    const ext = file.name.split('.').pop();
    const path = `${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from('sites').upload(path, file, { upsert: true });
    if (error) throw error;
    const { data } = supabase.storage.from('sites').getPublicUrl(path);
    return data.publicUrl;
  };

  return {
    sites,
    isLoading,
    addSite: addSite.mutateAsync,
    updateSite: updateSite.mutateAsync,
    deleteSite: deleteSite.mutateAsync,
    uploadSiteImage,
  };
}
