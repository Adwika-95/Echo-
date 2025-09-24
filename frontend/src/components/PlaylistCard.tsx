import React from 'react';
import { Play, Heart, MoreHorizontal } from 'lucide-react';

export interface Track {
  id: string;
  title: string;
  artist: string;
  albumCover: string;
  duration?: string | number;
  spotifyUrl?: string;
}

interface PlaylistCardProps {
  track: Track;
}

const PlaylistCard: React.FC<PlaylistCardProps> = ({ track }) => {
  return (
    <div className="group relative bg-[#181818] hover:bg-[#282828] rounded-lg transition-all duration-300 cursor-pointer w-[160px]">
      {/* Album Cover */}
      <div className="relative overflow-hidden rounded-md shadow-lg w-[160px] h-[160px]">
        <img
          src={track.albumCover}
          alt={`${track.title} album cover`}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        {/* Play Button Overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 flex items-center justify-center transition-all duration-300">
          <button className="w-10 h-10 bg-[#1db954] hover:bg-[#1ed760] rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 shadow-xl">
            <Play className="w-4 h-4 text-black" fill="currentColor" />
          </button>
        </div>
      </div>

      {/* Track Info */}
      <div className="mt-2 text-center space-y-1 w-[160px]">
        <h3 className="text-white font-semibold text-xs line-clamp-1 hover:underline">{track.title}</h3>
        <p className="text-[#b3b3b3] text-[11px] hover:text-white hover:underline cursor-pointer transition-colors duration-200">
          {track.artist}
        </p>
      </div>

      {/* Top-right Buttons */}
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex space-x-1">
        <button className="w-6 h-6 bg-black/60 hover:bg-black/80 rounded-full flex items-center justify-center transition-colors duration-200">
          <Heart className="w-3 h-3 text-[#b3b3b3] hover:text-white" />
        </button>
        <button className="w-6 h-6 bg-black/60 hover:bg-black/80 rounded-full flex items-center justify-center transition-colors duration-200">
          <MoreHorizontal className="w-3 h-3 text-[#b3b3b3] hover:text-white" />
        </button>
      </div>
    </div>
  );
};

export default PlaylistCard;
