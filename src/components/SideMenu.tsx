import { Link } from 'react-router-dom';
import { X, Globe, Disc, Mail, Star, Shield, Home } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface SideMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SideMenu({ isOpen, onClose }: SideMenuProps) {
  const { isAdmin } = useAuth();

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
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      <aside className="absolute top-0 left-0 h-full w-[78%] max-w-xs bg-[hsl(0,0%,3%)] border-r border-border flex flex-col animate-slide-in-right">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h2 className="text-lg font-black tracking-tight">MENU</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-foreground/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-3">
          {items.map(({ to, icon: Icon, label }) => (
            <Link
              key={to}
              to={to}
              onClick={onClose}
              className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-foreground/85 hover:bg-foreground/5 hover:text-foreground transition-colors"
            >
              <Icon className="w-5 h-5" />
              <span className="text-sm font-semibold">{label}</span>
            </Link>
          ))}

          {isAdmin && (
            <>
              <div className="my-3 mx-4 border-t border-border" />
              <Link
                to="/admin"
                onClick={onClose}
                className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-destructive hover:bg-destructive/10 transition-colors"
              >
                <Shield className="w-5 h-5" />
                <span className="text-sm font-semibold">Painel Admin</span>
              </Link>
            </>
          )}
        </nav>

        <div className="p-5 text-xs text-muted-foreground border-t border-border">
          PACKY · v1.0
        </div>
      </aside>
    </div>
  );
}
