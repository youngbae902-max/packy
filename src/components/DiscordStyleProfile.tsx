import { useState, useRef } from 'react';
import { Camera, Edit, MessageCircle, Shield, Palette, ImagePlus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface DiscordStyleProfileProps {
  onEditProfile: () => void;
}

// Preset colors for the status ring
const RING_COLORS = [
  { name: 'Verde', value: '#10b981' },
  { name: 'Azul', value: '#3b82f6' },
  { name: 'Roxo', value: '#8b5cf6' },
  { name: 'Rosa', value: '#ec4899' },
  { name: 'Vermelho', value: '#ef4444' },
  { name: 'Laranja', value: '#f97316' },
  { name: 'Amarelo', value: '#eab308' },
  { name: 'Ciano', value: '#06b6d4' },
  { name: 'Branco', value: '#ffffff' },
];

export const DiscordStyleProfile = ({ onEditProfile }: DiscordStyleProfileProps) => {
  const { profile, isAdmin } = useAuth();
  const { updateProfile, uploadAvatar, isUpdating } = useProfile();
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showThoughtEditor, setShowThoughtEditor] = useState(false);
  const [thought, setThought] = useState(profile?.thought_bubble || '');
  
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  const ringColor = (profile as any)?.status_ring_color || '#10b981';
  const bannerUrl = (profile as any)?.banner_url;
  const thoughtBubble = (profile as any)?.thought_bubble;

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const url = await uploadAvatar(file);
      await updateProfile({ avatar_url: url });
      toast.success('Foto atualizada!');
    } catch {
      toast.error('Erro ao atualizar foto');
    }
  };

  const handleBannerChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      
      const { supabase } = await import('@/integrations/supabase/client');
      const { error: uploadError } = await supabase.storage
        .from('banners')
        .upload(fileName, file, { upsert: true });
      
      if (uploadError) throw uploadError;
      
      const { data: { publicUrl } } = supabase.storage
        .from('banners')
        .getPublicUrl(fileName);
      
      await updateProfile({ banner_url: publicUrl } as any);
      toast.success('Banner atualizado!');
    } catch (err) {
      console.error(err);
      toast.error('Erro ao atualizar banner');
    }
  };

  const handleColorSelect = async (color: string) => {
    try {
      await updateProfile({ status_ring_color: color } as any);
      setShowColorPicker(false);
      toast.success('Cor do anel atualizada!');
    } catch {
      toast.error('Erro ao atualizar cor');
    }
  };

  const handleSaveThought = async () => {
    try {
      await updateProfile({ thought_bubble: thought } as any);
      setShowThoughtEditor(false);
      toast.success('Pensamento atualizado!');
    } catch {
      toast.error('Erro ao salvar pensamento');
    }
  };

  // Social icons
  const SpotifyIcon = () => (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
    </svg>
  );

  return (
    <>
      {/* Banner */}
      <div className="relative h-32 md:h-40 bg-gradient-to-br from-secondary via-secondary/80 to-muted overflow-hidden">
        {bannerUrl && (
          <img 
            src={bannerUrl} 
            alt="Banner" 
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
        
        {/* Banner edit button */}
        <button
          onClick={() => bannerInputRef.current?.click()}
          className="absolute top-3 right-3 p-2 rounded-full bg-background/50 backdrop-blur-sm hover:bg-background/70 transition-colors"
        >
          <ImagePlus className="w-4 h-4 text-foreground" />
        </button>
        <input 
          ref={bannerInputRef} 
          type="file" 
          accept="image/*" 
          onChange={handleBannerChange} 
          className="hidden" 
        />
      </div>

      {/* Profile Section */}
      <div className="relative px-4 -mt-16">
        <div className="flex items-end gap-4">
          {/* Avatar with ring */}
          <div className="relative">
            {/* Status ring */}
            <div 
              className="absolute -inset-1.5 rounded-full"
              style={{ 
                background: `linear-gradient(135deg, ${ringColor}, ${ringColor}80)`,
                padding: '3px'
              }}
            >
              <div className="w-full h-full rounded-full bg-background" />
            </div>
            
            {/* Avatar */}
            <div className="relative w-24 h-24 rounded-full bg-secondary border-4 border-background overflow-hidden">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-muted">
                  <span className="text-3xl font-bold text-muted-foreground">
                    {profile?.artist_name?.[0]?.toUpperCase() || '?'}
                  </span>
                </div>
              )}
            </div>
            
            {/* Online indicator */}
            <div className="absolute bottom-1 right-1 w-5 h-5 bg-success rounded-full border-2 border-background" />
            
            {/* Avatar edit */}
            <button 
              onClick={() => avatarInputRef.current?.click()} 
              className="absolute bottom-0 left-0 w-7 h-7 bg-primary text-primary-foreground rounded-full flex items-center justify-center shadow-lg hover:opacity-90 transition-opacity"
            >
              <Camera className="w-3.5 h-3.5" />
            </button>
            <input 
              ref={avatarInputRef} 
              type="file" 
              accept="image/*" 
              onChange={handleAvatarChange} 
              className="hidden" 
            />
          </div>

          {/* Quick actions */}
          <div className="flex gap-2 mb-2">
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => setShowColorPicker(true)}
              className="h-8"
            >
              <Palette className="w-3.5 h-3.5 mr-1" />
              Cor
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={onEditProfile}
              className="h-8"
            >
              <Edit className="w-3.5 h-3.5 mr-1" />
              Editar
            </Button>
          </div>
        </div>

        {/* Thought bubble */}
        {thoughtBubble && (
          <div className="relative mt-4 ml-4">
            {/* Bubble pointer */}
            <div className="absolute -left-2 top-3 w-0 h-0 border-t-8 border-t-transparent border-r-8 border-r-secondary border-b-8 border-b-transparent" />
            <div className="relative bg-secondary rounded-xl px-4 py-2 inline-flex items-center gap-2 max-w-xs">
              <MessageCircle className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <p className="text-sm text-foreground italic">"{thoughtBubble}"</p>
              <button 
                onClick={() => {
                  setThought(thoughtBubble);
                  setShowThoughtEditor(true);
                }}
                className="text-muted-foreground hover:text-foreground"
              >
                <Edit className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}
        
        {!thoughtBubble && (
          <button 
            onClick={() => setShowThoughtEditor(true)}
            className="mt-4 ml-4 text-sm text-muted-foreground hover:text-foreground flex items-center gap-2"
          >
            <MessageCircle className="w-4 h-4" />
            Adicionar pensamento
          </button>
        )}

        {/* Name and badges */}
        <div className="mt-4">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-xl font-bold text-foreground">{profile?.artist_name || 'Sem nome'}</h2>
            
            {/* Badges */}
            {isAdmin && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-destructive/20 text-destructive text-xs font-medium">
                <Shield className="w-3 h-3" />
                ADM
              </span>
            )}
            
            {profile?.has_spotify_badge && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-success/20 text-success text-xs font-medium">
                <SpotifyIcon />
                Verificado
              </span>
            )}
          </div>
          
          {profile?.username && (
            <p className="text-sm text-muted-foreground mt-0.5">@{profile.username}</p>
          )}
        </div>
      </div>

      {/* Color Picker Dialog */}
      <Dialog open={showColorPicker} onOpenChange={setShowColorPicker}>
        <DialogContent className="max-w-xs">
          <DialogHeader>
            <DialogTitle>Cor do Anel</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-3 gap-3">
            {RING_COLORS.map((color) => (
              <button
                key={color.value}
                onClick={() => handleColorSelect(color.value)}
                className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-secondary transition-colors"
              >
                <div 
                  className="w-10 h-10 rounded-full border-2 border-border"
                  style={{ backgroundColor: color.value }}
                />
                <span className="text-xs text-muted-foreground">{color.name}</span>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Thought Editor Dialog */}
      <Dialog open={showThoughtEditor} onOpenChange={setShowThoughtEditor}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              Seu Pensamento
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              value={thought}
              onChange={(e) => setThought(e.target.value.slice(0, 100))}
              placeholder="O que você está pensando?"
              rows={3}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground text-right">{thought.length}/100</p>
            <Button onClick={handleSaveThought} disabled={isUpdating} className="w-full">
              Salvar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
