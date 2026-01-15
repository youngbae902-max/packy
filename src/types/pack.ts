export interface Pack {
  id: string;
  title: string;
  author: string;
  type: PackType;
  downloadUrl: string;
  createdAt: Date;
  isExclusive?: boolean;
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
