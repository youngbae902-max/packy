import { Compass, User, Disc, Mic } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useCustomPages } from '@/hooks/useCustomPages';
import { useAuth } from '@/contexts/AuthContext';
import { AuthModal } from '@/components/AuthModal';
import { useState } from 'react';

const navItems = [
  { icon: Compass, label: 'Explore', to: '/' },
  { icon: Mic, label: 'MCs', to: '/mcs' },
  { icon: User, label: 'Profile', to: '/conta' },
];

export function BottomNav() {
  const { pages } = useCustomPages();
  const { user } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const dynamicItems = pages
    .filter((page) => page.is_active && page.placement === 'bottom')
    .slice(0, 2)
    .map((page) => ({ icon: Disc, label: page.title, to: `/pagina/${page.slug}` }));
  const items = [navItems[0], navItems[1], ...dynamicItems.slice(0, 1)];
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
        <button
          type="button"
          onClick={() => { if (user) window.location.href = `/perfil/${user.id}`; else setShowAuthModal(true); }}
          className="flex flex-col items-center gap-0.5 py-1.5 px-6 rounded-xl transition-all text-[#7A7A7A] hover:text-white"
        >
          <User className="w-[22px] h-[22px]" aria-label="Profile" />
          <span className="text-[10px] font-medium tracking-tight">{user ? 'Profile' : 'Entrar'}</span>
        </button>
      </div>
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </nav>
  );
}
