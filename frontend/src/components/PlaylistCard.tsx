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
    <div className="group relative bg-[#181818] hover:bg-[#282828] rounded-lg p-4 transition-all duration-300 cursor-pointer">
      <div className="relative">
        <div className="relative mb-4 overflow-hidden rounded-md shadow-lg">
          <img src={track.albumCover} alt={`${track.title} album cover`} className="w-full aspect-square object-cover" loading="lazy" />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center">
            <button className="w-12 h-12 bg-[#1db954] hover:bg-[#1ed760] rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 shadow-xl">
              <Play className="w-5 h-5 text-black ml-0.5" fill="currentColor" />
            </button>
          </div>
        </div>
        <div className="space-y-1">
          <h3 className="text-white font-semibold text-base line-clamp-1 hover:underline">{track.title}</h3>
          <p className="text-[#b3b3b3] text-sm hover:text-white hover:underline cursor-pointer transition-colors duration-200">{track.artist}</p>
        </div>
        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="flex space-x-2">
            <button className="w-8 h-8 bg-black/60 hover:bg-black/80 rounded-full flex items-center justify-center transition-colors duration-200">
              <Heart className="w-4 h-4 text-[#b3b3b3] hover:text-white" />
            </button>
            <button className="w-8 h-8 bg-black/60 hover:bg-black/80 rounded-full flex items-center justify-center transition-colors duration-200">
              <MoreHorizontal className="w-4 h-4 text-[#b3b3b3] hover:text-white" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default PlaylistCard;
