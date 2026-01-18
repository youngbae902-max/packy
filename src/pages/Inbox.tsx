import { useState } from 'react';
import { Inbox as InboxIcon, Gift, Bell, MessageSquare, Check, CheckCheck, Trash2 } from 'lucide-react';
import { useInbox, InboxMessage } from '@/hooks/useInbox';
import { useSupabasePacks } from '@/hooks/useSupabasePacks';
import { useAuth } from '@/contexts/AuthContext';
import { BottomNav } from '@/components/BottomNav';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AuthModal } from '@/components/AuthModal';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export default function Inbox() {
  const { user } = useAuth();
  const { messages, hasUnread, markAsRead, markAllAsRead, deleteMessage, isLoading } = useInbox();
  const { allApprovedPacks } = useSupabasePacks();
  const [selectedMessage, setSelectedMessage] = useState<InboxMessage | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  const getIcon = (type: string) => {
    switch (type) {
      case 'gift':
        return <Gift className="w-5 h-5 text-yellow-400" />;
      case 'wishlist_response':
        return <MessageSquare className="w-5 h-5 text-blue-400" />;
      default:
        return <Bell className="w-5 h-5 text-primary" />;
    }
  };

  const handleMessageClick = (message: InboxMessage) => {
    setSelectedMessage(message);
    if (!message.is_read) {
      markAsRead(message.id);
    }
  };

  const handleDelete = (e: React.MouseEvent, messageId: string) => {
    e.stopPropagation();
    deleteMessage(messageId);
  };

  const getPackForMessage = (packId: string | null) => {
    if (!packId) return null;
    return allApprovedPacks.find(p => p.id === packId);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-lg mx-auto px-4 pt-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center relative">
              <InboxIcon className="w-5 h-5 text-primary" />
              {hasUnread && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full" />
              )}
            </div>
            <div>
              <h1 className="text-xl font-bold">Caixa de Entrada</h1>
              <p className="text-xs text-muted-foreground">
                {hasUnread ? 'Novas mensagens' : 'Tudo lido'}
              </p>
            </div>
          </div>
          {hasUnread && (
            <Button size="sm" variant="outline" onClick={() => markAllAsRead()}>
              <CheckCheck className="w-4 h-4 mr-1" />
              Ler tudo
            </Button>
          )}
        </div>

        {!user ? (
          <Card className="text-center py-12">
            <InboxIcon className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground mb-4">Faça login para ver suas mensagens</p>
            <Button variant="outline" onClick={() => setIsAuthOpen(true)}>
              Entrar
            </Button>
          </Card>
        ) : isLoading ? (
          <div className="text-center py-12 text-muted-foreground">Carregando...</div>
        ) : messages.length === 0 ? (
          <Card className="text-center py-12">
            <InboxIcon className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">Sua caixa de entrada está vazia</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {messages.map((message) => (
              <Card
                key={message.id}
                className={`cursor-pointer transition-all hover:ring-1 ring-primary/50 ${
                  !message.is_read ? 'bg-primary/5 border-primary/30' : ''
                }`}
                onClick={() => handleMessageClick(message)}
              >
                <CardContent className="pt-4">
                  <div className="flex items-start gap-3">
                    <div className="shrink-0 mt-0.5">
                      {getIcon(message.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold truncate">{message.title}</h3>
                        {!message.is_read && (
                          <span className="w-2 h-2 bg-green-500 rounded-full shrink-0" />
                        )}
                      </div>
                      {message.message && (
                        <p className="text-sm text-muted-foreground truncate mt-1">
                          {message.message}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-2">
                        {new Date(message.created_at).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="shrink-0 text-muted-foreground hover:text-destructive"
                      onClick={(e) => handleDelete(e, message.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Message Detail Modal */}
      <Dialog open={!!selectedMessage} onOpenChange={() => setSelectedMessage(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedMessage && getIcon(selectedMessage.type)}
              {selectedMessage?.title}
            </DialogTitle>
          </DialogHeader>
          
          {selectedMessage?.message && (
            <p className="text-muted-foreground">{selectedMessage.message}</p>
          )}

          {selectedMessage?.pack_id && (
            <div className="mt-4">
              {(() => {
                const pack = getPackForMessage(selectedMessage.pack_id);
                if (!pack) return null;
                return (
                  <Card>
                    <CardContent className="pt-4">
                      <div className="flex items-center gap-3">
                        {pack.cover_url && (
                          <img
                            src={pack.cover_url}
                            alt={pack.title}
                            className="w-16 h-16 rounded object-cover"
                          />
                        )}
                        <div>
                          <h4 className="font-semibold">{pack.title}</h4>
                          <p className="text-sm text-muted-foreground">{pack.author_name}</p>
                          <a
                            href={pack.download_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-primary hover:underline mt-1 inline-block"
                          >
                            Baixar Pack
                          </a>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })()}
            </div>
          )}

          <p className="text-xs text-muted-foreground">
            Recebido em {selectedMessage && new Date(selectedMessage.created_at).toLocaleDateString('pt-BR', {
              day: '2-digit',
              month: 'long',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </DialogContent>
      </Dialog>

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
      <BottomNav />
    </div>
  );
}
