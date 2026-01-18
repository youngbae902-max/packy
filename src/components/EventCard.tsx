import { Youtube, Instagram, MessageCircle, Type, Link as LinkIcon } from 'lucide-react';
import { SiteEvent } from '@/hooks/useSiteEvents';
import { Card, CardContent } from '@/components/ui/card';

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
        return <LinkIcon className="w-5 h-5 text-primary" />;
      default:
        return <Type className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getBgColor = () => {
    switch (event.type) {
      case 'youtube':
        return 'bg-red-500/10 border-red-500/30';
      case 'instagram':
        return 'bg-pink-500/10 border-pink-500/30';
      case 'whatsapp':
        return 'bg-green-500/10 border-green-500/30';
      case 'text_link':
        return 'bg-primary/10 border-primary/30';
      default:
        return 'bg-muted border-border';
    }
  };

  const content = (
    <Card className={`${getBgColor()} transition-all hover:scale-[1.02]`}>
      <CardContent className="pt-4 flex items-center gap-3">
        {getIcon()}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold truncate">{event.title}</h3>
          {event.content && (
            <p className="text-sm text-muted-foreground truncate">{event.content}</p>
          )}
        </div>
      </CardContent>
    </Card>
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
