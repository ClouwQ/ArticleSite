import React from 'react';
import { X, ExternalLink, Play } from './Icons';
import { Playlist } from '../types';

interface PlaylistModalProps {
  isOpen: boolean;
  onClose: () => void;
  playlist: Playlist | null;
  onPlayTrack: (playlist: Playlist) => void;
}

const PlaylistModal: React.FC<PlaylistModalProps> = ({ isOpen, onClose, playlist, onPlayTrack }) => {
  if (!isOpen || !playlist) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-4 sm:p-0">
      {/* Backdrop with blur */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-md transition-opacity"
        onClick={onClose}
      ></div>
      
      {/* Modal Content */}
      <div className="relative bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-slide-up ring-1 ring-gray-100">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex flex-col gap-4 bg-white relative z-10">
           {/* Close Button */}
           <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-black p-1">
             <X size={24} />
           </button>

           <div className="pt-8 pb-2">
             {/* External Link Button - Replaces internal play controls and cover */}
             <a 
               href="https://music.yandex.com" // Placeholder URL
               target="_blank"
               rel="noopener noreferrer"
               className="inline-flex items-center justify-center gap-2 bg-yellow-400 text-black px-6 py-3 rounded-full text-sm font-bold uppercase tracking-wider hover:bg-yellow-500 transition-colors w-full sm:w-auto"
             >
               <span>Плейлист в Яндекс музыке</span>
               <ExternalLink size={16} />
             </a>
           </div>
        </div>

        {/* Tracks List */}
        <div className="p-2 max-h-[50vh] overflow-y-auto bg-gray-50/50">
          {playlist.tracks.map((track, idx) => (
            <div 
              key={track.id}
              onClick={() => {
                onPlayTrack(playlist);
                onClose();
              }}
              className="flex items-center gap-4 p-3 hover:bg-white hover:shadow-sm rounded-xl cursor-pointer group transition-all border border-transparent hover:border-gray-100 mx-2"
            >
              <div className="w-6 text-center text-gray-400 text-xs font-medium group-hover:hidden">{idx + 1}</div>
              <div className="w-6 text-center hidden group-hover:block text-accent">
                <Play size={16} fill="currentColor" />
              </div>
              <div className="flex-1">
                <div className="font-medium text-dark text-sm">{track.title}</div>
                <div className="text-xs text-gray-500">{track.artist}</div>
              </div>
              <div className="text-xs text-gray-400 font-mono">{track.duration}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PlaylistModal;