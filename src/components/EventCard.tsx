import { Youtube, Instagram, MessageCircle, Type, Link as LinkIcon } from 'lucide-react';
import { SiteEvent } from '@/hooks/useSiteEvents';

interface EventCardProps {
  event: SiteEvent;
}

export function EventCard({ event }: EventCardProps) {
  const getIcon = () => {
    switch (event.type) {
      case 'youtube':
        return <Youtube className="w-5 h-5 text-red-500" />;
      case 'instagram':
        return <Instagram className="w-5 h-5 text-pink-500" />;
      case 'whatsapp':
        return <MessageCircle className="w-5 h-5 text-green-500" />;
      case 'text_link':
        return <LinkIcon className="w-5 h-5 text-muted-foreground" />;
      default:
        return <Type className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const content = (
    <div className="bg-card/50 backdrop-blur-sm rounded-xl border border-border/50 p-3.5 hover:border-muted-foreground/30 transition-all group">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
          {getIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm truncate group-hover:text-primary transition-colors">
            {event.title}
          </h3>
          {event.content && (
            <p className="text-xs text-muted-foreground truncate">{event.content}</p>
          )}
        </div>
      </div>
    </div>
  );

  if (event.link_url) {
    return (
      <a href={event.link_url} target="_blank" rel="noopener noreferrer" className="block">
        {content}
      </a>
    );
  }

  return content;
}
