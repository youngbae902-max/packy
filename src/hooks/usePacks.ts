import { useState, useEffect } from 'react';
import { Pack } from '@/types/pack';

const STORAGE_KEY = 'packy-packs';

export function usePacks() {
  const [packs, setPacks] = useState<Pack[]>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed.map((p: Pack) => ({
        ...p,
        createdAt: new Date(p.createdAt),
      }));
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(packs));
  }, [packs]);

  const addPack = (pack: Omit<Pack, 'id' | 'createdAt' | 'status'>) => {
    const newPack: Pack = {
      ...pack,
      id: Date.now().toString(),
      createdAt: new Date(),
      status: 'pending',
    };
    setPacks((prev) => [newPack, ...prev]);
  };

  const addPremiumPack = (pack: Omit<Pack, 'id' | 'createdAt' | 'status' | 'isPremium'>) => {
    const newPack: Pack = {
      ...pack,
      id: Date.now().toString(),
      createdAt: new Date(),
      status: 'approved',
      isPremium: true,
    };
    setPacks((prev) => [newPack, ...prev]);
  };

  const approvePack = (id: string) => {
    setPacks((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: 'approved' as const } : p))
    );
  };

  const rejectPack = (id: string) => {
    setPacks((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: 'rejected' as const } : p))
    );
  };

  const deletePack = (id: string) => {
    setPacks((prev) => prev.filter((p) => p.id !== id));
  };

  const updatePack = (id: string, updates: Partial<Pack>) => {
    setPacks((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
    );
  };

  const approvedPacks = packs.filter((p) => p.status === 'approved' && !p.isPremium);
  const pendingPacks = packs.filter((p) => p.status === 'pending');
  const rejectedPacks = packs.filter((p) => p.status === 'rejected');
  const premiumPacks = packs.filter((p) => p.isPremium && p.status === 'approved');

  return { 
    packs, 
    approvedPacks, 
    pendingPacks, 
    rejectedPacks,
    premiumPacks,
    addPack,
    addPremiumPack,
    approvePack, 
    rejectPack, 
    deletePack,
    updatePack,
  };
}
