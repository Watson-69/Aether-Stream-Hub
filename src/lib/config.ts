// Configuration for Aether Local Streaming Hub
declare global {
  interface Window {
    __CONFIG__: {
      VITE_CORS_PROXY_URL: string;
      VITE_TMDB_READ_API_KEY: string;
      VITE_DMCA_EMAIL: string | null;
      VITE_NORMAL_ROUTER: boolean;
      VITE_BACKEND_URL: string;
      VITE_DISALLOWED_IDS: string;
    };
  }
}

// Read TMDB API key from environment variables only (no hardcoded fallback)
const envKey =
  typeof import.meta !== 'undefined' && import.meta.env
    ? import.meta.env.VITE_TMDB_READ_API_KEY
    : '';
const activeTmdbKey = envKey && envKey !== 'your_tmdb_read_access_token_here' ? envKey : '';

if (!activeTmdbKey) {
  console.warn(
    '[Aether] VITE_TMDB_READ_API_KEY not configured. Set it in .env.local to enable TMDB API access.'
  );
}

export interface EmbedServer {
  id: string;
  name: string;
  getMovieUrl: (id: string) => string;
  getTvUrl: (id: string, s?: number, e?: number) => string;
}

const CONFIG = {
  // Playback mode: local embed (no external redirects)
  PLAY_MODE: 'local',

  // Hostname & Backend
  HOSTNAME: 'aether.ist',
  HOST_URL: 'https://aether.ist',
  BACKEND_URL: 'https://backend.raccoonunbutteredbagel.zip',
  SECURE: true,

  // TMDB API Configuration (direct TMDB API v3 endpoints)
  TMDB_READ_API_KEY: activeTmdbKey,
  TMDB_BASE_URL: 'https://api.themoviedb.org/3',
  IMAGE_BASE: 'https://image.tmdb.org/t/p/w500',
  BACKDROP_BASE: 'https://image.tmdb.org/t/p/original',

  // Sudo-Flix / Movie-Web standard environment variables
  VITE_BACKEND_URL: 'https://backend.raccoonunbutteredbagel.zip',
  VITE_CORS_PROXY_URL: '',
  VITE_TMDB_READ_API_KEY: activeTmdbKey,
  VITE_NORMAL_ROUTER: true,
  VITE_DISALLOWED_IDS: '',
  VITE_DMCA_EMAIL: null,

  // Verified Local Embed Streaming Servers (all embeddable on localhost without iframe blocking)
  EMBED_SERVERS: [
    {
      id: 'vidlink',
      name: 'Server 1 (VidLink)',
      getMovieUrl: (id: string) => `https://vidlink.pro/movie/${id}`,
      getTvUrl: (id: string, s = 1, e = 1) => `https://vidlink.pro/tv/${id}/${s}/${e}`,
    },
    {
      id: 'vidsrc-pm',
      name: 'Server 2 (VidSrc PM)',
      getMovieUrl: (id: string) => `https://vidsrc.pm/embed/movie/${id}`,
      getTvUrl: (id: string, s = 1, e = 1) => `https://vidsrc.pm/embed/tv/${id}/${s}/${e}`,
    },
    {
      id: 'vidsrc-su',
      name: 'Server 3 (VidSrc SU)',
      getMovieUrl: (id: string) => `https://vidsrc.su/embed/movie/${id}`,
      getTvUrl: (id: string, s = 1, e = 1) => `https://vidsrc.su/embed/tv/${id}/${s}/${e}`,
    },
    {
      id: 'autoembed',
      name: 'Server 4 (AutoEmbed)',
      getMovieUrl: (id: string) => `https://autoembed.co/movie/tmdb/${id}`,
      getTvUrl: (id: string, s = 1, e = 1) => `https://autoembed.co/tv/tmdb/${id}-${s}-${e}`,
    },
    {
      id: '2embed',
      name: 'Server 5 (2Embed)',
      getMovieUrl: (id: string) => `https://www.2embed.cc/embed/${id}`,
      getTvUrl: (id: string, s = 1, e = 1) => `https://www.2embed.cc/embedtv/${id}&s=${s}&e=${e}`,
    },
  ] as EmbedServer[],
};

// Export to window.__CONFIG__ as expected by Aether / Movie-Web client
if (typeof window !== 'undefined') {
  window.__CONFIG__ = {
    VITE_CORS_PROXY_URL: CONFIG.VITE_CORS_PROXY_URL,
    VITE_TMDB_READ_API_KEY: CONFIG.VITE_TMDB_READ_API_KEY,
    VITE_DMCA_EMAIL: CONFIG.VITE_DMCA_EMAIL,
    VITE_NORMAL_ROUTER: CONFIG.VITE_NORMAL_ROUTER,
    VITE_BACKEND_URL: CONFIG.BACKEND_URL,
    VITE_DISALLOWED_IDS: CONFIG.VITE_DISALLOWED_IDS,
  };
}

export default CONFIG;
