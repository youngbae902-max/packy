import { Compass, User, Disc } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useCustomPages } from '@/hooks/useCustomPages';

const navItems = [
  { icon: Compass, label: 'Explorar', to: '/' },
  { icon: User, label: 'Conta', to: '/conta' },
];

export function BottomNav() {
  const { pages } = useCustomPages();
  const dynamicItems = pages
    .filter((page) => page.is_active && page.placement === 'bottom')
    .slice(0, 2)
    .map((page) => ({ icon: Disc, label: page.title, to: `/pagina/${page.slug}` }));
  const items = [navItems[0], ...dynamicItems, navItems[1]];
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-sm border-t border-border z-30 md:hidden">
      <div className="max-w-lg mx-auto flex justify-around items-center py-2">
        {items.map(({ icon: Icon, label, to }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 py-2 px-4 rounded-xl transition-all ${
                isActive ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
              }`
            }
          >
            <Icon className="w-5 h-5" title={label} />
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
