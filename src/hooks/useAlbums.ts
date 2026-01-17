import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Album {
  id: string;
  title: string;
  cover_url: string | null;
  description: string | null;
  style: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface AlbumPack {
  id: string;
  album_id: string;
  pack_id: string;
  added_at: string;
}

export function useAlbums() {
  const queryClient = useQueryClient();

  const { data: albums = [], isLoading } = useQuery({
    queryKey: ['albums'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('albums')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Album[];
    },
  });

  const { data: albumPacks = [] } = useQuery({
    queryKey: ['album_packs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('album_packs')
        .select('*');
      
      if (error) throw error;
      return data as AlbumPack[];
    },
  });

  const addAlbumMutation = useMutation({
    mutationFn: async (album: { title: string; cover_url?: string; description?: string; style?: string }) => {
      const { data, error } = await supabase
        .from('albums')
        .insert(album)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['albums'] });
      toast.success('Álbum criado com sucesso!');
    },
    onError: (error: Error) => {
      toast.error('Erro ao criar álbum: ' + error.message);
    },
  });

  const updateAlbumMutation = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Album> & { id: string }) => {
      const { data, error } = await supabase
        .from('albums')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['albums'] });
      toast.success('Álbum atualizado!');
    },
    onError: (error: Error) => {
      toast.error('Erro ao atualizar: ' + error.message);
    },
  });

  const deleteAlbumMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('albums')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['albums'] });
      toast.success('Álbum removido!');
    },
    onError: (error: Error) => {
      toast.error('Erro ao remover: ' + error.message);
    },
  });

  const addPackToAlbumMutation = useMutation({
    mutationFn: async ({ album_id, pack_id }: { album_id: string; pack_id: string }) => {
      const { data, error } = await supabase
        .from('album_packs')
        .insert({ album_id, pack_id })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['album_packs'] });
      toast.success('Pack adicionado ao álbum!');
    },
    onError: (error: Error) => {
      toast.error('Erro ao adicionar pack: ' + error.message);
    },
  });

  const removePackFromAlbumMutation = useMutation({
    mutationFn: async ({ album_id, pack_id }: { album_id: string; pack_id: string }) => {
      const { error } = await supabase
        .from('album_packs')
        .delete()
        .eq('album_id', album_id)
        .eq('pack_id', pack_id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['album_packs'] });
      toast.success('Pack removido do álbum!');
    },
    onError: (error: Error) => {
      toast.error('Erro ao remover pack: ' + error.message);
    },
  });

  const getAlbumPacks = (albumId: string) => {
    return albumPacks.filter(ap => ap.album_id === albumId);
  };

  return {
    albums,
    albumPacks,
    isLoading,
    addAlbum: addAlbumMutation.mutate,
    updateAlbum: updateAlbumMutation.mutate,
    deleteAlbum: deleteAlbumMutation.mutate,
    addPackToAlbum: addPackToAlbumMutation.mutate,
    removePackFromAlbum: removePackFromAlbumMutation.mutate,
    getAlbumPacks,
  };
}
