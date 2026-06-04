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
  theme_accent_color?: string | null;
  online_accent_color?: string | null;
  verified_badge_color?: string | null;
  verified_badge_bg_color?: string | null;
  verified_badge_text_color?: string | null;
  admin_badge_color?: string | null;
  admin_badge_bg_color?: string | null;
  admin_badge_border_color?: string | null;
  admin_badge_text_color?: string | null;
  theme_mode?: 'dark' | 'light' | null;
  recovery_keyword?: string | null;
  thought_bubble?: string | null;
  show_badges_in_bio?: boolean;
  show_badges_in_thought?: boolean;
  profile_decoration_url?: string | null;
  profile_decoration_position?: any;
  show_admin_badge?: boolean;
  avatar_shape?: string | null;
  pack_name_prefix?: string | null;
  pack_name_emoji?: string | null;
}

export function useProfile() {
  const { user, refreshProfile } = useAuth();
  const queryClient = useQueryClient();

  const updateProfileMutation = useMutation({
    mutationFn: async (updates: ProfileUpdates) => {
      if (!user) throw new Error('Not authenticated');

      // Ensure profile row exists (handles edge cases where the auth trigger
      // didn't create one — legacy users, interrupted signups, OAuth races).
      const { data: existing } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!existing) {
        const { error: insertErr } = await supabase
          .from('profiles')
          .insert({ user_id: user.id, ...(updates as any) });
        if (insertErr) throw insertErr;
        return { user_id: user.id, ...updates };
      }

      const { data, error } = await supabase
        .from('profiles')
        .update(updates as any)
        .eq('user_id', user.id)
        .select()
        .maybeSingle();

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
