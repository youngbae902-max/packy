import { NavLink } from 'react-router-dom';
import { Package, Disc, Gift, Inbox, User } from 'lucide-react';
import { useInbox } from '@/hooks/useInbox';
import { useAuth } from '@/contexts/AuthContext';

export function BottomNav() {
  const { user } = useAuth();
  const { unreadCount } = useInbox();

  const navItems = [
    { to: '/', icon: Package, label: 'Packs' },
    { to: '/albuns', icon: Disc, label: 'Álbuns' },
    { to: '/desejos', icon: Gift, label: 'Desejos' },
    { to: '/inbox', icon: Inbox, label: 'Inbox', badge: unreadCount },
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
              `flex-1 flex flex-col items-center gap-1 py-3 px-2 transition-colors relative ${
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`
            }
          >
            <div className="relative">
              <item.icon className="w-5 h-5" />
              {item.badge && item.badge > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 rounded-full text-[10px] flex items-center justify-center text-white font-bold">
                  {item.badge > 9 ? '9+' : item.badge}
                </span>
              )}
            </div>
            <span className="text-xs font-medium">{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
