# Movies & TV Shows API + Frontend Starter

This project is a starter full-stack app that provides:
- A simple backend (Node.js + Express) that proxies The Movie Database (TMDB) API (so you don't expose your API key).
- A responsive, modern frontend (HTML / CSS / vanilla JS) that searches movies & TV shows, shows lists and detail cards, and has a polished UI.

What you get:
- server.js — Express server with routes to search and fetch details from TMDB.
- public/index.html — Single-page frontend that supports searching and browsing (can be extended to multiple pages).
- public/styles.css — Modern responsive styling (CSS variables, grid, animations).
- public/app.js — Frontend logic: search, fetch lists, show detail modal, pagination.
- .env.example — example environment variables.

Before running
1. Get a TMDB API key: https://www.themoviedb.org/documentation/api
2. Copy `.env.example` to `.env` and set TMDB_API_KEY.

Run locally
1. npm install
2. npm start
3. Open http://localhost:3000

Notes
- This is a starter. You can extend the backend to add caching, authentication, or persist user favorites.
- The frontend is vanilla JS for simplicity. You can port to React/Vue if preferred.
