import { ChevronLeft, Disc3, Settings, User, Shield, Instagram, Youtube, Package, Heart } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { BottomNav } from '@/components/BottomNav';
import { ProfilePackRow } from '@/components/ProfilePackRow';
import { useAuth } from '@/contexts/AuthContext';
import { usePublicProfile } from '@/hooks/useSocial';
import { AuthModal } from '@/components/AuthModal';
import { useMemo, useState } from 'react';
import { EmojiText } from '@/components/EmojiText';
import { useUserAdminBadges } from '@/hooks/useAdminBadges';
import { avatarShapeClasses } from '@/lib/avatarShape';

export default function PublicProfile() {
  const { userId } = useParams();
  const { user } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [bioExpanded, setBioExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<'packs' | 'likes'>('packs');
  const {
    profile, packs, likedPacks, albums, followersCount, followingCount,
    isFollowing, toggleFollow, isLoading,
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
  const BIO_LIMIT = 240;
  const shouldClampBio = bio.length > BIO_LIMIT;
  const shownBio = shouldClampBio && !bioExpanded ? `${bio.slice(0, BIO_LIMIT).trim()}...` : bio;

  const currentPacks = useMemo(() => activeTab === 'likes' ? likedPacks : packs, [activeTab, likedPacks, packs]);

  const handleFollow = async () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    await toggleFollow();
  };

  const SpotifyIcon = () => (
    <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
    </svg>
  );

  const SoundCloudIcon = () => (
    <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="currentColor">
      <path d="M1.175 12.225c-.051 0-.094.046-.101.1l-.233 2.154.233 2.105c.007.058.05.098.101.098.05 0 .09-.04.099-.098l.255-2.105-.27-2.154c-.009-.06-.052-.1-.084-.1zm.957-.499c-.061 0-.107.048-.117.109l-.205 2.453.205 2.365c.01.061.056.109.117.109.06 0 .107-.048.117-.109l.235-2.365-.235-2.453c-.01-.061-.057-.109-.117-.109zm.943-.109c-.073 0-.126.059-.133.125l-.178 2.562.178 2.453c.007.066.06.125.133.125.073 0 .126-.059.133-.125l.205-2.453-.205-2.562c-.007-.066-.06-.125-.133-.125zm.937-.287c-.08 0-.14.063-.15.143l-.163 2.85.163 2.453c.01.08.07.143.15.143.08 0 .14-.063.15-.143l.19-2.453-.19-2.85c-.01-.08-.07-.143-.15-.143zm1.892-.252c-.102 0-.176.076-.185.176l-.117 3.354.117 2.416c.009.1.083.176.185.176.102 0 .176-.076.185-.176l.14-2.416-.14-3.354c-.009-.1-.083-.176-.185-.176zm1.906-.144c-.11 0-.19.08-.199.19l-.09 3.498.09 2.378c.009.11.089.19.199.19.11 0 .19-.08.199-.19l.107-2.378-.107-3.498c-.009-.11-.089-.19-.199-.19zm.95-.144c-.122 0-.21.088-.22.208l-.068 3.642.068 2.341c.01.12.098.208.22.208.122 0 .21-.088.22-.208l.08-2.341-.08-3.642c-.01-.12-.098-.208-.22-.208zm1.896.496c-.182 0-.326.144-.326.326v7.412c0 .182.144.326.326.326h7.412c1.8 0 3.262-1.462 3.262-3.262s-1.462-3.262-3.262-3.262c-.512 0-.994.118-1.424.326-.26-2.006-1.968-3.56-4.048-3.56-.598 0-1.168.13-1.678.364-.154.07-.194.144-.194.28v5.55z"/>
    </svg>
  );

  const socialLinks = [
    { url: profile?.instagram_url, Icon: Instagram, label: 'Instagram' },
    { url: profile?.spotify_url, Icon: SpotifyIcon, label: 'Spotify' },
    { url: profile?.soundcloud_url, Icon: SoundCloudIcon, label: 'SoundCloud' },
    { url: profile?.youtube_url, Icon: Youtube, label: 'YouTube' },
  ].filter(link => link.url);

  if (isLoading) return <div className="min-h-screen bg-background flex items-center justify-center text-muted-foreground">Carregando perfil...</div>;

  if (!profile) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <div className="max-w-lg mx-auto px-5 pt-6">
          <Link to="/" className="inline-flex items-center text-muted-foreground mb-10"><ChevronLeft className="w-5 h-5" /></Link>
          <p className="text-center text-muted-foreground">Perfil não encontrado</p>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 h-64 bg-gradient-to-b from-secondary via-secondary/60 to-background pointer-events-none" />
        <div className="relative max-w-lg mx-auto px-5 pt-5">
          <div className="flex items-center justify-between">
            <Link to="/" className="w-10 h-10 flex items-center justify-center text-foreground" aria-label="Voltar">
              <ChevronLeft className="w-5 h-5" />
            </Link>
            {isSelf ? (
              <Link to="/conta?settings=1" className="w-10 h-10 flex items-center justify-center text-foreground" aria-label="Configurações">
                <Settings className="w-[18px] h-[18px]" />
              </Link>
            ) : <div className="w-10" />}
          </div>

          <div className="pt-8 pb-8 text-center">
            <div className="relative mx-auto w-[104px] h-[104px] mb-5">
              <div className={`w-[104px] h-[104px] bg-secondary border border-border overflow-hidden ${avatarShapeClasses((profile as any)?.avatar_shape)}`}>
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center"><User className="w-10 h-10 text-muted-foreground" /></div>
                )}
              </div>
              <span
                className={`absolute bottom-1 right-0 border-[3px] border-background ${(profile as any)?.online_indicator_shape === 'dot' ? 'w-4 h-4 rounded-full' : 'w-5 h-3 rounded-full'}`}
                style={{ backgroundColor: accent }}
              />
              {(profile as any)?.profile_decoration_url && (() => {
                const pos = (profile as any)?.profile_decoration_position || {};
                return <img src={(profile as any).profile_decoration_url} alt="" aria-hidden className="absolute pointer-events-none z-20 w-[65%] h-[65%] left-1/2 top-1/2" style={{ transform: `translate(calc(-50% + ${pos.x ?? 25}%), calc(-50% + ${pos.y ?? 25}%)) scale(${pos.scale ?? 0.8})` }} />;
              })()}
            </div>

            <div className="flex items-center justify-center gap-2">
              <h1 className="text-[25px] leading-tight font-black tracking-tight">{displayName}</h1>
              {profile?.has_spotify_badge && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-[10px] font-bold" style={{ color: verifiedText, backgroundColor: verifiedBg }}>✓</span>
              )}
            </div>
            {profile?.username && <p className="mt-1 text-sm text-muted-foreground">@{profile.username}</p>}

            {isOwner && ((profile as any)?.show_admin_badge !== false) && (
              <span className="inline-flex items-center gap-1 mt-3 px-2.5 py-1 rounded-full text-[10px] font-bold border" style={{ color: adminText, borderColor: adminBorder, backgroundColor: adminBg }}>
                <Shield className="w-3 h-3" /> ADM
              </span>
            )}

            {bio && (
              <div className="mx-auto mt-4 max-w-[330px] text-sm leading-5 text-muted-foreground">
                <EmojiText text={shownBio} />
                {shouldClampBio && <button onClick={() => setBioExpanded(!bioExpanded)} className="ml-1 font-semibold" style={{ color: accent }}>{bioExpanded ? 'menos' : 'mais'}</button>}
              </div>
            )}

            {socialLinks.length > 0 && (
              <div className="flex justify-center gap-2.5 mt-5">
                {socialLinks.map((link, i) => (
                  <a key={i} href={link.url || '#'} target="_blank" rel="noopener noreferrer" aria-label={link.label}
                    className="w-9 h-9 rounded-full bg-secondary/70 border border-border/60 flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-border transition-colors">
                    <link.Icon />
                  </a>
                ))}
              </div>
            )}

            {((profile as any).show_badges_in_bio !== false) && userBadges.length > 0 && (
              <div className="flex flex-wrap justify-center gap-1.5 mt-4">
                {userBadges.map(b => b.badge && (
                  <span key={b.id} title={b.badge.name} className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-secondary/60 border border-border/50 text-[10px] font-semibold">
                    <img src={b.badge.image_url} alt={b.badge.name} className="w-3.5 h-3.5" />{b.badge.name}
                  </span>
                ))}
              </div>
            )}

            {!isSelf && (
              <button onClick={handleFollow}
                className="mt-5 min-w-[150px] rounded-full py-2.5 px-6 text-sm font-bold text-background transition-transform active:scale-95"
                style={{ backgroundColor: isFollowing ? 'hsl(var(--foreground))' : accent }}>
                {isFollowing ? 'Seguindo' : 'Seguir'}
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-5">
        <div className="grid grid-cols-3 border-y border-border/40 py-4 mb-6">
          <div className="text-center"><p className="text-lg font-black">{packs.length}</p><p className="text-[11px] text-muted-foreground">Packs</p></div>
          <div className="text-center border-x border-border/40"><p className="text-lg font-black">{followersCount}</p><p className="text-[11px] text-muted-foreground">Seguidores</p></div>
          <div className="text-center"><p className="text-lg font-black">{followingCount}</p><p className="text-[11px] text-muted-foreground">Seguindo</p></div>
        </div>

        {albums.length > 0 && (
          <section className="mb-7">
            <div className="flex items-center gap-2 mb-3">
              <Disc3 className="w-4 h-4 text-muted-foreground" />
              <h2 className="text-sm font-bold">Álbuns de packs</h2>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
              {albums.map(album => (
                <div key={album.id} className="w-28 shrink-0">
                  <div className="w-28 h-28 rounded-xl bg-secondary overflow-hidden border border-border/50">
                    {album.cover_url && <img src={album.cover_url} alt={album.title} className="w-full h-full object-cover" />}
                  </div>
                  <p className="text-xs font-semibold truncate mt-2">{album.title}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        <div className="sticky top-0 z-20 -mx-5 px-5 bg-background/95 backdrop-blur border-b border-border/40">
          <div className="flex items-center gap-7 h-12">
            <button onClick={() => setActiveTab('packs')} className={`relative h-full text-sm font-bold ${activeTab === 'packs' ? 'text-foreground' : 'text-muted-foreground'}`}>
              <span className="inline-flex items-center gap-2"><Package className="w-4 h-4" />Packs</span>
              {activeTab === 'packs' && <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full" style={{ backgroundColor: accent }} />}
            </button>
            <button onClick={() => setActiveTab('likes')} className={`relative h-full text-sm font-bold ${activeTab === 'likes' ? 'text-foreground' : 'text-muted-foreground'}`}>
              <span className="inline-flex items-center gap-2"><Heart className="w-4 h-4" />Favoritos</span>
              {activeTab === 'likes' && <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full" style={{ backgroundColor: accent }} />}
            </button>
          </div>
        </div>

        <section className="divide-y divide-border/30">
          {currentPacks.length > 0 ? currentPacks.map(pack => <ProfilePackRow key={pack.id} pack={pack} />) : (
            <p className="text-center text-muted-foreground py-12 text-sm">Nada por aqui ainda</p>
          )}
        </section>
      </main>

      <BottomNav />
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </div>
  );
}
