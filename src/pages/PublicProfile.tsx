import { ChevronLeft, Settings, User, Shield, Instagram, Youtube, Package, Heart, Disc3 } from 'lucide-react';
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
  const { profile, packs, likedPacks, albums, followersCount, followingCount, isFollowing, toggleFollow, isLoading } = usePublicProfile(userId);
  const { badges: userBadges } = useUserAdminBadges(userId);

  const displayName = profile?.artist_name || profile?.username || 'Usuário';
  const isOwner = (profile?.username || '').toLowerCase().replace(/^@/, '') === 'goat';
  const isSelf = user?.id === userId;
  const accent = profile?.online_accent_color || profile?.theme_accent_color || 'hsl(var(--primary))';
  const bio = profile?.bio || '';
  const shownBio = bio.length > 180 && !bioExpanded ? `${bio.slice(0, 180).trim()}...` : bio;
  const currentPacks = useMemo(() => activeTab === 'likes' ? likedPacks : packs, [activeTab, likedPacks, packs]);

  const handleFollow = async () => {
    if (!user) { setShowAuthModal(true); return; }
    await toggleFollow();
  };

  const SpotifyIcon = () => <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2z"/></svg>;
  const SoundCloudIcon = () => <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M9.5 8.2c-.4 0-.8.1-1.1.3C8 6.5 6.3 5 4.2 5c-.3 0-.6 0-.9.1C2.4 5.4 2 6 2 7v9.5h14.8c2.9 0 5.2-2.3 5.2-5.2s-2.3-5.2-5.2-5.2c-.7 0-1.4.1-2 .4-1-1.8-3-3-5.3-3.3z"/></svg>;

  const socials = [
    { url: profile?.instagram_url, Icon: Instagram },
    { url: profile?.spotify_url, Icon: SpotifyIcon },
    { url: profile?.soundcloud_url, Icon: SoundCloudIcon },
    { url: profile?.youtube_url, Icon: Youtube },
  ].filter(x => x.url);

  if (isLoading) return <div className="min-h-screen bg-background flex items-center justify-center text-muted-foreground">Carregando perfil...</div>;

  if (!profile) return (
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-xl mx-auto px-5 pt-6"><Link to="/" className="text-muted-foreground"><ChevronLeft /></Link><p className="text-center mt-12 text-muted-foreground">Perfil não encontrado</p></div>
      <BottomNav />
    </div>
  );

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-xl mx-auto">
        <section className="relative">
          <div className="h-40 bg-gradient-to-br from-secondary via-secondary/60 to-background overflow-hidden">
            <div className="absolute inset-0 opacity-30" style={{ background: `radial-gradient(circle at 70% 20%, ${accent}, transparent 55%)` }} />
          </div>

          <div className="absolute top-4 left-4 right-4 flex justify-between">
            <Link to="/" className="w-10 h-10 rounded-full bg-background/70 backdrop-blur flex items-center justify-center"><ChevronLeft className="w-5 h-5" /></Link>
            {isSelf && <Link to="/conta?settings=1" className="w-10 h-10 rounded-full bg-background/70 backdrop-blur flex items-center justify-center"><Settings className="w-4 h-4" /></Link>}
          </div>

          <div className="px-5 -mt-12 relative">
            <div className="flex items-end justify-between">
              <div className="relative w-24 h-24 shrink-0">
                <div className={`w-24 h-24 bg-secondary border-4 border-background overflow-hidden ${avatarShapeClasses((profile as any)?.avatar_shape)}`}>
                  {profile.avatar_url ? <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><User className="w-9 h-9 text-muted-foreground" /></div>}
                </div>
                <span className="absolute right-0 bottom-1 w-4 h-4 rounded-full border-[3px] border-background" style={{ backgroundColor: accent }} />
                {(profile as any)?.profile_decoration_url && (() => {
                  const p = (profile as any).profile_decoration_position || {};
                  return <img src={(profile as any).profile_decoration_url} alt="" className="absolute z-20 pointer-events-none w-16 h-16 left-1/2 top-1/2" style={{ transform: `translate(calc(-50% + ${p.x ?? 25}%),calc(-50% + ${p.y ?? 25}%)) scale(${p.scale ?? .8})` }} />;
                })()}
              </div>

              {!isSelf && <button onClick={handleFollow} className="mb-1 px-7 py-2.5 rounded-xl text-sm font-bold text-background" style={{ backgroundColor: isFollowing ? 'hsl(var(--foreground))' : accent }}>{isFollowing ? 'Seguindo' : 'Seguir'}</button>}
            </div>

            <div className="pt-4">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black tracking-tight">{displayName}</h1>
                {profile.has_spotify_badge && <span className="text-[10px] font-bold px-2 py-1 rounded-md" style={{ color: '#16A249', backgroundColor: '#0F2B1A' }}>✓</span>}
              </div>
              {profile.username && <p className="text-sm text-muted-foreground mt-0.5">@{profile.username}</p>}

              {isOwner && ((profile as any)?.show_admin_badge !== false) && <span className="inline-flex items-center gap-1 mt-3 px-2 py-1 rounded-md text-[10px] font-bold border" style={{ color: '#05BD2A', borderColor: '#085A18', backgroundColor: '#082D0F' }}><Shield className="w-3 h-3" /> ADM</span>}

              {bio && <p className="text-sm leading-5 text-muted-foreground mt-4 max-w-md"><EmojiText text={shownBio} />{bio.length > 180 && <button onClick={() => setBioExpanded(!bioExpanded)} className="ml-1 font-semibold" style={{ color: accent }}>{bioExpanded ? 'menos' : 'mais'}</button>}</p>}

              {socials.length > 0 && <div className="flex gap-2 mt-4">{socials.map((s, i) => <a key={i} href={s.url || '#'} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-lg border border-border/60 flex items-center justify-center text-muted-foreground hover:text-foreground"><s.Icon /></a>)}</div>}

              {((profile as any).show_badges_in_bio !== false) && userBadges.length > 0 && <div className="flex flex-wrap gap-1.5 mt-4">{userBadges.map(b => b.badge && <span key={b.id} className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-secondary/60 border border-border/40 text-[10px] font-semibold"><img src={b.badge.image_url} className="w-3.5 h-3.5" />{b.badge.name}</span>)}</div>}
            </div>

            <div className="grid grid-cols-3 mt-6 border-y border-border/50">
              <div className="py-4"><p className="text-xl font-black">{packs.length}</p><p className="text-xs text-muted-foreground">Packs</p></div>
              <div className="py-4 border-x border-border/50 text-center"><p className="text-xl font-black">{followersCount}</p><p className="text-xs text-muted-foreground">Seguidores</p></div>
              <div className="py-4 text-right"><p className="text-xl font-black">{followingCount}</p><p className="text-xs text-muted-foreground">Seguindo</p></div>
            </div>
          </div>
        </section>

        {albums.length > 0 && <section className="px-5 mt-7">
          <div className="flex items-center gap-2 mb-3"><Disc3 className="w-4 h-4 text-muted-foreground" /><h2 className="text-sm font-bold">Álbuns</h2></div>
          <div className="flex gap-3 overflow-x-auto scrollbar-hide">{albums.map(a => <div key={a.id} className="w-24 shrink-0"><div className="w-24 h-24 rounded-lg bg-secondary overflow-hidden">{a.cover_url && <img src={a.cover_url} alt={a.title} className="w-full h-full object-cover" />}</div><p className="mt-2 text-xs font-semibold truncate">{a.title}</p></div>)}</div>
        </section>}

        <section className="mt-7">
          <div className="px-5 border-b border-border/50 flex gap-6">
            <button onClick={() => setActiveTab('packs')} className={`relative pb-3 text-sm font-bold ${activeTab === 'packs' ? 'text-foreground' : 'text-muted-foreground'}`}>Packs{activeTab === 'packs' && <span className="absolute -bottom-px left-0 right-0 h-0.5" style={{ backgroundColor: accent }} />}</button>
            <button onClick={() => setActiveTab('likes')} className={`relative pb-3 text-sm font-bold ${activeTab === 'likes' ? 'text-foreground' : 'text-muted-foreground'}`}>Favoritos{activeTab === 'likes' && <span className="absolute -bottom-px left-0 right-0 h-0.5" style={{ backgroundColor: accent }} />}</button>
          </div>
          <div className="px-5 divide-y divide-border/30">
            {currentPacks.length > 0 ? currentPacks.map(pack => <ProfilePackRow key={pack.id} pack={pack} />) : <p className="text-center text-muted-foreground py-12 text-sm">Nada por aqui ainda</p>}
          </div>
        </section>
      </div>
      <BottomNav />
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </div>
  );
}
