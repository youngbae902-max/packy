import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Pack } from '@/hooks/useSupabasePacks';

export interface CartItem {
  id: string;
  pack_id: string;
  added_at: string;
  pack: Pack;
}

export interface PurchaseItem {
  id: string;
  pack_id: string;
  price_paid: number;
  purchased_at: string;
  pack: Pack;
}

export function useCart() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const { data: cart = [], isLoading: cartLoading } = useQuery({
    queryKey: ['cart', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cart_items')
        .select('id, pack_id, added_at, pack:packs(*)')
        .eq('user_id', user!.id)
        .order('added_at', { ascending: false });
      if (error) throw error;
      return (data || []) as unknown as CartItem[];
    },
  });

  const { data: purchases = [], isLoading: purchasesLoading } = useQuery({
    queryKey: ['purchases', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pack_purchases')
        .select('id, pack_id, price_paid, purchased_at, pack:packs(*)')
        .eq('user_id', user!.id)
        .order('purchased_at', { ascending: false });
      if (error) throw error;
      return (data || []) as unknown as PurchaseItem[];
    },
  });

  const cartPackIds = new Set(cart.map(c => c.pack_id));
  const purchasedIds = new Set(purchases.map(p => p.pack_id));

  const addToCart = useMutation({
    mutationFn: async (packId: string) => {
      if (!user) throw new Error('not_auth');
      const { error } = await supabase
        .from('cart_items')
        .insert({ user_id: user.id, pack_id: packId });
      if (error && !String(error.message).includes('duplicate')) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['cart'] }),
  });

  const removeFromCart = useMutation({
    mutationFn: async (packId: string) => {
      if (!user) throw new Error('not_auth');
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', user.id)
        .eq('pack_id', packId);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['cart'] }),
  });

  const purchaseCart = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.rpc('purchase_cart' as any);
      if (error) throw error;
      return data as { success: boolean; error?: string; total?: number; new_balance?: number; balance?: number };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['cart'] });
      qc.invalidateQueries({ queryKey: ['purchases'] });
      qc.invalidateQueries({ queryKey: ['profile'] });
      qc.invalidateQueries({ queryKey: ['wallet'] });
    },
  });

  const total = cart.reduce((s, i) => s + Number(i.pack?.price || 0), 0);

  return {
    cart,
    purchases,
    cartPackIds,
    purchasedIds,
    cartCount: cart.length,
    total,
    isLoading: cartLoading || purchasesLoading,
    addToCart: addToCart.mutateAsync,
    removeFromCart: removeFromCart.mutateAsync,
    purchaseCart: purchaseCart.mutateAsync,
    isPurchasing: purchaseCart.isPending,
  };
}
