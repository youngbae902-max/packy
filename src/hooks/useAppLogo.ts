import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const LOGO_KEY = 'app_logo_url';

export function useAppLogo() {
  const queryClient = useQueryClient();

  const { data: logoUrl, isLoading } = useQuery({
    queryKey: ['app-logo'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('app_settings')
        .select('value')
        .eq('key', LOGO_KEY)
        .maybeSingle();
      if (error) throw error;
      return (data?.value as string | null) ?? null;
    },
  });

  const uploadAndSet = useMutation({
    mutationFn: async (file: File) => {
      const ext = file.name.split('.').pop() || 'png';
      const path = `logo-${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from('app-logo')
        .upload(path, file, { upsert: true, cacheControl: '3600' });
      if (upErr) throw upErr;
      const { data: pub } = supabase.storage.from('app-logo').getPublicUrl(path);
      const url = pub.publicUrl;

      const { error: updErr } = await supabase
        .from('app_settings')
        .upsert(
          { key: LOGO_KEY, value: url, updated_at: new Date().toISOString() },
          { onConflict: 'key' },
        );
      if (updErr) throw updErr;
      return url;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['app-logo'] });
    },
  });

  const clearLogo = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('app_settings')
        .upsert(
          { key: LOGO_KEY, value: null, updated_at: new Date().toISOString() },
          { onConflict: 'key' },
        );
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['app-logo'] });
    },
  });

  return {
    logoUrl: logoUrl ?? null,
    isLoading,
    uploadLogo: uploadAndSet.mutateAsync,
    isUploading: uploadAndSet.isPending,
    clearLogo: clearLogo.mutateAsync,
  };
}
