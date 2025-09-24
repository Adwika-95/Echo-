require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();
app.use(cors());
app.use(express.json());
const PORT = process.env.PORT || 5000;
let spotifyToken = null;
let spotifyTokenExpiresAt = 0;
async function getSpotifyToken() {
  if (spotifyToken && Date.now() < spotifyTokenExpiresAt - 60 * 1000) return spotifyToken;
  const resp = await axios.post(
    'https://accounts.spotify.com/api/token',
    new URLSearchParams({ grant_type: 'client_credentials' }),
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization:
          'Basic ' + Buffer.from(`${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`).toString('base64'),
      },
    }
  );
  spotifyToken = resp.data.access_token;
  spotifyTokenExpiresAt = Date.now() + resp.data.expires_in * 1000;
  return spotifyToken;
}
async function callGeminiExtract(promptText) {
  try {
    const url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=' + process.env.GEMINI_API_KEY;
    const promptForGemini = `From the following user text, extract 3 valid Spotify genre seeds (comma-separated, no spaces) from this list: ${validSpotifyGenres}. Output only the genre seeds. The user text is: "${promptText}".`;
    const body = {
      contents: [{
        parts: [{
          text: promptForGemini
        }]
      }]
    };
    const r = await axios.post(url, body);
    const candidate = r.data?.candidates?.[0]?.content?.parts?.[0]?.text;
    console.log(`Gemini response: ${candidate}`);
    if (!candidate) return "pop,chill,ambient"; 
    return candidate.trim();
  } catch (e) {
    console.error('Gemini error (fallback to default genres):', e.message || e);
    return "pop,chill,ambient";
  }
}
app.post('/api/generate-playlist', async (req, res) => {
  try {
    const { prompt, limit = 20 } = req.body;
    if (!prompt) return res.status(400).json({ error: 'prompt required' });
    const keywords = await callGeminiExtract(prompt);
    console.log(`Using keywords for Spotify search: ${keywords}`);
    const token = await getSpotifyToken();
    const spotifyResp = await axios.get(
      `https://api.spotify.com/v1/recommendations?limit=${limit}&seed_genres=${encodeURIComponent(keywords)}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
    }
  );
    const tracks = spotifyResp.data.tracks.map((t) => ({
      id: t.id,
      title: t.name,
      artist: t.artists.map(a => a.name).join(', '),
      albumCover: t.album.images?.[0]?.url || null,
      duration: t.duration_ms,
      spotifyUrl: t.external_urls?.spotify,
    }));

    res.json({ prompt, keywords, tracks });
  } catch (err) {
    console.error('generate-playlist error', err.response?.data || err.message || err);
    res.status(500).json({ error: 'Failed to generate playlist' });
  }
});
app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));
