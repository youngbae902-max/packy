import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';
import { Ban, Shield, Trash2, Gift, X, KeyRound, Copy, Crown } from 'lucide-react';
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
      <DialogContent className="!fixed !inset-0 !left-0 !top-0 !translate-x-0 !translate-y-0 !w-screen !max-w-none !h-screen !max-h-none !rounded-none border-0 bg-[#111111] p-0 overflow-y-auto overflow-x-hidden shadow-none">
        <div className="relative min-h-screen">
          <div className="h-32 md:h-40 bg-gradient-to-br from-white/[0.08] via-white/[0.03] to-transparent" />
          <button onClick={onClose} className="absolute top-3 right-3 w-9 h-9 rounded-full bg-black/30 border border-white/[0.08] flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-white/[0.08] transition-colors">
            <X className="w-4 h-4" />
          </button>
          <div className="px-5 md:px-10 lg:px-16 -mt-10">
            <div className="flex items-end gap-4">
              <div className="relative shrink-0">
                <img src={user.avatar_url || '/placeholder.svg'} alt="" className="w-20 h-20 rounded-[24px] object-cover border-4 border-[#111111] shadow-lg" />
                <span className={`absolute bottom-1 right-1 w-4 h-4 rounded-full border-[3px] border-[#111111] ${user.is_online ? 'bg-emerald-400' : 'bg-white/20'}`} />
              </div>
              <div className="min-w-0 pb-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold truncate">@{user.username || 'sem-username'}</h2>
                  {isProtected && <Crown className="w-4 h-4 text-yellow-400 shrink-0" />}
                </div>
                <p className="text-sm text-muted-foreground truncate">{user.artist_name || 'Sem nome'}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="px-5 md:px-10 lg:px-16 pt-5 pb-10 max-w-5xl mx-auto">
          <div className="flex flex-wrap gap-1.5 mb-5">
            {userIsAdmin && <Badge className="rounded-full bg-primary/15 text-primary border-0 px-2.5">Admin</Badge>}
            {isProtected && <Badge className="rounded-full bg-yellow-400/10 text-yellow-400 border-0 px-2.5">Principal</Badge>}
            {user.is_banned && <Badge variant="destructive" className="rounded-full px-2.5">Banido</Badge>}
            {user.has_spotify_badge && <Badge style={{ color: accent, borderColor: accent }} className="rounded-full bg-transparent px-2.5">Spotify</Badge>}
            {user.is_online && <Badge variant="outline" style={{ color: accent, borderColor: accent }} className="rounded-full px-2.5">Online</Badge>}
          </div>

          <div className="space-y-2">
            <p className="px-1 text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground/60">Ações</p>
            <Button variant="outline" className="h-12 w-full justify-start rounded-2xl border-white/[0.07] bg-white/[0.025] hover:bg-white/[0.06]" onClick={() => { onSendGift(user.user_id, user.username || 'usuário'); onClose(); }}>
              <Gift className="w-4 h-4 mr-3" />Enviar Presente
            </Button>
            <Button variant="outline" className={`h-12 w-full justify-start rounded-2xl border-white/[0.07] ${user.has_spotify_badge ? 'bg-green-500/10 text-green-400 hover:bg-green-500/15' : 'bg-white/[0.025] hover:bg-white/[0.06]'}`} onClick={() => onToggleSpotify(user.user_id, !user.has_spotify_badge)}>
              <svg className="w-4 h-4 mr-3" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/></svg>
              {user.has_spotify_badge ? 'Remover Selo Spotify' : 'Adicionar Selo Spotify'}
            </Button>
          </div>

          {!isProtected && <div className="mt-6 pt-6 border-t border-white/[0.06] space-y-2">
            <p className="px-1 text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground/60">Moderação</p>
            <Button variant="outline" className={`h-12 w-full justify-start rounded-2xl border-white/[0.07] ${user.is_banned ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400 hover:bg-red-500/15'}`} onClick={() => onBan(user.user_id, !user.is_banned)}>
              <Ban className="w-4 h-4 mr-3" />{user.is_banned ? 'Desbanir Usuário' : 'Banir Usuário'}
            </Button>
            <Button variant="outline" className={`h-12 w-full justify-start rounded-2xl border-white/[0.07] ${userIsAdmin ? 'bg-primary/10 text-primary' : 'bg-white/[0.025] hover:bg-white/[0.06]'}`} onClick={() => onToggleAdmin(user.user_id, !userIsAdmin)}>
              <Shield className="w-4 h-4 mr-3" />{userIsAdmin ? 'Remover Admin' : 'Tornar Admin'}
            </Button>
            <Button variant="outline" className="h-12 w-full justify-start rounded-2xl border-red-500/15 bg-red-500/[0.04] text-red-400 hover:bg-red-500/10" onClick={() => { onDelete(user.user_id); onClose(); }}>
              <Trash2 className="w-4 h-4 mr-3" />Excluir Conta Permanentemente
            </Button>
          </div>}

          {canEnterAccount && !isProtected && <div className="mt-6 pt-6 border-t border-white/[0.06]">
            <p className="px-1 mb-2 text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground/60">Acesso</p>
            <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-3 space-y-2">
              <Button variant="outline" className="h-11 w-full justify-start rounded-xl border-white/[0.07]" disabled={isLoadingLogin} onClick={async () => { setIsLoadingLogin(true); try { setLoginEmail(await onGetLogin?.(user.user_id) || null); } catch { toast.error('Erro ao buscar login'); } finally { setIsLoadingLogin(false); } }}>
                <KeyRound className="w-4 h-4 mr-3" />Entrar com @{user.username || 'usuário'}
              </Button>
              {loginEmail && <div className="space-y-2">
                <button className="w-full flex items-center justify-between rounded-xl bg-black/20 border border-white/[0.05] px-3 py-2.5 text-sm" onClick={() => { navigator.clipboard.writeText(loginEmail); toast.success('Login copiado'); }}><span className="truncate">Login: {loginEmail}</span><Copy className="w-4 h-4 shrink-0" /></button>
                {tempPassword && <button className="w-full flex items-center justify-between rounded-xl bg-black/20 border border-white/[0.05] px-3 py-2.5 text-sm" onClick={() => { navigator.clipboard.writeText(tempPassword); toast.success('Senha copiada'); }}><span className="truncate">Senha: {tempPassword}</span><Copy className="w-4 h-4 shrink-0" /></button>}
              </div>}
              <Input value={tempPassword} onChange={(e) => setTempPassword(e.target.value)} placeholder="Senha temporária nova" className="rounded-xl bg-black/20 border-white/[0.06]" />
              <Button className="w-full rounded-xl" disabled={tempPassword.length < 6} onClick={async () => { await onSetPassword?.(user.user_id, tempPassword); setTempPassword(''); }}>Definir senha temporária</Button>
            </div>
          </div>}
        </div>
      </DialogContent>
    </Dialog>
  );
}
