import CONFIG from './config';
import type { MediaItem, Server, Genre } from './types';

// ==========================================
// Types (re-export from shared types)

interface AppState {
  hostname: string;
  backendUrl: string;
  apiKey: string;
  activeServerIndex: number;
  genres: Genre[];
  genreMap: Record<number, string>;
  activeTab: 'home' | 'watchlist';
  currentMedia: MediaItem | null;
  currentSeason: number;
  currentEpisode: number;
  watchlist: MediaItem[];
  searchDebounce: ReturnType<typeof setTimeout> | null;
}

interface DOMElements {
  serverStatusBtn: HTMLButtonElement | null;
  mediaInput: HTMLInputElement | null;
  searchMediaBtn: HTMLButtonElement | null;
  mediaTypeSelect: HTMLSelectElement | null;
  genreSelect: HTMLSelectElement | null;
  watchlistCount: HTMLElement | null;
  tabHome: HTMLButtonElement | null;
  tabWatchlist: HTMLButtonElement | null;
  panelHome: HTMLElement | null;
  panelWatchlist: HTMLElement | null;
  errorBanner: HTMLElement | null;
  loadingOverlay: HTMLElement | null;
  browseSections: HTMLElement | null;
  searchSection: HTMLElement | null;
  searchHeading: HTMLElement | null;
  searchGrid: HTMLElement | null;
  noSearchResults: HTMLElement | null;
  clearSearchBtn: HTMLButtonElement | null;
  watchlistGrid: HTMLElement | null;
  emptyWatchlist: HTMLElement | null;
  trendingRow: HTMLElement | null;
  popularMoviesRow: HTMLElement | null;
  popularTvRow: HTMLElement | null;
  topRatedRow: HTMLElement | null;
  scifiRow: HTMLElement | null;
  actionRow: HTMLElement | null;
  videoModal: HTMLElement | null;
  playerContainer: HTMLElement | null;
  streamPlayerFrame: HTMLIFrameElement | null;
  serverButtonsContainer: HTMLElement | null;
  tvControls: HTMLElement | null;
  seasonSelect: HTMLSelectElement | null;
  episodeSelect: HTMLSelectElement | null;
  fullscreenBtn: HTMLButtonElement | null;
  toggleFullscreenBtn: HTMLButtonElement | null;
  modalTitle: HTMLElement | null;
  modalTagline: HTMLElement | null;
  modalDuration: HTMLElement | null;
  modalQuality: HTMLElement | null;
  modalGenres: HTMLElement | null;
  modalOverview: HTMLElement | null;
  modalCastList: HTMLElement | null;
  addWatchlistBtn: HTMLButtonElement | null;
  serverModal: HTMLElement | null;
  hostnameInput: HTMLInputElement | null;
  backendUrlInput: HTMLInputElement | null;
  saveServerBtn: HTMLButtonElement | null;
  resetServerBtn: HTMLButtonElement | null;
  modalCloseBtns: NodeListOf<HTMLElement>;
}

// ==========================================
// Constants
// ==========================================
const SERVERS: Server[] = CONFIG.EMBED_SERVERS as unknown as Server[];

// ==========================================
// State
// ==========================================
const state: AppState = {
  hostname: CONFIG.HOSTNAME || 'aether.ist',
  backendUrl: CONFIG.BACKEND_URL || 'https://backend.raccoonunbutteredbagel.zip',
  apiKey: CONFIG.TMDB_READ_API_KEY || '',
  activeServerIndex: 0,
  genres: [],
  genreMap: {},
  activeTab: 'home',
  currentMedia: null,
  currentSeason: 1,
  currentEpisode: 1,
  watchlist: [],
  searchDebounce: null,
};

