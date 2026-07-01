import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, BadgeCheck, Disc3, Settings, User, Shield, Instagram, Youtube } from 'lucide-react';
import { BottomNav } from '@/components/BottomNav';
import { ProfilePackRow } from '@/components/ProfilePackRow';
import { useAuth } from '@/contexts/AuthContext';
import { usePublicProfile } from '@/hooks/useSocial';
import { AuthModal } from '@/components/AuthModal';
import { useMemo, useState } from 'react';
import { EmojiText } from '@/components/EmojiText';
import { useUserAdminBadges } from '@/hooks/useAdminBadges';
import { avatarShapeClasses } from '@/lib/avatarShape';
import { Badge } from '@/components/ui/badge';

export default function PublicProfile() {
  const { userId } = useParams();
  const { user } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [bioExpanded, setBioExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<'packs' | 'reposts' | 'likes'>('packs');
  const {
    profile,
    packs,
    likedPacks,
    repostedPacks,
    albums,
    followersCount,
    followingCount,
    isFollowing,
    toggleFollow,
    isLoading,
  } = usePublicProfile(userId);
  const { badges: userBadges } = useUserAdminBadges(userId);

  const displayName = profile?.artist_name || profile?.username || 'Usuário';
  const isOwner = (profile?.username || '').toLowerCase().replace(/^@/, '') === 'goat';
  const isSelf = user?.id === userId;
  const accent = profile?.online_accent_color || profile?.theme_accent_color || 'hsl(var(--primary))';
  const verifiedBg = profile?.verified_badge_bg_color || profile?.verified_badge_color || '#0F2B1A';
  const verifiedText = profile?.verified_badge_text_color || '#16A249';
  const adminBg = profile?.admin_badge_bg_color || profile?.admin_badge_color || '#082D0F';
  const adminBorder = profile?.admin_badge_border_color || '#085A18';
  const adminText = profile?.admin_badge_text_color || '#05BD2A';
  const bio = profile?.bio || '';
  const shouldClampBio = bio.length > BIO_LIMIT;
  const shownBio = shouldClampBio && !bioExpanded ? `${bio.slice(0, BIO_LIMIT).trim()}...` : bio;

  const currentPacks = useMemo(() => {
    if (activeTab === 'reposts') return repostedPacks;
    if (activeTab === 'likes') return likedPacks;
    return packs;
  }, [activeTab, likedPacks, packs, repostedPacks]);

  const handleFollow = async () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    await toggleFollow();
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

  if (isLoading) {
    return <div className="min-h-screen bg-background flex items-center justify-center text-muted-foreground">Carregando perfil...</div>;
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <div className="max-w-lg mx-auto px-4 pt-6">
          <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground mb-8"><ArrowLeft className="w-4 h-4" /> Voltar</Link>
          <p className="text-center text-muted-foreground">Perfil não encontrado</p>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header matching Conta.tsx */}
      <div className="bg-gradient-to-b from-secondary to-background pt-8 pb-16 px-4">
        <div className="max-w-lg mx-auto">
          <div className="flex justify-between items-center mb-8">
            <Link to="/" className="w-11 h-11 flex items-center justify-center text-foreground hover:opacity-80 transition-opacity">
              <ArrowLeft className="w-6 h-6" />
            </Link>
            {isSelf ? (
              <Link to="/conta?settings=1" className="w-11 h-11 flex items-center justify-center text-foreground hover:opacity-80 transition-opacity" aria-label="Configurações">
                <Settings className="w-5 h-5" />
              </Link>
            ) : <div className="w-11" />}
          </div>

          {/* Profile Card */}
          <div className="flex flex-col items-center text-center">
            {/* Avatar */}
            <div className="relative mb-4 w-24 h-24">
              <div className={`w-24 h-24 bg-secondary border-2 border-border overflow-hidden block ${avatarShapeClasses((profile as any)?.avatar_shape)}`}>
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <User className="w-10 h-10 text-muted-foreground" />
                  </div>
                )}
              </div>
              <span 
                className={`absolute -bottom-0.5 right-0 border-2 border-background ${
                  (profile as any)?.online_indicator_shape === 'dot' ? 'w-3 h-3 rounded-full' :
                  (profile as any)?.online_indicator_shape === 'pill' ? 'w-5 h-2.5 rounded-full' :
                  (profile as any)?.online_indicator_shape === 'square' ? 'w-3 h-3' :
                  (profile as any)?.online_indicator_shape === 'rounded-square' ? 'w-3 h-3 rounded-[3px]' :
                  (profile as any)?.online_indicator_shape === 'rectangle' ? 'w-5 h-2.5' :
                  'w-5 h-2.5 rounded-[4px]'
                }`}
                style={{ backgroundColor: accent }} 
              />
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
            </div>

            {/* Name & Username */}
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-xl font-bold text-foreground">{displayName}</h2>
              {profile?.has_spotify_badge && (
                <div
                  className={`flex items-center gap-1 px-2 py-0.5 rounded-full ${(profile as any)?.verified_rgb ? 'badge-rgb' : ''}`}
                  style={(profile as any)?.verified_rgb ? undefined : { color: verifiedText, backgroundColor: verifiedBg }}
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
                  </svg>
                  <span className="text-xs font-medium">{(profile as any).verified_badge_text || 'Verificado'}</span>
                </div>
              )}
            </div>
            
            {profile?.username && (
              <p className="text-sm text-muted-foreground mb-3">@{profile.username}</p>
            )}

            {/* Badges */}
            <div className="flex gap-2 mb-4">
              {isOwner && ((profile as any)?.show_admin_badge !== false) && (
                <Badge className="border gap-1" style={{ color: adminText, borderColor: adminBorder, backgroundColor: adminBg }}>
                  <Shield className="w-3 h-3" />
                  ADM
                </Badge>
              )}
            </div>

            {/* Bio */}
            {bio && (
              <p className="text-sm text-muted-foreground max-w-xs mb-4 whitespace-pre-wrap">
                <EmojiText text={shownBio} />
                {shouldClampBio && (
                  <button onClick={() => setBioExpanded(!bioExpanded)} className="ml-1 font-bold text-xs" style={{ color: accent }}>
                    {bioExpanded ? 'mostrar menos' : 'Exibir mais'}
                  </button>
                )}
              </p>
            )}

            {/* Social Links */}
            {socialLinks.length > 0 && (
              <div className="flex gap-3 mb-6">
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

            {/* Custom Badges display in bio */}
            {((profile as any).show_badges_in_bio !== false) && userBadges.length > 0 && (
              <div className="flex flex-wrap gap-1.5 justify-center mb-4">
                {userBadges.map(b => b.badge && (
                  <span key={b.id} title={b.badge.name} className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-secondary border border-border/40 text-[11px] font-semibold">
                    <img src={b.badge.image_url} alt={b.badge.name} className="w-3.5 h-3.5" />
                    {b.badge.name}
                  </span>
                ))}
              </div>
            )}

            {!isSelf && (
              <button
                onClick={handleFollow}
                className="w-full max-w-[200px] rounded-full py-2.5 text-sm font-bold text-background shadow-lg transition-transform active:scale-95"
                style={{ backgroundColor: isFollowing ? 'hsl(var(--foreground))' : accent }}
              >
                {isFollowing ? 'Seguindo' : 'Seguir'}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 -mt-8">
        <div className="grid grid-cols-3 gap-2 mb-6 text-center">
          <div><p className="text-xl font-black text-foreground">{packs.length}</p><p className="text-xs text-muted-foreground">Enviados</p></div>
          <div><p className="text-xl font-black text-foreground">{followersCount}</p><p className="text-xs text-muted-foreground">Seguidores</p></div>
          <div><p className="text-xl font-black text-foreground">{followingCount}</p><p className="text-xs text-muted-foreground">Seguindo</p></div>
        </div>

        {albums.length > 0 && (
          <section className="mb-8">
            <div className="flex items-center gap-2 mb-3"><Disc3 className="w-5 h-5" /><h2 className="text-2xl font-black">Álbuns de packs</h2></div>
            <div className="space-y-2 divide-y divide-border/30">
              {albums.map(album => (
                <div key={album.id} className="flex items-center gap-3 py-2.5">
                  <div className="w-14 h-14 rounded-lg bg-[hsl(0,0%,7%)] overflow-hidden border border-border/40">{album.cover_url && <img src={album.cover_url} alt={album.title} className="w-full h-full object-cover" />}</div>
                  <div className="min-w-0"><p className="text-sm font-bold truncate">{album.title}</p><p className="text-xs text-muted-foreground truncate">Álbum de packs</p></div>
                </div>
              ))}
            </div>
          </section>
        )}

        <div className="sticky top-0 z-20 bg-background/95 backdrop-blur border-b border-border/40 mb-3">
          <div className="grid grid-cols-3 gap-1 py-2">
            {[
              { id: 'packs', label: 'Packs principais' },
              { id: 'reposts', label: 'Repostados' },
              { id: 'likes', label: 'Packs curtidos' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`py-2 text-xs font-black rounded-full transition ${activeTab === tab.id ? 'text-background' : 'text-muted-foreground'}`}
                style={activeTab === tab.id ? { backgroundColor: accent } : undefined}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <section className="divide-y divide-border/30">
          {currentPacks.length > 0 ? currentPacks.map(pack => <ProfilePackRow key={pack.id} pack={pack} />) : (
            <p className="text-center text-muted-foreground py-10">Nada por aqui ainda</p>
          )}
        </section>
      </div>
      <BottomNav />
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </div>
  );
}
