import { Link } from 'react-router-dom';
import { X, Globe, Disc, Mail, Star, Shield, Home } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useAppLogo } from '@/hooks/useAppLogo';

interface SideMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SideMenu({ isOpen, onClose }: SideMenuProps) {
  const { isAdmin, user } = useAuth();
  const { logoUrl } = useAppLogo();

  const items = [
    { to: '/', icon: Home, label: 'Início' },
    { to: '/sites', icon: Globe, label: 'Sites' },
    { to: '/albuns', icon: Disc, label: 'Álbuns' },
    { to: '/inbox', icon: Mail, label: 'Caixa de entrada' },
    { to: '/desejos', icon: Star, label: 'Lista de desejos' },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60]">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/85 backdrop-blur-md animate-fade-in"
        onClick={onClose}
      />

      {/* Drawer */}
      <aside className="absolute top-0 left-0 h-full w-[80%] max-w-[300px] bg-[hsl(0,0%,2%)] border-r border-border/60 flex flex-col animate-slide-in-right shadow-[8px_0_40px_rgba(0,0,0,0.6)]">
        {/* Brand header */}
        <div className="px-6 pt-8 pb-6 border-b border-border/40">
          <div className="grid grid-cols-[40px_1fr_40px] items-center">
            <div />
            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-2xl bg-secondary border border-border flex items-center justify-center overflow-hidden text-lg font-black">
                {logoUrl ? <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" /> : 'P'}
              </div>
            </div>
            <button
              onClick={onClose}
              aria-label="Fechar menu"
              className="p-2 rounded-full hover:bg-foreground/10 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
          {items.map(({ to, icon: Icon, label }) => (
            <Link
              key={to}
              to={to}
              onClick={onClose}
              className="group flex items-center gap-4 px-4 py-3 rounded-xl text-foreground/80 hover:bg-foreground/[0.06] hover:text-foreground transition-all"
            >
              <span className="w-9 h-9 rounded-lg bg-[hsl(0,0%,5%)] border border-border/50 flex items-center justify-center group-hover:bg-[hsl(0,0%,8%)] group-hover:border-border transition-colors">
                <Icon className="w-4 h-4" />
              </span>
              <span className="text-sm font-medium">{label}</span>
            </Link>
          ))}

          {isAdmin && (
            <>
              <div className="my-3 mx-4 border-t border-border/40" />
              <Link
                to="/admin"
                onClick={onClose}
                className="group flex items-center gap-4 px-4 py-3 rounded-xl text-foreground/90 hover:bg-foreground/[0.06] transition-all"
              >
                <span className="w-9 h-9 rounded-lg bg-[hsl(0,0%,5%)] border border-border/50 flex items-center justify-center">
                  <Shield className="w-4 h-4" />
                </span>
                <span className="text-sm font-semibold">Painel Admin</span>
              </Link>
            </>
          )}
        </nav>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border/40">
          <p className="text-[11px] text-muted-foreground">
            {user ? 'Conectado' : 'Visitante'} · v1.0
          </p>
        </div>
      </aside>
    </div>
  );
}
