import { NavLink } from 'react-router-dom';
import { Package, FolderOpen, Mic, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export function BottomNav() {
  const { user } = useAuth();

  const navItems = [
    { to: '/', icon: Package, label: 'Packs' },
    { to: '/projetos', icon: FolderOpen, label: 'Projetos' },
    { to: '/mcs', icon: Mic, label: 'MCs' },
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
              `flex-1 flex flex-col items-center gap-1 py-3 px-2 transition-colors ${
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`
            }
          >
            <item.icon className="w-5 h-5" />
            <span className="text-xs font-medium">{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
