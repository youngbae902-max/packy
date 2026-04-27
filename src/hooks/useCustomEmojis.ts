import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface CustomEmoji {
  id: string;
  name: string;
  shortcode: string;
  image_url: string;
  is_active: boolean;
  created_at: string;
}

export function useCustomEmojis() {
  const { user, isAdmin } = useAuth();
  const queryClient = useQueryClient();

  const { data: emojis = [], isLoading } = useQuery({
    queryKey: ['custom-emojis'],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('custom_emojis')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []) as CustomEmoji[];
    },
  });

  const uploadEmoji = async (file: File) => {
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '-');
    const fileName = `${user?.id || 'admin'}/${Date.now()}-${safeName}`;
    const { error } = await supabase.storage.from('emojis').upload(fileName, file, { upsert: true });
    if (error) throw error;
    const { data } = supabase.storage.from('emojis').getPublicUrl(fileName);
    return data.publicUrl;
  };

  const saveEmojiMutation = useMutation({
    mutationFn: async ({ name, shortcode, file }: { name: string; shortcode: string; file: File }) => {
      if (!isAdmin) throw new Error('Apenas ADM pode criar emojis');
      const imageUrl = await uploadEmoji(file);
      const cleanCode = shortcode.replace(/:/g, '').trim().toLowerCase();
      const { error } = await (supabase as any).from('custom_emojis').insert({
        name: name.trim(),
        shortcode: cleanCode,
        image_url: imageUrl,
        created_by: user?.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['custom-emojis'] });
      toast.success('Emoji criado!');
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const deleteEmojiMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any).from('custom_emojis').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['custom-emojis'] });
      toast.success('Emoji removido');
    },
  });

  return {
    emojis,
    isLoading,
    saveEmoji: saveEmojiMutation.mutateAsync,
    deleteEmoji: deleteEmojiMutation.mutate,
    isSaving: saveEmojiMutation.isPending,
  };
}
