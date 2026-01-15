export interface Pack {
  id: string;
  title: string;
  author: string;
  type: PackType;
  downloadUrl: string;
  coverUrl?: string;
  createdAt: Date;
  isExclusive?: boolean;
  isAnonymous?: boolean;
  isPremium?: boolean;
  price?: number;
  status: 'pending' | 'approved' | 'rejected';
}

export type PackType = 'samples' | 'drumkit' | 'loops' | 'midi' | 'presets' | 'outros';

export const packTypeLabels: Record<PackType, string> = {
  samples: 'Samples',
  drumkit: 'Drumkit',
  loops: 'Loops',
  midi: 'MIDI',
  presets: 'Presets',
  outros: 'Outros',
};
