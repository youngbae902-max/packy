import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, BadgeCheck, Heart, Package, Repeat2, User, Users, Disc3 } from 'lucide-react';
import { BottomNav } from '@/components/BottomNav';
import { PackCardV2 } from '@/components/PackCardV2';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { usePublicProfile } from '@/hooks/useSocial';
import { AuthModal } from '@/components/AuthModal';
import { useState } from 'react';

export default function PublicProfile() {
  const { userId } = useParams();
  const { user } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
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

  const displayName = profile?.artist_name || profile?.username || 'Usuário';
  const isOwner = (profile?.username || '').toLowerCase().replace(/^@/, '') === 'goat';
  const isSelf = user?.id === userId;

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
        <header className="flex items-center justify-between mb-6">
          <Link to="/" className="w-10 h-10 rounded-full bg-[hsl(0,0%,5%)] border border-border/50 flex items-center justify-center">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <span className="text-sm text-muted-foreground">Perfil</span>
          <div className="w-10" />
        </header>

        <section className="rounded-2xl border border-border/50 bg-[hsl(0,0%,4%)] p-5 mb-5">
          <div className="flex items-start gap-4">
            <Avatar className="w-20 h-20 border border-border/50">
              <AvatarImage src={profile.avatar_url || undefined} />
              <AvatarFallback><User className="w-8 h-8" /></AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <h1 className="text-xl font-black text-foreground truncate">{displayName}</h1>
                {isOwner && <BadgeCheck className="w-5 h-5 text-sky-400 fill-sky-400/20 shrink-0" />}
              </div>
              {profile.username && <p className="text-sm text-muted-foreground">@{profile.username}</p>}
              <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                <span><b className="text-foreground">{followersCount}</b> seguidores</span>
                <span><b className="text-foreground">{followingCount}</b> seguindo</span>
              </div>
            </div>
          </div>

          {profile.bio && <p className="text-sm text-muted-foreground mt-4 whitespace-pre-wrap">{profile.bio}</p>}

          {!isSelf && (
            <button
              onClick={handleFollow}
              className={`w-full mt-4 rounded-full py-2.5 text-sm font-bold transition ${
                isFollowing ? 'bg-[hsl(0,0%,8%)] border border-border/60 text-foreground' : 'bg-foreground text-background'
              }`}
            >
              {isFollowing ? 'Seguindo' : 'Seguir'}
            </button>
          )}
        </section>

        {albums.length > 0 && (
          <section className="mb-6">
            <div className="flex items-center gap-2 mb-3"><Disc3 className="w-4 h-4" /><h2 className="text-lg font-black">Álbuns de packs</h2></div>
            <div className="grid grid-cols-2 gap-3">
              {albums.map(album => (
                <div key={album.id} className="rounded-xl border border-border/40 bg-[hsl(0,0%,4%)] overflow-hidden">
                  <div className="aspect-square bg-[hsl(0,0%,7%)]">
                    {album.cover_url && <img src={album.cover_url} alt={album.title} className="w-full h-full object-cover" />}
                  </div>
                  <div className="p-2"><p className="text-sm font-bold truncate">{album.title}</p></div>
                </div>
              ))}
            </div>
          </section>
        )}

        <ProfileSection title="Packs postados" icon={<Package className="w-4 h-4" />} empty="Nenhum pack postado">
          {packs.map(pack => <PackCardV2 key={pack.id} pack={pack} />)}
        </ProfileSection>

        <ProfileSection title="Republicações" icon={<Repeat2 className="w-4 h-4" />} empty="Nenhuma republicação">
          {repostedPacks.map(pack => <PackCardV2 key={pack.id} pack={pack} />)}
        </ProfileSection>

        <ProfileSection title="Packs curtidos" icon={<Heart className="w-4 h-4" />} empty="Nenhum pack curtido">
          {likedPacks.map(pack => <PackCardV2 key={pack.id} pack={pack} />)}
        </ProfileSection>
      </div>
      <BottomNav />
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </div>
  );
}

function ProfileSection({ title, icon, empty, children }: { title: string; icon: React.ReactNode; empty: string; children: React.ReactNode }) {
  const hasChildren = Array.isArray(children) ? children.length > 0 : !!children;
  return (
    <section className="mb-6">
      <div className="flex items-center gap-2 mb-3">{icon}<h2 className="text-lg font-black">{title}</h2></div>
      <div className="space-y-4">
        {hasChildren ? children : <p className="text-sm text-muted-foreground rounded-xl border border-border/40 bg-[hsl(0,0%,4%)] p-4">{empty}</p>}
      </div>
    </section>
  );
}
