import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import type { Pack } from '@/hooks/useSupabasePacks';
import type { Album } from '@/hooks/useAlbums';

export interface PublicProfile {
  id: string;
  user_id: string;
  username: string | null;
  artist_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  has_spotify_badge: boolean | null;
  instagram_url: string | null;
  spotify_url: string | null;
  soundcloud_url: string | null;
  youtube_url: string | null;
  theme_accent_color?: string | null;
  online_accent_color?: string | null;
}

export interface PackComment {
  id: string;
  pack_id: string;
  user_id: string;
  content: string;
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
  profiles?: PublicProfile | null;
}

export function useProfileSearch(query: string) {
  const q = query.trim().toLowerCase();

  return useQuery({
    queryKey: ['profile-search', q],
    queryFn: async () => {
      if (q.length < 2) return [];
      const { data, error } = await (supabase as any)
        .from('profiles')
        .select('id, user_id, username, artist_name, avatar_url, bio, has_spotify_badge, instagram_url, spotify_url, soundcloud_url, youtube_url, theme_accent_color, online_accent_color')
        .or(`username.ilike.%${q}%,artist_name.ilike.%${q}%`)
        .limit(5);

      if (error) throw error;
      return (data || []) as PublicProfile[];
    },
    enabled: q.length >= 2,
  });
}

export function usePublicProfile(userId?: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const profileQuery = useQuery({
    queryKey: ['public-profile', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, user_id, username, artist_name, avatar_url, bio, has_spotify_badge, instagram_url, spotify_url, soundcloud_url, youtube_url, theme_accent_color, online_accent_color')
        .eq('user_id', userId!)
        .single();

      if (error) throw error;
      return data as PublicProfile;
    },
    enabled: !!userId,
  });

  const packsQuery = useQuery({
    queryKey: ['profile-packs', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('packs')
        .select('*')
        .eq('user_id', userId!)
        .eq('status', 'approved')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Pack[];
    },
    enabled: !!userId,
  });

  const likesQuery = useQuery({
    queryKey: ['profile-liked-packs', userId],
    queryFn: async () => {
      const { data: likes, error } = await supabase
        .from('pack_likes')
        .select('pack_id')
        .eq('user_id', userId!)
        .order('created_at', { ascending: false });

      if (error) throw error;
      const ids = (likes || []).map(item => item.pack_id);
      if (ids.length === 0) return [];

      const { data: packs, error: packsError } = await supabase
        .from('packs')
        .select('*')
        .in('id', ids)
        .eq('status', 'approved');

      if (packsError) throw packsError;
      return ids.map(id => (packs || []).find(pack => pack.id === id)).filter(Boolean) as Pack[];
    },
    enabled: !!userId,
  });

  const repostsQuery = useQuery({
    queryKey: ['profile-reposts', userId],
    queryFn: async () => {
      const { data: reposts, error } = await (supabase as any)
        .from('pack_reposts')
        .select('pack_id')
        .eq('user_id', userId!)
        .order('created_at', { ascending: false });

      if (error) throw error;
      const ids = (reposts || []).map((item: any) => item.pack_id);
      if (ids.length === 0) return [];

      const { data: packs, error: packsError } = await supabase
        .from('packs')
        .select('*')
        .in('id', ids)
        .eq('status', 'approved');

      if (packsError) throw packsError;
      return ids.map((id: string) => (packs || []).find(pack => pack.id === id)).filter(Boolean) as Pack[];
    },
    enabled: !!userId,
  });

  const albumsQuery = useQuery({
    queryKey: ['profile-albums', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('albums')
        .select('*')
        .eq('created_by', userId!)
        .eq('status', 'approved')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Album[];
    },
    enabled: !!userId,
  });

  const followersQuery = useQuery({
    queryKey: ['followers', userId],
    queryFn: async () => {
      const { count, error } = await (supabase as any)
        .from('user_follows')
        .select('*', { count: 'exact', head: true })
        .eq('following_id', userId!);
      if (error) throw error;
      return count || 0;
    },
    enabled: !!userId,
  });

  const followingQuery = useQuery({
    queryKey: ['following', userId],
    queryFn: async () => {
      const { count, error } = await (supabase as any)
        .from('user_follows')
        .select('*', { count: 'exact', head: true })
        .eq('follower_id', userId!);
      if (error) throw error;
      return count || 0;
    },
    enabled: !!userId,
  });

  const isFollowingQuery = useQuery({
    queryKey: ['is-following', user?.id, userId],
    queryFn: async () => {
      if (!user || !userId) return false;
      const { data } = await (supabase as any)
        .from('user_follows')
        .select('id')
        .eq('follower_id', user.id)
        .eq('following_id', userId)
        .maybeSingle();
      return !!data;
    },
    enabled: !!user && !!userId && user.id !== userId,
  });

  const toggleFollowMutation = useMutation({
    mutationFn: async () => {
      if (!user || !userId) throw new Error('Faça login');
      if (user.id === userId) throw new Error('Você não pode seguir você mesmo');

      if (isFollowingQuery.data) {
        const { error } = await (supabase as any)
          .from('user_follows')
          .delete()
          .eq('follower_id', user.id)
          .eq('following_id', userId);
        if (error) throw error;
      } else {
        const { error } = await (supabase as any)
          .from('user_follows')
          .insert({ follower_id: user.id, following_id: userId });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['is-following'] });
      queryClient.invalidateQueries({ queryKey: ['followers', userId] });
      toast.success(isFollowingQuery.data ? 'Você deixou de seguir' : 'Agora você está seguindo');
    },
  });

  return {
    profile: profileQuery.data,
    packs: packsQuery.data || [],
    likedPacks: likesQuery.data || [],
    repostedPacks: repostsQuery.data || [],
    albums: albumsQuery.data || [],
    followersCount: followersQuery.data || 0,
    followingCount: followingQuery.data || 0,
    isFollowing: !!isFollowingQuery.data,
    toggleFollow: toggleFollowMutation.mutateAsync,
    isLoading: profileQuery.isLoading,
  };
}

