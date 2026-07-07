import { useState, useRef, useEffect } from 'react';
import { User, LogOut, Shield, AtSign, Trash2, Edit, Instagram, Youtube, Settings, KeyRound, Moon, Sun, ArrowLeft, BadgeCheck, RotateCcw, Award, Wallet, Sparkles, Eye, EyeOff, History, Pipette } from 'lucide-react';
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
import { WalletCard } from '@/components/WalletCard';
import { EmojiText } from '@/components/EmojiText';
import { WelcomeScreen } from '@/components/WelcomeScreen';
import { SettingsRow, SettingsGroup } from '@/components/SettingsRow';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { ChevronRight, Palette, Lock, Smile, Sticker, Image as ImageIcon, MoreHorizontal } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { avatarShapeClasses, AVATAR_SHAPES } from '@/lib/avatarShape';
import { ColorPickerCard } from '@/components/ColorPickerCard';

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
  const [settingsSub, setSettingsSub] = useState<null | 'tema' | 'cores' | 'senha' | 'selos' | 'mais' | 'formato-foto' | 'indicador-online'>(null);
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
  const [verifiedBadgeText, setVerifiedBadgeText] = useState('Verificado');
  const [adminBadgeBgColor, setAdminBadgeBgColor] = useState('#082D0F');
  const [adminBadgeBorderColor, setAdminBadgeBorderColor] = useState('#085A18');
  const [adminBadgeTextColor, setAdminBadgeTextColor] = useState('#05BD2A');
  const [avatarShape, setAvatarShape] = useState<string>('circle');
  const [onlineShape, setOnlineShape] = useState<string>('pill');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const settingsFileInputRef = useRef<HTMLInputElement>(null);
  const [walletOpen, setWalletOpen] = useState(false);

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
      setVerifiedBadgeText((profile as any).verified_badge_text || 'Verificado');
      setAdminBadgeBgColor(profile.admin_badge_bg_color || profile.admin_badge_color || '#082D0F');
      setAdminBadgeBorderColor(profile.admin_badge_border_color || '#085A18');
      setAdminBadgeTextColor(profile.admin_badge_text_color || '#05BD2A');
      setAvatarShape((profile as any).avatar_shape || 'circle');
      setOnlineShape((profile as any).online_indicator_shape || 'pill');
    }
  }, [profile]);

  useEffect(() => {
    document.documentElement.classList.toggle('light', themeMode === 'light');
  }, [themeMode]);

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
        toast.success('Foto de perfil atualizada');
        refreshProfile();
      } catch (err: any) {
        toast.error(err?.message || 'Erro ao atualizar GIF');
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
      toast.success('Foto de perfil atualizada');
      refreshProfile();
    } catch (err: any) {
      toast.error(err?.message || 'Erro ao atualizar foto');
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
        theme_accent_color: themeColor,
        online_accent_color: themeColor,
        recovery_keyword: recoveryKeyword.trim() || null,
        verified_badge_color: verifiedBadgeBgColor || '#0F2B1A',
        verified_badge_bg_color: verifiedBadgeBgColor || '#0F2B1A',
        verified_badge_text_color: verifiedBadgeTextColor || '#16A249',
        verified_badge_text: verifiedBadgeText || 'Verificado',
        admin_badge_color: adminBadgeBgColor || '#082D0F',
        admin_badge_bg_color: adminBadgeBgColor || '#082D0F',
        admin_badge_border_color: adminBadgeBorderColor || '#085A18',
        admin_badge_text_color: adminBadgeTextColor || '#05BD2A',
        avatar_shape: avatarShape,
        online_indicator_shape: onlineShape,
      } as any);
      
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
      <>
        <WelcomeScreen onStart={() => setShowAuthModal(true)} />
        <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} initialMode="signup" />
      </>
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
            <div className="relative mb-4 w-32 h-32">
              <button 
                onClick={() => fileInputRef.current?.click()}
                className={`w-32 h-32 bg-secondary border-2 border-border overflow-hidden cursor-pointer hover:opacity-80 transition-opacity block ${avatarShapeClasses(avatarShape)}`}
              >
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <User className="w-14 h-14 text-muted-foreground" />
                  </div>
                )}
              </button>
              <span className="absolute -bottom-0.5 right-1 rounded-full border-2 border-background" style={{ backgroundColor: themeColor, width: '1.5rem', height: '0.65rem' }} />
              {(profile as any)?.profile_decoration_url && (() => {
                const pos = (profile as any)?.profile_decoration_position || {};
                const x = pos.x ?? 25;
                const y = pos.y ?? 25;
                const scale = pos.scale ?? 0.8;
                return (
                  <img
                    src={(profile as any).profile_decoration_url}
                    alt=""
                    aria-hidden
                    className="absolute pointer-events-none z-20"
                    style={{
                      width: '60%', height: '60%',
                      left: '50%', top: '50%',
                      transform: `translate(calc(-50% + ${x}%), calc(-50% + ${y}%)) scale(${scale})`,
                    }}
                  />
                );
              })()}
              <input ref={fileInputRef} type="file" accept="image/*,image/gif" onChange={handleAvatarSelect} className="hidden" />
            </div>

            {/* Name & Username */}
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-xl font-bold text-foreground">{profile?.artist_name || 'Sem nome'}</h2>
              {(profile as any)?.is_verified && (
                <div
                  className={`flex items-center gap-1 px-2 py-0.5 rounded-full ${(profile as any)?.verified_rgb ? 'badge-rgb' : ''}`}
                  style={(profile as any)?.verified_rgb ? undefined : { color: verifiedBadgeTextColor, backgroundColor: verifiedBadgeBgColor }}
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
                  </svg>
                  <span className="text-xs font-medium">{verifiedBadgeText || 'Verificado'}</span>
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
              {isAdmin && ((profile as any)?.show_admin_badge !== false) && (
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

        <FavoritesSection />

        <div className="h-4" />
      </div>

      {settingsMode && (
        <div className="fixed inset-0 z-40 bg-background overflow-y-auto pb-24">
          <div className="max-w-lg mx-auto px-4 py-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={() => { if (settingsSub) setSettingsSub(null); else setSearchParams({}); }}
                className="w-11 h-11 flex items-center justify-center"
                aria-label="Voltar"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <h1 className="text-[17px] font-bold tracking-tight">
                {settingsSub === 'tema' ? 'Trocar Tema'
                  : settingsSub === 'cores' ? 'Cores dos Selos'
                  : settingsSub === 'senha' ? 'Senha e Segurança'
                  : settingsSub === 'selos' ? 'Meus Selos'
                  : settingsSub === 'mais' ? 'Mais opções'
                  : settingsSub === 'formato-foto' ? 'Formato da Foto'
                  : settingsSub === 'indicador-online' ? 'Indicador Online'
                  : 'Configurações'}
              </h1>
              <div className="w-11" />
            </div>

            {/* Dynamic Preview for Visual Settings */}
            {['cores', 'formato-foto', 'indicador-online', 'tema'].includes(settingsSub || '') && (
              <div className="mb-6 pointer-events-none opacity-90 scale-95 origin-top">
                <div className="flex flex-col items-center text-center">
                  <div className="relative mb-4 w-24 h-24">
                     <div className={`w-24 h-24 bg-secondary border-2 border-border overflow-hidden block ${avatarShapeClasses(avatarShape)}`}>
                        {profile?.avatar_url ? <img src={profile.avatar_url} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><User className="w-10 h-10 text-muted-foreground" /></div>}
                     </div>
                     <span
                      className={`absolute -bottom-0.5 right-0 border-2 border-background ${
                        onlineShape === 'dot' ? 'w-3 h-3 rounded-full' :
                        onlineShape === 'pill' ? 'w-5 h-2.5 rounded-full' :
                        onlineShape === 'square' ? 'w-3 h-3' :
                        onlineShape === 'rounded-square' ? 'w-3 h-3 rounded-[3px]' :
                        onlineShape === 'rectangle' ? 'w-5 h-2.5' :
                        'w-5 h-2.5 rounded-[4px]'
                      }`}
                      style={{ backgroundColor: themeColor }}
                    />
                  </div>
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-xl font-bold text-foreground">{artistName || 'Sem nome'}</h2>
                    {profile?.has_spotify_badge && (
                      <div className="flex items-center gap-1 px-2 py-0.5 rounded-full" style={{ color: verifiedBadgeTextColor, backgroundColor: verifiedBadgeBgColor }}>
                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
                        </svg>
                        <span className="text-xs font-medium">{verifiedBadgeText || 'Verificado'}</span>
                      </div>
                    )}
                  </div>
                  {username && <p className="text-sm text-muted-foreground mb-3">@{username}</p>}
                </div>
              </div>
            )}

            {/* Settings home */}
            {!settingsSub && (
              <>
                {/* Small profile card */}
                <div className="rounded-2xl border border-border/40 bg-card p-3 flex items-center gap-3 mb-6">
                  <button
                    onClick={() => settingsFileInputRef.current?.click()}
                    className={`w-11 h-11 bg-secondary overflow-hidden flex-shrink-0 border border-border/40 ${avatarShapeClasses(avatarShape)}`}
                  >
                    {profile?.avatar_url ? (
                      <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center"><User className="w-5 h-5 text-muted-foreground" /></div>
                    )}
                  </button>
                  <input ref={settingsFileInputRef} type="file" accept="image/*,image/gif" onChange={handleAvatarSelect} className="hidden" />
                  <button onClick={() => setIsEditingProfile(true)} className="min-w-0 flex-1 text-left">
                    <p className="text-[14px] font-bold tracking-tight truncate leading-tight">{profile?.artist_name || 'Sem nome'}</p>
                    {profile?.username && <p className="text-[12px] text-muted-foreground truncate leading-tight">@{profile.username}</p>}
                  </button>
                  <ChevronRight className="w-4 h-4 text-muted-foreground/70 shrink-0" />
                </div>

                <SettingsGroup>
                  <Link to="/carteira" className="w-full flex items-center gap-3 px-4 py-3.5 bg-card hover:bg-secondary/60 transition-colors">
                    <Wallet className="w-[18px] h-[18px] text-foreground/70" />
                    <span className="flex-1 text-[15px] font-medium tracking-tight">Carteira</span>
                    <span className="text-[13px] font-bold tabular-nums text-foreground/80">R$ {Number((profile as any)?.wallet_balance || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    <ChevronRight className="w-4 h-4 text-muted-foreground/70" />
                  </Link>
                </SettingsGroup>

                <SettingsGroup title="Personalização">
                  <SettingsRow icon={Palette} label="Trocar Tema" value={themeMode === 'light' ? 'Claro' : 'Escuro'} onClick={() => setSettingsSub('tema')} />
                  <SettingsRow icon={BadgeCheck} label="Cores dos Selos" onClick={() => setSettingsSub('cores')} />
                  <SettingsRow icon={Sticker} label="Decoração do Perfil" onClick={() => setDecorPickerOpen(true)} />
                  <SettingsRow icon={ImageIcon} label="Formato da Foto" onClick={() => setSettingsSub('formato-foto')} />
                  <SettingsRow icon={Smile} label="Indicador Online" onClick={() => setSettingsSub('indicador-online')} />
                </SettingsGroup>

                <SettingsGroup title="Conta">
                  <SettingsRow icon={Lock} label="Senha e Segurança" onClick={() => setSettingsSub('senha')} />
                  <SettingsRow icon={Award} label="Meus Selos" onClick={() => setSettingsSub('selos')} />
                </SettingsGroup>

                {isAdmin && (
                  <SettingsGroup>
                    <Link to="/admin" className="w-full flex items-center gap-3 px-4 py-3.5 bg-card hover:bg-secondary/60 transition-colors">
                      <Shield className="w-[18px] h-[18px] text-foreground/70" />
                      <span className="flex-1 text-[15px] font-medium tracking-tight">Painel de Administração</span>
                      <ChevronRight className="w-4 h-4 text-muted-foreground/70" />
                    </Link>
                  </SettingsGroup>
                )}

                <SettingsGroup>
                  <SettingsRow icon={MoreHorizontal} label="Mais opções" onClick={() => setSettingsSub('mais')} />
                </SettingsGroup>
              </>
            )}

            {/* Theme subscreen */}
            {settingsSub === 'tema' && (
              <div className="space-y-3">
                <p className="text-[13px] text-muted-foreground px-1 mb-2">Escolha como o PACKY aparece para você.</p>
                {[
                  { id: 'dark' as const, label: 'Escuro', desc: 'Padrão PACKY — preto absoluto', bg: '#000', fg: '#fff' },
                  { id: 'light' as const, label: 'Claro', desc: 'Em breve — prévia decorativa', bg: '#f5f5f5', fg: '#0a0a0a' },
                ].map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => opt.id === 'dark' ? handleThemeChange('dark') : toast.info('Tema claro em breve')}
                    className={`w-full flex items-center gap-3 p-3 rounded-2xl border ${themeMode === opt.id ? 'border-foreground' : 'border-border/40'} bg-card`}
                  >
                    <div className="w-16 h-16 rounded-xl flex flex-col items-center justify-center border border-border/40" style={{ background: opt.bg, color: opt.fg }}>
                      <div className="w-8 h-1 rounded-full mb-1" style={{ background: opt.fg, opacity: 0.7 }} />
                      <div className="w-6 h-1 rounded-full" style={{ background: opt.fg, opacity: 0.4 }} />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-[15px] font-bold">{opt.label}</p>
                      <p className="text-[12px] text-muted-foreground">{opt.desc}</p>
                    </div>
                    {themeMode === opt.id && <BadgeCheck className="w-5 h-5 text-foreground" />}
                  </button>
                ))}
              </div>
            )}

            {/* Cores dos selos subscreen */}
            {settingsSub === 'cores' && (
              <div className="space-y-4 pb-24">
                <ColorPickerCard label="Selo Verificado — Fundo" value={verifiedBadgeBgColor} onChange={setVerifiedBadgeBgColor} />
                <ColorPickerCard label="Selo Verificado — Texto" value={verifiedBadgeTextColor} onChange={setVerifiedBadgeTextColor} />

                <div className="rounded-2xl border border-border/40 bg-card p-4">
                  <p className="text-[13px] font-bold mb-1">Texto Customizado do Selo Verificado</p>
                  <p className="text-[11px] text-muted-foreground mb-3">Troque "Verificado" por um emoji (ex: 👑) ou outra palavra.</p>
                  <Input value={verifiedBadgeText} onChange={e => setVerifiedBadgeText(e.target.value)} placeholder="Verificado" className="bg-secondary text-foreground" />
                </div>

                <div className="rounded-2xl border border-border/40 bg-card p-4">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="text-[13px] font-bold">Verificado em RGB</p>
                      <p className="text-[11px] text-muted-foreground">Anima cores do selo</p>
                    </div>
                    <Switch
                      checked={(profile as any)?.verified_rgb === true}
                      onCheckedChange={async (v) => { await updateProfile({ verified_rgb: v } as any); refreshProfile(); }}
                    />
                  </div>
                </div>

                <ColorPickerCard label="Selo ADM — Fundo" value={adminBadgeBgColor} onChange={setAdminBadgeBgColor} />
                <ColorPickerCard label="Selo ADM — Borda" value={adminBadgeBorderColor} onChange={setAdminBadgeBorderColor} />
                <ColorPickerCard label="Selo ADM — Texto" value={adminBadgeTextColor} onChange={setAdminBadgeTextColor} />

                <ColorPickerCard label="Indicador online" value={themeColor} onChange={setThemeColor} />
              </div>
            )}

            {settingsSub === 'formato-foto' && (
              <div className="space-y-4">
                <div className="rounded-2xl border border-border/40 bg-card p-4">
                  <div className="grid grid-cols-5 gap-2">
                    {AVATAR_SHAPES.map(s => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => { setAvatarShape(s.id); updateProfile({ avatar_shape: s.id } as any); toast.success('Formato da foto atualizado'); refreshProfile(); }}
                        className={`flex flex-col items-center gap-1.5 p-2 rounded-xl transition ${avatarShape === s.id ? 'bg-foreground/10' : 'hover:bg-foreground/5'}`}
                        title={s.label}
                      >
                        <div className={`w-10 h-10 bg-foreground/80 ${avatarShapeClasses(s.id)}`} />
                        <span className="text-[9px] text-muted-foreground leading-tight text-center">{s.label.split(' ')[0]}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {settingsSub === 'indicador-online' && (
              <div className="space-y-4">
                <div className="rounded-2xl border border-border/40 bg-card p-4">
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { id: 'pill', label: 'Pill' },
                      { id: 'dot', label: 'Bolinha' },
                      { id: 'star', label: 'Estrela' },
                      { id: 'square', label: 'Quadrado' },
                      { id: 'rounded-square', label: 'Quad. arred.' },
                      { id: 'rectangle', label: 'Retângulo' },
                      { id: 'rounded-rectangle', label: 'Ret. arred.' },
                    ].map(s => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={async () => { setOnlineShape(s.id); try { await updateProfile({ online_indicator_shape: s.id } as any); toast.success('Indicador online atualizado'); await refreshProfile(); } catch { toast.error('Erro ao salvar indicador'); } }}
                        className={`flex flex-col items-center gap-1.5 p-2 rounded-xl transition ${onlineShape === s.id ? 'bg-foreground/10' : 'hover:bg-foreground/5'}`}
                        title={s.label}
                      >
                        {s.id === 'star' ? (
                          <span className="text-success text-lg leading-none">★</span>
                        ) : (
                          <span
                            className={`bg-success ${
                              s.id === 'dot' ? 'w-2 h-2 rounded-full' :
                              s.id === 'pill' ? 'w-4 h-2 rounded-full' :
                              s.id === 'square' ? 'w-2 h-2' :
                              s.id === 'rounded-square' ? 'w-2 h-2 rounded-[2px]' :
                              s.id === 'rectangle' ? 'w-4 h-2' :
                              'w-4 h-2 rounded-[3px]'
                            }`}
                          />
                        )}
                        <span className="text-[9px] text-muted-foreground text-center leading-tight">{s.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Sticky save bar for Cores */}
            {settingsSub === 'cores' && (
              <div className="fixed left-0 right-0 bottom-0 z-30 bg-background/95 backdrop-blur border-t border-border/40 px-4 py-3">
                <div className="max-w-lg mx-auto grid grid-cols-2 gap-2">
                  <Button variant="outline" className="rounded-2xl" onClick={() => { setVerifiedBadgeBgColor('#0F2B1A'); setVerifiedBadgeTextColor('#16A249'); setAdminBadgeBgColor('#082D0F'); setAdminBadgeBorderColor('#085A18'); setAdminBadgeTextColor('#05BD2A'); setThemeColor('#16A249'); }}>
                    <RotateCcw className="w-4 h-4 mr-2" />Padrão
                  </Button>
                  <Button className="rounded-2xl" onClick={async () => { await updateProfile({ verified_badge_color: verifiedBadgeBgColor, verified_badge_bg_color: verifiedBadgeBgColor, verified_badge_text_color: verifiedBadgeTextColor, verified_badge_text: verifiedBadgeText, admin_badge_color: adminBadgeBgColor, admin_badge_bg_color: adminBadgeBgColor, admin_badge_border_color: adminBadgeBorderColor, admin_badge_text_color: adminBadgeTextColor, theme_accent_color: themeColor, online_accent_color: themeColor } as any); toast.success('Cores salvas'); }}>
                    Salvar cores
                  </Button>
                </div>
              </div>
            )}

            {/* "Mais opções" subscreen */}
            {settingsSub === 'mais' && (
              <div className="space-y-3">
                <p className="text-[13px] text-muted-foreground px-1 mb-1">Encerrar sessão ou apagar sua conta permanentemente.</p>
                <SettingsGroup>
                  <SettingsRow icon={LogOut} label="Sair da minha conta" onClick={signOut} rightSlot={<span />} />
                </SettingsGroup>
                <SettingsGroup>
                  <SettingsRow icon={Trash2} label="Excluir a conta" destructive onClick={() => setShowDeleteConfirm(true)} rightSlot={<span />} />
                </SettingsGroup>
                <p className="text-[11px] text-muted-foreground text-center pt-4">A exclusão é permanente e não pode ser desfeita.</p>
              </div>
            )}

            {/* Senha e Segurança subscreen */}
            {settingsSub === 'senha' && (
              <div className="space-y-4">
                <div className="rounded-2xl border border-border/40 bg-card p-4 space-y-3">
                  <p className="text-[13px] font-bold">Alterar senha</p>
                  <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Nova senha (mín. 6 caracteres)" />
                  <Button onClick={handleChangePassword} className="w-full rounded-2xl">Salvar nova senha</Button>
                </div>
                <div className="rounded-2xl border border-border/40 bg-card p-4 space-y-3">
                  <p className="text-[13px] font-bold">Palavra-chave de recuperação</p>
                  <p className="text-[11px] text-muted-foreground">Usada para recuperar a conta sem e-mail.</p>
                  <Input value={recoveryKeyword} onChange={(e) => setRecoveryKeyword(e.target.value)} placeholder="Sua palavra-chave secreta" />
                  <Button variant="outline" className="w-full rounded-2xl" onClick={async () => { await updateProfile({ recovery_keyword: recoveryKeyword.trim() || null }); toast.success('Palavra-chave salva'); }}>Salvar palavra-chave</Button>
                </div>
                <div className="rounded-2xl border border-border/40 bg-card p-4 space-y-2">
                  <p className="text-[13px] font-bold">Segurança da conta</p>
                  <p className="text-[11px] text-muted-foreground">Email: {user.email || '—'}</p>
                  <p className="text-[11px] text-muted-foreground">Conta criada em {new Date(user.created_at).toLocaleDateString('pt-BR')}</p>
                </div>
              </div>
            )}

            {/* Selos subscreen */}
            {settingsSub === 'selos' && (
              <div className="space-y-4">
                <div className="rounded-2xl border border-border/40 bg-card p-4 space-y-3">
                  <p className="text-[13px] font-bold">Seus selos</p>
                  {myBadges.length === 0 ? (
                    <p className="text-[12px] text-muted-foreground">Você ainda não recebeu selos. Selos são enviados pelo ADM.</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {myBadges.map(b => b.badge && (
                        <span key={b.id} className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-secondary border border-border/40 text-[11px] font-semibold">
                          <img src={b.badge.image_url} alt={b.badge.name} className="w-4 h-4" /> {b.badge.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="rounded-2xl border border-border/40 bg-card p-4 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[13px] font-medium">Exibir selos na bio</span>
                    <Switch
                      checked={(profile as any)?.show_badges_in_bio !== false}
                      onCheckedChange={async (v) => { await updateProfile({ show_badges_in_bio: v } as any); refreshProfile(); }}
                    />
                  </div>
                  {isAdmin && (
                    <div className="flex items-center justify-between gap-2 pt-2 border-t border-border/30">
                      <span className="text-[13px] font-medium">Exibir selo de ADM no perfil</span>
                      <Switch
                        checked={(profile as any)?.show_admin_badge !== false}
                        onCheckedChange={async (v) => { await updateProfile({ show_admin_badge: v } as any); refreshProfile(); }}
                      />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Decoração — Bottom Sheet */}
      <Sheet open={decorPickerOpen} onOpenChange={setDecorPickerOpen}>
        <SheetContent side="bottom" className="rounded-t-[2rem] max-h-[80vh] overflow-y-auto bg-background border-border/40">
          <SheetHeader>
            <SheetTitle className="text-center">Decoração do Perfil</SheetTitle>
          </SheetHeader>
          <p className="text-[12px] text-muted-foreground text-center mt-1 mb-5">Escolha uma decoração para enquadrar sua foto.</p>
          <div className="grid grid-cols-3 gap-3 pb-6">
            <button
              onClick={async () => { await updateProfile({ profile_decoration_url: null }); toast.success('Decoração removida'); refreshProfile(); setDecorPickerOpen(false); }}
              className={`aspect-square rounded-2xl border ${!(profile as any)?.profile_decoration_url ? 'border-foreground' : 'border-border/40'} bg-secondary flex items-center justify-center text-[11px] text-muted-foreground`}
            >
              Nenhuma
            </button>
            {decorations.map(d => (
              <button
                key={d.id}
                onClick={() => { setDecorEditing({
                  url: d.image_url,
                  x: (profile as any)?.profile_decoration_position?.x ?? 25,
                  y: (profile as any)?.profile_decoration_position?.y ?? 25,
                  scale: (profile as any)?.profile_decoration_position?.scale ?? 0.8,
                }); setDecorPickerOpen(false); }}
                className={`relative aspect-square rounded-2xl border overflow-hidden ${(profile as any)?.profile_decoration_url === d.image_url ? 'border-foreground' : 'border-border/40'} bg-secondary`}
                title={d.name}
              >
                <img src={d.image_url} alt={d.name} className="w-full h-full object-contain" />
              </button>
            ))}
          </div>
          {decorations.length === 0 && <p className="text-[12px] text-muted-foreground text-center pb-4">Nenhuma decoração disponível ainda.</p>}
        </SheetContent>
      </Sheet>


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

      {/* Decoration positioning modal */}
      <Dialog open={!!decorEditing} onOpenChange={(o) => !o && setDecorEditing(null)}>
        <DialogContent className="bg-card border-border rounded-[2rem] max-w-md">
          <DialogHeader>
            <DialogTitle className="text-foreground text-center">Posicionar decoração</DialogTitle>
            <DialogDescription className="text-center">Ajuste a posição e o tamanho sobre sua foto</DialogDescription>
          </DialogHeader>
          {decorEditing && (
            <div className="space-y-4">
              <div className="relative w-44 h-44 mx-auto">
                <div className="w-44 h-44 rounded-full bg-secondary border border-border overflow-hidden">
                  {profile?.avatar_url ? <img src={profile.avatar_url} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><User className="w-16 h-16 text-muted-foreground" /></div>}
                </div>
                <span className="absolute bottom-2 right-2 w-5 h-5 rounded-full border-2 border-background z-10" style={{ backgroundColor: themeColor }} />
                <img
                  src={decorEditing.url}
                  alt=""
                  className="absolute pointer-events-none z-20"
                  style={{
                    width: '60%', height: '60%', left: '50%', top: '50%',
                    transform: `translate(calc(-50% + ${decorEditing.x}%), calc(-50% + ${decorEditing.y}%)) scale(${decorEditing.scale})`,
                  }}
                />
              </div>
              <div className="space-y-2">
                <div><label className="label-field">Horizontal: {decorEditing.x}%</label><input type="range" min="-60" max="60" value={decorEditing.x} onChange={e => setDecorEditing({ ...decorEditing, x: Number(e.target.value) })} className="w-full" /></div>
                <div><label className="label-field">Vertical: {decorEditing.y}%</label><input type="range" min="-60" max="60" value={decorEditing.y} onChange={e => setDecorEditing({ ...decorEditing, y: Number(e.target.value) })} className="w-full" /></div>
                <div><label className="label-field">Tamanho: {decorEditing.scale.toFixed(2)}x</label><input type="range" min="0.3" max="2" step="0.05" value={decorEditing.scale} onChange={e => setDecorEditing({ ...decorEditing, scale: Number(e.target.value) })} className="w-full" /></div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" className="rounded-2xl" onClick={() => setDecorEditing(null)}>Cancelar</Button>
                <Button className="rounded-2xl" onClick={async () => { await updateProfile({ profile_decoration_url: decorEditing.url, profile_decoration_position: { x: decorEditing.x, y: decorEditing.y, scale: decorEditing.scale } } as any); refreshProfile(); setDecorEditing(null); toast.success('Decoração aplicada'); }}>Salvar</Button>
              </div>
            </div>
          )}
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

      <Dialog open={walletOpen} onOpenChange={setWalletOpen}>
        <DialogContent className="bg-transparent border-0 shadow-none p-0 max-w-md">
          <DialogHeader className="sr-only"><DialogTitle>Carteira</DialogTitle></DialogHeader>
          <WalletCard />
        </DialogContent>
      </Dialog>

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
