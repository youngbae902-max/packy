import { useState, useRef } from 'react';
import { User, LogOut, Shield, Camera, Package, Heart, Bookmark, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';
import { BottomNav } from '@/components/BottomNav';
import { AuthModal } from '@/components/AuthModal';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { useSupabasePacks } from '@/hooks/useSupabasePacks';
import { useUserFavorites, useUserLikes } from '@/hooks/usePackInteractions';
import { toast } from 'sonner';

const Conta = () => {
  const { user, profile, isAdmin, signOut, promoteToAdmin } = useAuth();
  const { updateProfile, uploadAvatar, isUpdating } = useProfile();
  const { userPacks } = useSupabasePacks();
  const { favorites } = useUserFavorites();
  const { likes } = useUserLikes();
  
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [artistName, setArtistName] = useState(profile?.artist_name || '');
  const [showAdminForm, setShowAdminForm] = useState(false);
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
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

            {isAdmin && (
              <span className="inline-flex items-center gap-1 bg-destructive/20 text-destructive px-3 py-1 rounded-full text-xs font-bold">
                <Shield className="w-3 h-3" />
                ADM
              </span>
            )}

            <div className="w-full">
              <label className="label-field">Nome Artístico</label>
              <input
                type="text"
                value={artistName}
                onChange={(e) => setArtistName(e.target.value)}
                placeholder="Seu vulgo"
                className="input-field"
              />
            </div>

            <button onClick={handleSaveProfile} disabled={isUpdating} className="btn-primary w-full">
              {isUpdating ? 'Salvando...' : 'Salvar Perfil'}
            </button>
          </div>
        </div>

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
                <input type="email" value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)} placeholder="Email autorizado" className="input-field" />
                <input type="password" value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} placeholder="Senha ADM" className="input-field" />
                <button type="submit" className="btn-secondary w-full text-sm">Validar</button>
              </form>
            )}
          </div>
        )}

        <button onClick={signOut} className="w-full flex items-center justify-center gap-2 text-destructive py-3">
          <LogOut className="w-4 h-4" />
          Sair
        </button>
      </div>
      <BottomNav />
    </div>
  );
};

export default Conta;
