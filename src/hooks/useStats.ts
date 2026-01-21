import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Stats {
  totalDownloads: number;
  totalLikes: number;
  totalPacks: number;
  totalAcapellas: number;
  totalUsers: number;
  pendingPacks: number;
  pendingAcapellas: number;
}

export function useStats() {
  const { isAdmin } = useAuth();

  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      // Get counts from different tables
      const [
        downloadsRes,
        likesRes,
        packsRes,
        acapellasRes,
        usersRes,
        pendingPacksRes,
        pendingAcapellasRes
      ] = await Promise.all([
        supabase.from('pack_downloads').select('*', { count: 'exact', head: true }),
        supabase.from('pack_likes').select('*', { count: 'exact', head: true }),
        supabase.from('packs').select('*', { count: 'exact', head: true }).eq('status', 'approved'),
        supabase.from('acapellas').select('*', { count: 'exact', head: true }).eq('status', 'approved'),
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('packs').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('acapellas').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      ]);

      return {
        totalDownloads: downloadsRes.count || 0,
        totalLikes: likesRes.count || 0,
        totalPacks: packsRes.count || 0,
        totalAcapellas: acapellasRes.count || 0,
        totalUsers: usersRes.count || 0,
        pendingPacks: pendingPacksRes.count || 0,
        pendingAcapellas: pendingAcapellasRes.count || 0,
      } as Stats;
    },
    enabled: isAdmin,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  return {
    stats: stats || {
      totalDownloads: 0,
      totalLikes: 0,
      totalPacks: 0,
      totalAcapellas: 0,
      totalUsers: 0,
      pendingPacks: 0,
      pendingAcapellas: 0,
    },
    isLoading,
  };
}
