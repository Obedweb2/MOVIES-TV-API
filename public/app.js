const resultsEl = document.getElementById('results');
const form = document.getElementById('searchForm');
const queryInput = document.getElementById('query');
const typeSelect = document.getElementById('type');
const modal = document.getElementById('modal');
const modalBody = document.getElementById('modalBody');
const closeModal = document.getElementById('closeModal');
const paginationEl = document.getElementById('pagination');
const popularMoviesBtn = document.getElementById('popularMovies');
const popularTvBtn = document.getElementById('popularTv');

let currentQuery = '';
let currentType = 'movie';
let currentPage = 1;
let totalPages = 1;

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  currentQuery = queryInput.value.trim();
  currentType = typeSelect.value;
  if (!currentQuery) return;
  currentPage = 1;
  await doSearch();
});

popularMoviesBtn.addEventListener('click', async () => {
  currentType = 'movie';
  await fetchPopular('movie');
});

popularTvBtn.addEventListener('click', async () => {
  currentType = 'tv';
  await fetchPopular('tv');
});

async function fetchPopular(type, page = 1) {
  resultsEl.innerHTML = `<div class="meta">Loading popular ${type}...</div>`;
  try {
    const res = await fetch(`/api/popular/${type}?page=${page}`);
    const data = await res.json();
    renderResults(data.results || []);
    totalPages = data.total_pages || 1;
    currentPage = data.page || 1;
    renderPagination();
  } catch (err) {
    console.error(err);
    resultsEl.innerHTML = `<div class="meta">Failed to fetch popular.</div>`;
  }
}

async function doSearch(page = 1) {
  resultsEl.innerHTML = `<div class="meta">Searching for "${currentQuery}"...</div>`;
  try {
    const res = await fetch(
      `/api/search?q=${encodeURIComponent(currentQuery)}&type=${currentType}&page=${page}`
    );
    const data = await res.json();
    renderResults(data.results || []);
    totalPages = data.total_pages || 1;
    currentPage = data.page || 1;
    renderPagination();
  } catch (err) {
    console.error(err);
    resultsEl.innerHTML = `<div class="meta">Search failed.</div>`;
  }
}

function renderResults(items) {
  if (!items.length) {
    resultsEl.innerHTML = `<div class="meta">No results found.</div>`;
    return;
  }
  resultsEl.innerHTML = '';
  const base = 'https://image.tmdb.org/t/p/w500';
  items.forEach((it) => {
    const poster = it.poster_path || it.backdrop_path
      ? base + (it.poster_path || it.backdrop_path)
      : '/placeholder.png';
    const title = it.title || it.name || 'Untitled';
    const sub = (it.release_date || it.first_air_date || '').slice(0,4) || '';
    const card = document.createElement('article');
    card.className = 'card';
    card.innerHTML = `
      <img class="poster" src="${poster}" alt="${escapeHtml(title)} poster" loading="lazy" />
      <div class="card-body">
        <h3 class="title">${escapeHtml(title)}</h3>
        <div class="meta">${escapeHtml(sub)} • ${escapeHtml((it.vote_average||0).toFixed(1))} ⭐</div>
      </div>
    `;
    card.addEventListener('click', () => openDetails(it.id, currentType));
    resultsEl.appendChild(card);
  });
}

function renderPagination() {
  paginationEl.innerHTML = '';
  if (totalPages <= 1) return;

  const prev = document.createElement('button');
  prev.className = 'page-btn';
  prev.textContent = 'Prev';
  prev.disabled = currentPage <= 1;
  prev.onclick = () => gotoPage(currentPage - 1);
  paginationEl.appendChild(prev);

  const info = document.createElement('div');
  info.className = 'meta';
  info.style.padding = '0.4rem 0.6rem';
  info.textContent = `Page ${currentPage} / ${totalPages}`;
  paginationEl.appendChild(info);

  const next = document.createElement('button');
  next.className = 'page-btn';
  next.textContent = 'Next';
  next.disabled = currentPage >= totalPages;
  next.onclick = () => gotoPage(currentPage + 1);
  paginationEl.appendChild(next);
}

async function gotoPage(page) {
  if (currentQuery) {
    await doSearch(page);
  } else {
    await fetchPopular(currentType, page);
  }
}

async function openDetails(id, type) {
  modal.classList.add('show');
  modal.setAttribute('aria-hidden', 'false');
  modalBody.innerHTML = `<div class="meta">Loading details...</div>`;
  try {
    const res = await fetch(`/api/details/${type}/${id}`);
    const data = await res.json();
    renderModal(data, type);
  } catch (err) {
    console.error(err);
    modalBody.innerHTML = `<div class="meta">Details failed to load.</div>`;
  }
}

closeModal.addEventListener('click', close);
modal.addEventListener('click', (e) => {
  if (e.target === modal) close();
});
function close() {
  modal.classList.remove('show');
  modal.setAttribute('aria-hidden', 'true');
  modalBody.innerHTML = '';
}

function renderModal(data, type) {
  const base = 'https://image.tmdb.org/t/p/original';
  const title = data.title || data.name || 'Details';
  const poster = data.poster_path ? base + data.poster_path : '';
  const overview = data.overview || 'No description';
  const year = (data.release_date || data.first_air_date || '').slice(0,4);
  const genres = (data.genres || []).map(g=>g.name).join(', ');
  const runtime = data.runtime || data.episode_run_time?.[0] || '';
  const credits = (data.credits && data.credits.cast) ? data.credits.cast.slice(0,6).map(c=>c.name).join(', ') : '';

  modalBody.innerHTML = `
    <div style="display:flex;gap:1rem;align-items:flex-start;flex-wrap:wrap;">
      ${poster ? `<img src="${poster}" alt="${escapeHtml(title)} poster" style="width:220px;border-radius:10px;object-fit:cover" />` : ''}
      <div style="flex:1;min-width:240px">
        <h2 style="margin:0 0 .2rem 0">${escapeHtml(title)} ${year ? `<span style="color:var(--muted);font-weight:600">(${escapeHtml(year)})</span>` : ''}</h2>
        <div class="meta">${escapeHtml(genres)} ${runtime ? '• ' + escapeHtml(runtime + ' min') : ''}</div>
        <p style="margin-top:0.6rem;color:var(--muted)">${escapeHtml(overview)}</p>
        <p style="color:var(--muted);margin-top:0.4rem"><strong>Cast:</strong> ${escapeHtml(credits)}</p>
        ${renderVideos(data.videos)}
      </div>
    </div>
  `;
}

function renderVideos(videos = {}) {
  const results = (videos.results || []).filter(v => v.site === 'YouTube' && (v.type === 'Trailer' || v.type === 'Teaser'));
  if (!results.length) return '';
  const first = results[0];
  const url = `https://www.youtube.com/embed/${first.key}`;
  return `<div style="margin-top:0.6rem"><iframe width="560" height="315" src="${url}" title="Trailer" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen style="width:100%;height:220px;border-radius:8px"></iframe></div>`;
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replaceAll('&','&amp;')
    .replaceAll('<','&lt;')
    .replaceAll('>','&gt;')
    .replaceAll('"','&quot;')
    .replaceAll("'","&#039;");
}

// Init: show popular movies
fetchPopular('movie');
