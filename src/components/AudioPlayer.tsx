import { useState, useRef, useEffect } from 'react';
import { Play, Pause, Download, Music } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { AuthModal } from './AuthModal';

interface AudioPlayerProps {
  artistName: string;
  imageUrl?: string | null;
  audioUrl: string | null;
  downloadUrl: string;
  duration?: number;
}

export function AudioPlayer({ artistName, imageUrl, audioUrl, downloadUrl, duration }: AudioPlayerProps) {
  const { user } = useAuth();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(duration || 0);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (duration) {
      setTotalDuration(duration);
    }
  }, [duration]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      void audioRef.current.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) setCurrentTime(audioRef.current.currentTime);
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current && !duration && Number.isFinite(audioRef.current.duration)) {
      setTotalDuration(audioRef.current.duration);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = Number(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handleDownloadClick = () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    window.open(downloadUrl, '_blank');
  };

  const progress = totalDuration > 0 ? (currentTime / totalDuration) * 100 : 0;

  return (
    <>
      <div className="bg-card/80 backdrop-blur-sm rounded-2xl border border-border/50 p-4 hover:border-primary/30 transition-all">
        {audioUrl && (
          <audio
            ref={audioRef}
            src={audioUrl}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onEnded={() => setIsPlaying(false)}
            preload="metadata"
          />
        )}
        <div className="flex items-center gap-4">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={`Foto de ${artistName}`}
              className="w-14 h-14 rounded-xl object-cover flex-shrink-0"
              loading="lazy"
            />
          ) : (
            <div className="w-14 h-14 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
              <Music className="w-6 h-6 text-primary" />
            </div>
          )}
          <button
            onClick={togglePlay}
            disabled={!audioUrl}
            aria-label={isPlaying ? 'Pausar' : 'Reproduzir'}
            className="w-11 h-11 rounded-full bg-gradient-to-br from-primary to-primary/80 text-primary-foreground flex items-center justify-center hover:scale-105 transition-transform shadow-lg disabled:opacity-40"
          >
            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-1" />}
          </button>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-sm uppercase tracking-tight truncate mb-2">{artistName}</h3>
            <div className="relative w-full h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className="absolute left-0 top-0 h-full bg-gradient-to-r from-primary to-primary/70 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
              <input
                type="range"
                min={0}
                max={totalDuration || 100}
                value={currentTime}
                onChange={handleSeek}
                disabled={!audioUrl}
                aria-label="Progresso do áudio"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-default"
              />
            </div>
            <div className="flex justify-between mt-1.5">
              <span className="text-[10px] text-muted-foreground font-medium">{formatTime(currentTime)}</span>
              <span className="text-[10px] text-muted-foreground font-medium">{formatTime(totalDuration)}</span>
            </div>
          </div>
          <button
            onClick={handleDownloadClick}
            aria-label="Baixar acapella"
            className="w-10 h-10 rounded-xl bg-secondary text-secondary-foreground flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </>
  );
}
