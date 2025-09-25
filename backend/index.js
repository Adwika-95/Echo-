require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();
app.use(cors());
app.use(express.json());
const PORT = process.env.PORT || 5000;
const validSpotifyGenres = [
  'pop', 'rock', 'hip-hop', 'hiphop', 'indie', 'electronic', 'dance',
  'ambient', 'jazz', 'classical', 'blues', 'reggae', 'country', 'metal',
  'folk', 'soul', 'rnb', 'rap', 'punk', 'latin'
];
if (!process.env.SPOTIFY_CLIENT_ID || !process.env.SPOTIFY_CLIENT_SECRET) {
  console.error('Missing SPOTIFY_CLIENT_ID or SPOTIFY_CLIENT_SECRET in environment');
  process.exit(1);
}
if (!process.env.GEMINI_API_KEY) {
  console.error('Missing GEMINI_API_KEY in environment');
  process.exit(1);
}
let spotifyToken = null;
let spotifyTokenExpiresAt = 0;

async function getSpotifyToken() {
  if (spotifyToken && Date.now() < spotifyTokenExpiresAt - 60 * 1000) {
    return spotifyToken;
  }
  const creds = Buffer.from(
    `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
  ).toString('base64');
  try {
    const resp = await axios.post(
      'https://accounts.spotify.com/api/token',
      new URLSearchParams({ grant_type: 'client_credentials' }).toString(),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${creds}`,
        },
        timeout: 10000,
      }
    );
    spotifyToken = resp.data.access_token;
    spotifyTokenExpiresAt = Date.now() + resp.data.expires_in * 1000;
    return spotifyToken;
  } catch (err) {
    console.error('Failed to obtain Spotify token:', err?.response?.data || err.message);
    throw new Error('Spotify auth failed');
  }
}
async function callGeminiExtract(promptText) {
  if (!promptText || typeof promptText !== 'string') {
    return ['pop', 'ambient'];
  }
  try {
    const url = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;

    const systemInstruction = `From the user's text, choose up to 5 valid Spotify genre seeds (exactly matching one of these allowed genres): ${validSpotifyGenres.join(
      ', '
    )}. Return only the selected genre seeds as a comma-separated list, no extra text.`;
    const body = {
      prompt: {
        messages: [
          { role: 'system', content: systemInstruction },
          { role: 'user', content: `User text: "${promptText}"` }
        ]
      },
      candidateCount: 1,
    };
    const r = await axios.post(url, body, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 10000,
    });
    const candidateText =
      r.data?.candidates?.[0]?.content?.[0]?.text ||
      r.data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      r.data?.candidates?.[0]?.text ||
      r.data?.output?.[0]?.content?.[0]?.text ||
      null;
    if (!candidateText || typeof candidateText !== 'string') {
      console.warn('Gemini returned no usable text, falling back to defaults');
      return ['pop', 'ambient'];
    }
    const rawSeeds = candidateText
      .replace(/[\n\r]/g, ' ')
      .split(',')
      .map(s => s.trim().toLowerCase())
      .filter(Boolean);
    const seeds = Array.from(new Set(rawSeeds)).filter(s => validSpotifyGenres.includes(s)).slice(0, 5);
    if (seeds.length === 0) {
      console.warn('No valid seeds extracted, falling back to defaults. Gemini output:', candidateText);
      return ['pop', 'ambient'];
    }

    return seeds;
  } catch (e) {
    console.error('Gemini extraction error, falling back to defaults:', e?.response?.data || e.message);
    return ['pop', 'ambient'];
  }
}

app.post('/api/generate-playlist', async (req, res) => {
  try {
    const { prompt, limit = 20 } = req.body;
    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      return res.status(400).json({ error: 'prompt required and must be a non-empty string' });
    }

    const requestedLimit = Math.min(100, Math.max(1, parseInt(limit, 10) || 20)); 
    const seeds = await callGeminiExtract(prompt);
    const usedSeeds = seeds.slice(0, 5); 

    const token = await getSpotifyToken();

    const spotifyUrl = `https://api.spotify.com/v1/recommendations?limit=${requestedLimit}&seed_genres=${encodeURIComponent(
      usedSeeds.join(',')
    )}`;

    const spotifyResp = await axios.get(spotifyUrl, {
      headers: { Authorization: `Bearer ${token}` },
      timeout: 10000,
    });

    const tracks = (spotifyResp.data.tracks || []).map((t) => ({
      id: t.id,
      title: t.name,
      artist: (t.artists || []).map(a => a.name).join(', '),
      albumCover: t.album?.images?.[0]?.url || null,
      durationMs: t.duration_ms,
      spotifyUrl: t.external_urls?.spotify || null,
    }));

    res.json({ prompt, seeds: usedSeeds, tracks });
  } catch (err) {
    console.error('generate-playlist error:', err?.response?.status, err?.response?.data || err.message);
    const status = err?.response?.status === 401 ? 502 : 500;
    res.status(status).json({ error: 'Failed to generate playlist' });
  }
});

app.get('/', (req, res) => {
  res.send('Spotify playlist generator backend is running');
});

app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));