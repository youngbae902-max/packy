import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface HomeBanner {
  id: string;
  image_url: string;
  title: string | null;
  subtitle: string | null;
  link_url: string | null;
  display_order: number;
  is_active: boolean;
}

const db = supabase as any;

export function useHomeBanners() {
  return useQuery({
    queryKey: ['home-banners'],
    queryFn: async () => {
      const { data, error } = await db
        .from('home_banners')
        .select('id,image_url,title,subtitle,link_url,display_order,is_active')
        .eq('is_active', true)
        .order('display_order', { ascending: true });
      if (error) throw error;
      return (data || []) as HomeBanner[];
    },
  });
}

export function useHomeBannersAdmin() {
  const qc = useQueryClient();

  const list = useQuery({
    queryKey: ['home-banners-admin'],
    queryFn: async () => {
      const { data, error } = await db
        .from('home_banners')
        .select('id,image_url,title,subtitle,link_url,display_order,is_active')
        .order('display_order', { ascending: true });
      if (error) throw error;
      return (data || []) as HomeBanner[];
    },
  });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['home-banners'] });
    qc.invalidateQueries({ queryKey: ['home-banners-admin'] });
  };

  const uploadBanner = async (file: File) => {
    const ext = file.name.split('.').pop();
    const path = `home/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from('banners').upload(path, file, { upsert: true });
    if (error) throw error;
    return supabase.storage.from('banners').getPublicUrl(path).data.publicUrl;
  };

  const createBanner = useMutation({
    mutationFn: async (payload: Partial<HomeBanner>) => {
      const { error } = await db.from('home_banners').insert(payload);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  const updateBanner = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<HomeBanner> & { id: string }) => {
      const { error } = await db.from('home_banners').update(updates).eq('id', id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  const deleteBanner = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await db.from('home_banners').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  return {
    banners: list.data || [],
    isLoading: list.isLoading,
    uploadBanner,
    createBanner: createBanner.mutateAsync,
    updateBanner: updateBanner.mutateAsync,
    deleteBanner: deleteBanner.mutateAsync,
  };
}
