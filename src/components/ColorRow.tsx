interface ColorRowProps {
  label: string;
  value: string;
  onChange: (color: string) => void;
}

/** Linha compacta de cor: nome + amostra clicável que abre o seletor nativo. */
export function ColorRow({ label, value, onChange }: ColorRowProps) {
  const safe = /^#([0-9a-fA-F]{6})$/.test(value || '') ? value : '#000000';
  return (
    <label className="flex items-center gap-3 px-4 min-h-[52px] py-2 bg-card hover:bg-secondary/50 transition-colors cursor-pointer">
      <span className="flex-1 text-[14px] font-medium">{label}</span>
      <span className="text-[11px] font-mono text-muted-foreground uppercase">{safe}</span>
      <span
        className="relative w-8 h-8 rounded-full border border-border shrink-0"
        style={{ backgroundColor: safe }}
      >
        <input
          type="color"
          value={safe}
          onChange={e => onChange(e.target.value.toUpperCase())}
          className="absolute inset-0 opacity-0 cursor-pointer"
          aria-label={label}
        />
      </span>
    </label>
  );
}
