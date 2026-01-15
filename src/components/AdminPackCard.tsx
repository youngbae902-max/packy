import { Pack, packTypeLabels } from '@/types/pack';
import { Check, X, Trash2, ExternalLink, Image as ImageIcon, Star, Edit, Crown } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface AdminPackCardProps {
  pack: Pack;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  onDelete?: (id: string) => void;
  onEdit?: (pack: Pack) => void;
  showActions?: boolean;
}

export function AdminPackCard({ pack, onApprove, onReject, onDelete, onEdit, showActions = true }: AdminPackCardProps) {
  const formattedDate = format(pack.createdAt, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
  const displayAuthor = pack.isAnonymous ? 'Anônimo' : pack.author;

  return (
    <div className="pack-card animate-fade-in overflow-hidden">
      {pack.coverUrl ? (
        <div className="relative -mx-5 -mt-5 mb-4 h-32 overflow-hidden rounded-t-xl">
          <img 
            src={pack.coverUrl} 
            alt={pack.title}
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        <div className="relative -mx-5 -mt-5 mb-4 h-20 overflow-hidden rounded-t-xl bg-muted flex items-center justify-center">
          <ImageIcon className="w-6 h-6 text-muted-foreground/40" />
        </div>
      )}
      
      <div className="space-y-3">
        <div className="flex items-center justify-center gap-2 flex-wrap">
          <span className="badge-exclusive text-xs">
            {packTypeLabels[pack.type]}
          </span>
          
          {pack.isExclusive && (
            <span className="badge-star text-xs">
              <Star className="w-3 h-3 fill-warning" />
              Exclusivo
            </span>
          )}

          {pack.isPremium && (
            <span className="badge-premium text-xs">
              <Crown className="w-3 h-3" />
              R$ {pack.price?.toFixed(2)}
            </span>
          )}
          
          <span className={`px-2 py-0.5 rounded-full text-xs font-bold uppercase ${
            pack.status === 'pending' 
              ? 'bg-warning/20 text-warning' 
              : pack.status === 'approved'
              ? 'bg-success/20 text-success'
              : 'bg-destructive/20 text-destructive'
          }`}>
            {pack.status === 'pending' ? 'Pendente' : pack.status === 'approved' ? 'Aprovado' : 'Rejeitado'}
          </span>
        </div>
        
        <h3 className="text-lg font-black uppercase tracking-tight text-center">
          {pack.title}
        </h3>
        
        <p className="text-sm text-muted-foreground text-center">
          @{displayAuthor} • {formattedDate}
        </p>

        <a 
          href={pack.downloadUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <ExternalLink className="w-3 h-3" />
          Ver link de download
        </a>
        
        {showActions && pack.status === 'pending' && (
          <div className="flex gap-2 pt-2">
            <button 
              onClick={() => onApprove?.(pack.id)}
              className="flex-1 flex items-center justify-center gap-2 bg-success text-success-foreground font-bold py-2.5 rounded-xl hover:opacity-90 transition-opacity"
            >
              <Check className="w-4 h-4" />
              Aprovar
            </button>
            <button 
              onClick={() => onReject?.(pack.id)}
              className="flex-1 flex items-center justify-center gap-2 bg-destructive text-destructive-foreground font-bold py-2.5 rounded-xl hover:opacity-90 transition-opacity"
            >
              <X className="w-4 h-4" />
              Rejeitar
            </button>
          </div>
        )}

        {pack.status !== 'pending' && (
          <div className="flex gap-2 pt-2">
            <button 
              onClick={() => onEdit?.(pack)}
              className="flex-1 flex items-center justify-center gap-2 text-sm bg-secondary text-secondary-foreground font-bold py-2 rounded-xl hover:bg-secondary/80 transition-colors"
            >
              <Edit className="w-4 h-4" />
              Editar
            </button>
            <button 
              onClick={() => onDelete?.(pack.id)}
              className="flex-1 flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-destructive transition-colors py-2"
            >
              <Trash2 className="w-4 h-4" />
              Remover
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
