import { ChevronRight, LucideIcon } from 'lucide-react';

interface SettingsRowProps {
  icon: LucideIcon;
  label: string;
  value?: string;
  onClick?: () => void;
  destructive?: boolean;
  rightSlot?: React.ReactNode;
}

export function SettingsRow({ icon: Icon, label, value, onClick, destructive, rightSlot }: SettingsRowProps) {
  return (
    <button
      onClick={onClick}
      type="button"
      className="group w-full flex items-center gap-3 px-3.5 min-h-[50px] py-2 bg-transparent hover:bg-white/[0.035] active:bg-white/[0.055] transition-colors text-left"
    >
      <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-[9px] bg-white/[0.035] border border-white/[0.045] transition-colors group-hover:bg-white/[0.065] ${destructive ? 'text-destructive' : 'text-foreground/70'}`}>
        <Icon className="w-[16px] h-[16px]" />
      </span>
      <span className={`flex-1 min-w-0 text-[13px] font-medium tracking-[-0.01em] ${destructive ? 'text-destructive' : 'text-foreground'}`}>
        {label}
      </span>
      {value && <span className="max-w-[120px] truncate text-[12px] text-muted-foreground/80">{value}</span>}
      {rightSlot ?? <ChevronRight className="w-[15px] h-[15px] shrink-0 text-muted-foreground/45 group-hover:text-muted-foreground/70 transition-colors" />}
    </button>
  );
}

interface SettingsGroupProps {
  title?: string;
  children: React.ReactNode;
}

export function SettingsGroup({ title, children }: SettingsGroupProps) {
  return (
    <section className="mb-5">
      {title && (
        <p className="px-1 mb-1.5 text-[10px] font-medium text-muted-foreground/65 uppercase tracking-[0.12em]">
          {title}
        </p>
      )}
      <div className="overflow-hidden rounded-[14px] border border-white/[0.055] bg-white/[0.012] divide-y divide-white/[0.045]">
        {children}
      </div>
    </section>
  );
}
