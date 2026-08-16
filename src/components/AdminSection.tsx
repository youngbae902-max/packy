import { ReactNode, useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { LucideIcon } from 'lucide-react';

interface AdminSectionProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  defaultOpen?: boolean;
  children: ReactNode;
}

/** Collapsible admin section with an animated chevron. */
export function AdminSection({ title, description, icon: Icon, defaultOpen = false, children }: AdminSectionProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="rounded-2xl border border-[#252525] bg-[#1C1C1C] overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-[#232323] transition-colors"
      >
        {Icon && <Icon className="w-[18px] h-[18px] text-foreground/70 shrink-0" />}
        <span className="flex-1 min-w-0">
          <span className="block text-[15px] font-semibold tracking-tight truncate">{title}</span>
          {description && <span className="block text-[11px] text-muted-foreground truncate">{description}</span>}
        </span>
        <ChevronRight className={`w-4 h-4 text-muted-foreground transition-transform duration-300 ${open ? 'rotate-90' : ''}`} />
      </button>
      <div className={`grid transition-all duration-300 ease-out ${open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
        <div className="overflow-hidden">
          <div className="px-3 pb-4 pt-1">{children}</div>
        </div>
      </div>
    </div>
  );
}
