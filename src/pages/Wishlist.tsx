import { useState } from 'react';
import { Gift, Send, Trash2 } from 'lucide-react';
import { useWishlist } from '@/hooks/useWishlist';
import { useAuth } from '@/contexts/AuthContext';
import { BottomNav } from '@/components/BottomNav';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AuthModal } from '@/components/AuthModal';

export default function Wishlist() {
  const { user } = useAuth();
  const { myWishlist, hasUpdates, addWish, deleteWish, isLoading } = useWishlist();
  const [requestText, setRequestText] = useState('');
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  const handleSubmit = () => {
    if (!user) {
      setIsAuthOpen(true);
      return;
    }
    if (!requestText.trim()) return;
    
    addWish(requestText.trim());
    setRequestText('');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">Pendente</Badge>;
      case 'accepted':
        return <Badge className="bg-green-500/20 text-green-400">Aceito</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Recusado</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-lg mx-auto px-4 pt-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center relative">
            <Gift className="w-5 h-5 text-primary" />
            {hasUpdates && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full" />
            )}
          </div>
          <div>
            <h1 className="text-xl font-bold">Lista de Desejos</h1>
            <p className="text-xs text-muted-foreground">Peça packs que você quer</p>
          </div>
        </div>

        {/* Request Form */}
        <Card className="mb-6">
          <CardContent className="pt-4">
            <Textarea
              placeholder="Descreva o pack que você quer..."
              value={requestText}
              onChange={(e) => setRequestText(e.target.value)}
              className="min-h-[100px] mb-3"
            />
            <Button 
              onClick={handleSubmit}
              disabled={!requestText.trim()}
              className="w-full"
            >
              <Send className="w-4 h-4 mr-2" />
              Enviar Pedido
            </Button>
          </CardContent>
        </Card>

        {/* My Requests */}
        <h2 className="font-semibold mb-3">Meus Pedidos</h2>
        
        {!user ? (
          <Card className="text-center py-8">
            <p className="text-muted-foreground mb-4">Faça login para ver seus pedidos</p>
            <Button variant="outline" onClick={() => setIsAuthOpen(true)}>
              Entrar
            </Button>
          </Card>
        ) : isLoading ? (
          <div className="text-center py-8 text-muted-foreground">Carregando...</div>
        ) : myWishlist.length === 0 ? (
          <Card className="text-center py-8">
            <Gift className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
            <p className="text-muted-foreground">Você ainda não fez nenhum pedido</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {myWishlist.map((wish) => (
              <Card key={wish.id}>
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm flex-1">{wish.request_text}</p>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(wish.status)}
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="text-muted-foreground hover:text-destructive"
                        onClick={() => deleteWish(wish.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  {wish.admin_response && (
                    <div className="mt-3 pt-3 border-t border-border">
                      <p className="text-xs text-muted-foreground">Resposta do admin:</p>
                      <p className="text-sm mt-1">{wish.admin_response}</p>
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground mt-2">
                    {new Date(wish.created_at).toLocaleDateString('pt-BR')}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
      <BottomNav />
    </div>
  );
}