// ==========================================
// DOM Elements
// ==========================================
const elements: DOMElements = {
  serverStatusBtn: null,
  mediaInput: null,
  searchMediaBtn: null,
  mediaTypeSelect: null,
  genreSelect: null,
  watchlistCount: null,
  tabHome: null,
  tabWatchlist: null,
  panelHome: null,
  panelWatchlist: null,
  errorBanner: null,
  loadingOverlay: null,
  browseSections: null,
  searchSection: null,
  searchHeading: null,
  searchGrid: null,
  noSearchResults: null,
  clearSearchBtn: null,
  watchlistGrid: null,
  emptyWatchlist: null,
  trendingRow: null,
  popularMoviesRow: null,
  popularTvRow: null,
  topRatedRow: null,
  scifiRow: null,
  actionRow: null,
  videoModal: null,
  playerContainer: null,
  streamPlayerFrame: null,
  serverButtonsContainer: null,
  tvControls: null,
  seasonSelect: null,
  episodeSelect: null,
  fullscreenBtn: null,
  toggleFullscreenBtn: null,
  modalTitle: null,
  modalTagline: null,
  modalDuration: null,
  modalQuality: null,
  modalGenres: null,
  modalOverview: null,
  modalCastList: null,
  addWatchlistBtn: null,
  serverModal: null,
  hostnameInput: null,
  backendUrlInput: null,
  saveServerBtn: null,
  resetServerBtn: null,
  modalCloseBtns: null as any,
};

// ==========================================
// Utility Functions
// ==========================================
function escapeHtml(text: string | null | undefined): string {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = String(text);
  return div.innerHTML;
}

function showLoading(show: boolean): void {
  if (elements.loadingOverlay) {
    elements.loadingOverlay.classList.toggle('hidden', !show);
  }
}

function showError(msg: string): void {
  const banner = elements.errorBanner;
  if (!banner) return;
  banner.textContent = msg;
  banner.classList.remove('hidden');
  setTimeout(() => {
    banner.classList.add('hidden');
  }, 6000);
}

function getImageUrl(path: string | null, size: string = 'w500'): string {
  if (!path)
    return 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="300" height="450" fill="%23242430"%3E%3Crect width="100%25" height="100%25"/%3E%3Ctext x="50%25" y="50%25" fill="%23808080" font-family="sans-serif" font-size="20" text-anchor="middle" dominant-baseline="middle"%3ENo Poster%3C/text%3E%3C/svg%3E';
  return `https://image.tmdb.org/t/p/${size}${path}`;
}

