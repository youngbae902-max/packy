import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface WalletTransaction {
  id: string;
  user_id: string;
  amount: number;
  type: 'credit' | 'debit';
  description: string | null;
  created_at: string;
}

export function useWallet(userId?: string) {
  const { user } = useAuth();
  const targetId = userId || user?.id;
  const queryClient = useQueryClient();

  const txQuery = useQuery({
    queryKey: ['wallet-tx', targetId],
    queryFn: async () => {
      if (!targetId) return [];
      const { data, error } = await supabase
        .from('wallet_transactions' as any)
        .select('*')
        .eq('user_id', targetId)
        .order('created_at', { ascending: false })
        .limit(100);
      if (error) throw error;
      return (data || []) as unknown as WalletTransaction[];
    },
    enabled: !!targetId,
  });

  useEffect(() => {
    if (!targetId) return;
    const channel = supabase
      .channel(`wallet-${targetId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'wallet_transactions', filter: `user_id=eq.${targetId}` }, () => {
        queryClient.invalidateQueries({ queryKey: ['wallet-tx', targetId] });
        queryClient.invalidateQueries({ queryKey: ['profile'] });
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `user_id=eq.${targetId}` }, () => {
        queryClient.invalidateQueries({ queryKey: ['profile'] });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [targetId, queryClient]);

  const adjustMutation = useMutation({
    mutationFn: async ({ targetUserId, amount, reason }: { targetUserId: string; amount: number; reason?: string }) => {
      const { data, error } = await supabase.rpc('admin_adjust_wallet' as any, {
        target_user_id: targetUserId,
        amount_delta: amount,
        reason: reason || null,
      });
      if (error) throw error;
      return data as number;
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['wallet-tx', vars.targetUserId] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
  });

  return {
    transactions: txQuery.data || [],
    isLoading: txQuery.isLoading,
    adjustBalance: adjustMutation.mutateAsync,
  };
}
