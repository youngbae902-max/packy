import { Store, Folder, Heart, User } from 'lucide-react';
import { NavLink } from 'react-router-dom';

const navItems = [
  { icon: Store, label: 'Início', to: '/' },
  { icon: Folder, label: 'Projetos', to: '/projetos' },
  { icon: Heart, label: 'Favoritos', to: '/desejos' },
  { icon: User, label: 'Minha conta', to: '/conta' },
];

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-[#eee9ef] z-30 md:hidden">
      <div className="max-w-lg mx-auto flex justify-around items-center py-2 px-2 pb-[max(8px,env(safe-area-inset-bottom))]">
        {navItems.map(({ icon: Icon, label, to }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 min-w-0 flex-1 py-1.5 transition-all ${
                isActive ? 'text-[#79005f]' : 'text-[#77717a] hover:text-[#79005f]'
              }`
            }
          >
            <Icon className="w-[23px] h-[23px]" strokeWidth={2.1} aria-label={label} />
            <span className="text-[10px] font-medium tracking-tight whitespace-nowrap">{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
