import React, { useState } from 'react';
import './index.css';
import SearchBar from './components/SearchBar';
import LoadingAnimation from './components/LoadingAnimation';
import PlaylistCard, { Track } from './components/PlaylistCard';
import MoodBackground from './components/MoodBackground';
function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<Track[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [currentMood, setCurrentMood] = useState<string | null>(null);
  const handleSearch = async (mood: string) => {
    setIsLoading(true);
    setResults([]);
    setError(null);
    setCurrentMood(mood);
    try {
      const response = await fetch('http://localhost:5000/api/generate-playlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: mood }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch playlist.');
      }
      const data = await response.json();
      const tracks: Track[] = data.tracks.map((track: any) => ({
        id: track.id,
        title: track.title,
        artist: track.artist,
        albumCover: track.albumCover || 'https://via.placeholder.com/200',
        duration: track.duration,
        spotifyUrl: track.spotifyUrl,
      }));
      setResults(tracks);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="App">
      <MoodBackground mood={currentMood} />
      <h1>🎵 Echo: Mood-Based Music</h1>
      <SearchBar onSearch={handleSearch} isLoading={isLoading} />
      {isLoading && (
        <div className="loading-animation-overlay">
          <LoadingAnimation />
        </div>
      )}
      {error && <p className="error">{error}</p>}
      {!isLoading && results.length > 0 && (
        <div className="results-container">
          {results.map((track) => (
            <div key={track.id} className="playlist-card-wrapper">
              <PlaylistCard track={track} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default App;
