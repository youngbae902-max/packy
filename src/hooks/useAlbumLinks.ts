import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface AlbumLink {
  id: string;
  album_id: string;
  name: string;
  link_url: string;
  description: string | null;
  display_order: number;
  created_at: string;
}

export function useAlbumLinks(albumId?: string) {
  const queryClient = useQueryClient();

  const { data: albumLinks = [], isLoading } = useQuery({
    queryKey: ['album_links', albumId],
    queryFn: async () => {
      let query = supabase
        .from('album_links')
        .select('*')
        .order('display_order', { ascending: true });
      
      if (albumId) {
        query = query.eq('album_id', albumId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as AlbumLink[];
    },
  });

  const addLinkMutation = useMutation({
    mutationFn: async (link: { album_id: string; name: string; link_url: string; description?: string }) => {
      // Check if album already has 10 links
      const { count } = await supabase
        .from('album_links')
        .select('*', { count: 'exact', head: true })
        .eq('album_id', link.album_id);
      
      if (count && count >= 10) {
        throw new Error('Máximo de 10 links por álbum');
      }

      const { data, error } = await supabase
        .from('album_links')
        .insert({ ...link, display_order: count || 0 })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['album_links'] });
      toast.success('Link adicionado ao álbum!');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const updateLinkMutation = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<AlbumLink> & { id: string }) => {
      const { data, error } = await supabase
        .from('album_links')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['album_links'] });
      toast.success('Link atualizado!');
    },
    onError: (error: Error) => {
      toast.error('Erro ao atualizar: ' + error.message);
    },
  });

  const deleteLinkMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('album_links')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['album_links'] });
      toast.success('Link removido!');
    },
    onError: (error: Error) => {
      toast.error('Erro ao remover: ' + error.message);
    },
  });

  const getAlbumLinks = (albumId: string) => albumLinks.filter(l => l.album_id === albumId);

  return {
    albumLinks,
    isLoading,
    getAlbumLinks,
    addLink: addLinkMutation.mutateAsync,
    updateLink: updateLinkMutation.mutate,
    deleteLink: deleteLinkMutation.mutate,
  };
}
