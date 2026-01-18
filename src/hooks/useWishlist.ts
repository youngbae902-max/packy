import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface WishlistItem {
  id: string;
  user_id: string;
  request_text: string;
  status: 'pending' | 'accepted' | 'rejected';
  admin_response: string | null;
  responded_by: string | null;
  created_at: string;
  responded_at: string | null;
}

export function useWishlist() {
  const { user, isAdmin } = useAuth();
  const queryClient = useQueryClient();

  // User's own wishlist items
  const { data: myWishlist = [], isLoading: isLoadingMy } = useQuery({
    queryKey: ['my_wishlist', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('wishlists')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as WishlistItem[];
    },
    enabled: !!user,
  });

  // All pending wishlists (admin only)
  const { data: pendingWishlists = [], isLoading: isLoadingPending } = useQuery({
    queryKey: ['pending_wishlists'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('wishlists')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as WishlistItem[];
    },
    enabled: isAdmin,
  });

  // All wishlists (admin only)
  const { data: allWishlists = [], isLoading: isLoadingAll } = useQuery({
    queryKey: ['all_wishlists'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('wishlists')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as WishlistItem[];
    },
    enabled: isAdmin,
  });

  const addWishMutation = useMutation({
    mutationFn: async (request_text: string) => {
      if (!user) throw new Error('Você precisa estar logado');
      
      const { data, error } = await supabase
        .from('wishlists')
        .insert({ user_id: user.id, request_text })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my_wishlist'] });
      toast.success('Pedido enviado com sucesso!');
    },
    onError: (error: Error) => {
      toast.error('Erro ao enviar pedido: ' + error.message);
    },
  });

  const respondToWishMutation = useMutation({
    mutationFn: async ({ 
      id, 
      status, 
      admin_response 
    }: { 
      id: string; 
      status: 'accepted' | 'rejected'; 
      admin_response?: string 
    }) => {
      const { data, error } = await supabase
        .from('wishlists')
        .update({ 
          status, 
          admin_response,
          responded_by: user?.id,
          responded_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;

      // Send notification to user
      const wishlist = pendingWishlists.find(w => w.id === id) || allWishlists.find(w => w.id === id);
      if (wishlist) {
        await supabase
          .from('user_inbox')
          .insert({
            user_id: wishlist.user_id,
            type: 'wishlist_response',
            title: status === 'accepted' ? 'Pedido aceito!' : 'Pedido recusado',
            message: admin_response || (status === 'accepted' 
              ? 'Seu pedido foi aceito pelo admin!' 
              : 'Infelizmente seu pedido foi recusado.')
          });
      }

      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['pending_wishlists'] });
      queryClient.invalidateQueries({ queryKey: ['all_wishlists'] });
      toast.success(variables.status === 'accepted' ? 'Pedido aceito!' : 'Pedido recusado');
    },
    onError: (error: Error) => {
      toast.error('Erro: ' + error.message);
    },
  });

  const deleteWishMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('wishlists')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my_wishlist'] });
      toast.success('Pedido apagado');
    },
    onError: (error: Error) => {
      toast.error('Erro ao apagar: ' + error.message);
    },
  });

  const hasUpdates = myWishlist.some(w => w.status !== 'pending');

  return {
    myWishlist,
    pendingWishlists,
    allWishlists,
    hasUpdates,
    isLoading: isLoadingMy || isLoadingPending || isLoadingAll,
    addWish: addWishMutation.mutate,
    respondToWish: respondToWishMutation.mutate,
    deleteWish: deleteWishMutation.mutate,
  };
}
