export interface MediaItem {
  id: string;
  tmdbId: number;
  type: 'movie' | 'tv';
  title: string;
  year: string;
  duration: string;
  rating: string;
  genre: string;
  genres: string[];
  poster: string;
  backdrop: string;
  overview: string;
}

export interface Server {
  id: string;
  name: string;
  getMovieUrl: (id: string) => string;
  getTvUrl: (id: string, s?: number, e?: number) => string;
}

export interface Genre {
  id: number;
  name: string;
}

export interface StreamLogEntry {
  id: string;
  timestamp: string;
  type: 'connect' | 'server' | 'watchlist' | 'episode';
  tag: string;
  message: string;
  media: MediaItem;
  serverIndex?: number;
  season?: number;
  episode?: number;
}

export interface CastMember {
  name: string;
  character: string;
  profile_path: string;
}

export interface ItemDetails {
  tagline: string;
  duration: string;
  quality: string;
  cast: CastMember[];
  seasons: number;
  episodes: number;
  seasonsData: { season_number: number; episode_count: number }[];
}

export interface Episode {
  episode_number: number;
  name: string;
}

export interface SearchFilters {
  query: string;
  genreId: string;
  type: 'all' | 'movie' | 'tv';
}

export type ActiveTab = 'home' | 'watchlist';

export type ThemeId =
  | 'mocha'
  | 'tokyo'
  | 'gruvbox'
  | 'solarized'
  | 'nord'
  | 'everforest'
  | 'rose-pine'
  | 'dracula'
  | 'kanagawa'
  | 'cyberpunk'
  | 'doom-one'
  | 'ayu'
  | 'one-dark'
  | 'github-dark'
  | 'frappe';

export interface ThemeOption {
  id: ThemeId;
  name: string;
  badge: string;
  accentPrimary: string;
  accentHighlight: string;
  bgCrust: string;
}

export interface HomeSections {
  trending: MediaItem[];
  popularMovies: MediaItem[];
  popularTv: MediaItem[];
  topRated: MediaItem[];
  scifi: MediaItem[];
  action: MediaItem[];
}

export interface AppConfig {
  PLAY_MODE: 'local';
  HOSTNAME: string;
  HOST_URL: string;
  BACKEND_URL: string;
  SECURE: boolean;
  TMDB_READ_API_KEY: string;
  TMDB_BASE_URL: string;
  IMAGE_BASE: string;
  BACKDROP_BASE: string;
  VITE_BACKEND_URL: string;
  VITE_CORS_PROXY_URL: string;
  VITE_TMDB_READ_API_KEY: string;
  VITE_NORMAL_ROUTER: boolean;
  VITE_DISALLOWED_IDS: string;
  VITE_DMCA_EMAIL: string | null;
  EMBED_SERVERS: Server[];
}
