import { Link } from 'react-router-dom';
import { User, Plus } from 'lucide-react';

export interface Creator {
  user_id: string;
  username: string | null;
  artist_name: string | null;
  avatar_url: string | null;
  packs_count: number;
}

export function CreatorRow({ creator }: { creator: Creator }) {
  const name = creator.username || creator.artist_name || 'usuário';
  return (
    <Link to={`/perfil/${creator.user_id}`} className="flex items-center gap-3 py-2 px-1 rounded-xl hover:bg-[hsl(0,0%,6%)] transition-colors">
      <div className="w-11 h-11 rounded-full overflow-hidden bg-[hsl(0,0%,10%)] border border-border/40 shrink-0 flex items-center justify-center">
        {creator.avatar_url ? (
          <img src={creator.avatar_url} alt={name} className="w-full h-full object-cover" />
        ) : (
          <User className="w-5 h-5 text-muted-foreground" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[13px] font-bold text-foreground truncate leading-tight">@{name}</p>
        <p className="text-[11px] text-muted-foreground truncate mt-0.5">{creator.packs_count} pack{creator.packs_count === 1 ? '' : 's'}</p>
      </div>
      <button className="w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-foreground/10" aria-label="Seguir">
        <Plus className="w-4 h-4" />
      </button>
    </Link>
  );
}
