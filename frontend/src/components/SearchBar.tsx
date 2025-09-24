import React, { useState } from 'react';
import { Search, Mic } from 'lucide-react';
interface SearchBarProps {
  onSearch: (mood: string) => void;
  isLoading: boolean;
}
const SearchBar: React.FC<SearchBarProps> = ({ onSearch, isLoading }) => {
  const [mood, setMood] = useState('');
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mood.trim() && !isLoading) {
      onSearch(mood.trim());
    }
  };
  return (
    <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-xl px-4">
      <form onSubmit={handleSubmit} className="relative group">
        <div className="relative bg-[#242424] hover:bg-[#2a2a2a] rounded-full shadow-xl border border-[#3e3e3e] transition-all duration-300 focus-within:border-[#1db954] focus-within:shadow-lg">
          <div className="relative flex items-center px-4 py-3">
            <Search className="w-5 h-5 text-[#b3b3b3] mr-3 transition-colors duration-300 group-focus-within:text-[#1db954]" />
            <input
              type="text"
              value={mood}
              onChange={(e) => setMood(e.target.value)}
              placeholder="What do you want to listen to?"
              className="flex-1 text-sm font-medium text-white placeholder-[#b3b3b3] bg-transparent border-none outline-none"
              disabled={isLoading}
            />
            <Mic className="w-5 h-5 text-[#b3b3b3] mr-3 hover:text-white transition-colors duration-200 cursor-pointer" />
            <button
              type="submit"
              disabled={isLoading || !mood.trim()}
              className="px-4 py-1.5 bg-[#1db954] hover:bg-[#1ed760] text-black font-bold text-sm rounded-full transition-all duration-200 disabled:opacity-50 disabled:hover:bg-[#1db954] hover:scale-105"
            >
              {isLoading ? 'Searching...' : 'Search'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
export default SearchBar;
