import { Compass, ShoppingCart, User } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useCart } from '@/hooks/useCart';

const navItems = [
  { icon: Compass, label: 'Explorar', to: '/' },
  { icon: ShoppingCart, label: 'Carrinho', to: '/carrinho', badge: true as const },
  { icon: User, label: 'Conta', to: '/conta' },
];

export function BottomNav() {
  const { cartCount } = useCart();
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-sm border-t border-border z-30">
      <div className="max-w-lg mx-auto flex justify-around items-center py-2">
        {navItems.map(({ icon: Icon, label, to, badge }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `relative flex flex-col items-center gap-1 py-2 px-4 rounded-xl transition-all ${
                isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              }`
            }
          >
            <div className="relative">
              <Icon className="w-5 h-5" />
              {badge && cartCount > 0 && (
                <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 px-1 rounded-full bg-foreground text-background text-[10px] font-bold flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </div>
            <span className="text-xs font-medium">{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
