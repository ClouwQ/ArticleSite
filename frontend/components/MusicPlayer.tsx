import React, { useEffect, useRef, useState } from 'react';
import { Play, Pause, Rewind, FastForward, Music, X } from './Icons';
import { Playlist } from '../types';
import { API_BASE_URL } from '../services/api';

interface MusicPlayerProps {
  currentPlaylist: Playlist | null;
  onClose: () => void;
}

const MusicPlayer: React.FC<MusicPlayerProps> = ({ currentPlaylist, onClose }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  if (!currentPlaylist) return null;

  const currentTrack = currentPlaylist.tracks[currentTrackIndex];

  const currentSrc = currentTrack?.audio_file_path
    ? `${API_BASE_URL}${currentTrack.audio_file_path}`
    : '';

  const handlePlayPause = async () => {
    if (!audioRef.current) return;
    if (!currentSrc) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      try {
        await audioRef.current.play();
      } catch (e) {
        console.error(e);
      }
    }
  };
  const handleNext = () => {
    setCurrentTrackIndex((prev) => (prev + 1) % currentPlaylist.tracks.length);
  };
  const handlePrev = () => {
    setCurrentTrackIndex((prev) => (prev - 1 + currentPlaylist.tracks.length) % currentPlaylist.tracks.length);
  };

  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.pause();
    audioRef.current.currentTime = 0;
    setIsPlaying(false);
  }, [currentSrc]);

  useEffect(() => {
    if (!audioRef.current) return;
    const a = audioRef.current;
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onEnded = () => handleNext();
    a.addEventListener('play', onPlay);
    a.addEventListener('pause', onPause);
    a.addEventListener('ended', onEnded);
    return () => {
      a.removeEventListener('play', onPlay);
      a.removeEventListener('pause', onPause);
      a.removeEventListener('ended', onEnded);
    };
  }, [currentPlaylist, currentTrackIndex]);

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-gray-200 p-4 z-50 shadow-lg">
      <audio ref={audioRef} src={currentSrc || undefined} preload="metadata" />
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-4 w-1/3">
          <div className="w-12 h-12 bg-gray-200 rounded overflow-hidden hidden sm:block">
            <img src={currentPlaylist.coverImage} alt="Album Art" className="w-full h-full object-cover" />
          </div>
          <div className="flex flex-col overflow-hidden">
            <span className="font-bold text-sm truncate">{currentTrack?.title || 'No Track'}</span>
            <span className="text-xs text-gray-500 truncate">{currentTrack?.artist || 'Unknown'}</span>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center gap-1 w-1/3">
          <div className="flex items-center gap-8">
            <button onClick={handlePrev} className="text-gray-400 hover:text-dark transition-colors">
              <Rewind size={28} fill="currentColor" strokeWidth={0} />
            </button>
            <button 
              onClick={handlePlayPause} 
              className="text-gray-400 hover:text-dark transition-colors"
            >
              {isPlaying ? (
                <Pause size={28} fill="currentColor" strokeWidth={0} />
              ) : (
                <Play size={28} fill="currentColor" strokeWidth={0} />
              )}
            </button>
            <button onClick={handleNext} className="text-gray-400 hover:text-dark transition-colors">
              <FastForward size={28} fill="currentColor" strokeWidth={0} />
            </button>
          </div>
        </div>

        <div className="flex items-center justify-end gap-4 w-1/3">
          <button className="text-gray-400 hover:text-accent hidden sm:block">
            <Music size={18} />
          </button>
          <button onClick={onClose} className="text-gray-400 hover:text-red-500">
            <X size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default MusicPlayer;