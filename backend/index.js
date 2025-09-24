// backend/index.js
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
  // expires_in is in seconds
  spotifyTokenExpiresAt = Date.now() + resp.data.expires_in * 1000;
  return spotifyToken;
}

// Simple Gemini prompt: extract 1-3 keywords/genre seeds from user text
async function callGeminiExtract(promptText) {
  try {
    const url =
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=' + process.env.GEMINI_API_KEY;

    const body = {
      // simple request: ask for comma separated short keywords
      prompt: {
        text: `Extract 3 short keywords (comma-separated) or genres from this user text for music search: "${promptText}". Output only keywords.`,
      },
      // some endpoints use "temperature" etc — keep minimal
    };

    // if this form doesn't match your account, replace with your official SDK approach.
    const r = await axios.post(url, body);
    // best-effort parsing
    const candidate = r.data?.candidates?.[0]?.content?.[0]?.text || r.data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!candidate) return promptText;
    return candidate.trim();
  } catch (e) {
    console.error('Gemini error (fallback to raw):', e.message || e);
    return promptText;
  }
}

app.post('/api/generate-playlist', async (req, res) => {
  try {
    const { prompt, limit = 20 } = req.body;
    if (!prompt) return res.status(400).json({ error: 'prompt required' });

    // 1) use Gemini to extract short keywords
    const keywords = await callGeminiExtract(prompt); // e.g., "lofi, chill, instrumental"

    // 2) get spotify token
    const token = await getSpotifyToken();

    // 3) call Spotify search or recommendations (simpler: search for keywords as track)
    // We'll search tracks by keywords
    const searchQ = encodeURIComponent(keywords);
    const spotifyResp = await axios.get(`https://api.spotify.com/v1/search?q=${searchQ}&type=track&limit=${limit}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const tracks = spotifyResp.data.tracks.items.map((t) => ({
      id: t.id,
      title: t.name,
      artist: t.artists.map(a => a.name).join(', '),
      albumCover: t.album.images[0]?.url || null,
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
