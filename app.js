(function () {
  'use strict';

  // Application State
  const state = {
    hostname: (typeof CONFIG !== 'undefined' && CONFIG.HOSTNAME) || 'aether.ist',
    backendUrl: (typeof CONFIG !== 'undefined' && CONFIG.BACKEND_URL) || 'https://backend.raccoonunbutteredbagel.zip',
    apiKey: (typeof CONFIG !== 'undefined' && CONFIG.TMDB_READ_API_KEY) || '',
    activeServerIndex: 0,
    genres: [],
    genreMap: {},
    activeTab: 'home',
    currentMedia: null,
    currentSeason: 1,
    currentEpisode: 1,
    watchlist: [],
    searchDebounce: null
  };

  // Embed Servers Configuration (bypasses sandbox & frame blocking on localhost)
  const SERVERS = (typeof CONFIG !== 'undefined' && Array.isArray(CONFIG.EMBED_SERVERS)) ? CONFIG.EMBED_SERVERS : [
    {
      id: 'vidsrc',
      name: 'Server 1 (VidSrc)',
      getMovieUrl: (id) => `https://vidsrc.xyz/embed/movie?tmdb=${id}`,
      getTvUrl: (id, s = 1, e = 1) => `https://vidsrc.xyz/embed/tv?tmdb=${id}&season=${s}&episode=${e}`
    },
    {
      id: 'autoembed',
      name: 'Server 2 (AutoEmbed)',
      getMovieUrl: (id) => `https://player.autoembed.cc/embed/movie/${id}`,
      getTvUrl: (id, s = 1, e = 1) => `https://player.autoembed.cc/embed/tv/${id}/${s}/${e}`
    },
    {
      id: '2embed',
      name: 'Server 3 (2Embed)',
      getMovieUrl: (id) => `https://www.2embed.cc/embed/${id}`,
      getTvUrl: (id, s = 1, e = 1) => `https://www.2embed.cc/embedtv/${id}&s=${s}&e=${e}`
    },
    {
      id: 'embedsu',
      name: 'Server 4 (EmbedSu)',
      getMovieUrl: (id) => `https://embed.su/embed/movie/${id}`,
      getTvUrl: (id, s = 1, e = 1) => `https://embed.su/embed/tv/${id}/${s}/${e}`
    }
  ];

  // DOM Elements
  const elements = {
    serverStatusBtn: document.getElementById('server-status-btn'),
    mediaInput: document.getElementById('media-input'),
    searchMediaBtn: document.getElementById('search-media-btn'),
    mediaTypeSelect: document.getElementById('media-type-select'),
    genreSelect: document.getElementById('genre-select'),
    watchlistCount: document.getElementById('watchlist-count'),
    tabHome: document.getElementById('tab-home'),
    tabWatchlist: document.getElementById('tab-watchlist'),
    panelHome: document.getElementById('panel-home'),
    panelWatchlist: document.getElementById('panel-watchlist'),
    errorBanner: document.getElementById('error-banner'),
    loadingOverlay: document.getElementById('loading-overlay'),
    
    // Sections
    browseSections: document.getElementById('browse-sections'),
    searchSection: document.getElementById('search-section'),
    searchHeading: document.getElementById('search-heading'),
    searchGrid: document.getElementById('search-grid'),
    noSearchResults: document.getElementById('no-search-results'),
    clearSearchBtn: document.getElementById('clear-search-btn'),
    watchlistGrid: document.getElementById('watchlist-grid'),
    emptyWatchlist: document.getElementById('empty-watchlist'),

    // Row containers
    trendingRow: document.getElementById('trending-row'),
    popularMoviesRow: document.getElementById('popular-movies-row'),
    popularTvRow: document.getElementById('popular-tv-row'),
    topRatedRow: document.getElementById('top-rated-row'),
    scifiRow: document.getElementById('scifi-row'),
    actionRow: document.getElementById('action-row'),
    
    // Player Modal & Controls
    videoModal: document.getElementById('video-modal'),
    playerContainer: document.getElementById('player-container'),
    streamPlayerFrame: document.getElementById('stream-player-frame'),
    serverButtonsContainer: document.getElementById('server-buttons-container'),
    tvControls: document.getElementById('tv-controls'),
    seasonSelect: document.getElementById('season-select'),
    episodeSelect: document.getElementById('episode-select'),
    fullscreenBtn: document.getElementById('fullscreen-btn'),
    toggleFullscreenBtn: document.getElementById('toggle-fullscreen-btn'),
    modalTitle: document.getElementById('modal-title'),
    modalTagline: document.getElementById('modal-tagline'),
    modalDuration: document.getElementById('modal-duration'),
    modalQuality: document.getElementById('modal-quality'),
    modalGenres: document.getElementById('modal-genres'),
    modalOverview: document.getElementById('modal-overview'),
    modalCastList: document.getElementById('modal-cast-list'),
    addWatchlistBtn: document.getElementById('add-watchlist-btn'),

    // Server Modal
    serverModal: document.getElementById('server-modal'),
    hostnameInput: document.getElementById('hostname-input'),
    backendUrlInput: document.getElementById('backend-url-input'),
    saveServerBtn: document.getElementById('save-server-btn'),
    resetServerBtn: document.getElementById('reset-server-btn'),
    
    modalCloseBtns: document.querySelectorAll('.modal-close')
  };

  function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = String(text);
    return div.innerHTML;
  }

  function showLoading(show) {
    if (elements.loadingOverlay) {
      elements.loadingOverlay.classList.toggle('hidden', !show);
    }
  }

  function showError(msg) {
    if (!elements.errorBanner) return;
    elements.errorBanner.textContent = msg;
    elements.errorBanner.classList.remove('hidden');
    setTimeout(() => {
      elements.errorBanner.classList.add('hidden');
    }, 6000);
  }

  function getImageUrl(path, size = 'w500') {
    if (!path) return 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="300" height="450" fill="%23242430"%3E%3Crect width="100%25" height="100%25"/%3E%3Ctext x="50%25" y="50%25" fill="%23808080" font-family="sans-serif" font-size="20" text-anchor="middle" dominant-baseline="middle"%3ENo Poster%3C/text%3E%3C/svg%3E';
    return `https://image.tmdb.org/t/p/${size}${path}`;
  }

  // ==========================================
  // Fetch API using Aether TMDB Read Token
  // ==========================================
  async function fetchAetherApi(endpoint, params = {}) {
    const baseUrl = (typeof CONFIG !== 'undefined' && CONFIG.TMDB_BASE_URL) || 'https://api.themoviedb.org/3';
    const url = new URL(`${baseUrl}${endpoint}`);

    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') {
        url.searchParams.set(k, v);
      }
    });

    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${state.apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (!res.ok) {
      throw new Error(`Aether API request failed: ${res.status}`);
    }

    return res.json();
  }

  // Load all movie and TV genres from Aether backend
  async function loadGenres() {
    try {
      const [movieGenresData, tvGenresData] = await Promise.all([
        fetchAetherApi('/genre/movie/list').catch(() => ({ genres: [] })),
        fetchAetherApi('/genre/tv/list').catch(() => ({ genres: [] }))
      ]);

      const map = {};
      const combined = [];

      (movieGenresData.genres || []).concat(tvGenresData.genres || []).forEach(g => {
        if (!map[g.id]) {
          map[g.id] = g.name;
          combined.push(g);
        }
      });

      state.genreMap = map;
      state.genres = combined;

      elements.genreSelect.innerHTML = '<option value="">All Categories / Genres</option>';
      combined.sort((a, b) => a.name.localeCompare(b.name)).forEach(g => {
        const opt = document.createElement('option');
        opt.value = g.id;
        opt.textContent = g.name;
        elements.genreSelect.appendChild(opt);
      });
    } catch (e) {
      console.warn('Could not load genres from backend:', e);
    }
  }

  // Normalize raw item from TMDB into standard media structure
  function normalizeItem(item) {
    const isTv = item.media_type === 'tv' || Boolean(item.first_air_date) || Boolean(item.name && !item.title);
    const type = isTv ? 'tv' : 'movie';
    const title = item.title || item.name || 'Untitled';
    const dateStr = item.release_date || item.first_air_date || '';
    const year = dateStr ? dateStr.slice(0, 4) : '';
    const rating = item.vote_average ? item.vote_average.toFixed(1) : '8.0';

    const genreNames = (item.genre_ids || []).map(id => state.genreMap[id]).filter(Boolean);
    if (genreNames.length === 0 && Array.isArray(item.genres)) {
      item.genres.forEach(g => genreNames.push(g.name));
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
      overview: item.overview || 'No description available for this title.'
    };
  }

  // Create Card Element
  function createMediaCard(item, isWatchlist = false) {
    const card = document.createElement('article');
    card.className = `video-card ${isWatchlist ? 'watchlist-card' : ''}`;
    card.setAttribute('role', 'listitem');
    card.setAttribute('tabindex', '0');
    card.dataset.mediaId = item.id;

    card.innerHTML = `
      <div class="video-thumbnail-box">
        <img src="${escapeHtml(item.poster)}" alt="${escapeHtml(item.title)}" loading="lazy">
        <span class="duration-badge">${escapeHtml(item.year || item.type.toUpperCase())}</span>
        <span class="quality-badge">${escapeHtml(item.type.toUpperCase())}</span>
        <div class="play-hover-overlay">
          <div class="play-icon-circle">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
          </div>
        </div>
      </div>
      <div class="video-info">
        <h3 class="video-title" title="${escapeHtml(item.title)}">${escapeHtml(item.title)}</h3>
        <div class="video-meta-row">
          <span>${escapeHtml(item.genre)}</span>
          <span>★ ${escapeHtml(item.rating)}</span>
        </div>
      </div>
      ${isWatchlist ? `<button class="remove-btn" aria-label="Remove from saved">&times;</button>` : ''}
    `;

    card.addEventListener('click', (e) => {
      if (!e.target.closest('.remove-btn')) {
        openPlayerModal(item);
      }
    });

    if (isWatchlist) {
      const removeBtn = card.querySelector('.remove-btn');
      if (removeBtn) {
        removeBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          removeFromWatchlist(item.id);
        });
      }
    }

    return card;
  }

  function renderRow(container, items) {
    if (!container) return;
    container.innerHTML = '';
    items.forEach(item => {
      container.appendChild(createMediaCard(item));
    });
  }

  // Load all Home catalog sections from Aether
  async function loadHomeSections() {
    showLoading(true);
    try {
      const [trending, popularMovies, popularTv, topRated, scifi, action] = await Promise.all([
        fetchAetherApi('/trending/all/week'),
        fetchAetherApi('/movie/popular'),
        fetchAetherApi('/tv/popular'),
        fetchAetherApi('/movie/top_rated'),
        fetchAetherApi('/discover/movie', { with_genres: 878, sort_by: 'popularity.desc' }),
        fetchAetherApi('/discover/movie', { with_genres: 28, sort_by: 'popularity.desc' })
      ]);

      renderRow(elements.trendingRow, (trending.results || []).map(normalizeItem));
      renderRow(elements.popularMoviesRow, (popularMovies.results || []).map(normalizeItem));
      renderRow(elements.popularTvRow, (popularTv.results || []).map(normalizeItem));
      renderRow(elements.topRatedRow, (topRated.results || []).map(normalizeItem));
      renderRow(elements.scifiRow, (scifi.results || []).map(normalizeItem));
      renderRow(elements.actionRow, (action.results || []).map(normalizeItem));
    } catch (err) {
      console.error('Failed to load Aether catalog sections:', err);
      showError('Failed to load catalog from Aether backend. Check connection.');
    } finally {
      showLoading(false);
    }
  }

  // Live Search / Filter across Aether catalog
  async function performSearch(query, genreId, type) {
    if (!query && !genreId) {
      // Restore home view
      elements.searchSection.classList.add('hidden');
      elements.browseSections.classList.remove('hidden');
      return;
    }

    showLoading(true);
    elements.searchSection.classList.remove('hidden');
    elements.browseSections.classList.add('hidden');
    elements.searchHeading.textContent = query ? `Search Results for "${query}"` : 'Filtered Titles';
    elements.searchGrid.innerHTML = '';

    try {
      let results = [];

      // If user typed a numeric ID directly, fetch that specific item
      if (/^\d+$/.test(query)) {
        const id = parseInt(query, 10);
        try {
          const movieItem = await fetchAetherApi(`/movie/${id}`);
          results.push(movieItem);
        } catch {
          try {
            const tvItem = await fetchAetherApi(`/tv/${id}`);
            results.push(tvItem);
          } catch {}
        }
      }

      if (results.length === 0) {
        if (query) {
          if (type === 'movie') {
            const data = await fetchAetherApi('/search/movie', { query, page: 1 });
            results = data.results || [];
          } else if (type === 'tv') {
            const data = await fetchAetherApi('/search/tv', { query, page: 1 });
            results = data.results || [];
          } else {
            const data = await fetchAetherApi('/search/multi', { query, page: 1 });
            results = (data.results || []).filter(r => r.media_type === 'movie' || r.media_type === 'tv');
          }
        } else if (genreId) {
          if (type === 'tv') {
            const data = await fetchAetherApi('/discover/tv', { with_genres: genreId, sort_by: 'popularity.desc' });
            results = data.results || [];
          } else {
            const data = await fetchAetherApi('/discover/movie', { with_genres: genreId, sort_by: 'popularity.desc' });
            results = data.results || [];
          }
        }
      }

      const normalized = results.map(normalizeItem);

      if (normalized.length === 0) {
        elements.noSearchResults.classList.remove('hidden');
      } else {
        elements.noSearchResults.classList.add('hidden');
        normalized.forEach(item => {
          elements.searchGrid.appendChild(createMediaCard(item));
        });
      }
    } catch (err) {
      console.error('Search error:', err);
      showError('Search query failed.');
    } finally {
      showLoading(false);
    }
  }

  // ==========================================
  // Local Player Modal (Plays strictly on localhost)
  // ==========================================
  function getStreamEmbedUrl(item, serverIndex = state.activeServerIndex, season = state.currentSeason, episode = state.currentEpisode) {
    const server = SERVERS[serverIndex] || SERVERS[0];
    if (item.type === 'tv') {
      return server.getTvUrl ? server.getTvUrl(item.tmdbId, season, episode) : server.getMovieUrl(item.tmdbId);
    }
    return server.getMovieUrl(item.tmdbId);
  }

  function renderServerButtons() {
    elements.serverButtonsContainer.innerHTML = '';
    SERVERS.forEach((server, idx) => {
      const btn = document.createElement('button');
      btn.className = `server-btn ${idx === state.activeServerIndex ? 'active' : ''}`;
      btn.textContent = `Server ${idx + 1}`;
      btn.title = server.name;
      btn.addEventListener('click', () => {
        state.activeServerIndex = idx;
        renderServerButtons();
        if (state.currentMedia) {
          updateStreamSource();
        }
      });
      elements.serverButtonsContainer.appendChild(btn);
    });
  }

  function updateStreamSource() {
    if (!state.currentMedia) return;
    const url = getStreamEmbedUrl(state.currentMedia, state.activeServerIndex, state.currentSeason, state.currentEpisode);
    elements.streamPlayerFrame.src = url;
  }

  async function openPlayerModal(item) {
    state.currentMedia = item;
    state.currentSeason = 1;
    state.currentEpisode = 1;

    elements.modalTitle.textContent = item.title;
    elements.modalDuration.textContent = `${item.year || ''} • ${item.duration || ''}`;
    elements.modalQuality.textContent = `${item.type.toUpperCase()} • HD`;
    elements.modalGenres.innerHTML = (item.genres || [item.genre]).map(g => `<span class="genre-tag">${escapeHtml(g)}</span>`).join('');
    elements.modalOverview.textContent = item.overview || '';
    elements.modalTagline.textContent = '';
    elements.modalCastList.innerHTML = '';

    // Fetch detailed metadata from Aether backend (cast, runtime, tagline, seasons)
    try {
      const details = await fetchAetherApi(`/${item.type}/${item.tmdbId}`, { append_to_response: 'credits' });
      
      if (details.tagline) {
        elements.modalTagline.textContent = `"${details.tagline}"`;
      }

      if (item.type === 'movie' && details.runtime) {
        const hrs = Math.floor(details.runtime / 60);
        const mins = details.runtime % 60;
        elements.modalDuration.textContent = `${item.year} • ${hrs > 0 ? `${hrs}h ` : ''}${mins}m • ★ ${item.rating}`;
      } else if (item.type === 'tv' && details.number_of_seasons) {
        elements.modalDuration.textContent = `${details.number_of_seasons} Season${details.number_of_seasons > 1 ? 's' : ''} • ★ ${item.rating}`;
      }

      // Populate Cast
      const cast = (details.credits?.cast || []).slice(0, 6);
      if (cast.length > 0) {
        elements.modalCastList.innerHTML = cast.map(c => `
          <div class="cast-member" role="listitem">
            <img class="cast-photo" src="${getImageUrl(c.profile_path, 'w185')}" alt="${escapeHtml(c.name)}" loading="lazy">
            <div class="cast-name">${escapeHtml(c.name)}</div>
            <div class="cast-character">${escapeHtml(c.character || '')}</div>
          </div>
        `).join('');
      }

      // Populate TV Seasons & Episodes
      if (item.type === 'tv') {
        elements.tvControls.classList.remove('hidden');
        const numSeasons = details.number_of_seasons || 1;
        elements.seasonSelect.innerHTML = '';
        for (let s = 1; s <= numSeasons; s++) {
          const opt = document.createElement('option');
          opt.value = s;
          opt.textContent = `Season ${s}`;
          elements.seasonSelect.appendChild(opt);
        }

        populateEpisodesForSeason(1, details.seasons || []);
      } else {
        elements.tvControls.classList.add('hidden');
      }
    } catch (e) {
      console.warn('Could not load rich details:', e);
    }

    renderServerButtons();
    updateStreamSource();
    updateWatchlistButton(isInWatchlist(item.id));
    elements.videoModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }

  function populateEpisodesForSeason(seasonNum, seasonsArray = []) {
    elements.episodeSelect.innerHTML = '';
    const seasonObj = seasonsArray.find(s => s.season_number === seasonNum);
    const count = seasonObj ? seasonObj.episode_count : 12;
    for (let e = 1; e <= count; e++) {
      const opt = document.createElement('option');
      opt.value = e;
      opt.textContent = `Ep ${e}`;
      elements.episodeSelect.appendChild(opt);
    }
  }

  function closePlayerModal() {
    elements.videoModal.classList.add('hidden');
    document.body.style.overflow = '';
    elements.streamPlayerFrame.src = '';
    state.currentMedia = null;
  }

  function toggleFullscreen() {
    const container = elements.playerContainer;
    if (!document.fullscreenElement) {
      if (container.requestFullscreen) {
        container.requestFullscreen();
      } else if (container.webkitRequestFullscreen) {
        container.webkitRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  }

  // ==========================================
  // Watchlist Management
  // ==========================================
  function loadWatchlist() {
    try {
      const saved = localStorage.getItem('aether_saved_watchlist');
      state.watchlist = saved ? JSON.parse(saved) : [];
      elements.watchlistCount.textContent = state.watchlist.length;
    } catch {
      state.watchlist = [];
    }
  }

  function saveWatchlist() {
    try {
      localStorage.setItem('aether_saved_watchlist', JSON.stringify(state.watchlist));
      elements.watchlistCount.textContent = state.watchlist.length;
    } catch (e) {
      console.warn('Error saving watchlist:', e);
    }
  }

  function isInWatchlist(mediaId) {
    return state.watchlist.some(m => m.id === mediaId);
  }

  function addToWatchlist(item) {
    if (!isInWatchlist(item.id)) {
      state.watchlist.unshift(item);
      saveWatchlist();
      updateWatchlistButton(true);
      if (state.activeTab === 'watchlist') renderWatchlistGrid();
    }
  }

  function removeFromWatchlist(mediaId) {
    state.watchlist = state.watchlist.filter(m => m.id !== mediaId);
    saveWatchlist();
    if (state.activeTab === 'watchlist') renderWatchlistGrid();
    if (state.currentMedia && state.currentMedia.id === mediaId) {
      updateWatchlistButton(false);
    }
  }

  function updateWatchlistButton(saved) {
    elements.addWatchlistBtn.textContent = saved ? 'Saved in Watchlist ✓' : 'Save to Watchlist';
    elements.addWatchlistBtn.classList.toggle('btn-primary', saved);
    elements.addWatchlistBtn.classList.toggle('btn-secondary', !saved);
  }

  function renderWatchlistGrid() {
    elements.watchlistGrid.innerHTML = '';
    const count = state.watchlist.length;
    elements.watchlistCount.textContent = count;

    if (count === 0) {
      elements.emptyWatchlist.classList.remove('hidden');
      return;
    }

    elements.emptyWatchlist.classList.add('hidden');
    state.watchlist.forEach(item => {
      elements.watchlistGrid.appendChild(createMediaCard(item, true));
    });
  }

  function switchTab(tab) {
    state.activeTab = tab;
    const isHome = tab === 'home';

    elements.tabHome.classList.toggle('active', isHome);
    elements.tabHome.setAttribute('aria-selected', isHome);
    elements.tabWatchlist.classList.toggle('active', !isHome);
    elements.tabWatchlist.setAttribute('aria-selected', !isHome);

    elements.panelHome.classList.toggle('active', isHome);
    elements.panelHome.classList.toggle('hidden', !isHome);
    elements.panelWatchlist.classList.toggle('active', !isHome);
    elements.panelWatchlist.classList.toggle('hidden', isHome);

    if (!isHome) {
      renderWatchlistGrid();
    }
  }

  // ==========================================
  // Event Listeners
  // ==========================================
  function initEventListeners() {
    // Search Button
    elements.searchMediaBtn.addEventListener('click', () => {
      const q = elements.mediaInput.value.trim();
      const genre = elements.genreSelect.value;
      const type = elements.mediaTypeSelect.value;
      performSearch(q, genre, type);
    });

    // Enter Key Search
    elements.mediaInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const q = elements.mediaInput.value.trim();
        const genre = elements.genreSelect.value;
        const type = elements.mediaTypeSelect.value;
        performSearch(q, genre, type);
      }
    });

    // Input debounce search
    elements.mediaInput.addEventListener('input', (e) => {
      clearTimeout(state.searchDebounce);
      state.searchDebounce = setTimeout(() => {
        const q = e.target.value.trim();
        const genre = elements.genreSelect.value;
        const type = elements.mediaTypeSelect.value;
        performSearch(q, genre, type);
      }, 400);
    });

    // Filters
    elements.mediaTypeSelect.addEventListener('change', () => {
      const q = elements.mediaInput.value.trim();
      const genre = elements.genreSelect.value;
      const type = elements.mediaTypeSelect.value;
      performSearch(q, genre, type);
    });

    elements.genreSelect.addEventListener('change', () => {
      const q = elements.mediaInput.value.trim();
      const genre = elements.genreSelect.value;
      const type = elements.mediaTypeSelect.value;
      performSearch(q, genre, type);
    });

    // Clear Search Button
    elements.clearSearchBtn.addEventListener('click', () => {
      elements.mediaInput.value = '';
      elements.genreSelect.value = '';
      elements.searchSection.classList.add('hidden');
      elements.browseSections.classList.remove('hidden');
    });

    // TV Season & Episode Selectors
    elements.seasonSelect.addEventListener('change', (e) => {
      state.currentSeason = parseInt(e.target.value, 10) || 1;
      updateStreamSource();
    });

    elements.episodeSelect.addEventListener('change', (e) => {
      state.currentEpisode = parseInt(e.target.value, 10) || 1;
      updateStreamSource();
    });

    // Fullscreen Controls
    elements.fullscreenBtn.addEventListener('click', toggleFullscreen);
    elements.toggleFullscreenBtn.addEventListener('click', toggleFullscreen);

    // Tabs
    elements.tabHome.addEventListener('click', () => switchTab('home'));
    elements.tabWatchlist.addEventListener('click', () => switchTab('watchlist'));

    // Server Settings Modal
    elements.serverStatusBtn.addEventListener('click', () => {
      elements.serverModal.classList.remove('hidden');
      document.body.style.overflow = 'hidden';
    });

    elements.saveServerBtn.addEventListener('click', () => {
      elements.serverModal.classList.add('hidden');
      document.body.style.overflow = '';
    });

    elements.resetServerBtn.addEventListener('click', () => {
      elements.serverModal.classList.add('hidden');
      document.body.style.overflow = '';
    });

    // Watchlist
    elements.addWatchlistBtn.addEventListener('click', () => {
      if (!state.currentMedia) return;
      if (isInWatchlist(state.currentMedia.id)) {
        removeFromWatchlist(state.currentMedia.id);
      } else {
        addToWatchlist(state.currentMedia);
      }
    });

    // Modal Close
    elements.modalCloseBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        closePlayerModal();
        elements.serverModal.classList.add('hidden');
        document.body.style.overflow = '';
      });
    });

    elements.videoModal.querySelector('.modal-overlay').addEventListener('click', closePlayerModal);
    elements.serverModal.querySelector('.modal-overlay').addEventListener('click', () => {
      elements.serverModal.classList.add('hidden');
      document.body.style.overflow = '';
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (!elements.videoModal.classList.contains('hidden')) closePlayerModal();
        if (!elements.serverModal.classList.contains('hidden')) {
          elements.serverModal.classList.add('hidden');
          document.body.style.overflow = '';
        }
      }
    });
  }

  // ==========================================
  // App Bootstrapping
  // ==========================================
  async function init() {
    loadWatchlist();
    initEventListeners();
    await loadGenres();
    await loadHomeSections();
  }

  init();
})();
