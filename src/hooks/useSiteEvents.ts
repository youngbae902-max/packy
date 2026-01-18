import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface SiteEvent {
  id: string;
  type: 'youtube' | 'instagram' | 'whatsapp' | 'text' | 'text_link';
  title: string;
  content: string | null;
  link_url: string | null;
  is_active: boolean;
  display_order: number;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export function useSiteEvents() {
  const queryClient = useQueryClient();

  const { data: events = [], isLoading } = useQuery({
    queryKey: ['site_events'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_events')
        .select('*')
        .order('display_order', { ascending: true });
      
      if (error) throw error;
      return data as SiteEvent[];
    },
  });

  const activeEvents = events.filter(e => e.is_active);

  const addEventMutation = useMutation({
    mutationFn: async (event: Omit<SiteEvent, 'id' | 'created_at' | 'updated_at' | 'created_by'>) => {
      const { data, error } = await supabase
        .from('site_events')
        .insert(event)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['site_events'] });
      toast.success('Evento criado com sucesso!');
    },
    onError: (error: Error) => {
      toast.error('Erro ao criar evento: ' + error.message);
    },
  });

  const updateEventMutation = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<SiteEvent> & { id: string }) => {
      const { data, error } = await supabase
        .from('site_events')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['site_events'] });
      toast.success('Evento atualizado!');
    },
    onError: (error: Error) => {
      toast.error('Erro ao atualizar: ' + error.message);
    },
  });

  const deleteEventMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('site_events')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['site_events'] });
      toast.success('Evento removido!');
    },
    onError: (error: Error) => {
      toast.error('Erro ao remover: ' + error.message);
    },
  });

  return {
    events,
    activeEvents,
    isLoading,
    addEvent: addEventMutation.mutate,
    updateEvent: updateEventMutation.mutate,
    deleteEvent: deleteEventMutation.mutate,
  };
}
