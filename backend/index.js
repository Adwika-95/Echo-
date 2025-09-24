require('dotenv').config();
const validSpotifyGenres = [
  "acoustic","afrobeat","alt-rock","alternative","ambient","anime","black-metal",
  "blues","bossanova","brazil","breakbeat","british","cantopop","chicago-house",
  "children","chill","classical","club","comedy","country","dance","dancehall",
  "death-metal","deep-house","detroit-techno","disco","disney","drum-and-bass","dub",
  "dubstep","edm","electro","electronic","emo","folk","forro","french","funk","garage",
  "german","gospel","goth","grindcore","groove","grunge","guitar","happy","hard-rock",
  "hardcore","hardstyle","heavy-metal","hip-hop","holidays","honky-tonk","house",
  "idm","indian","indie","indie-pop","industrial","iranian","j-dance","j-idol","j-pop",
  "j-rock","jazz","k-pop","kids","latin","latino","malay","mandopop","metal","metal-misc",
  "metalcore","minimal-techno","movies","mpb","new-age","new-release","opera","pagode",
  "party","philippines-opm","piano","pop","pop-film","post-dubstep","power-pop","progressive-house",
  "psych-rock","punk","punk-rock","r-n-b","rainy-day","reggae","reggaeton","rock","rock-n-roll",
  "rockabilly","romance","sad","salsa","samba","sertanejo","show-tunes","singer-songwriter",
  "ska","sleep","songwriter","soul","soundtracks","spanish","study","summer","swedish","synth-pop",
  "tango","techno","trance","trip-hop","turkish","work-out","world-music"
];

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