// ==========================================
// API Functions
// ==========================================
async function fetchAetherApi(endpoint: string, params: Record<string, any> = {}): Promise<any> {
  const baseUrl = CONFIG.TMDB_BASE_URL || 'https://api.themoviedb.org/3';
  const url = new URL(`${baseUrl}${endpoint}`);

  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') {
      url.searchParams.set(k, v);
    }
  });

  const res = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${state.apiKey}`,
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    throw new Error(`Aether API request failed: ${res.status}`);
  }

  return res.json();
}

// Load all movie and TV genres from Aether backend
async function loadGenres(): Promise<void> {
  try {
    const [movieGenresData, tvGenresData] = await Promise.all([
      fetchAetherApi('/genre/movie/list').catch(() => ({ genres: [] })),
      fetchAetherApi('/genre/tv/list').catch(() => ({ genres: [] })),
    ]);

    const map: Record<number, string> = {};
    const combined: Genre[] = [];

    (movieGenresData.genres || []).concat(tvGenresData.genres || []).forEach((g: Genre) => {
      if (!map[g.id]) {
        map[g.id] = g.name;
        combined.push(g);
      }
    });

    state.genreMap = map;
    state.genres = combined;

    if (elements.genreSelect) {
      elements.genreSelect.innerHTML = '<option value="">All Categories / Genres</option>';
      combined
        .sort((a, b) => a.name.localeCompare(b.name))
        .forEach((g: Genre) => {
          const opt = document.createElement('option');
          opt.value = String(g.id);
          opt.textContent = g.name;
          elements.genreSelect!.appendChild(opt);
        });
    }
  } catch (e) {
    console.warn('Could not load genres from backend:', e);
  }
}

export async function fetchGenres(): Promise<Genre[]> {
  await loadGenres();
  return state.genres;
}

// Normalize raw item from TMDB into standard media structure
function normalizeItem(item: any): MediaItem {
  const isTv =
    item.media_type === 'tv' || Boolean(item.first_air_date) || Boolean(item.name && !item.title);
  const type = isTv ? 'tv' : 'movie';
  const title = item.title || item.name || 'Untitled';
  const dateStr = item.release_date || item.first_air_date || '';
  const year = dateStr ? dateStr.slice(0, 4) : '';
  const rating = item.vote_average ? item.vote_average.toFixed(1) : '8.0';

  const genreNames = (item.genre_ids || []).map((id: number) => state.genreMap[id]).filter(Boolean);
  if (genreNames.length === 0 && Array.isArray(item.genres)) {
    item.genres.forEach((g: Genre) => genreNames.push(g.name));
  }

  return {
    id: `${type}-${item.id}`,
    tmdbId: item.id,
    type,
    title,
    year,
    duration: isTv ? 'TV Series' : 'Movie',
    rating,
    genre: genreNames[0] || (isTv ? 'TV Show' : 'Movie'),
    genres: genreNames,
    poster: getImageUrl(item.poster_path, 'w500'),
    backdrop: getImageUrl(item.backdrop_path, 'original'),
    overview: item.overview || 'No description available for this title.',
  };
}

// Create Card Element
function createMediaCard(item: MediaItem, isWatchlist = false): HTMLElement {
  const card = document.createElement('article');
  card.className = `video-card ${isWatchlist ? 'watchlist-card' : ''} card-interactive`;
  card.setAttribute('role', 'listitem');
  card.setAttribute('tabindex', '0');
  card.dataset.mediaId = item.id;

  card.innerHTML = `
    <div class="video-thumbnail-box relative aspect-video bg-fg/10 overflow-hidden">
      <img src="${escapeHtml(item.poster)}" alt="${escapeHtml(item.title)}" loading="lazy" class="w-full h-full object-cover transition-transform duration-normal ease-snappy hover:scale-105">
      <span class="duration-badge absolute bottom-2 right-2 bg-fg/90 text-bg text-caption font-semibold px-2 py-1 rounded-sm">${escapeHtml(item.year || item.type.toUpperCase())}</span>
      <span class="quality-badge absolute top-2 left-2 bg-primary text-fg text-caption font-bold px-2 py-1 rounded-sm uppercase">${escapeHtml(item.type.toUpperCase())}</span>
      <div class="play-hover-overlay absolute inset-0 bg-fg/30 flex items-center justify-center opacity-0 transition-opacity duration-fast">
        <div class="play-icon-circle w-11 h-11 rounded-full bg-primary text-fg flex items-center justify-center shadow-brutal">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
        </div>
      </div>
    </div>
    <div class="video-info p-4 flex flex-col flex-1">
      <h3 class="video-title font-heading font-semibold text-body leading-tight line-clamp-2 mb-3" title="${escapeHtml(item.title)}">${escapeHtml(item.title)}</h3>
      <div class="video-meta-row flex items-center justify-between text-body-sm text-fg/60 mt-auto">
        <span>${escapeHtml(item.genre)}</span>
        <span>★ ${escapeHtml(item.rating)}</span>
      </div>
    </div>
    ${isWatchlist ? `<button class="remove-btn absolute top-2 right-2 z-10 w-8 h-8 rounded-full bg-fg/70 text-bg text-xl flex items-center justify-center opacity-0 transition-opacity duration-fast hover:bg-primary hover:opacity-100 focus-visible:opacity-100" aria-label="Remove from saved">&times;</button>` : ''}
  `;

  card.addEventListener('click', e => {
    if (!(e.target as HTMLElement).closest('.remove-btn')) {
      void openPlayerModal(item);
    }
  });

  if (isWatchlist) {
    const removeBtn = card.querySelector('.remove-btn');
    if (removeBtn) {
      removeBtn.addEventListener('click', e => {
        e.stopPropagation();
        removeFromWatchlist(item.id);
      });
    }
  }

  return card;
}

function renderRow(container: HTMLElement | null, items: MediaItem[]): void {
  if (!container) return;
  container.innerHTML = '';
  items.forEach(item => {
    container.appendChild(createMediaCard(item));
  });
}

// Load all Home catalog sections from Aether
export async function fetchHomeSectionsData(): Promise<{
  trending: MediaItem[];
  popularMovies: MediaItem[];
  popularTv: MediaItem[];
  topRated: MediaItem[];
  scifi: MediaItem[];
  action: MediaItem[];
}> {
  const [trending, popularMovies, popularTv, topRated, scifi, action] = await Promise.all([
    fetchAetherApi('/trending/all/week'),
    fetchAetherApi('/movie/popular'),
    fetchAetherApi('/tv/popular'),
    fetchAetherApi('/movie/top_rated'),
    fetchAetherApi('/discover/movie', { with_genres: 878, sort_by: 'popularity.desc' }),
    fetchAetherApi('/discover/movie', { with_genres: 28, sort_by: 'popularity.desc' }),
  ]);

  const sectionsData = {
    trending: (trending.results || []).map(normalizeItem),
    popularMovies: (popularMovies.results || []).map(normalizeItem),
    popularTv: (popularTv.results || []).map(normalizeItem),
    topRated: (topRated.results || []).map(normalizeItem),
    scifi: (scifi.results || []).map(normalizeItem),
    action: (action.results || []).map(normalizeItem),
  };

  if (elements.trendingRow) renderRow(elements.trendingRow, sectionsData.trending);
  if (elements.popularMoviesRow) renderRow(elements.popularMoviesRow, sectionsData.popularMovies);
  if (elements.popularTvRow) renderRow(elements.popularTvRow, sectionsData.popularTv);
  if (elements.topRatedRow) renderRow(elements.topRatedRow, sectionsData.topRated);
  if (elements.scifiRow) renderRow(elements.scifiRow, sectionsData.scifi);
  if (elements.actionRow) renderRow(elements.actionRow, sectionsData.action);

  return sectionsData;
}

async function loadHomeSections(): Promise<void> {
  showLoading(true);
  try {
    await fetchHomeSectionsData();
  } catch (err) {
    console.error('Failed to load Aether catalog sections:', err);
    showError('Failed to load catalog from Aether backend. Check connection.');
  } finally {
    showLoading(false);
  }
}

export async function fetchSearchResults(
  query: string,
  genreId: string = '',
  type: string = 'all'
): Promise<MediaItem[]> {
  let results: any[] = [];

  // If user typed a numeric TMDB ID directly, fetch that specific item
  const trimmedQuery = query.trim();
  if (/^\d+$/.test(trimmedQuery)) {
    const id = parseInt(trimmedQuery, 10);
    try {
      const movieItem = await fetchAetherApi(`/movie/${id}`);
      if (movieItem && movieItem.id) results.push(movieItem);
    } catch {
      try {
        const tvItem = await fetchAetherApi(`/tv/${id}`);
        if (tvItem && tvItem.id) results.push(tvItem);
      } catch {}
    }
  }

  // If user pasted an IMDb ID (e.g. tt0137523, tt0944947)
  if (results.length === 0 && /^tt\d+$/i.test(trimmedQuery)) {
    try {
      const findData = await fetchAetherApi(`/find/${trimmedQuery}`, {
        external_source: 'imdb_id',
      });
      if (findData?.movie_results?.length > 0) {
        results.push(...findData.movie_results);
      } else if (findData?.tv_results?.length > 0) {
        results.push(...findData.tv_results);
      }
    } catch (err) {
      console.warn('IMDb find lookup failed:', err);
    }
  }

  // Auto-detect if query matches a known genre name
  let targetGenreId = genreId;
  if (!targetGenreId && query) {
    const qLower = query.toLowerCase().trim();
    const matchedGenre = state.genres.find(
      g =>
        g.name.toLowerCase() === qLower ||
        (qLower === 'sci-fi' &&
          (g.name.toLowerCase().includes('science fiction') ||
            g.name.toLowerCase().includes('sci-fi')))
    );
    if (matchedGenre) {
      targetGenreId = String(matchedGenre.id);
    }
  }

  if (results.length === 0) {
    if (targetGenreId && (!query || state.genres.some(g => String(g.id) === targetGenreId))) {
      // Discovered top media for this genre
      try {
        const [movieData, tvData] = await Promise.all([
          fetchAetherApi('/discover/movie', {
            with_genres: targetGenreId,
            sort_by: 'popularity.desc',
          }).catch(() => ({ results: [] })),
          fetchAetherApi('/discover/tv', {
            with_genres: targetGenreId,
            sort_by: 'popularity.desc',
          }).catch(() => ({ results: [] })),
        ]);
        results = (movieData.results || []).slice(0, 12).concat((tvData.results || []).slice(0, 8));
      } catch (e) {
        console.warn('Genre discovery failed:', e);
      }
    } else if (query) {
      if (type === 'movie') {
        const data = await fetchAetherApi('/search/movie', { query, page: 1 });
        results = data.results || [];
      } else if (type === 'tv') {
        const data = await fetchAetherApi('/search/tv', { query, page: 1 });
        results = data.results || [];
      } else {
        const data = await fetchAetherApi('/search/multi', { query, page: 1 });
        results = (data.results || []).filter(
          (r: any) => r.media_type === 'movie' || r.media_type === 'tv'
        );
      }
    }
  }

  return results.map(normalizeItem);
}

// Live Search / Filter across Aether catalog
async function performSearch(query: string, genreId: string, type: string): Promise<void> {
  if (!query && !genreId) {
    // Restore home view
    if (elements.searchSection) elements.searchSection.classList.add('hidden');
    if (elements.browseSections) elements.browseSections.classList.remove('hidden');
    return;
  }

  showLoading(true);
  if (elements.searchSection) elements.searchSection.classList.remove('hidden');
  if (elements.browseSections) elements.browseSections.classList.add('hidden');
  if (elements.searchHeading)
    elements.searchHeading.textContent = query
      ? `Search Results for "${query}"`
      : 'Filtered Titles';
  if (elements.searchGrid) elements.searchGrid.innerHTML = '';

  try {
    const normalized = await fetchSearchResults(query, genreId, type);

    if (normalized.length === 0) {
      if (elements.noSearchResults) elements.noSearchResults.classList.remove('hidden');
    } else {
      if (elements.noSearchResults) elements.noSearchResults.classList.add('hidden');
      normalized.forEach(item => {
        elements.searchGrid?.appendChild(createMediaCard(item));
      });
    }
  } catch (err) {
    console.error('Search error:', err);
    showError('Search query failed.');
  } finally {
    showLoading(false);
  }
}

export async function fetchItemDetails(item: MediaItem): Promise<{
  tagline: string;
  duration: string;
  quality: string;
  cast: { name: string; character: string; profile_path: string }[];
  seasons: number;
  episodes: number;
  seasonsData: { season_number: number; episode_count: number }[];
}> {
  try {
    const details = await fetchAetherApi(`/${item.type}/${item.tmdbId}`, {
      append_to_response: 'credits',
    });
    const tagline = details.tagline ? `"${details.tagline}"` : '';
    let duration = `${item.year || ''} • ${item.duration || ''}`;

    if (item.type === 'movie' && details.runtime) {
      const hrs = Math.floor(details.runtime / 60);
      const mins = details.runtime % 60;
      duration = `${item.year} • ${hrs > 0 ? `${hrs}h ` : ''}${mins}m • ★ ${item.rating}`;
    } else if (item.type === 'tv' && details.number_of_seasons) {
      duration = `${details.number_of_seasons} Season${details.number_of_seasons > 1 ? 's' : ''} • ★ ${item.rating}`;
    }

    const cast = (details.credits?.cast || []).slice(0, 6).map((c: any) => ({
      name: c.name || '',
      character: c.character || '',
      profile_path: c.profile_path || '',
    }));

    const seasons = details.number_of_seasons || 1;
    const seasonsData = (details.seasons || []).map((s: any) => ({
      season_number: s.season_number,
      episode_count: s.episode_count || 12,
    }));
    const s1 = seasonsData.find((s: any) => s.season_number === 1);
    const episodes = s1 ? s1.episode_count : 12;

    return {
      tagline,
      duration,
      quality: `${item.type.toUpperCase()} • HD`,
      cast,
      seasons,
      episodes,
      seasonsData,
    };
  } catch (err) {
    console.warn('Could not fetch item details:', err);
    return {
      tagline: '',
      duration: `${item.year || ''} • ${item.duration || ''}`,
      quality: `${item.type.toUpperCase()} • HD`,
      cast: [],
      seasons: 1,
      episodes: 1,
      seasonsData: [],
    };
  }
}

export async function fetchTvSeasonEpisodes(
  tvId: number,
  seasonNumber: number
): Promise<{ episode_number: number; name: string }[]> {
  try {
    const data = await fetchAetherApi(`/tv/${tvId}/season/${seasonNumber}`);
    if (data && Array.isArray(data.episodes)) {
      return data.episodes.map((ep: any) => ({
        episode_number: ep.episode_number,
        name: ep.name || `Episode ${ep.episode_number}`,
      }));
    }
    return [];
  } catch (err) {
    console.warn(`Failed to fetch episodes for TV ${tvId} S${seasonNumber}:`, err);
    return [];
  }
}

// ==========================================
// Local Player Modal (Plays strictly on localhost)
// ==========================================
function getStreamEmbedUrl(
  item: MediaItem,
  serverIndex = state.activeServerIndex,
  season = state.currentSeason,
  episode = state.currentEpisode
): string {
  const server = SERVERS[serverIndex] || SERVERS[0];
  if (item.type === 'tv') {
    return server.getTvUrl
      ? server.getTvUrl(String(item.tmdbId), season, episode)
      : server.getMovieUrl(String(item.tmdbId));
  }
  return server.getMovieUrl(String(item.tmdbId));
}

function renderServerButtons(): void {
  if (!elements.serverButtonsContainer) return;
  elements.serverButtonsContainer.innerHTML = '';
  SERVERS.forEach((server, idx) => {
    const btn = document.createElement('button');
    btn.className = `server-btn px-3 py-1.5 text-caption font-semibold border-2 border-border rounded-sm transition-all duration-fast ease-snappy shadow-brutal-sm hover:shadow-brutal active:shadow-brutal-pressed active:translate-x-0.5 active:translate-y-0.5 ${idx === state.activeServerIndex ? 'bg-primary text-fg border-primary' : 'bg-bg text-fg/70 hover:bg-fg/10'}`;
    btn.textContent = `Server ${idx + 1}`;
    btn.title = server.name;
    btn.addEventListener('click', () => {
      state.activeServerIndex = idx;
      renderServerButtons();
      if (state.currentMedia) {
        updateStreamSource();
      }
    });
    elements.serverButtonsContainer!.appendChild(btn);
  });
}

function updateStreamSource(): void {
  if (!state.currentMedia || !elements.streamPlayerFrame) return;
  const url = getStreamEmbedUrl(
    state.currentMedia,
    state.activeServerIndex,
    state.currentSeason,
    state.currentEpisode
  );
  elements.streamPlayerFrame.src = url;
}

async function openPlayerModal(item: MediaItem): Promise<void> {
  state.currentMedia = item;
  state.currentSeason = 1;
  state.currentEpisode = 1;

  if (elements.modalTitle) elements.modalTitle.textContent = item.title;
  if (elements.modalDuration)
    elements.modalDuration.textContent = `${item.year || ''} • ${item.duration || ''}`;
  if (elements.modalQuality) elements.modalQuality.textContent = `${item.type.toUpperCase()} • HD`;
  if (elements.modalGenres)
    elements.modalGenres.innerHTML = (item.genres || [item.genre])
      .map(g => `<span class="badge badge-primary">${escapeHtml(g)}</span>`)
      .join('');
  if (elements.modalOverview) elements.modalOverview.textContent = item.overview || '';
  if (elements.modalTagline) elements.modalTagline.textContent = '';
  if (elements.modalCastList) elements.modalCastList.innerHTML = '';

  // Fetch detailed metadata from Aether backend (cast, runtime, tagline, seasons)
  try {
    const details = await fetchAetherApi(`/${item.type}/${item.tmdbId}`, {
      append_to_response: 'credits',
    });

    if (details.tagline && elements.modalTagline) {
      elements.modalTagline.textContent = `"${details.tagline}"`;
    }

    if (item.type === 'movie' && details.runtime && elements.modalDuration) {
      const hrs = Math.floor(details.runtime / 60);
      const mins = details.runtime % 60;
      elements.modalDuration.textContent = `${item.year} • ${hrs > 0 ? `${hrs}h ` : ''}${mins}m • ★ ${item.rating}`;
    } else if (item.type === 'tv' && details.number_of_seasons && elements.modalDuration) {
      elements.modalDuration.textContent = `${details.number_of_seasons} Season${details.number_of_seasons > 1 ? 's' : ''} • ★ ${item.rating}`;
    }

    // Populate Cast
    const cast = (details.credits?.cast || []).slice(0, 6);
    if (cast.length > 0 && elements.modalCastList) {
      elements.modalCastList.innerHTML = cast
        .map(
          (c: { name: string; character: string; profile_path: string }) => `
        <div class="cast-member flex flex-col items-center gap-1 w-20" role="listitem">
          <img class="cast-photo w-20 h-20 rounded-full object-cover border-2 border-transparent hover:border-primary transition-colors duration-fast" src="${getImageUrl(c.profile_path, 'w185')}" alt="${escapeHtml(c.name)}" loading="lazy">
          <div class="cast-name text-caption font-medium text-center truncate w-full">${escapeHtml(c.name)}</div>
          <div class="cast-character text-caption text-fg/50 text-center truncate w-full">${escapeHtml(c.character || '')}</div>
        </div>
      `
        )
        .join('');
    }

    // Populate TV Seasons & Episodes
    if (item.type === 'tv') {
      if (elements.tvControls) elements.tvControls.classList.remove('hidden');
      const numSeasons = details.number_of_seasons || 1;
      if (elements.seasonSelect) {
        elements.seasonSelect.innerHTML = '';
        for (let s = 1; s <= numSeasons; s++) {
          const opt = document.createElement('option');
          opt.value = String(s);
          opt.textContent = `Season ${s}`;
          elements.seasonSelect.appendChild(opt);
        }
      }
      populateEpisodesForSeason(1, details.seasons || []);
    } else {
      if (elements.tvControls) elements.tvControls.classList.add('hidden');
    }
  } catch (e) {
    console.warn('Could not load rich details:', e);
  }

  renderServerButtons();
  updateStreamSource();
  updateWatchlistButton(isInWatchlist(item.id));
  if (elements.videoModal) {
    elements.videoModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }
}

function populateEpisodesForSeason(seasonNum: number, seasonsArray: any[] = []): void {
  if (!elements.episodeSelect) return;
  elements.episodeSelect.innerHTML = '';
  const seasonObj = seasonsArray.find(s => s.season_number === seasonNum);
  const count = seasonObj ? seasonObj.episode_count : 12;
  for (let e = 1; e <= count; e++) {
    const opt = document.createElement('option');
    opt.value = String(e);
    opt.textContent = `Ep ${e}`;
    elements.episodeSelect.appendChild(opt);
  }
}

function closePlayerModal(): void {
  if (elements.videoModal) elements.videoModal.classList.add('hidden');
  document.body.style.overflow = '';
  if (elements.streamPlayerFrame) elements.streamPlayerFrame.src = '';
  state.currentMedia = null;
}

function toggleFullscreen(): void {
  const container = elements.playerContainer;
  if (!container) return;
  if (!document.fullscreenElement) {
    if (container.requestFullscreen) {
      void container.requestFullscreen();
    } else if ('webkitRequestFullscreen' in container) {
      void (
        container as HTMLElement & { webkitRequestFullscreen: () => Promise<void> }
      ).webkitRequestFullscreen();
    }
  } else {
    if (document.exitFullscreen) {
      void document.exitFullscreen();
    }
  }
}

// ==========================================
// Watchlist Management
// ==========================================
function loadWatchlist(): void {
  try {
    const saved = localStorage.getItem('aether_saved_watchlist');
    state.watchlist = saved ? JSON.parse(saved) : [];
    if (elements.watchlistCount)
      elements.watchlistCount.textContent = String(state.watchlist.length);
  } catch {
    state.watchlist = [];
  }
}

function saveWatchlist(): void {
  try {
    localStorage.setItem('aether_saved_watchlist', JSON.stringify(state.watchlist));
    if (elements.watchlistCount)
      elements.watchlistCount.textContent = String(state.watchlist.length);
  } catch (e) {
    console.warn('Error saving watchlist:', e);
  }
}

function isInWatchlist(mediaId: string): boolean {
  return state.watchlist.some(m => m.id === mediaId);
}

function addToWatchlist(item: MediaItem): void {
  if (!isInWatchlist(item.id)) {
    state.watchlist.unshift(item);
    saveWatchlist();
    updateWatchlistButton(true);
    if (state.activeTab === 'watchlist') renderWatchlistGrid();
  }
}

function removeFromWatchlist(mediaId: string): void {
  state.watchlist = state.watchlist.filter(m => m.id !== mediaId);
  saveWatchlist();
  if (state.activeTab === 'watchlist') renderWatchlistGrid();
  if (state.currentMedia && state.currentMedia.id === mediaId) {
    updateWatchlistButton(false);
  }
}

function updateWatchlistButton(saved: boolean): void {
  if (!elements.addWatchlistBtn) return;
  elements.addWatchlistBtn.textContent = saved ? 'Saved in Watchlist ✓' : 'Save to Watchlist';
  elements.addWatchlistBtn.classList.toggle('btn-primary', saved);
  elements.addWatchlistBtn.classList.toggle('btn-secondary', !saved);
}

function renderWatchlistGrid(): void {
  if (!elements.watchlistGrid) return;
  elements.watchlistGrid.innerHTML = '';
  const count = state.watchlist.length;
  if (elements.watchlistCount) elements.watchlistCount.textContent = String(count);

  if (count === 0) {
    if (elements.emptyWatchlist) elements.emptyWatchlist.classList.remove('hidden');
    return;
  }

  if (elements.emptyWatchlist) elements.emptyWatchlist.classList.add('hidden');
  state.watchlist.forEach(item => {
    elements.watchlistGrid!.appendChild(createMediaCard(item, true));
  });
}

function switchTab(tab: 'home' | 'watchlist'): void {
  state.activeTab = tab;
  const isHome = tab === 'home';

  if (elements.tabHome) elements.tabHome.classList.toggle('active', isHome);
  if (elements.tabWatchlist) elements.tabWatchlist.classList.toggle('active', !isHome);
  if (elements.panelHome) elements.panelHome.classList.toggle('hidden', !isHome);
  if (elements.panelWatchlist) elements.panelWatchlist.classList.toggle('hidden', isHome);

  if (!isHome) {
    renderWatchlistGrid();
  }
}

export {
  // Legacy DOM manipulation functions (kept for backward compatibility)
  // TODO: Remove once all components migrate to services
  performSearch,
  switchTab,
  openPlayerModal,
  closePlayerModal,
  addToWatchlist,
  removeFromWatchlist,
  isInWatchlist,
  updateWatchlistButton,
  renderWatchlistGrid,
  loadHomeSections,
  loadWatchlist,
  saveWatchlist,
  normalizeItem,
  getImageUrl,
  fetchAetherApi,
  toggleFullscreen,
  SERVERS,
};

// Re-export shared types for consumers
export type { MediaItem, Server, Genre, ItemDetails, Episode, HomeSections } from './types';

// Re-export services for new code
export { apiService, watchlistService, streamLogService } from './services';
