import { useState, useRef, useEffect } from 'react';
import { User, LogOut, Shield, Package, Heart, Bookmark, AtSign, Trash2, Edit, Star, Instagram, Youtube } from 'lucide-react';
import { ImageCropModal } from '@/components/ImageCropModal';
import { Link } from 'react-router-dom';
import { BottomNav } from '@/components/BottomNav';
import { AuthModal } from '@/components/AuthModal';
import { FavoritesSection } from '@/components/FavoritesSection';
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
  
  const [artistName, setArtistName] = useState('');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [instagramUrl, setInstagramUrl] = useState('');
  const [spotifyUrl, setSpotifyUrl] = useState('');
  const [soundcloudUrl, setSoundcloudUrl] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [cropImage, setCropImage] = useState<string | null>(null);
  const [showCropModal, setShowCropModal] = useState(false);

  useEffect(() => {
    if (profile) {
      setArtistName(profile.artist_name || '');
      setUsername(profile.username || '');
      setBio(profile.bio || '');
      setInstagramUrl(profile.instagram_url || '');
      setSpotifyUrl(profile.spotify_url || '');
      setSoundcloudUrl(profile.soundcloud_url || '');
      setYoutubeUrl(profile.youtube_url || '');
    }
  }, [profile]);

  const handleAvatarSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';

    // GIFs são enviados direto para preservar a animação (sem crop)
    const isGif = file.type === 'image/gif' || file.name.toLowerCase().endsWith('.gif');
    if (isGif) {
      try {
        const url = await uploadAvatar(file);
        await updateProfile({ avatar_url: url });
        toast.success('GIF atualizado!');
        refreshProfile();
      } catch {
        toast.error('Erro ao atualizar GIF');
      }
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setCropImage(reader.result as string);
      setShowCropModal(true);
    };
    reader.readAsDataURL(file);
  };

  const handleCroppedAvatar = async (blob: Blob) => {
    try {
      const file = new File([blob], 'avatar.jpg', { type: 'image/jpeg' });
      const url = await uploadAvatar(file);
      await updateProfile({ avatar_url: url });
      toast.success('Foto atualizada!');
      refreshProfile();
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
      });
      
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

  const SpotifyIcon = () => (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
    </svg>
  );

  const SoundCloudIcon = () => (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
      <path d="M1.175 12.225c-.051 0-.094.046-.101.1l-.233 2.154.233 2.105c.007.058.05.098.101.098.05 0 .09-.04.099-.098l.255-2.105-.27-2.154c-.009-.06-.052-.1-.084-.1zm-.899 1.075c-.05 0-.09.039-.099.096l-.164 1.08.164 1.063c.009.053.049.09.099.09.05 0 .09-.037.099-.09l.2-1.063-.185-1.08c-.009-.057-.049-.096-.114-.096zm1.956-1.574c-.061 0-.107.048-.117.109l-.205 2.453.205 2.365c.01.061.056.109.117.109.06 0 .107-.048.117-.109l.235-2.365-.235-2.453c-.01-.061-.057-.109-.117-.109zm.943-.109c-.073 0-.126.059-.133.125l-.178 2.562.178 2.453c.007.066.06.125.133.125.073 0 .126-.059.133-.125l.205-2.453-.205-2.562c-.007-.066-.06-.125-.133-.125zm.937-.287c-.08 0-.14.063-.15.143l-.163 2.85.163 2.453c.01.08.07.143.15.143.08 0 .14-.063.15-.143l.19-2.453-.19-2.85c-.01-.08-.07-.143-.15-.143zm.943-.252c-.092 0-.159.07-.168.158l-.14 3.102.14 2.453c.009.088.076.158.168.158.092 0 .159-.07.168-.158l.163-2.453-.163-3.102c-.009-.088-.076-.158-.168-.158zm.949-.252c-.102 0-.176.076-.185.176l-.117 3.354.117 2.416c.009.1.083.176.185.176.102 0 .176-.076.185-.176l.14-2.416-.14-3.354c-.009-.1-.083-.176-.185-.176zm.956-.144c-.11 0-.19.08-.199.19l-.09 3.498.09 2.378c.009.11.089.19.199.19.11 0 .19-.08.199-.19l.107-2.378-.107-3.498c-.009-.11-.089-.19-.199-.19zm.95-.144c-.122 0-.21.088-.22.208l-.068 3.642.068 2.341c.01.12.098.208.22.208.122 0 .21-.088.22-.208l.08-2.341-.08-3.642c-.01-.12-.098-.208-.22-.208zm1.896.496c-.182 0-.326.144-.326.326v7.412c0 .182.144.326.326.326h7.412c1.8 0 3.262-1.462 3.262-3.262s-1.462-3.262-3.262-3.262c-.512 0-.994.118-1.424.326-.26-2.006-1.968-3.56-4.048-3.56-.598 0-1.168.13-1.678.364-.154.07-.194.144-.194.28v5.55z"/>
    </svg>
  );

  const socialLinks = [
    { url: profile?.instagram_url, Icon: Instagram, color: 'text-pink-500', label: 'Instagram' },
    { url: profile?.spotify_url, Icon: SpotifyIcon, color: 'text-green-500', label: 'Spotify' },
    { url: profile?.soundcloud_url, Icon: SoundCloudIcon, color: 'text-orange-500', label: 'SoundCloud' },
    { url: profile?.youtube_url, Icon: Youtube, color: 'text-red-500', label: 'YouTube' },
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
      {/* Header */}
      <div className="bg-gradient-to-b from-secondary to-background pt-8 pb-16 px-4">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-lg font-bold tracking-wider text-foreground/90">MINHA CONTA</h1>
            <Link to="/desejos" className="relative p-2 rounded-full bg-foreground/5 hover:bg-foreground/10 transition-colors">
              <Star className="w-5 h-5 text-foreground/70" />
              {hasUpdates && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-success rounded-full" />
              )}
            </Link>
          </div>

          {/* Profile Card */}
          <div className="flex flex-col items-center text-center">
            {/* Avatar */}
            <div className="relative mb-4">
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="w-24 h-24 rounded-full bg-secondary border-2 border-border overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
              >
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <User className="w-10 h-10 text-muted-foreground" />
                  </div>
                )}
              </button>
              {/* Green online dot */}
              <span className="absolute bottom-1 right-1 w-4 h-4 bg-success rounded-full border-2 border-background" />
              <input ref={fileInputRef} type="file" accept="image/*,image/gif" onChange={handleAvatarSelect} className="hidden" />
            </div>

            {/* Name & Username */}
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-xl font-bold text-foreground">{profile?.artist_name || 'Sem nome'}</h2>
              {profile?.has_spotify_badge && (
                <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-success/20 text-success">
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
                  </svg>
                  <span className="text-xs font-medium">Verificado</span>
                </div>
              )}
              <button 
                onClick={() => setIsEditingProfile(true)} 
                className="p-1.5 text-muted-foreground hover:text-foreground transition-colors"
              >
                <Edit className="w-4 h-4" />
              </button>
            </div>
            
            {profile?.username && (
              <p className="text-sm text-muted-foreground mb-3">@{profile.username}</p>
            )}

            {/* Badges */}
            <div className="flex gap-2 mb-4">
              {isAdmin && (
                <Badge className="bg-destructive/20 text-destructive border-destructive/30 gap-1">
                  <Shield className="w-3 h-3" />
                  ADM
                </Badge>
              )}
            </div>

            {/* Bio */}
            {profile?.bio && (
              <p className="text-sm text-muted-foreground max-w-xs mb-4">{profile.bio}</p>
            )}

            {/* Social Links */}
            {socialLinks.length > 0 && (
              <div className="flex gap-3">
                {socialLinks.map((link, i) => (
                  <a 
                    key={i} 
                    href={link.url || '#'} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className={`w-10 h-10 rounded-full bg-secondary border border-border flex items-center justify-center hover:border-primary/50 transition-colors ${link.color}`}
                    title={link.label}
                  >
                    <link.Icon />
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 -mt-8">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-secondary border border-border rounded-2xl p-4 text-center">
            <Package className="w-5 h-5 mx-auto mb-2 text-primary" />
            <p className="text-xl font-bold text-foreground">{userPacks.length}</p>
            <p className="text-xs text-muted-foreground">Enviados</p>
          </div>
          <div className="bg-secondary border border-border rounded-2xl p-4 text-center">
            <Heart className="w-5 h-5 mx-auto mb-2 text-destructive" />
            <p className="text-xl font-bold text-foreground">{likes.length}</p>
            <p className="text-xs text-muted-foreground">Curtidos</p>
          </div>
          <div className="bg-secondary border border-border rounded-2xl p-4 text-center">
            <Bookmark className="w-5 h-5 mx-auto mb-2 text-warning" />
            <p className="text-xl font-bold text-foreground">{favorites.length}</p>
            <p className="text-xs text-muted-foreground">Favoritos</p>
          </div>
        </div>

        {/* Favorites Section */}
        <div className="mb-6">
          <FavoritesSection />
        </div>

        {/* Admin Panel Access */}
        {isAdmin && (
          <Link 
            to="/admin" 
            className="w-full mb-4 flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-sm bg-gradient-to-r from-destructive to-destructive/80 text-destructive-foreground hover:opacity-90 transition-all shadow-lg"
          >
            <Shield className="w-5 h-5" />
            Painel de Administração
          </Link>
        )}

        {/* Actions */}
        <div className="space-y-2">
          <Button 
            variant="ghost" 
            className="w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl h-12" 
            onClick={() => setShowDeleteConfirm(true)}
          >
            <Trash2 className="w-5 h-5 mr-3" />
            Excluir minha conta
          </Button>

          <Button 
            variant="ghost" 
            className="w-full justify-start text-muted-foreground hover:text-foreground hover:bg-secondary rounded-xl h-12" 
            onClick={signOut}
          >
            <LogOut className="w-5 h-5 mr-3" />
            Sair da conta
          </Button>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <Dialog open={isEditingProfile} onOpenChange={setIsEditingProfile}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">Editar Perfil</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-muted-foreground mb-1 block flex items-center gap-1">
                <AtSign className="w-3 h-3" />
                Nome de Usuário
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">@</span>
                <Input 
                  value={username} 
                  onChange={e => setUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, ''))} 
                  placeholder="seunome" 
                  className="pl-7 bg-secondary border-border text-foreground" 
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">Máximo 3 alterações por dia</p>
            </div>

            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Nome Artístico</label>
              <Input 
                value={artistName} 
                onChange={e => setArtistName(e.target.value)} 
                placeholder="Seu vulgo" 
                className="bg-secondary border-border text-foreground"
              />
            </div>

            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Bio</label>
              <Textarea 
                value={bio} 
                onChange={e => setBio(e.target.value)} 
                placeholder="Fale um pouco sobre você..."
                rows={3}
                className="bg-secondary border-border text-foreground resize-none"
              />
            </div>

            <div className="border-t border-border pt-4">
              <p className="text-sm font-bold text-foreground mb-3">Links Sociais</p>
              
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Instagram className="w-5 h-5 text-premium flex-shrink-0" />
                  <Input 
                    value={instagramUrl} 
                    onChange={e => setInstagramUrl(e.target.value)} 
                    placeholder="https://instagram.com/..."
                    className="bg-secondary border-border text-foreground"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-success flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
                  </svg>
                  <Input 
                    value={spotifyUrl} 
                    onChange={e => setSpotifyUrl(e.target.value)} 
                    placeholder="https://open.spotify.com/..."
                    className="bg-secondary border-border text-foreground"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-warning flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M1.175 12.225c-.051 0-.094.046-.101.1l-.233 2.154.233 2.105c.007.058.05.098.101.098.05 0 .09-.04.099-.098l.255-2.105-.27-2.154c-.009-.06-.052-.1-.084-.1zm-.899 1.075c-.05 0-.09.039-.099.096l-.164 1.08.164 1.063c.009.053.049.09.099.09.05 0 .09-.037.099-.09l.2-1.063-.185-1.08c-.009-.057-.049-.096-.114-.096zm1.956-1.574c-.061 0-.107.048-.117.109l-.205 2.453.205 2.365c.01.061.056.109.117.109.06 0 .107-.048.117-.109l.235-2.365-.235-2.453c-.01-.061-.057-.109-.117-.109zm.943-.109c-.073 0-.126.059-.133.125l-.178 2.562.178 2.453c.007.066.06.125.133.125.073 0 .126-.059.133-.125l.205-2.453-.205-2.562c-.007-.066-.06-.125-.133-.125zm.937-.287c-.08 0-.14.063-.15.143l-.163 2.85.163 2.453c.01.08.07.143.15.143.08 0 .14-.063.15-.143l.19-2.453-.19-2.85c-.01-.08-.07-.143-.15-.143zm.943-.252c-.092 0-.159.07-.168.158l-.14 3.102.14 2.453c.009.088.076.158.168.158.092 0 .159-.07.168-.158l.163-2.453-.163-3.102c-.009-.088-.076-.158-.168-.158zm.949-.252c-.102 0-.176.076-.185.176l-.117 3.354.117 2.416c.009.1.083.176.185.176.102 0 .176-.076.185-.176l.14-2.416-.14-3.354c-.009-.1-.083-.176-.185-.176zm.956-.144c-.11 0-.19.08-.199.19l-.09 3.498.09 2.378c.009.11.089.19.199.19.11 0 .19-.08.199-.19l.107-2.378-.107-3.498c-.009-.11-.089-.19-.199-.19zm.95-.144c-.122 0-.21.088-.22.208l-.068 3.642.068 2.341c.01.12.098.208.22.208.122 0 .21-.088.22-.208l.08-2.341-.08-3.642c-.01-.12-.098-.208-.22-.208zm1.896.496c-.182 0-.326.144-.326.326v7.412c0 .182.144.326.326.326h7.412c1.8 0 3.262-1.462 3.262-3.262s-1.462-3.262-3.262-3.262c-.512 0-.994.118-1.424.326-.26-2.006-1.968-3.56-4.048-3.56-.598 0-1.168.13-1.678.364-.154.07-.194.144-.194.28v5.55z"/>
                  </svg>
                  <Input 
                    value={soundcloudUrl} 
                    onChange={e => setSoundcloudUrl(e.target.value)} 
                    placeholder="https://soundcloud.com/..."
                    className="bg-secondary border-border text-foreground"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Youtube className="w-5 h-5 text-destructive flex-shrink-0" />
                  <Input 
                    value={youtubeUrl} 
                    onChange={e => setYoutubeUrl(e.target.value)} 
                    placeholder="https://youtube.com/..."
                    className="bg-secondary border-border text-foreground"
                  />
                </div>
              </div>
            </div>

            <Button 
              onClick={handleSaveProfile} 
              disabled={isUpdating} 
              className="w-full"
            >
              {isUpdating ? 'Salvando...' : 'Salvar Perfil'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Account Confirmation */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">Excluir conta</DialogTitle>
            <DialogDescription className="text-muted-foreground">
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

      {/* Image Crop Modal */}
      {cropImage && (
        <ImageCropModal
          isOpen={showCropModal}
          onClose={() => { setShowCropModal(false); setCropImage(null); }}
          imageSrc={cropImage}
          onCropComplete={handleCroppedAvatar}
          aspectRatio={1}
          title="Ajustar Foto de Perfil"
        />
      )}

      <BottomNav />
    </div>
  );
};

export default Conta;
