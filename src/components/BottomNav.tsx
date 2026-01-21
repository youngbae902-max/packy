import { NavLink } from 'react-router-dom';
import { Package, Disc, Gift, Inbox, User, Mic } from 'lucide-react';
import { useInbox } from '@/hooks/useInbox';
import { useWishlist } from '@/hooks/useWishlist';
import { useAuth } from '@/contexts/AuthContext';

export function BottomNav() {
  const { user } = useAuth();
  const { hasUnread } = useInbox();
  const { hasUpdates } = useWishlist();

  const navItems = [
    { to: '/', icon: Package, label: 'Packs' },
    { to: '/mcs', icon: Mic, label: 'Acapellas' },
    { to: '/albuns', icon: Disc, label: 'Álbuns' },
    { to: '/desejos', icon: Gift, label: 'Desejos', showDot: hasUpdates },
    { to: '/inbox', icon: Inbox, label: 'Inbox', showDot: hasUnread },
    { to: '/conta', icon: User, label: 'Conta' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-40">
      <div className="max-w-lg mx-auto flex">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center gap-0.5 py-2 px-1 transition-colors relative ${
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`
            }
          >
            <div className="relative">
              <item.icon className="w-5 h-5" />
              {item.showDot && (
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full" />
              )}
            </div>
            <span className="text-[10px] font-medium">{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
