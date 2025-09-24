// frontend/src/App.tsx
import React, { useState } from 'react';
import './App.css';
import SearchBar from './components/SearchBar';

function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (mood: string) => {
    setIsLoading(true);
    setResults([]);
    setError(null); // Clear any previous errors
    
    try {
      const response = await fetch('http://localhost:5000/api/generate-playlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: mood }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch playlist.');
      }

      const data = await response.json();
      console.log('API Response:', data); // Log the response to see the tracks
      
      // Update the state with the track titles
      const trackTitles = data.tracks.map((track: any) => `${track.title} by ${track.artist}`);
      setResults(trackTitles);

    } catch (err: any) {
      console.error('Error generating playlist:', err);
      setError(err.message);
      
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="App">
      <h1>🎵 Echo: Mood-Based Music</h1>
      <SearchBar onSearch={handleSearch} isLoading={isLoading} />

      {isLoading && <p className="loading">Fetching songs...</p>}
      
      {error && <p className="error">{error}</p>}

      {!isLoading && results.length > 0 && (
        <ul className="results-list">
          {results.map((song, index) => (
            <li key={index}>{song}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default App;