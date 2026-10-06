import React from 'react';
import { Compass, User, Disc, Home, Inbox, List, Folder, Mic, Crown, Search, Settings } from 'lucide-react';
import { NavLink, Link } from 'react-router-dom';
import { useCustomPages } from '@/hooks/useCustomPages';
import { useAuth } from '@/contexts/AuthContext';
import { useAppLogo } from '@/hooks/useAppLogo';
import { AuthModal } from '@/components/AuthModal';

const mainNavItems = [
  { icon: Home, label: 'Início', to: '/' },
  { icon: Search, label: 'Buscar', to: '/explore' }, // Just an example if there was an explore page
];

export function Sidebar() {
  const { pages } = useCustomPages();
  const { user } = useAuth();
  const [showAuthModal, setShowAuthModal] = React.useState(false);
  const { logoUrl } = useAppLogo();

  const dynamicItems = pages
    .filter((page) => page.is_active && page.placement === 'bottom')
    .map((page) => ({ icon: Disc, label: page.title, to: `/pagina/${page.slug}` }));

  return (
    <aside className="hidden md:flex flex-col w-64 fixed inset-y-0 left-0 bg-card border-r border-border/40 z-40">
      <div className="p-6">
        <Link to="/" className="flex items-center">
          {logoUrl ? (
            <img src={logoUrl} alt="Logo" className="w-8 h-8 rounded-lg object-cover" />
          ) : (
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center font-bold">P</div>
          )}
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto py-4 px-4 space-y-6">
        <div className="space-y-1">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-xl transition-colors ${
                isActive ? 'bg-foreground/10 text-foreground font-semibold' : 'text-muted-foreground hover:text-foreground hover:bg-foreground/5'
              }`
            }
          >
            <Home className="w-5 h-5" />
            Início
          </NavLink>
        </div>

        <div className="space-y-1">
          <p className="px-3 text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Descobrir</p>
          <NavLink
            to="/projetos"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-xl transition-colors ${
                isActive ? 'bg-foreground/10 text-foreground font-semibold' : 'text-muted-foreground hover:text-foreground hover:bg-foreground/5'
              }`
            }
          >
            <Folder className="w-5 h-5" />
            Projetos
          </NavLink>
          <NavLink
            to="/mcs"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-xl transition-colors ${
                isActive ? 'bg-foreground/10 text-foreground font-semibold' : 'text-muted-foreground hover:text-foreground hover:bg-foreground/5'
              }`
            }
          >
            <Mic className="w-5 h-5" />
            MCs
          </NavLink>
        </div>

        {dynamicItems.length > 0 && (
          <div className="space-y-1">
            <p className="px-3 text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Páginas</p>
            {dynamicItems.map(({ icon: Icon, label, to }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-xl transition-colors ${
                    isActive ? 'bg-foreground/10 text-foreground font-semibold' : 'text-muted-foreground hover:text-foreground hover:bg-foreground/5'
                  }`
                }
              >
                <Icon className="w-5 h-5" />
                {label}
              </NavLink>
            ))}
          </div>
        )}
      </div>

      <div className="p-4 mt-auto border-t border-border/40 space-y-1">
        {user ? (
          <>
            <NavLink
              to="#"
              onClick={(e) => { e.preventDefault(); setShowAuthModal(true); }}
              className="flex items-center gap-3 px-3 py-2 rounded-xl transition-colors text-muted-foreground hover:text-foreground hover:bg-foreground/5"
            >
              <User className="w-5 h-5" />
              Minha Conta
            </NavLink>
          </>
        ) : (
          <Link
            to="/conta"
            className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-foreground text-background font-semibold text-sm rounded-xl border border-white/10 shadow-sm hover:bg-foreground/90 hover:shadow-md active:scale-[0.98] transition-all"
          >
            Entrar
          </Link>
        )}
      </div>
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </aside>
  );
}
