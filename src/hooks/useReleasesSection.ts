import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const KEY = 'home_releases_section';

export interface ReleasesConfig {
  title: string;
  visible: boolean;
  limit: number;
  mode: 'auto' | 'manual';
  pack_ids: string[];
}

export const DEFAULT_RELEASES: ReleasesConfig = {
  title: 'Lançamentos',
  visible: true,
  limit: 10,
  mode: 'auto',
  pack_ids: [],
};

function parse(value: string | null): ReleasesConfig {
  if (!value) return DEFAULT_RELEASES;
  try {
    const parsed = JSON.parse(value);
    return { ...DEFAULT_RELEASES, ...parsed };
  } catch {
    return DEFAULT_RELEASES;
  }
}

export function useReleasesSection() {
  const qc = useQueryClient();

  const { data: config = DEFAULT_RELEASES, isLoading } = useQuery({
    queryKey: ['home-releases-config'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('app_settings')
        .select('value')
        .eq('key', KEY)
        .maybeSingle();
      if (error) throw error;
      return parse((data?.value as string | null) ?? null);
    },
  });

  const save = useMutation({
    mutationFn: async (next: Partial<ReleasesConfig>) => {
      const merged = { ...config, ...next };
      const { error } = await supabase
        .from('app_settings')
        .upsert(
          { key: KEY, value: JSON.stringify(merged), updated_at: new Date().toISOString() },
          { onConflict: 'key' },
        );
      if (error) throw error;
      return merged;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['home-releases-config'] });
    },
  });

  return { config, isLoading, saveConfig: save.mutateAsync, isSaving: save.isPending };
}
