import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export function usePackInteractions(packId?: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Check if user has liked the pack
  const { data: hasLiked = false } = useQuery({
    queryKey: ['pack_likes', packId, user?.id],
    queryFn: async () => {
      if (!user || !packId) return false;
      const { data } = await supabase
        .from('pack_likes')
        .select('id')
        .eq('pack_id', packId)
        .eq('user_id', user.id)
        .single();
      return !!data;
    },
    enabled: !!user && !!packId,
  });

  // Check if user has favorited the pack
  const { data: hasFavorited = false } = useQuery({
    queryKey: ['pack_favorites', packId, user?.id],
    queryFn: async () => {
      if (!user || !packId) return false;
      const { data } = await supabase
        .from('pack_favorites')
        .select('id')
        .eq('pack_id', packId)
        .eq('user_id', user.id)
        .single();
      return !!data;
    },
    enabled: !!user && !!packId,
  });

  // Check if download is unlocked (via credit)
  const { data: isDownloadUnlocked = false } = useQuery({
    queryKey: ['pack_downloads', packId, user?.id],
    queryFn: async () => {
      if (!user || !packId) return false;
      const { data } = await supabase
        .from('pack_downloads')
        .select('id')
        .eq('pack_id', packId)
        .eq('user_id', user.id)
        .single();
      return !!data;
    },
    enabled: !!user && !!packId,
  });

  // Toggle like mutation
  const toggleLikeMutation = useMutation({
    mutationFn: async () => {
      if (!user || !packId) throw new Error('Not authenticated');
      
      if (hasLiked) {
        await supabase
          .from('pack_likes')
          .delete()
          .eq('pack_id', packId)
          .eq('user_id', user.id);
      } else {
        await supabase
          .from('pack_likes')
          .insert({ pack_id: packId, user_id: user.id });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pack_likes', packId] });
      queryClient.invalidateQueries({ queryKey: ['packs'] });
    },
  });

  // Toggle favorite mutation
  const toggleFavoriteMutation = useMutation({
    mutationFn: async () => {
      if (!user || !packId) throw new Error('Not authenticated');
      
      if (hasFavorited) {
        await supabase
          .from('pack_favorites')
          .delete()
          .eq('pack_id', packId)
          .eq('user_id', user.id);
      } else {
        await supabase
          .from('pack_favorites')
          .insert({ pack_id: packId, user_id: user.id });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pack_favorites', packId] });
      queryClient.invalidateQueries({ queryKey: ['user_favorites'] });
    },
  });

  // Unlock download mutation
  const unlockDownloadMutation = useMutation({
    mutationFn: async () => {
      if (!user || !packId) throw new Error('Not authenticated');
      
      await supabase
        .from('pack_downloads')
        .insert({ pack_id: packId, user_id: user.id });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pack_downloads', packId] });
    },
  });

  return {
    hasLiked,
    hasFavorited,
    isDownloadUnlocked,
    toggleLike: toggleLikeMutation.mutateAsync,
    toggleFavorite: toggleFavoriteMutation.mutateAsync,
    unlockDownload: unlockDownloadMutation.mutateAsync,
  };
}

// Hook for user's favorites
export function useUserFavorites() {
  const { user } = useAuth();

  const { data: favorites = [], isLoading } = useQuery({
    queryKey: ['user_favorites', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('pack_favorites')
        .select(`
          pack_id,
          packs (*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data.map(f => f.packs).filter(Boolean);
    },
    enabled: !!user,
  });

  return { favorites, isLoading };
}

// Hook for user's liked packs
export function useUserLikes() {
  const { user } = useAuth();

  const { data: likes = [], isLoading } = useQuery({
    queryKey: ['user_likes', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('pack_likes')
        .select(`
          pack_id,
          packs (*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data.map(l => l.packs).filter(Boolean);
    },
    enabled: !!user,
  });

  return { likes, isLoading };
}
