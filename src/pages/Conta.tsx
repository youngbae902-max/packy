import { useState, useRef } from 'react';
import { User, LogOut, Shield, Camera, Package, Heart, Bookmark, Settings, AtSign, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { BottomNav } from '@/components/BottomNav';
import { AuthModal } from '@/components/AuthModal';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { useSupabasePacks } from '@/hooks/useSupabasePacks';
import { useUserFavorites, useUserLikes } from '@/hooks/usePackInteractions';
import { useUserManagement } from '@/hooks/useUserManagement';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';

const Conta = () => {
  const { user, profile, isAdmin, signOut, promoteToAdmin } = useAuth();
  const { updateProfile, uploadAvatar, isUpdating } = useProfile();
  const { userPacks } = useSupabasePacks();
  const { favorites } = useUserFavorites();
  const { likes } = useUserLikes();
  const { updateUsername, deleteMyAccount } = useUserManagement();
  
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [artistName, setArtistName] = useState(profile?.artist_name || '');
  const [username, setUsername] = useState(profile?.username || '');
  const [showAdminForm, setShowAdminForm] = useState(false);
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const url = await uploadAvatar(file);
      await updateProfile({ avatar_url: url });
      toast.success('Foto atualizada!');
    } catch {
      toast.error('Erro ao atualizar foto');
    }
  };

  const handleSaveProfile = async () => {
    try {
      await updateProfile({ artist_name: artistName });
      toast.success('Perfil salvo!');
    } catch {
      toast.error('Erro ao salvar');
    }
  };

  const handleUpdateUsername = () => {
    if (!username.trim()) return;
    updateUsername(username.trim());
  };

  const handlePromoteToAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await promoteToAdmin(adminEmail, adminPassword);
    if (success) {
      toast.success('Você agora é administrador!');
      setShowAdminForm(false);
    } else {
      toast.error('Credenciais inválidas');
    }
  };

  const handleDeleteAccount = () => {
    deleteMyAccount();
    setShowDeleteConfirm(false);
    signOut();
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-black pb-20 flex items-center justify-center">
        <div className="text-center p-6">
          <User className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-xl font-bold mb-2">Faça login</h2>
          <p className="text-muted-foreground mb-4">Acesse sua conta para ver seu perfil</p>
          <button onClick={() => setShowAuthModal(true)} className="btn-primary">
            Entrar / Criar Conta
          </button>
        </div>
        <BottomNav />
        <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black pb-20">
      <div className="max-w-lg mx-auto px-4 pt-6">
        <h1 className="text-2xl font-black text-center mb-6">MINHA CONTA</h1>

        <div className="pack-card mb-6">
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-muted overflow-hidden">
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <User className="w-10 h-10 text-muted-foreground" />
                  </div>
                )}
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center"
              >
                <Camera className="w-4 h-4" />
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
            </div>

            <div className="flex items-center gap-2">
              {isAdmin && (
                <Badge className="bg-destructive/20 text-destructive">
                  <Shield className="w-3 h-3 mr-1" />
                  ADM
                </Badge>
              )}
              {profile?.has_spotify_badge && (
                <Badge className="bg-green-500/20 text-green-500">
                  <svg className="w-3 h-3 mr-1" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
                  </svg>
                  Spotify
                </Badge>
              )}
            </div>

            {/* Username @ Field */}
            <div className="w-full">
              <label className="label-field flex items-center gap-1">
                <AtSign className="w-3 h-3" />
                Nome de Usuário
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">@</span>
                  <Input
                    value={username}
                    onChange={(e) => setUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, ''))}
                    placeholder="seunome"
                    className="pl-7"
                  />
                </div>
                <Button size="sm" onClick={handleUpdateUsername} disabled={!username.trim()}>
                  Salvar
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Você pode alterar até 3 vezes por dia
              </p>
            </div>

            <div className="w-full">
              <label className="label-field">Nome Artístico</label>
              <Input
                value={artistName}
                onChange={(e) => setArtistName(e.target.value)}
                placeholder="Seu vulgo"
              />
            </div>

            <Button onClick={handleSaveProfile} disabled={isUpdating} className="w-full">
              {isUpdating ? 'Salvando...' : 'Salvar Perfil'}
            </Button>
          </div>
        </div>

        {/* Profile Display */}
        {(profile?.artist_name || profile?.username) && (
          <div className="pack-card mb-6 text-center">
            <h3 className="font-bold text-lg">{profile.artist_name || 'Sem nome'}</h3>
            {profile.username && (
              <p className="text-sm text-muted-foreground">@{profile.username}</p>
            )}
          </div>
        )}

        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="pack-card text-center">
            <Package className="w-5 h-5 mx-auto mb-1 text-primary" />
            <p className="text-lg font-bold">{userPacks.length}</p>
            <p className="text-xs text-muted-foreground">Enviados</p>
          </div>
          <div className="pack-card text-center">
            <Heart className="w-5 h-5 mx-auto mb-1 text-destructive" />
            <p className="text-lg font-bold">{likes.length}</p>
            <p className="text-xs text-muted-foreground">Curtidos</p>
          </div>
          <div className="pack-card text-center">
            <Bookmark className="w-5 h-5 mx-auto mb-1 text-warning" />
            <p className="text-lg font-bold">{favorites.length}</p>
            <p className="text-xs text-muted-foreground">Favoritos</p>
          </div>
        </div>

        {/* Admin Panel Access */}
        {isAdmin && (
          <Link
            to="/admin"
            className="w-full mb-6 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm uppercase tracking-wide bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors"
          >
            <Settings className="w-4 h-4" />
            Painel de Administração
          </Link>
        )}

        {!isAdmin && (
          <div className="pack-card mb-6">
            <button
              onClick={() => setShowAdminForm(!showAdminForm)}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Acesso ADM
            </button>
            {showAdminForm && (
              <form onSubmit={handlePromoteToAdmin} className="mt-4 space-y-3">
                <Input 
                  type="email" 
                  value={adminEmail} 
                  onChange={(e) => setAdminEmail(e.target.value)} 
                  placeholder="Email autorizado" 
                />
                <Input 
                  type="password" 
                  value={adminPassword} 
                  onChange={(e) => setAdminPassword(e.target.value)} 
                  placeholder="Senha ADM" 
                />
                <Button type="submit" variant="secondary" className="w-full">
                  Validar
                </Button>
              </form>
            )}
          </div>
        )}

        <div className="space-y-3">
          <Button 
            variant="ghost" 
            className="w-full justify-start text-destructive hover:text-destructive"
            onClick={() => setShowDeleteConfirm(true)}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Excluir minha conta
          </Button>

          <Button 
            variant="ghost" 
            className="w-full justify-start text-muted-foreground"
            onClick={signOut}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sair
          </Button>
        </div>
      </div>

      {/* Delete Account Confirmation */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir conta</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir sua conta? Esta ação não pode ser desfeita.
              Todos os seus dados serão removidos permanentemente.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDeleteAccount}>
              Excluir permanentemente
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <BottomNav />
    </div>
  );
};

export default Conta;
