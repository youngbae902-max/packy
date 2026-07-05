import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Pack } from '@/hooks/useSupabasePacks';

export interface HomeSection {
  id: string;
  title: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface HomeSectionPack {
  id: string;
  section_id: string;
  pack_id: string;
  display_order: number;
}

/** Public hook: returns active sections with their packs, ordered. */
export function useHomeSectionsWithPacks() {
  return useQuery({
    queryKey: ['home-sections-with-packs'],
    queryFn: async () => {
      const { data: sections, error: e1 } = await supabase
        .from('home_sections')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });
      if (e1) throw e1;
      if (!sections?.length) return [] as { section: HomeSection; packs: Pack[] }[];

      const { data: links, error: e2 } = await supabase
        .from('home_section_packs')
        .select('*')
        .in('section_id', sections.map(s => s.id))
        .order('display_order', { ascending: true });
      if (e2) throw e2;

      const packIds = Array.from(new Set((links || []).map(l => l.pack_id)));
      if (!packIds.length) return sections.map(s => ({ section: s as HomeSection, packs: [] }));

      const { data: packs, error: e3 } = await supabase
        .from('packs')
        .select('*')
        .in('id', packIds)
        .eq('status', 'approved');
      if (e3) throw e3;

      const byId = new Map<string, Pack>((packs || []).map((p: any) => [p.id, p as Pack]));
      return sections.map(s => {
        const secLinks = (links || []).filter(l => l.section_id === s.id);
        const secPacks = secLinks
          .map(l => byId.get(l.pack_id))
          .filter(Boolean) as Pack[];
        return { section: s as HomeSection, packs: secPacks };
      });
    },
  });
}

/** Admin hook: CRUD for sections + linking packs. */
export function useHomeSectionsAdmin() {
  const qc = useQueryClient();
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['home-sections-with-packs'] });
    qc.invalidateQueries({ queryKey: ['home-sections-admin'] });
  };

  const sectionsQuery = useQuery({
    queryKey: ['home-sections-admin'],
    queryFn: async () => {
      const { data: sections, error } = await supabase
        .from('home_sections')
        .select('*')
        .order('display_order', { ascending: true });
      if (error) throw error;
      const ids = (sections || []).map(s => s.id);
      let links: HomeSectionPack[] = [];
      if (ids.length) {
        const { data } = await supabase
          .from('home_section_packs')
          .select('*')
          .in('section_id', ids)
          .order('display_order', { ascending: true });
        links = (data || []) as HomeSectionPack[];
      }
      return (sections || []).map(s => ({
        ...(s as HomeSection),
        pack_ids: links.filter(l => l.section_id === s.id).map(l => l.pack_id),
      }));
    },
  });

  const createSection = useMutation({
    mutationFn: async (input: { title: string; display_order?: number }) => {
      const { data, error } = await supabase
        .from('home_sections')
        .insert({ title: input.title, display_order: input.display_order ?? 100, is_active: true })
        .select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: invalidate,
  });

  const updateSection = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<HomeSection> & { id: string }) => {
      const { error } = await supabase.from('home_sections').update(updates).eq('id', id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  const deleteSection = useMutation({
    mutationFn: async (id: string) => {
      await supabase.from('home_section_packs').delete().eq('section_id', id);
      const { error } = await supabase.from('home_sections').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  const setSectionPacks = useMutation({
    mutationFn: async ({ sectionId, packIds }: { sectionId: string; packIds: string[] }) => {
      await supabase.from('home_section_packs').delete().eq('section_id', sectionId);
      if (packIds.length) {
        const rows = packIds.map((pid, i) => ({ section_id: sectionId, pack_id: pid, display_order: i }));
        const { error } = await supabase.from('home_section_packs').insert(rows);
        if (error) throw error;
      }
    },
    onSuccess: invalidate,
  });

  return {
    sections: sectionsQuery.data || [],
    isLoading: sectionsQuery.isLoading,
    createSection: createSection.mutateAsync,
    updateSection: updateSection.mutateAsync,
    deleteSection: deleteSection.mutateAsync,
    setSectionPacks: setSectionPacks.mutateAsync,
  };
}
