import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface CustomPage {
  id: string;
  title: string;
  slug: string;
  content: string | null;
  cover_url: string | null;
  icon_name: string | null;
  placement: 'home' | 'bottom' | 'hidden';
  is_active: boolean;
  display_order: number;
}

export function useCustomPages() {
  const queryClient = useQueryClient();
  const pagesQuery = useQuery({
    queryKey: ['custom-pages'],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('custom_pages')
        .select('*')
        .order('display_order', { ascending: true })
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []) as CustomPage[];
    },
  });

  const savePage = useMutation({
    mutationFn: async (page: Partial<CustomPage> & { title: string; slug: string }) => {
      const payload = { ...page, slug: page.slug.toLowerCase().replace(/[^a-z0-9-]/g, '-') };
      const { error } = page.id
        ? await (supabase as any).from('custom_pages').update(payload).eq('id', page.id)
        : await (supabase as any).from('custom_pages').insert(payload);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['custom-pages'] });
      toast.success('Aba salva!');
    },
  });

  const deletePage = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any).from('custom_pages').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['custom-pages'] }),
  });

  return { pages: pagesQuery.data || [], savePage: savePage.mutateAsync, deletePage: deletePage.mutateAsync };
}