import React from 'react';
import { Link } from 'react-router-dom';
import { X, Globe, Mail, Star, Monitor, Compass, FileArchive, Mic } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useAppLogo } from '@/hooks/useAppLogo';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface SideMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SideMenu({ isOpen, onClose }: SideMenuProps) {
  const { isAdmin, user, profile, signOut } = useAuth();
  const { logoUrl } = useAppLogo();
  const [showSignOutConfirm, setShowSignOutConfirm] = React.useState(false);

  const baseItems = [
    { to: '/', icon: Compass, label: 'Explorar' },
    { to: '/mcs', icon: Mic, label: 'Acapella' },
    { to: '/sites', icon: Globe, label: 'Sites' },
    { to: '/inbox', icon: Mail, label: 'Caixa de entrada' },
    { to: '/desejos', icon: Star, label: 'Lista de desejos' },
  ];

  const items = user
    ? [...baseItems, { to: '/up', icon: FileArchive, label: 'Projetos' }]
    : baseItems;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60]">
      <div className="absolute inset-0 bg-black/85 backdrop-blur-md animate-fade-in" onClick={onClose} />

      <aside className="absolute top-0 left-0 h-full w-[80%] max-w-[300px] bg-[#111111] border-r border-[#1E1E1E] flex flex-col animate-slide-in-right shadow-[8px_0_40px_rgba(0,0,0,0.6)]">
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

        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
          {items.map(({ to, icon: Icon, label }) => (
            <Link
              key={to}
              to={to}
              onClick={onClose}
              className="group flex items-center gap-4 px-4 py-3 rounded-xl text-foreground/80 hover:bg-foreground/[0.06] hover:text-foreground transition-all"
            >
              <Icon className="w-[18px] h-[18px] shrink-0" />
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
                aria-label="Painel"
              >
                <Monitor className="w-[18px] h-[18px] shrink-0" />
                <span className="text-sm font-semibold">Painel</span>
              </Link>
            </>
          )}
        </nav>

        <div className="px-4 py-4 border-t border-border/40 space-y-2">
          {user && (
            <button
              type="button"
              onClick={() => setShowSignOutConfirm(true)}
              className="w-full flex items-center gap-3 rounded-2xl px-3 py-3 bg-white/[0.04] border border-white/[0.06] hover:bg-white/[0.07] transition-colors text-left"
              aria-label="Conta"
            >
              <Avatar className="w-10 h-10 shrink-0 ring-1 ring-white/[0.08]">
                <AvatarImage src={profile?.avatar_url || undefined} />
                <AvatarFallback className="bg-[#222222] text-xs font-semibold">
                  {(profile?.artist_name || profile?.username || user.email || 'U').slice(0, 1).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="min-w-0 flex-1">
                <span className="block text-[13px] font-semibold text-foreground truncate">
                  {profile?.artist_name || profile?.username || user.email?.split('@')[0] || 'Sua conta'}
                </span>
                <span className="flex items-center gap-1.5 mt-0.5 text-[10px] text-foreground/45">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#34C759]" />
                  Ativo
                </span>
              </span>
            </button>
          )}
          <p className="px-2 text-[11px] text-muted-foreground">{user ? 'Conectado' : 'Visitante'} · v1.0</p>
        </div>
      </aside>

      {showSignOutConfirm && user && (
        <div className="absolute inset-0 z-[70] flex items-center justify-center px-5">
          <button
            type="button"
            aria-label="Fechar confirmação"
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowSignOutConfirm(false)}
          />
          <div className="relative z-10 w-full max-w-[320px] rounded-3xl bg-[#1A1A1A] border border-white/[0.08] p-5 shadow-2xl">
            <h2 className="text-base font-semibold text-foreground">Sair da conta?</h2>
            <p className="mt-2 text-sm text-muted-foreground">Você será desconectado desta conta.</p>
            <div className="mt-5 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setShowSignOutConfirm(false)}
                className="rounded-xl px-4 py-3 text-sm font-medium bg-white/[0.06] hover:bg-white/[0.1] transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => { void signOut(); setShowSignOutConfirm(false); onClose(); }}
                className="rounded-xl px-4 py-3 text-sm font-semibold bg-white text-black hover:bg-white/90 transition-colors"
              >
                Sair
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
