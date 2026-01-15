import { useState, useEffect } from 'react';
import { Pack } from '@/types/pack';

const STORAGE_KEY = 'pack-storage-packs';

const initialPacks: Pack[] = [
  {
    id: '1',
    title: 'ZIP SERGI FIM DE SEMANA',
    author: 'DJ IGAGURI ZL',
    type: 'samples',
    downloadUrl: 'https://example.com/download1',
    createdAt: new Date('2026-01-10'),
    isExclusive: true,
  },
  {
    id: '2',
    title: 'ZIPS EXCLU',
    author: 'DJ LEGALIZAÇÃO DO NORDESTE',
    type: 'drumkit',
    downloadUrl: 'https://example.com/download2',
    createdAt: new Date('2026-01-06'),
    isExclusive: true,
  },
  {
    id: '3',
    title: 'PACK TLS DA ZL o serto',
    author: 'DJ PIKA DOS KELL',
    type: 'loops',
    downloadUrl: 'https://example.com/download3',
    createdAt: new Date('2026-01-02'),
    isExclusive: true,
  },
  {
    id: '4',
    title: 'PACK TLS DA ZL',
    author: 'DJ PIKA DOS KELL',
    type: 'presets',
    downloadUrl: 'https://example.com/download4',
    createdAt: new Date('2026-01-02'),
    isExclusive: true,
  },
];

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
    return initialPacks;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(packs));
  }, [packs]);

  const addPack = (pack: Omit<Pack, 'id' | 'createdAt'>) => {
    const newPack: Pack = {
      ...pack,
      id: Date.now().toString(),
      createdAt: new Date(),
    };
    setPacks((prev) => [newPack, ...prev]);
  };

  const deletePack = (id: string) => {
    setPacks((prev) => prev.filter((p) => p.id !== id));
  };

  return { packs, addPack, deletePack };
}
