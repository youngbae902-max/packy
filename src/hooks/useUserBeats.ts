import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface UserBeat {
  id: string;
  user_id: string;
  name: string;
  cover_url: string | null;
  external_url: string | null;
  storage_path: string | null;
  size_bytes: number | null;
  created_at: string;
  updated_at: string;
}

export function useUserBeats() {
  const { user } = useAuth();
  const [beats, setBeats] = useState<UserBeat[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!user) {
      setBeats([]);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase
      .from('user_beats' as any)
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    if (!error && data) setBeats(data as unknown as UserBeat[]);
    setLoading(false);
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const create = useCallback(async (payload: Omit<UserBeat, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) throw new Error('not_authenticated');
    const { data, error } = await supabase
      .from('user_beats' as any)
      .insert({ ...payload, user_id: user.id } as any)
      .select()
      .single();
    if (error) throw error;
    await load();
    return data as unknown as UserBeat;
  }, [user, load]);

  const update = useCallback(async (id: string, patch: Partial<UserBeat>) => {
    const { error } = await supabase.from('user_beats' as any).update(patch as any).eq('id', id);
    if (error) throw error;
    await load();
  }, [load]);

  const remove = useCallback(async (beat: UserBeat) => {
    // delete file if owned
    if (beat.storage_path) {
      await supabase.storage.from('beats-files').remove([beat.storage_path]);
    }
    const { error } = await supabase.from('user_beats' as any).delete().eq('id', beat.id);
    if (error) throw error;
    await load();
  }, [load]);

  const getDownloadUrl = useCallback(async (beat: UserBeat): Promise<string | null> => {
    if (beat.external_url) return beat.external_url;
    if (!beat.storage_path) return null;
    const { data, error } = await supabase.storage
      .from('beats-files')
      .createSignedUrl(beat.storage_path, 60 * 5); // 5 minutes
    if (error || !data) return null;
    return data.signedUrl;
  }, []);

  return { beats, loading, reload: load, create, update, remove, getDownloadUrl };
}
