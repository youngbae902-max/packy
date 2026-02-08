import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface ProfileUpdates {
  username?: string;
  artist_name?: string;
  avatar_url?: string;
  bio?: string;
  instagram_url?: string | null;
  spotify_url?: string | null;
  soundcloud_url?: string | null;
  youtube_url?: string | null;
  banner_url?: string | null;
  status_ring_color?: string | null;
  thought_bubble?: string | null;
  theme_preference?: string | null;
}

export function useProfile() {
  const { user, refreshProfile } = useAuth();
  const queryClient = useQueryClient();

  const updateProfileMutation = useMutation({
    mutationFn: async (updates: ProfileUpdates) => {
      if (!user) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('profiles')
        .update(updates as any)
        .eq('user_id', user.id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      refreshProfile();
    },
  });

  const uploadAvatar = async (file: File) => {
    if (!user) throw new Error('Not authenticated');
    
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/${Date.now()}.${fileExt}`;
    
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(fileName, file, { upsert: true });
    
    if (uploadError) throw uploadError;
    
    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName);
    
    return publicUrl;
  };

  return {
    updateProfile: updateProfileMutation.mutateAsync,
    uploadAvatar,
    isUpdating: updateProfileMutation.isPending,
  };
}
