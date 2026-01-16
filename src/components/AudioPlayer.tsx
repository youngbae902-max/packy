import { useState, useRef } from 'react';
import { Play, Pause, Download } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { AuthModal } from './AuthModal';

interface AudioPlayerProps {
  artistName: string;
  audioUrl: string;
  downloadUrl: string;
  duration?: number;
}

export function AudioPlayer({ artistName, audioUrl, downloadUrl, duration }: AudioPlayerProps) {
  const { user } = useAuth();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
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

  const totalDuration = duration || (audioRef.current?.duration || 0);

  return (
    <>
      <div className="pack-card">
        <audio
          ref={audioRef}
          src={audioUrl}
          onTimeUpdate={handleTimeUpdate}
          onEnded={() => setIsPlaying(false)}
          preload="metadata"
        />
        
        <div className="flex flex-col gap-3">
          <h3 className="text-lg font-black uppercase tracking-tight text-center">
            {artistName}
          </h3>
          
          <div className="flex items-center gap-3">
            <button
              onClick={togglePlay}
              className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:opacity-90 transition-opacity"
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
            </button>
            
            <div className="flex-1 flex items-center gap-2">
              <input
                type="range"
                min={0}
                max={totalDuration || 100}
                value={currentTime}
                onChange={handleSeek}
                className="flex-1 h-1 bg-muted rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:rounded-full"
              />
              <span className="text-xs text-muted-foreground min-w-[4rem] text-right">
                {formatTime(currentTime)} / {formatTime(totalDuration)}
              </span>
            </div>
          </div>
          
          <button
            onClick={handleDownloadClick}
            className="btn-download w-full"
          >
            <Download className="w-4 h-4 mr-2" />
            DOWNLOAD
          </button>
        </div>
      </div>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </>
  );
}
