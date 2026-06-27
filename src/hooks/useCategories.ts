import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export type Category = {
  id: string;
  name: string;
  display_order: number;
  is_active: boolean;
};

export function useCategories() {
  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('categories' as any)
          .select('*')
          .eq('is_active', true)
          .order('display_order', { ascending: true });

        if (error) {
          console.error("Error fetching categories:", error);
          return [];
        }
        return data as Category[];
      } catch (e) {
        console.error("Error fetching categories (maybe table doesnt exist yet):", e);
        return [];
      }
    }
  });

  return { categories, isLoading };
}
