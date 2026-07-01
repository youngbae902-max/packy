import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, BadgeCheck, Disc3, Settings, User, Users } from 'lucide-react';
import { BottomNav } from '@/components/BottomNav';
import { ProfilePackRow } from '@/components/ProfilePackRow';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { usePublicProfile } from '@/hooks/useSocial';
import { AuthModal } from '@/components/AuthModal';
import { useMemo, useState } from 'react';
import { EmojiText } from '@/components/EmojiText';
import { useUserAdminBadges } from '@/hooks/useAdminBadges';
import { avatarShapeClasses } from '@/lib/avatarShape';

const BIO_LIMIT = 115;

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
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-lg mx-auto px-4 pt-6">
        <header className="flex items-center justify-between mb-8">
          <Link to="/" className="w-12 h-12 rounded-full bg-[hsl(0,0%,12%)] flex items-center justify-center">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          {isSelf ? (
            <Link to="/conta?settings=1" className="inline-flex items-center gap-2 rounded-full bg-[hsl(0,0%,12%)] px-4 py-2 text-sm font-bold">
              <Settings className="w-4 h-4" /> Configurações
            </Link>
          ) : <div className="w-12" />}
        </header>

        <section className="mb-8 flex flex-col items-center text-center">
          <div className="relative w-28 h-28 mb-5">
            <div className={`absolute inset-[-5px] border-4 ${avatarShapeClasses((profile as any)?.avatar_shape)}`} style={{ borderColor: accent, opacity: 0.45 }} />
            <Avatar className={`w-28 h-28 border border-border/50 ${avatarShapeClasses((profile as any)?.avatar_shape)}`}>
              <AvatarImage src={profile.avatar_url || undefined} />
              <AvatarFallback><User className="w-14 h-14" /></AvatarFallback>
            </Avatar>
            <span className="absolute -bottom-0.5 right-2 rounded-full border-[3px] border-background z-10" style={{ backgroundColor: accent, width: '1.5rem', height: '0.65rem' }} />
            {(profile as any).profile_decoration_url && (() => {
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
                    width: '60%', height: '60%', left: '50%', top: '50%',
                    transform: `translate(calc(-50% + ${x}%), calc(-50% + ${y}%)) scale(${scale})`,
                  }}
                />
              );
            })()}
          </div>

          <div className="flex items-center justify-center gap-2 mb-1 flex-wrap">
            <h1 className="text-2xl font-black text-foreground leading-none">{displayName}</h1>
            {profile.has_spotify_badge && (
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-black ${(profile as any)?.verified_rgb ? 'badge-rgb' : ''}`}
                style={(profile as any)?.verified_rgb ? undefined : { color: verifiedText, backgroundColor: verifiedBg }}
              >
                <BadgeCheck className="w-3.5 h-3.5" /> Verificado
              </span>
            )}
            {isOwner && ((profile as any)?.show_admin_badge !== false) && <span className="inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[11px] font-black" style={{ color: adminText, backgroundColor: adminBg, borderColor: adminBorder }}><BadgeCheck className="w-3.5 h-3.5" /> ADM</span>}
          </div>
          {profile.username && <p className="text-lg text-muted-foreground mb-3">@{profile.username}</p>}

          <div className="flex items-center gap-4 text-base text-muted-foreground mb-7">
            <span><b className="text-foreground">{packs.length}</b> Enviados</span>
            <span><b className="text-foreground">{followersCount}</b> Seguidores</span>
            <span><b className="text-foreground">{followingCount}</b> Seguindo</span>
          </div>

          {!isSelf && (
            <button
              onClick={handleFollow}
              className="rounded-full px-7 py-3 text-sm font-black text-background shadow-lg mb-7"
              style={{ backgroundColor: isFollowing ? 'hsl(var(--foreground) / 0.9)' : accent }}
            >
              {isFollowing ? 'Seguindo' : 'Seguir'}
            </button>
          )}

          {bio && (
            <p className="text-lg text-foreground/90 leading-snug whitespace-pre-wrap mb-2">
              <EmojiText text={shownBio} />
              {shouldClampBio && (
                <button onClick={() => setBioExpanded(!bioExpanded)} className="ml-1 font-bold" style={{ color: accent }}>
                  {bioExpanded ? 'mostrar menos' : 'Exibir mais'}
                </button>
              )}
            </p>
          )}

          {((profile as any).show_badges_in_bio !== false) && userBadges.length > 0 && (
            <div className="flex flex-wrap gap-1.5 justify-center mt-1">
              {userBadges.map(b => b.badge && (
                <span key={b.id} title={b.badge.name} className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-secondary border border-border/40 text-[11px] font-semibold">
                  <img src={b.badge.image_url} alt={b.badge.name} className="w-3.5 h-3.5" />
                  {b.badge.name}
                </span>
              ))}
            </div>
          )}
        </section>

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
