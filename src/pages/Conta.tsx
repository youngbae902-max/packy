import { useState, useRef, useEffect } from 'react';
import { User, LogOut, Shield, Camera, Package, Heart, Bookmark, AtSign, Trash2, Edit, Star, Instagram, Music, Youtube } from 'lucide-react';
import { Link } from 'react-router-dom';
import { BottomNav } from '@/components/BottomNav';
import { AuthModal } from '@/components/AuthModal';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { useSupabasePacks } from '@/hooks/useSupabasePacks';
import { useUserFavorites, useUserLikes } from '@/hooks/usePackInteractions';
import { useUserManagement } from '@/hooks/useUserManagement';
import { useWishlist } from '@/hooks/useWishlist';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';

const Conta = () => {
  const { user, profile, isAdmin, signOut, refreshProfile } = useAuth();
  const { updateProfile, uploadAvatar, isUpdating } = useProfile();
  const { userPacks } = useSupabasePacks();
  const { favorites } = useUserFavorites();
  const { likes } = useUserLikes();
  const { updateUsername, deleteMyAccount } = useUserManagement();
  const { hasUpdates } = useWishlist();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  
  // Form states
  const [artistName, setArtistName] = useState('');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [instagramUrl, setInstagramUrl] = useState('');
  const [spotifyUrl, setSpotifyUrl] = useState('');
  const [soundcloudUrl, setSoundcloudUrl] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (profile) {
      setArtistName(profile.artist_name || '');
      setUsername(profile.username || '');
      setBio((profile as any).bio || '');
      setInstagramUrl((profile as any).instagram_url || '');
      setSpotifyUrl((profile as any).spotify_url || '');
      setSoundcloudUrl((profile as any).soundcloud_url || '');
      setYoutubeUrl((profile as any).youtube_url || '');
    }
  }, [profile]);

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
      await updateProfile({ 
        artist_name: artistName,
        bio,
        instagram_url: instagramUrl || null,
        spotify_url: spotifyUrl || null,
        soundcloud_url: soundcloudUrl || null,
        youtube_url: youtubeUrl || null,
      } as any);
      
      if (username.trim() && username !== profile?.username) {
        await updateUsername(username.trim());
      }
      
      toast.success('Perfil salvo!');
      setIsEditingProfile(false);
      refreshProfile();
    } catch {
      toast.error('Erro ao salvar');
    }
  };

  const handleDeleteAccount = () => {
    deleteMyAccount();
    setShowDeleteConfirm(false);
    signOut();
  };

  const socialLinks = [
    { url: (profile as any)?.instagram_url, icon: Instagram, color: 'text-pink-500' },
    { url: (profile as any)?.spotify_url, icon: Music, color: 'text-green-500' },
    { url: (profile as any)?.soundcloud_url, icon: Music, color: 'text-orange-500' },
    { url: (profile as any)?.youtube_url, icon: Youtube, color: 'text-red-500' },
  ].filter(link => link.url);

  if (!user) {
    return (
      <div className="min-h-screen bg-background pb-20 flex items-center justify-center">
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
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-lg mx-auto px-4 pt-6">
        {/* Header with Wishlist */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-black">MINHA CONTA</h1>
          <Link to="/desejos" className="relative p-2 text-muted-foreground hover:text-foreground">
            <Star className="w-5 h-5" />
            {hasUpdates && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-green-500 rounded-full" />
            )}
          </Link>
        </div>

        {/* Profile Card */}
        <div className="pack-card mb-6">
          <div className="flex items-start gap-4">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div className="w-20 h-20 rounded-full bg-muted overflow-hidden">
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <User className="w-8 h-8 text-muted-foreground" />
                  </div>
                )}
              </div>
              <button 
                onClick={() => fileInputRef.current?.click()} 
                className="absolute bottom-0 right-0 w-7 h-7 bg-primary text-primary-foreground rounded-full flex items-center justify-center"
              >
                <Camera className="w-3.5 h-3.5" />
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <h3 className="font-bold text-lg truncate">{profile?.artist_name || 'Sem nome'}</h3>
                {!isEditingProfile && (
                  <button 
                    onClick={() => setIsEditingProfile(true)} 
                    className="p-1 text-muted-foreground hover:text-foreground"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                )}
              </div>
              {profile?.username && (
                <p className="text-sm text-muted-foreground mb-2">@{profile.username}</p>
              )}
              
              {/* Badges */}
              <div className="flex gap-1.5 flex-wrap">
                {isAdmin && (
                  <Badge className="bg-destructive/20 text-destructive">
                    <Shield className="w-3 h-3 mr-1" />
                    ADM
                  </Badge>
                )}
                {profile?.has_spotify_badge && (
                  <Badge className="bg-green-500/20 text-green-500">
                    <svg className="w-3 h-3 mr-1" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
                    </svg>
                    Spotify
                  </Badge>
                )}
              </div>

              {/* Bio */}
              {(profile as any)?.bio && (
                <p className="text-sm text-muted-foreground mt-2">{(profile as any).bio}</p>
              )}

              {/* Social Links */}
              {socialLinks.length > 0 && (
                <div className="flex gap-2 mt-3">
                  {socialLinks.map((link, i) => (
                    <a 
                      key={i} 
                      href={link.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className={`w-8 h-8 rounded-lg bg-muted flex items-center justify-center hover:bg-secondary transition-colors ${link.color}`}
                    >
                      <link.icon className="w-4 h-4" />
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stats */}
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
            <Shield className="w-4 h-4" />
            Painel de Administração
          </Link>
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

          <Button variant="ghost" className="w-full justify-start text-muted-foreground" onClick={signOut}>
            <LogOut className="w-4 h-4 mr-2" />
            Sair
          </Button>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <Dialog open={isEditingProfile} onOpenChange={setIsEditingProfile}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Perfil</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="label-field flex items-center gap-1">
                <AtSign className="w-3 h-3" />
                Nome de Usuário
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">@</span>
                <Input 
                  value={username} 
                  onChange={e => setUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, ''))} 
                  placeholder="seunome" 
                  className="pl-7" 
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">Máximo 3 alterações por dia</p>
            </div>

            <div>
              <label className="label-field">Nome Artístico</label>
              <Input value={artistName} onChange={e => setArtistName(e.target.value)} placeholder="Seu vulgo" />
            </div>

            <div>
              <label className="label-field">Bio</label>
              <Textarea 
                value={bio} 
                onChange={e => setBio(e.target.value)} 
                placeholder="Fale um pouco sobre você..."
                rows={3}
              />
            </div>

            <div className="border-t pt-4">
              <p className="text-sm font-bold mb-3">Links Sociais</p>
              
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Instagram className="w-4 h-4 text-pink-500 flex-shrink-0" />
                  <Input 
                    value={instagramUrl} 
                    onChange={e => setInstagramUrl(e.target.value)} 
                    placeholder="https://instagram.com/..."
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Music className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <Input 
                    value={spotifyUrl} 
                    onChange={e => setSpotifyUrl(e.target.value)} 
                    placeholder="https://open.spotify.com/..."
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Music className="w-4 h-4 text-orange-500 flex-shrink-0" />
                  <Input 
                    value={soundcloudUrl} 
                    onChange={e => setSoundcloudUrl(e.target.value)} 
                    placeholder="https://soundcloud.com/..."
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Youtube className="w-4 h-4 text-red-500 flex-shrink-0" />
                  <Input 
                    value={youtubeUrl} 
                    onChange={e => setYoutubeUrl(e.target.value)} 
                    placeholder="https://youtube.com/..."
                  />
                </div>
              </div>
            </div>

            <Button onClick={handleSaveProfile} disabled={isUpdating} className="w-full">
              {isUpdating ? 'Salvando...' : 'Salvar Perfil'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

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
