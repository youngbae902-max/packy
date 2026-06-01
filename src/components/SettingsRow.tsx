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
      className={`w-full flex items-center gap-3 px-4 py-3.5 bg-card hover:bg-secondary/60 transition-colors text-left ${
        destructive ? 'text-destructive' : 'text-foreground'
      }`}
    >
      <Icon className={`w-[18px] h-[18px] flex-shrink-0 ${destructive ? 'text-destructive' : 'text-foreground/70'}`} />
      <span className="flex-1 text-[15px] font-medium tracking-tight">{label}</span>
      {value && <span className="text-[13px] text-muted-foreground">{value}</span>}
      {rightSlot ?? <ChevronRight className="w-4 h-4 text-muted-foreground/70" />}
    </button>
  );
}

interface SettingsGroupProps {
  title?: string;
  children: React.ReactNode;
}

export function SettingsGroup({ title, children }: SettingsGroupProps) {
  return (
    <div className="mb-6">
      {title && (
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 mb-2">
          {title}
        </p>
      )}
      <div className="rounded-2xl border border-border/40 overflow-hidden divide-y divide-border/30">
        {children}
      </div>
    </div>
  );
}
