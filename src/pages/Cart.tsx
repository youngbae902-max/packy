import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Trash2, Download, Package, Wallet, ArrowLeft } from 'lucide-react';
import { BottomNav } from '@/components/BottomNav';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/contexts/AuthContext';
import { PackImagePlaceholder } from '@/components/PackImagePlaceholder';
import { toast } from 'sonner';

const Cart = () => {
  const { user, profile } = useAuth();
  const [tab, setTab] = useState<'pendentes' | 'comprados'>('pendentes');
  const { cart, purchases, total, removeFromCart, purchaseCart, isPurchasing, isLoading } = useCart();

  const balance = Number((profile as any)?.wallet_balance || 0);
  const insufficient = total > balance;

  const fmt = (n: number) =>
    `R$ ${Number(n).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const handleBuy = async () => {
    if (cart.length === 0) return;
    const res = await purchaseCart();
    if (res?.success) {
      toast.success('Compra realizada com sucesso!');
      setTab('comprados');
    } else if (res?.error === 'insufficient_balance') {
      toast.error('Saldo insuficiente na carteira');
    } else {
      toast.error('Não foi possível concluir a compra');
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background pb-20 flex items-center justify-center px-6 text-center">
        <div>
          <ShoppingCart className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
          <p className="text-foreground font-bold">Entre para usar seu carrinho</p>
          <Link to="/conta" className="text-xs text-muted-foreground underline">Ir para conta</Link>
        </div>
        <BottomNav />
      </div>
    );
  }

  const list = tab === 'pendentes' ? cart : purchases;

  return (
    <div className="min-h-screen bg-background pb-32">
      <div className="max-w-lg mx-auto px-4 pt-6">
        <header className="flex items-center gap-3 mb-5">
          <Link to="/" className="p-2 -ml-2 rounded-full hover:bg-foreground/10">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-black tracking-tight flex-1">Carrinho</h1>
          <div className="flex items-center gap-1.5 text-xs font-bold text-foreground/80 bg-[hsl(0,0%,5%)] border border-border/40 rounded-full px-3 py-1.5">
            <Wallet className="w-3.5 h-3.5" /> {fmt(balance)}
          </div>
        </header>

        {/* Tabs */}
        <div className="grid grid-cols-2 gap-2 mb-5 p-1 rounded-2xl bg-[hsl(0,0%,4%)] border border-border/40">
          <button
            onClick={() => setTab('pendentes')}
            className={`flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm font-bold transition ${
              tab === 'pendentes' ? 'bg-foreground text-background' : 'text-muted-foreground'
            }`}
          >
            <ShoppingCart className="w-4 h-4" /> Pendentes
            {cart.length > 0 && (
              <span className={`ml-1 text-[10px] px-1.5 py-0.5 rounded-full ${tab === 'pendentes' ? 'bg-background/20' : 'bg-foreground/10'}`}>{cart.length}</span>
            )}
          </button>
          <button
            onClick={() => setTab('comprados')}
            className={`flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm font-bold transition ${
              tab === 'comprados' ? 'bg-foreground text-background' : 'text-muted-foreground'
            }`}
          >
            <Package className="w-4 h-4" /> Comprados
            {purchases.length > 0 && (
              <span className={`ml-1 text-[10px] px-1.5 py-0.5 rounded-full ${tab === 'comprados' ? 'bg-background/20' : 'bg-foreground/10'}`}>{purchases.length}</span>
            )}
          </button>
        </div>

        {isLoading ? (
          <p className="text-center text-muted-foreground py-10">Carregando...</p>
        ) : list.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            {tab === 'pendentes' ? 'Carrinho vazio' : 'Você ainda não comprou nenhum pack'}
          </div>
        ) : (
          <div className="space-y-3">
            {list.map((item: any) => {
              const pack = item.pack;
              if (!pack) return null;
              const price = Number(pack.price || 0);
              return (
                <div
                  key={item.id}
                  className="flex items-center gap-3 p-3 rounded-2xl bg-[hsl(0,0%,4%)] border border-border/40"
                >
                  <div className="w-16 h-16 rounded-xl overflow-hidden border border-border/60 bg-[hsl(0,0%,6%)] shrink-0">
                    {pack.cover_url ? (
                      <img src={pack.cover_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <PackImagePlaceholder />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate">{pack.title}</p>
                    <p className="text-[11px] text-muted-foreground truncate">@{pack.author_name || 'criador'}</p>
                    <p className="text-[13px] font-black mt-0.5 tabular-nums">
                      {tab === 'comprados'
                        ? Number(item.price_paid) === 0
                          ? 'Grátis'
                          : fmt(item.price_paid)
                        : price === 0
                        ? 'Grátis'
                        : fmt(price)}
                    </p>
                  </div>
                  {tab === 'pendentes' ? (
                    <button
                      onClick={() => removeFromCart(pack.id)}
                      className="p-2 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      aria-label="Remover"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  ) : (
                    <a
                      href={pack.download_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-full text-foreground bg-foreground/10 hover:bg-foreground/20"
                      aria-label="Baixar"
                    >
                      <Download className="w-4 h-4" />
                    </a>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Sticky checkout bar */}
      {tab === 'pendentes' && cart.length > 0 && (
        <div className="fixed left-0 right-0 bottom-16 z-30 bg-background/95 backdrop-blur border-t border-border/40 px-4 py-3">
          <div className="max-w-lg mx-auto flex items-center gap-3">
            <div className="flex-1">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Total</p>
              <p className="text-lg font-black tabular-nums">{fmt(total)}</p>
            </div>
            <button
              onClick={handleBuy}
              disabled={isPurchasing || insufficient}
              className="flex-1 px-5 py-3 rounded-2xl bg-foreground text-background font-black text-sm disabled:opacity-50"
            >
              {isPurchasing ? 'Comprando...' : insufficient ? 'Saldo insuficiente' : 'Comprar com saldo'}
            </button>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
};

export default Cart;
