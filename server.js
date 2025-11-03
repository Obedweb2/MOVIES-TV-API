const express = require('express');
const fetch = require('node-fetch');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const TMDB_KEY = process.env.TMDB_API_KEY;

if (!TMDB_KEY) {
  console.warn('Warning: TMDB_API_KEY is not set. See .env.example');
}

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// Simple proxy to TMDB search (movies or tv)
app.get('/api/search', async (req, res) => {
  try {
    const { q = '', type = 'movie', page = 1 } = req.query;
    if (!q) return res.status(400).json({ error: 'Missing query param q' });

    const url = `https://api.themoviedb.org/3/search/${encodeURIComponent(
      type
    )}?api_key=${TMDB_KEY}&language=en-US&query=${encodeURIComponent(
      q
    )}&page=${page}&include_adult=false`;

    const r = await fetch(url);
    const data = await r.json();
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get details for a movie or tv show
app.get('/api/details/:type/:id', async (req, res) => {
  try {
    const { type, id } = req.params; // type = movie or tv
    const url = `https://api.themoviedb.org/3/${encodeURIComponent(
      type
    )}/${encodeURIComponent(id)}?api_key=${TMDB_KEY}&language=en-US&append_to_response=credits,images,videos`;
    const r = await fetch(url);
    const data = await r.json();
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Popular endpoint (optional)
app.get('/api/popular/:type', async (req, res) => {
  try {
    const { type } = req.params; // movie or tv
    const page = req.query.page || 1;
    const url = `https://api.themoviedb.org/3/${encodeURIComponent(
      type
    )}/popular?api_key=${TMDB_KEY}&language=en-US&page=${page}`;
    const r = await fetch(url);
    const data = await r.json();
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
