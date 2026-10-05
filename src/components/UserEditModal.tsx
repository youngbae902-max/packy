import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';
import { Ban, Shield, Trash2, Gift, X, KeyRound, Copy } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface UserProfile {
  id: string;
  user_id: string;
  username: string | null;
  artist_name: string | null;
  avatar_url: string | null;
  is_banned: boolean | null;
  is_online: boolean | null;
  has_spotify_badge: boolean | null;
  online_accent_color?: string | null;
  theme_accent_color?: string | null;
  admin_badge_color?: string | null;
  verified_badge_color?: string | null;
}

interface UserEditModalProps {
  user: UserProfile | null;
  isOpen: boolean;
  onClose: () => void;
  isUserAdmin: (userId: string) => boolean;
  isMainAdmin: (userId: string) => boolean;
  onBan: (userId: string, ban: boolean) => void;
  onToggleAdmin: (userId: string, makeAdmin: boolean) => void;
  onToggleSpotify: (userId: string, enabled: boolean) => void;
  onDelete: (userId: string) => void;
  onSendGift: (userId: string, username: string) => void;
  onSetPassword?: (userId: string, password: string) => Promise<void>;
  onGetLogin?: (userId: string) => Promise<string | null>;
  canEnterAccount?: boolean;
}

export function UserEditModal({
  user,
  isOpen,
  onClose,
  isUserAdmin,
  isMainAdmin,
  onBan,
  onToggleAdmin,
  onToggleSpotify,
  onDelete,
  onSendGift,
  onSetPassword,
  onGetLogin,
  canEnterAccount = false,
}: UserEditModalProps) {
  const [loginEmail, setLoginEmail] = useState<string | null>(null);
  const [isLoadingLogin, setIsLoadingLogin] = useState(false);
  const [tempPassword, setTempPassword] = useState('');
  if (!user) return null;

  const isProtected = isMainAdmin(user.user_id);
  const userIsAdmin = isUserAdmin(user.user_id);
  const accent = user.online_accent_color || user.theme_accent_color || 'hsl(var(--primary))';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-sm rounded-[2rem] border-border bg-card">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <img 
              src={user.avatar_url || '/placeholder.svg'} 
              alt="" 
              className="w-10 h-10 rounded-full object-cover" 
            />
            <div className="flex-1 min-w-0">
              <p className="font-bold truncate">@{user.username || 'sem-username'}</p>
              <p className="text-sm text-muted-foreground truncate">{user.artist_name || 'Sem nome'}</p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-wrap gap-2 mb-4">
          {userIsAdmin && <Badge className="bg-primary/20 text-primary">Admin</Badge>}
          {isProtected && <Badge className="bg-yellow-500/20 text-yellow-500">Principal</Badge>}
          {user.is_banned && <Badge variant="destructive">Banido</Badge>}
          {user.has_spotify_badge && <Badge style={{ color: accent, borderColor: accent }} className="bg-transparent">Spotify</Badge>}
          {user.is_online && <Badge variant="outline" style={{ color: accent, borderColor: accent }}>Online</Badge>}
        </div>

        <div className="space-y-2">
          <Button 
            variant="outline" 
            className="w-full justify-start"
            onClick={() => {
              onSendGift(user.user_id, user.username || 'usuário');
              onClose();
            }}
          >
            <Gift className="w-4 h-4 mr-2" />
            Enviar Presente
          </Button>

          <Button 
            variant={user.has_spotify_badge ? 'default' : 'outline'} 
            className={`w-full justify-start ${user.has_spotify_badge ? 'bg-green-500 hover:bg-green-600' : ''}`}
            onClick={() => onToggleSpotify(user.user_id, !user.has_spotify_badge)}
          >
            <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
            </svg>
            {user.has_spotify_badge ? 'Remover Selo Spotify' : 'Adicionar Selo Spotify'}
          </Button>

          {!isProtected && (
            <>
              <Button 
                variant={user.is_banned ? 'default' : 'destructive'} 
                className="w-full justify-start"
                onClick={() => onBan(user.user_id, !user.is_banned)}
              >
                <Ban className="w-4 h-4 mr-2" />
                {user.is_banned ? 'Desbanir Usuário' : 'Banir Usuário'}
              </Button>

              <Button 
                variant={userIsAdmin ? 'default' : 'outline'} 
                className="w-full justify-start"
                onClick={() => onToggleAdmin(user.user_id, !userIsAdmin)}
              >
                <Shield className="w-4 h-4 mr-2" />
                {userIsAdmin ? 'Remover Admin' : 'Tornar Admin'}
              </Button>

              <Button 
                variant="destructive" 
                className="w-full justify-start"
                onClick={() => {
                  onDelete(user.user_id);
                  onClose();
                }}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Excluir Conta Permanentemente
              </Button>
            </>
          )}

          {canEnterAccount && !isProtected && (
            <div className="rounded-3xl border border-border/50 bg-secondary/40 p-3 space-y-2">
              <p className="text-xs font-black uppercase text-muted-foreground">Entrar com @{user.username || 'usuário'}</p>
              <Button variant="outline" className="w-full justify-start" disabled={isLoadingLogin} onClick={async () => { setIsLoadingLogin(true); try { setLoginEmail(await onGetLogin?.(user.user_id) || null); } catch { toast.error('Erro ao buscar login'); } finally { setIsLoadingLogin(false); } }}>
                <KeyRound className="w-4 h-4 mr-2" /> Entrar com @{user.username || 'usuário'}
              </Button>
              {loginEmail && (
                <div className="space-y-2">
                  <button className="w-full flex items-center justify-between rounded-2xl bg-background px-3 py-2 text-sm" onClick={() => { navigator.clipboard.writeText(loginEmail); toast.success('Login copiado'); }}>
                    <span className="truncate">Login: {loginEmail}</span><Copy className="w-4 h-4" />
                  </button>
                  {tempPassword && (
                    <button className="w-full flex items-center justify-between rounded-2xl bg-background px-3 py-2 text-sm" onClick={() => { navigator.clipboard.writeText(tempPassword); toast.success('Senha copiada'); }}>
                      <span className="truncate">Senha: {tempPassword}</span><Copy className="w-4 h-4" />
                    </button>
                  )}
                </div>
              )}
              <Input value={tempPassword} onChange={(e) => setTempPassword(e.target.value)} placeholder="Senha temporária nova" className="rounded-2xl" />
              <Button className="w-full" disabled={tempPassword.length < 6} onClick={async () => { await onSetPassword?.(user.user_id, tempPassword); setTempPassword(''); }}>
                Definir senha temporária
              </Button>
            </div>
          )}
        </div>

        <Button variant="outline" onClick={onClose} className="w-full mt-2">
          <X className="w-4 h-4 mr-2" />
          Fechar
        </Button>
      </DialogContent>
    </Dialog>
  );
}
