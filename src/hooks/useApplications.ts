import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Application {
  id: string;
  name: string;
  description: string | null;
  app_url: string;
  icon_url: string | null;
  is_active: boolean;
  display_order: number;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export function useApplications() {
  const queryClient = useQueryClient();

  const applicationsQuery = useQuery({
    queryKey: ['applications'],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('applications')
        .select('*')
        .order('display_order', { ascending: true })
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []) as Application[];
    },
  });

  const saveApplication = useMutation({
    mutationFn: async (application: Partial<Application> & { name: string; app_url: string }) => {
      const payload = {
        name: application.name.trim(),
        description: application.description?.trim() || null,
        app_url: application.app_url.trim(),
        icon_url: application.icon_url?.trim() || null,
        is_active: application.is_active ?? true,
        display_order: application.display_order ?? 0,
      };

      const query = application.id
        ? (supabase as any).from('applications').update(payload).eq('id', application.id)
        : (supabase as any).from('applications').insert({ ...payload, created_by: (await supabase.auth.getUser()).data.user?.id });

      const { error } = await query;
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      toast.success('Aplicativo salvo!');
    },
    onError: () => toast.error('Não foi possível salvar o aplicativo.'),
  });

  const deleteApplication = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any).from('applications').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      toast.success('Aplicativo removido.');
    },
    onError: () => toast.error('Não foi possível remover o aplicativo.'),
  });

  return {
    applications: applicationsQuery.data || [],
    isLoading: applicationsQuery.isLoading,
    saveApplication: saveApplication.mutateAsync,
    deleteApplication: deleteApplication.mutateAsync,
  };
}
