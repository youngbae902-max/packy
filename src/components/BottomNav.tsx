import { Store, Folder, Heart, User } from 'lucide-react';
import { NavLink } from 'react-router-dom';

const navItems = [
  { icon: Store, label: 'Loja', to: '/' },
  { icon: Folder, label: 'Projetos', to: '/projetos' },
  { icon: Heart, label: 'Favoritos', to: '/desejos' },
  { icon: User, label: 'Perfil', to: '/conta' },
];

export function BottomNav() {
  const items = [navItems[0], navItems[1], navItems[2], navItems[3]];
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[#111111] backdrop-blur-sm border-t border-[#1E1E1E] z-30 md:hidden">
      <div className="max-w-lg mx-auto flex justify-around items-center py-2 px-2">
        {items.map(({ icon: Icon, label, to }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 py-1.5 px-6 rounded-xl transition-all ${
                isActive ? 'text-white' : 'text-[#7A7A7A] hover:text-white'
              }`
            }
          >
            <Icon className="w-[22px] h-[22px]" aria-label={label} />
            <span className="text-[10px] font-medium tracking-tight">{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