export function usePackComments(packId?: string) {
  const { user, isAdmin } = useAuth();
  const queryClient = useQueryClient();

  const commentsQuery = useQuery({
    queryKey: ['pack-comments', packId],
    queryFn: async () => {
      const { data: comments, error } = await (supabase as any)
        .from('pack_comments')
        .select('*')
        .eq('pack_id', packId!)
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      const userIds = Array.from(new Set<string>((comments || []).map((comment: any) => String(comment.user_id))));
      if (userIds.length === 0) return [];

      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, user_id, username, artist_name, avatar_url, bio, has_spotify_badge, instagram_url, spotify_url, soundcloud_url, youtube_url, theme_accent_color, online_accent_color')
        .in('user_id', userIds);

      if (profilesError) throw profilesError;
      return (comments || []).map((comment: any) => ({
        ...comment,
        profiles: (profiles || []).find(profile => profile.user_id === comment.user_id) || null,
      })) as PackComment[];
    },
    enabled: !!packId,
  });

  const addCommentMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!user || !packId) throw new Error('Faça login');
      const { error } = await (supabase as any)
        .from('pack_comments')
        .insert({ pack_id: packId, user_id: user.id, content: content.trim() });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pack-comments', packId] });
      toast.success('Comentário enviado');
    },
  });

  const updateCommentMutation = useMutation({
    mutationFn: async ({ id, content }: { id: string; content: string }) => {
      const { error } = await (supabase as any)
        .from('pack_comments')
        .update({ content: content.trim() })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pack-comments', packId] });
      toast.success('Comentário atualizado');
    },
  });

  const deleteCommentMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any).from('pack_comments').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pack-comments', packId] });
      toast.success('Comentário apagado');
    },
  });

  const pinCommentMutation = useMutation({
    mutationFn: async ({ id, pinned }: { id: string; pinned: boolean }) => {
      if (!isAdmin) throw new Error('Apenas ADM');
      const { error } = await (supabase as any).from('pack_comments').update({ is_pinned: pinned }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pack-comments', packId] });
    },
  });

  return {
    comments: commentsQuery.data || [],
    addComment: addCommentMutation.mutateAsync,
    updateComment: updateCommentMutation.mutateAsync,
    deleteComment: deleteCommentMutation.mutateAsync,
    pinComment: pinCommentMutation.mutateAsync,
  };
}

export function useRepost(packId?: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const repostQuery = useQuery({
    queryKey: ['pack-repost', packId, user?.id],
    queryFn: async () => {
      if (!user || !packId) return false;
      const { data } = await (supabase as any)
        .from('pack_reposts')
        .select('id')
        .eq('pack_id', packId)
        .eq('user_id', user.id)
        .maybeSingle();
      return !!data;
    },
    enabled: !!user && !!packId,
  });

  const toggleRepostMutation = useMutation({
    mutationFn: async () => {
      if (!user || !packId) throw new Error('Faça login');
      if (repostQuery.data) {
        const { error } = await (supabase as any).from('pack_reposts').delete().eq('pack_id', packId).eq('user_id', user.id);
        if (error) throw error;
      } else {
        const { error } = await (supabase as any).from('pack_reposts').insert({ pack_id: packId, user_id: user.id });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pack-repost', packId] });
      queryClient.invalidateQueries({ queryKey: ['profile-reposts'] });
      toast.success(repostQuery.data ? 'Republicação removida' : 'Pack republicado');
    },
  });

  return { hasReposted: !!repostQuery.data, toggleRepost: toggleRepostMutation.mutateAsync };
}
