import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type HomeSection = {
  id: string;
  title: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type HomeSectionPack = {
  id: string;
  section_id: string;
  pack_id: string;
  display_order: number;
};

export function useHomeSections() {
  const qc = useQueryClient();

  const sectionsQ = useQuery({
    queryKey: ['home-sections'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('home_sections')
        .select('*')
        .order('display_order', { ascending: true });
      if (error) throw error;
      return (data || []) as HomeSection[];
    },
  });

  const packsQ = useQuery({
    queryKey: ['home-section-packs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('home_section_packs')
        .select('*')
        .order('display_order', { ascending: true });
      if (error) throw error;
      return (data || []) as HomeSectionPack[];
    },
  });

  const createSection = useMutation({
    mutationFn: async ({ title, display_order }: { title: string; display_order: number }) => {
      const { data, error } = await supabase
        .from('home_sections')
        .insert({ title, display_order })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['home-sections'] });
      toast.success('Seção criada');
    },
    onError: (e: any) => toast.error(e.message || 'Erro'),
  });

  const updateSection = useMutation({
    mutationFn: async ({ id, ...patch }: Partial<HomeSection> & { id: string }) => {
      const { error } = await supabase.from('home_sections').update(patch).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['home-sections'] }),
  });

  const deleteSection = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('home_sections').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['home-sections'] });
      qc.invalidateQueries({ queryKey: ['home-section-packs'] });
      toast.success('Seção removida');
    },
  });

  const addPackToSection = useMutation({
    mutationFn: async ({ section_id, pack_id, display_order }: { section_id: string; pack_id: string; display_order: number }) => {
      const { error } = await supabase.from('home_section_packs').insert({ section_id, pack_id, display_order });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['home-section-packs'] });
      toast.success('Pack adicionado');
    },
    onError: (e: any) => toast.error(e.message || 'Já existe'),
  });

  const removePackFromSection = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('home_section_packs').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['home-section-packs'] }),
  });

  return {
    sections: sectionsQ.data || [],
    sectionPacks: packsQ.data || [],
    isLoading: sectionsQ.isLoading || packsQ.isLoading,
    createSection: createSection.mutate,
    updateSection: updateSection.mutate,
    deleteSection: deleteSection.mutate,
    addPackToSection: addPackToSection.mutate,
    removePackFromSection: removePackFromSection.mutate,
  };
}
