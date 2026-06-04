import { Pipette } from 'lucide-react';
import { Input } from '@/components/ui/input';

const PRESET_PALETTE = [
  '#FFFFFF', '#000000', '#16A249', '#05BD2A', '#0F2B1A', '#082D0F',
  '#3B82F6', '#1E40AF', '#EF4444', '#B91C1C', '#F59E0B', '#FBBF24',
  '#A855F7', '#7C3AED', '#EC4899', '#DB2777', '#06B6D4', '#0891B2',
  '#94A3B8', '#475569', '#1F2937', '#FDE68A', '#C9A84C', '#E8C07A',
];

interface ColorPickerCardProps {
  label: string;
  value: string;
  onChange: (color: string) => void;
}

export function ColorPickerCard({ label, value, onChange }: ColorPickerCardProps) {
  const safeValue = /^#([0-9a-fA-F]{6})$/.test(value || '') ? value : '#000000';
  return (
    <div className="rounded-2xl border border-border/40 bg-card p-4 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[13px] font-bold">{label}</p>
        <div
          className="w-7 h-7 rounded-lg border border-border"
          style={{ backgroundColor: safeValue }}
          aria-label="Pré-visualização da cor"
        />
      </div>

      <div className="flex items-center gap-2">
        <label className="relative inline-flex items-center justify-center w-10 h-10 rounded-xl border border-border bg-secondary cursor-pointer hover:opacity-80 transition" title="Conta-gotas / picker">
          <Pipette className="w-4 h-4" />
          <input
            type="color"
            value={safeValue}
            onChange={(e) => onChange(e.target.value.toUpperCase())}
            className="absolute inset-0 opacity-0 cursor-pointer"
          />
        </label>
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#000000"
          className="font-mono uppercase"
          maxLength={7}
        />
      </div>

      <div className="grid grid-cols-8 gap-1.5 pt-1">
        {PRESET_PALETTE.map((color) => (
          <button
            key={color}
            type="button"
            onClick={() => onChange(color)}
            aria-label={color}
            className={`aspect-square rounded-md border ${
              safeValue.toUpperCase() === color.toUpperCase() ? 'border-foreground' : 'border-border/40'
            }`}
            style={{ backgroundColor: color }}
          />
        ))}
      </div>
    </div>
  );
}
