// Configuration for Aether Local Streaming Hub
const CONFIG = {
  // Playback mode: local embed (no external redirects)
  PLAY_MODE: "local",

  // Hostname & Backend
  HOSTNAME: "aether.ist",
  HOST_URL: "https://aether.ist",
  BACKEND_URL: "https://backend.raccoonunbutteredbagel.zip",
  SECURE: true,

  // Aether TMDB Read Token (used by Aether frontend to fetch the full catalog)
  TMDB_READ_API_KEY: "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI1YjEwYWNhZDFhNjY3ZTQwMDEyMGVjMTc1ZDBjZTFmZCIsIm5iZiI6MTcyNDk1Mjg3MC45NDA4NDcsInN1YiI6IjY2ZDBhOTgyODQ1OWYzM2FmMjBmYjdkNSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.ScGHs1VZTLGpUKWPG7EA-2T29OPcqW_qpJjKL5Yhrjc",
  TMDB_BASE_URL: "https://api.themoviedb.org/3",
  IMAGE_BASE: "https://image.tmdb.org/t/p/w500",
  BACKDROP_BASE: "https://image.tmdb.org/t/p/original",

  // Sudo-Flix / Movie-Web standard environment variables
  VITE_BACKEND_URL: "https://backend.raccoonunbutteredbagel.zip",
  VITE_CORS_PROXY_URL: "",
  VITE_TMDB_READ_API_KEY: "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI1YjEwYWNhZDFhNjY3ZTQwMDEyMGVjMTc1ZDBjZTFmZCIsIm5iZiI6MTcyNDk1Mjg3MC45NDA4NDcsInN1YiI6IjY2ZDBhOTgyODQ1OWYzM2FmMjBmYjdkNSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.ScGHs1VZTLGpUKWPG7EA-2T29OPcqW_qpJjKL5Yhrjc",
  VITE_NORMAL_ROUTER: true,
  VITE_DISALLOWED_IDS: "",
  VITE_DMCA_EMAIL: null,

  // Local Embed Streaming Servers (all embeddable on localhost without redirects)
  EMBED_SERVERS: [
    {
      id: "vidsrc",
      name: "Server 1 (VidSrc)",
      getMovieUrl: (id) => `https://vidsrc.xyz/embed/movie?tmdb=${id}`,
      getTvUrl: (id, s = 1, e = 1) => `https://vidsrc.xyz/embed/tv?tmdb=${id}&season=${s}&episode=${e}`
    },
    {
      id: "autoembed",
      name: "Server 2 (AutoEmbed)",
      getMovieUrl: (id) => `https://player.autoembed.cc/embed/movie/${id}`,
      getTvUrl: (id, s = 1, e = 1) => `https://player.autoembed.cc/embed/tv/${id}/${s}/${e}`
    },
    {
      id: "2embed",
      name: "Server 3 (2Embed)",
      getMovieUrl: (id) => `https://www.2embed.cc/embed/${id}`,
      getTvUrl: (id, s = 1, e = 1) => `https://www.2embed.cc/embedtv/${id}&s=${s}&e=${e}`
    },
    {
      id: "embedsu",
      name: "Server 4 (EmbedSu)",
      getMovieUrl: (id) => `https://embed.su/embed/movie/${id}`,
      getTvUrl: (id, s = 1, e = 1) => `https://embed.su/embed/tv/${id}/${s}/${e}`
    }
  ]
};

// Export to window.__CONFIG__ as expected by Aether / Movie-Web client
window.__CONFIG__ = {
  VITE_CORS_PROXY_URL: CONFIG.VITE_CORS_PROXY_URL,
  VITE_TMDB_READ_API_KEY: CONFIG.VITE_TMDB_READ_API_KEY,
  VITE_DMCA_EMAIL: CONFIG.VITE_DMCA_EMAIL,
  VITE_NORMAL_ROUTER: CONFIG.VITE_NORMAL_ROUTER,
  VITE_BACKEND_URL: CONFIG.BACKEND_URL,
  VITE_DISALLOWED_IDS: CONFIG.VITE_DISALLOWED_IDS
};
