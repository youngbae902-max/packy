import { useState, useRef, useEffect } from 'react';
import { User, LogOut, Shield, AtSign, Trash2, Edit, Instagram, Youtube, Settings, KeyRound, Moon, Sun, ArrowLeft, BadgeCheck, RotateCcw, Award, Wallet, Sparkles, Eye, EyeOff, ChevronDown, History, Move } from 'lucide-react';
import { useUserAdminBadges } from '@/hooks/useAdminBadges';
import { ImageCropModal } from '@/components/ImageCropModal';
import { Link, useSearchParams } from 'react-router-dom';
import { BottomNav } from '@/components/BottomNav';
import { AuthModal } from '@/components/AuthModal';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { useSupabasePacks } from '@/hooks/useSupabasePacks';
import { useUserManagement } from '@/hooks/useUserManagement';
import { usePublicProfile } from '@/hooks/useSocial';
import { useDecorations } from '@/hooks/useDecorations';
import { useWallet } from '@/hooks/useWallet';
import { FavoritesSection } from '@/components/FavoritesSection';
import { EmojiText } from '@/components/EmojiText';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';

const Conta = () => {
  const { user, profile, isAdmin, signOut, refreshProfile, updatePassword } = useAuth();
  const { badges: myBadges } = useUserAdminBadges(user?.id);
  const { updateProfile, uploadAvatar, isUpdating } = useProfile();
  const { userPacks } = useSupabasePacks();
  const { followersCount, followingCount } = usePublicProfile(user?.id);
  const { updateUsername, deleteMyAccount } = useUserManagement();
  const { decorations } = useDecorations();
  const { transactions: walletTx } = useWallet(user?.id);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const settingsMode = searchParams.get('settings') === '1';
  const [newPassword, setNewPassword] = useState('');
  const [recoveryKeyword, setRecoveryKeyword] = useState('');
  const [themeMode, setThemeMode] = useState<'dark' | 'light'>('dark');
  const [showBalance, setShowBalance] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [decorPickerOpen, setDecorPickerOpen] = useState(false);
  const [decorEditing, setDecorEditing] = useState<{ url: string; x: number; y: number; scale: number } | null>(null);
  
  const [artistName, setArtistName] = useState('');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [instagramUrl, setInstagramUrl] = useState('');
  const [spotifyUrl, setSpotifyUrl] = useState('');
  const [soundcloudUrl, setSoundcloudUrl] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [themeColor, setThemeColor] = useState('#16A249');
  const [verifiedBadgeBgColor, setVerifiedBadgeBgColor] = useState('#0F2B1A');
  const [verifiedBadgeTextColor, setVerifiedBadgeTextColor] = useState('#16A249');
  const [adminBadgeBgColor, setAdminBadgeBgColor] = useState('#082D0F');
  const [adminBadgeBorderColor, setAdminBadgeBorderColor] = useState('#085A18');
  const [adminBadgeTextColor, setAdminBadgeTextColor] = useState('#05BD2A');
  
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
      setThemeColor(profile.online_accent_color || profile.theme_accent_color || '#16A249');
      setThemeMode((profile.theme_mode as 'dark' | 'light') || 'dark');
      setRecoveryKeyword(profile.recovery_keyword || '');
      setVerifiedBadgeBgColor(profile.verified_badge_bg_color || profile.verified_badge_color || '#0F2B1A');
      setVerifiedBadgeTextColor(profile.verified_badge_text_color || '#16A249');
      setAdminBadgeBgColor(profile.admin_badge_bg_color || profile.admin_badge_color || '#082D0F');
      setAdminBadgeBorderColor(profile.admin_badge_border_color || '#085A18');
      setAdminBadgeTextColor(profile.admin_badge_text_color || '#05BD2A');
      setThoughtDraft((profile as any)?.thought_bubble || '');
    }
  }, [profile]);

  useEffect(() => {
    document.documentElement.classList.toggle('light', themeMode === 'light');
  }, [themeMode]);

  const handleAvatarSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    const detectedColor = await getDominantColor(file).catch(() => null);
    if (detectedColor) setThemeColor(detectedColor);

    // GIFs são enviados direto para preservar a animação (sem crop)
    const isGif = file.type === 'image/gif' || file.name.toLowerCase().endsWith('.gif');
    if (isGif) {
      try {
        const url = await uploadAvatar(file);
        await updateProfile({ avatar_url: url, theme_accent_color: detectedColor || themeColor, online_accent_color: detectedColor || themeColor });
        toast.success('Foto de perfil atualizada');
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
      const detectedColor = await getDominantColor(file).catch(() => null);
      const url = await uploadAvatar(file);
      await updateProfile({ avatar_url: url, theme_accent_color: detectedColor || themeColor, online_accent_color: detectedColor || themeColor });
      if (detectedColor) setThemeColor(detectedColor);
      toast.success('Foto de perfil atualizada');
      refreshProfile();
    } catch {
      toast.error('Erro ao atualizar foto');
    }
  };

  const handleSaveProfile = async () => {
    if (!profile?.avatar_url && !cropImage) {
      toast.error('Coloque uma foto de perfil');
      return;
    }
    if (!artistName.trim() || !username.trim()) {
      toast.error('Nome e username são obrigatórios');
      return;
    }
    try {
      await updateProfile({ 
        artist_name: artistName,
        bio,
        instagram_url: instagramUrl || null,
        spotify_url: spotifyUrl || null,
        soundcloud_url: soundcloudUrl || null,
        youtube_url: youtubeUrl || null,
        theme_accent_color: themeColor,
        online_accent_color: themeColor,
        recovery_keyword: recoveryKeyword.trim() || null,
        verified_badge_color: verifiedBadgeBgColor || '#0F2B1A',
        verified_badge_bg_color: verifiedBadgeBgColor || '#0F2B1A',
        verified_badge_text_color: verifiedBadgeTextColor || '#16A249',
        admin_badge_color: adminBadgeBgColor || '#082D0F',
        admin_badge_bg_color: adminBadgeBgColor || '#082D0F',
        admin_badge_border_color: adminBadgeBorderColor || '#085A18',
        admin_badge_text_color: adminBadgeTextColor || '#05BD2A',
      });
      
      if (username.trim() && username !== profile?.username) {
        await updateUsername(username.trim());
      }
      
      toast.success('Perfil atualizado');
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

  const handleChangePassword = async () => {
    if (newPassword.length < 6) {
      toast.error('A senha precisa ter pelo menos 6 caracteres');
      return;
    }
    const { error } = await updatePassword(newPassword);
    if (error) toast.error('Erro ao alterar senha');
    else {
      toast.success('Senha principal alterada');
      setNewPassword('');
    }
  };

  const handleThemeChange = async (mode: 'dark' | 'light') => {
    setThemeMode(mode);
    await updateProfile({ theme_mode: mode });
    document.documentElement.classList.toggle('light', mode === 'light');
    toast.success(mode === 'light' ? 'Tema branco ativado' : 'Tema preto ativado');
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
          <div className="flex justify-end mb-8">
            <button onClick={() => setSearchParams({ settings: '1' })} className="w-11 h-11 flex items-center justify-center text-foreground" aria-label="Configurações">
              <Settings className="w-5 h-5" />
            </button>
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
              {(profile as any)?.profile_decoration_url && (
                <img
                  src={(profile as any).profile_decoration_url}
                  alt=""
                  aria-hidden
                  className="absolute inset-0 w-full h-full pointer-events-none"
                  style={{
                    transform: `translate(${(profile as any)?.profile_decoration_position?.x || 0}px, ${(profile as any)?.profile_decoration_position?.y || 0}px) scale(${(profile as any)?.profile_decoration_position?.scale || 1.35})`,
                  }}
                />
              )}
              <span className="absolute bottom-1 right-1 w-4 h-4 rounded-full border-2 border-background z-10" style={{ backgroundColor: themeColor }} />
              <input ref={fileInputRef} type="file" accept="image/*,image/gif" onChange={handleAvatarSelect} className="hidden" />
            </div>

            {/* Name & Username */}
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-xl font-bold text-foreground">{profile?.artist_name || 'Sem nome'}</h2>
              {profile?.has_spotify_badge && (
                <div className="flex items-center gap-1 px-2 py-0.5 rounded-full" style={{ color: verifiedBadgeTextColor, backgroundColor: verifiedBadgeBgColor }}>
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
                <Badge className="border gap-1" style={{ color: adminBadgeTextColor, borderColor: adminBadgeBorderColor, backgroundColor: adminBadgeBgColor }}>
                  <Shield className="w-3 h-3" />
                  ADM
                </Badge>
              )}
            </div>

            {/* Bio */}
            {profile?.bio && (
              <p className="text-sm text-muted-foreground max-w-xs mb-4"><EmojiText text={profile.bio} /></p>
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
        <div className="grid grid-cols-3 gap-2 mb-6 text-center">
          <div><p className="text-xl font-black text-foreground">{userPacks.length}</p><p className="text-xs text-muted-foreground">Enviados</p></div>
          <div><p className="text-xl font-black text-foreground">{followersCount}</p><p className="text-xs text-muted-foreground">Seguidores</p></div>
          <div><p className="text-xl font-black text-foreground">{followingCount}</p><p className="text-xs text-muted-foreground">Seguindo</p></div>
        </div>

        {/* Carteira */}
        <div className="rounded-3xl border border-border/50 bg-card p-4 mb-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-sm font-bold"><Wallet className="w-4 h-4" /> Saldo</div>
            <span className="text-xl font-black tabular-nums">R$ {Number((profile as any)?.wallet_balance || 0).toFixed(2)}</span>
          </div>
          {walletTx.length > 0 && (
            <div className="space-y-1 mt-3 max-h-40 overflow-y-auto">
              {walletTx.slice(0, 5).map(tx => (
                <div key={tx.id} className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="truncate mr-2">{tx.description || (tx.type === 'credit' ? 'Crédito' : 'Débito')}</span>
                  <span className={tx.type === 'credit' ? 'text-emerald-400' : 'text-rose-400'}>{tx.type === 'credit' ? '+' : '-'}R$ {Number(tx.amount).toFixed(2)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <FavoritesSection />

        <div className="h-4" />
      </div>

      {settingsMode && (
        <div className="fixed inset-0 z-[55] bg-background overflow-y-auto pb-24">
          <div className="max-w-lg mx-auto px-4 py-6">
            <div className="flex items-center justify-between mb-6">
              <button onClick={() => setSearchParams({})} className="w-11 h-11 flex items-center justify-center" aria-label="Voltar">
                <ArrowLeft className="w-6 h-6" />
              </button>
              <h1 className="text-base font-black">Configurações</h1>
              <div className="w-11" />
            </div>

            <div className="space-y-4">
              <div className="rounded-3xl border border-border/50 bg-card p-4 space-y-3">
                <div className="flex items-center gap-2 text-sm font-bold"><Moon className="w-4 h-4" /> Trocar tema</div>
                <div className="grid grid-cols-2 gap-2">
                  <Button variant={themeMode === 'dark' ? 'default' : 'outline'} onClick={() => handleThemeChange('dark')} className="rounded-2xl"><Moon className="w-4 h-4 mr-2" />Preto</Button>
                  <Button variant={themeMode === 'light' ? 'default' : 'outline'} onClick={() => handleThemeChange('light')} className="rounded-2xl"><Sun className="w-4 h-4 mr-2" />Branco</Button>
                </div>
              </div>

              <div className="rounded-3xl border border-border/50 bg-card p-4 space-y-3">
                <div className="flex items-center gap-2 text-sm font-bold"><BadgeCheck className="w-4 h-4" /> Cores dos selos</div>
                <div className="grid grid-cols-2 gap-2">
                  <div><label className="label-field">Fundo verificado</label><Input value={verifiedBadgeBgColor} onChange={(e) => setVerifiedBadgeBgColor(e.target.value)} placeholder="#0F2B1A" /></div>
                  <div><label className="label-field">Texto verificado</label><Input value={verifiedBadgeTextColor} onChange={(e) => setVerifiedBadgeTextColor(e.target.value)} placeholder="#16A249" /></div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div><label className="label-field">Fundo ADM</label><Input value={adminBadgeBgColor} onChange={(e) => setAdminBadgeBgColor(e.target.value)} placeholder="#082D0F" /></div>
                  <div><label className="label-field">Borda ADM</label><Input value={adminBadgeBorderColor} onChange={(e) => setAdminBadgeBorderColor(e.target.value)} placeholder="#085A18" /></div>
                  <div><label className="label-field">Texto ADM</label><Input value={adminBadgeTextColor} onChange={(e) => setAdminBadgeTextColor(e.target.value)} placeholder="#05BD2A" /></div>
                </div>
                <div className="grid grid-cols-[1fr_52px] gap-2 items-end">
                  <div><label className="label-field">Bolinha online</label><Input value={themeColor} onChange={(e) => setThemeColor(e.target.value)} placeholder="#16A249" /></div>
                  <div className="h-10 rounded-2xl border border-border" style={{ backgroundColor: themeColor }} />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" onClick={() => { setVerifiedBadgeBgColor('#0F2B1A'); setVerifiedBadgeTextColor('#16A249'); setAdminBadgeBgColor('#082D0F'); setAdminBadgeBorderColor('#085A18'); setAdminBadgeTextColor('#05BD2A'); setThemeColor('#16A249'); }}><RotateCcw className="w-4 h-4 mr-2" />Padrão</Button>
                  <Button onClick={async () => { await updateProfile({ verified_badge_color: verifiedBadgeBgColor, verified_badge_bg_color: verifiedBadgeBgColor, verified_badge_text_color: verifiedBadgeTextColor, admin_badge_color: adminBadgeBgColor, admin_badge_bg_color: adminBadgeBgColor, admin_badge_border_color: adminBadgeBorderColor, admin_badge_text_color: adminBadgeTextColor, theme_accent_color: themeColor, online_accent_color: themeColor }); toast.success('Cores salvas'); }}>Salvar cores</Button>
                </div>
              </div>

              <div className="rounded-3xl border border-border/50 bg-card p-4 space-y-3">
                <div className="flex items-center gap-2 text-sm font-bold"><KeyRound className="w-4 h-4" /> Senha e palavra-chave</div>
                <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Nova senha principal" />
                <Button onClick={handleChangePassword} className="w-full">Alterar senha principal</Button>
                <Input value={recoveryKeyword} onChange={(e) => setRecoveryKeyword(e.target.value)} placeholder="Palavra-chave se esquecer a senha" />
                <Button variant="outline" onClick={async () => { await updateProfile({ recovery_keyword: recoveryKeyword.trim() || null }); toast.success('Palavra-chave salva'); }} className="w-full">Salvar palavra-chave</Button>
              </div>

              <div className="rounded-3xl border border-border/50 bg-card p-4 space-y-3">
                <div className="flex items-center gap-2 text-sm font-bold"><Award className="w-4 h-4" /> Meus selos</div>
                {myBadges.length === 0 ? (
                  <p className="text-xs text-muted-foreground">Você ainda não recebeu selos. Selos são enviados pelo ADM.</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {myBadges.map(b => b.badge && (
                      <span key={b.id} className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-secondary border border-border/40 text-[11px] font-semibold">
                        <img src={b.badge.image_url} alt={b.badge.name} className="w-4 h-4" /> {b.badge.name}
                      </span>
                    ))}
                  </div>
                )}
                <div className="flex items-center justify-between gap-2 pt-2 border-t border-border/40">
                  <span className="text-xs text-muted-foreground">Exibir selos na bio</span>
                  <Button size="sm" variant={(profile as any)?.show_badges_in_bio !== false ? 'default' : 'outline'} className="rounded-full" onClick={async () => { await updateProfile({ show_badges_in_bio: !((profile as any)?.show_badges_in_bio !== false) } as any); refreshProfile(); }}>
                    {(profile as any)?.show_badges_in_bio !== false ? 'Sim' : 'Não'}
                  </Button>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs text-muted-foreground">Exibir selos no pensamento</span>
                  <Button size="sm" variant={(profile as any)?.show_badges_in_thought ? 'default' : 'outline'} className="rounded-full" onClick={async () => { await updateProfile({ show_badges_in_thought: !(profile as any)?.show_badges_in_thought } as any); refreshProfile(); }}>
                    {(profile as any)?.show_badges_in_thought ? 'Sim' : 'Não'}
                  </Button>
                </div>
              </div>

              {/* Decorações */}
              <div className="rounded-3xl border border-border/50 bg-card p-4 space-y-3">
                <div className="flex items-center gap-2 text-sm font-bold"><Sparkles className="w-4 h-4" /> Decoração do perfil</div>
                <p className="text-[11px] text-muted-foreground">Escolha um PNG para enquadrar sua foto.</p>
                <div className="grid grid-cols-4 gap-2">
                  <button
                    onClick={async () => { await updateProfile({ profile_decoration_url: null }); toast.success('Decoração removida'); refreshProfile(); }}
                    className={`aspect-square rounded-2xl border ${!(profile as any)?.profile_decoration_url ? 'border-primary' : 'border-border/40'} bg-secondary flex items-center justify-center text-[10px] text-muted-foreground`}
                  >
                    Nenhuma
                  </button>
                  {decorations.map(d => (
                    <button
                      key={d.id}
                      onClick={async () => { await updateProfile({ profile_decoration_url: d.image_url }); toast.success('Decoração aplicada'); refreshProfile(); }}
                      className={`relative aspect-square rounded-2xl border overflow-hidden ${(profile as any)?.profile_decoration_url === d.image_url ? 'border-primary' : 'border-border/40'} bg-secondary`}
                      title={d.name}
                    >
                      <img src={d.image_url} alt={d.name} className="w-full h-full object-contain" />
                    </button>
                  ))}
                </div>
                {decorations.length === 0 && <p className="text-[11px] text-muted-foreground">Nenhuma decoração disponível ainda.</p>}
              </div>

              {isAdmin && (
                <Link to="/admin" className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl font-bold text-sm bg-secondary text-foreground border border-border/60">
                  <Shield className="w-5 h-5" /> Painel de Administração
                </Link>
              )}
              <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-foreground hover:bg-secondary rounded-xl h-12" onClick={signOut}>
                <LogOut className="w-5 h-5 mr-3" /> Sair da minha conta
              </Button>
              <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl h-12" onClick={() => setShowDeleteConfirm(true)}>
                <Trash2 className="w-5 h-5 mr-3" /> Excluir a conta
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      <Dialog open={isEditingProfile} onOpenChange={setIsEditingProfile}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto bg-card border-border rounded-[2rem]">
          <DialogHeader>
            <DialogTitle className="text-foreground">Editar Perfil</DialogTitle>
            <DialogDescription>Foto, nome e username são obrigatórios.</DialogDescription>
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
                onChange={e => setBio(e.target.value.slice(0, 160))} 
                placeholder="Fale um pouco sobre você..."
                rows={3}
                maxLength={160}
                className="bg-secondary border-border text-foreground resize-none"
              />
              <p className="text-xs text-muted-foreground mt-1 text-right">{bio.length}/160</p>
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
        <DialogContent className="bg-card border-border rounded-[2rem]">
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

      {/* Thought Bubble Modal */}
      <Dialog open={showThoughtModal} onOpenChange={setShowThoughtModal}>
        <DialogContent className="bg-card border-border rounded-[2rem] max-w-md">
          <DialogHeader>
            <DialogTitle className="text-foreground text-center">Defina seu status</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              value={thoughtDraft}
              onChange={(e) => setThoughtDraft(e.target.value.slice(0, 120))}
              placeholder="O que você tá pensando?"
              rows={3}
              className="bg-secondary border-border text-foreground resize-none rounded-2xl"
              maxLength={120}
            />
            <p className="text-[11px] text-muted-foreground text-right">{thoughtDraft.length}/120</p>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" onClick={() => setShowThoughtModal(false)} className="rounded-2xl">Sair</Button>
              <Button onClick={async () => { await updateProfile({ thought_bubble: thoughtDraft.trim() || null } as any); refreshProfile(); setShowThoughtModal(false); toast.success('Status salvo'); }} className="rounded-2xl">Salvar</Button>
            </div>
            {(profile as any)?.thought_bubble && (
              <Button variant="ghost" className="w-full text-destructive hover:text-destructive rounded-2xl" onClick={async () => { await updateProfile({ thought_bubble: null } as any); refreshProfile(); setThoughtDraft(''); setShowThoughtModal(false); toast.success('Removido'); }}>
                <X className="w-4 h-4 mr-2" /> Remover pensamento
              </Button>
            )}
          </div>
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

function getDominantColor(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const size = 24;
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject(new Error('Canvas indisponível'));
      ctx.drawImage(img, 0, 0, size, size);
      const data = ctx.getImageData(0, 0, size, size).data;
      let r = 0, g = 0, b = 0, count = 0;
      for (let i = 0; i < data.length; i += 16) {
        r += data[i]; g += data[i + 1]; b += data[i + 2]; count++;
      }
      URL.revokeObjectURL(url);
      resolve(`rgb(${Math.round(r / count)}, ${Math.round(g / count)}, ${Math.round(b / count)})`);
    };
    img.onerror = reject;
    img.src = url;
  });
}

export default Conta;

function shadeColor(color: string, percent: number) {
  if (!color.startsWith('#')) return color;
  const num = parseInt(color.slice(1), 16);
  const amt = Math.round(2.55 * percent);
  const r = Math.max(0, Math.min(255, (num >> 16) + amt));
  const g = Math.max(0, Math.min(255, ((num >> 8) & 0x00ff) + amt));
  const b = Math.max(0, Math.min(255, (num & 0x0000ff) + amt));
  return `#${(0x1000000 + r * 0x10000 + g * 0x100 + b).toString(16).slice(1)}`;
}
