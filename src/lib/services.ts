import CONFIG from './config';
import type {
  MediaItem,
  Server,
  Genre,
  ItemDetails,
  Episode,
  HomeSections,
  SearchFilters,
  StreamLogEntry,
} from './types';
import { watchlistStorage, streamLogsStorage } from './storage';

// ==========================================
// Internal State (not exported)
// ==========================================

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

const SERVERS: Server[] = CONFIG.EMBED_SERVERS as unknown as Server[];

// ==========================================
// Utility Functions
// ==========================================

function getImageUrl(path: string | null, size: string = 'w500'): string {
  if (!path) {
    return 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="300" height="450" fill="%23242430"%3E%3Crect width="100%25" height="100%25"/%3E%3Ctext x="50%25" y="50%25" fill="%23808080" font-family="sans-serif" font-size="20" text-anchor="middle" dominant-baseline="middle"%3ENo Poster%3C/text%3E%3C/svg%3E';
  }
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
  } catch (e) {
    console.warn('Could not load genres from backend:', e);
  }
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

// ==========================================
// Public Service API
// ==========================================

export const apiService = {
  async fetchGenres(): Promise<Genre[]> {
    await loadGenres();
    return state.genres;
  },

  async fetchHomeSections(): Promise<HomeSections> {
    const [trending, popularMovies, popularTv, topRated, scifi, action] = await Promise.all([
      fetchAetherApi('/trending/all/week'),
      fetchAetherApi('/movie/popular'),
      fetchAetherApi('/tv/popular'),
      fetchAetherApi('/movie/top_rated'),
      fetchAetherApi('/discover/movie', { with_genres: 878, sort_by: 'popularity.desc' }),
      fetchAetherApi('/discover/movie', { with_genres: 28, sort_by: 'popularity.desc' }),
    ]);

    return {
      trending: (trending.results || []).map(normalizeItem),
      popularMovies: (popularMovies.results || []).map(normalizeItem),
      popularTv: (popularTv.results || []).map(normalizeItem),
      topRated: (topRated.results || []).map(normalizeItem),
      scifi: (scifi.results || []).map(normalizeItem),
      action: (action.results || []).map(normalizeItem),
    };
  },

  async fetchSearchResults(filters: SearchFilters): Promise<MediaItem[]> {
    const { query, genreId, type } = filters;
    let results: any[] = [];

    const trimmedQuery = query.trim();

    // Direct TMDB ID
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

    // IMDb ID
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

    // Genre auto-detection
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
          results = (movieData.results || [])
            .slice(0, 12)
            .concat((tvData.results || []).slice(0, 8));
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
  },

  async fetchItemDetails(item: MediaItem): Promise<ItemDetails> {
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
  },

  async fetchTvSeasonEpisodes(tvId: number, seasonNumber: number): Promise<Episode[]> {
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
  },

  getStreamEmbedUrl(
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
  },

  getServers(): Server[] {
    return SERVERS;
  },

  getActiveServerIndex(): number {
    return state.activeServerIndex;
  },

  setActiveServerIndex(index: number): void {
    state.activeServerIndex = index;
  },

  getCurrentMedia(): MediaItem | null {
    return state.currentMedia;
  },

  setCurrentMedia(media: MediaItem | null): void {
    state.currentMedia = media;
  },

  getCurrentSeason(): number {
    return state.currentSeason;
  },

  setCurrentSeason(season: number): void {
    state.currentSeason = season;
  },

  getCurrentEpisode(): number {
    return state.currentEpisode;
  },

  setCurrentEpisode(episode: number): void {
    state.currentEpisode = episode;
  },

  getGenres(): Genre[] {
    return state.genres;
  },

  getGenreMap(): Record<number, string> {
    return state.genreMap;
  },
};

// ==========================================
// Watchlist Service
// ==========================================

export const watchlistService = {
  load(): MediaItem[] {
    return watchlistStorage.get();
  },

  save(watchlist: MediaItem[]): void {
    watchlistStorage.set(watchlist);
  },

  getAll(): MediaItem[] {
    return watchlistStorage.get();
  },

  isInWatchlist(mediaId: string): boolean {
    return watchlistStorage.get().some(m => m.id === mediaId);
  },

  add(item: MediaItem): void {
    const watchlist = watchlistStorage.get();
    if (!watchlist.some(m => m.id === item.id)) {
      watchlist.unshift(item);
      watchlistStorage.set(watchlist);
    }
  },

  remove(mediaId: string): void {
    const watchlist = watchlistStorage.get().filter(m => m.id !== mediaId);
    watchlistStorage.set(watchlist);
  },

  toggle(item: MediaItem): boolean {
    const watchlist = watchlistStorage.get();
    const exists = watchlist.some(m => m.id === item.id);
    if (exists) {
      watchlistStorage.set(watchlist.filter(m => m.id !== item.id));
      return false;
    } else {
      watchlist.unshift(item);
      watchlistStorage.set(watchlist);
      return true;
    }
  },
};

// ==========================================
// Stream Log Service
// ==========================================

export const streamLogService = {
  load(): StreamLogEntry[] {
    return streamLogsStorage.get();
  },

  save(logs: StreamLogEntry[]): void {
    streamLogsStorage.set(logs);
  },

  add(entry: Omit<StreamLogEntry, 'id' | 'timestamp'>): StreamLogEntry {
    const now = new Date();
    const timestamp = now.toTimeString().split(' ')[0];
    const newEntry: StreamLogEntry = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      timestamp,
      ...entry,
    };
    return newEntry;
  },
};

// Re-export types for consumers
export type {
  MediaItem,
  Server,
  Genre,
  ItemDetails,
  Episode,
  HomeSections,
  SearchFilters,
  StreamLogEntry,
} from './types';
