import { useEffect, useRef, useCallback, useState } from 'react';
import {
  apiService,
  watchlistService,
  type MediaItem,
  type Genre,
  type ItemDetails,
  type HomeSections,
  type SearchFilters,
} from '../lib/services';
import CONFIG from '../lib/config';

interface UseAetherAppReturn {
  // State
  sections: HomeSections;
  searchResults: MediaItem[];
  activeTab: 'home' | 'watchlist';
  watchlist: MediaItem[];
  genres: Genre[];
  searchQuery: string;
  isSearchSectionVisible: boolean;
  searchHeading: string;
  isLoading: boolean;
  errorMessage: string | null;

  // Modal state
  isVideoModalOpen: boolean;
  currentMedia: MediaItem | null;
  activeServerIndex: number;
  currentSeason: number;
  currentEpisode: number;
  isServerModalOpen: boolean;
  hostname: string;
  backendUrl: string;

  // Rich media details
  seasons: number;
  episodes: number;
  cast: { name: string; character: string; profile_path: string }[];
  tagline: string;
  duration: string;
  quality: string;

  // Actions
  setActiveTab: (tab: 'home' | 'watchlist') => void;
  setSearchQuery: (query: string) => void;
  handleSearch: (query?: string) => Promise<void>;
  handleClearSearch: () => void;
  handleServerChange: (index: number) => void;
  handleSeasonChange: (season: number) => void;
  handleEpisodeChange: (episode: number) => void;
  handleFullscreenToggle: () => void;
  handleWatchlistToggle: () => void;
  handleToggleItemWatchlist: (item: MediaItem) => void;
  handleRemoveFromWatchlist: (id: string) => void;
  openVideoModal: (media: MediaItem | null) => Promise<void>;
  closeVideoModal: () => void;
  openServerModal: () => void;
  closeServerModal: () => void;
  handleSaveServer: () => void;
  handleResetServer: () => void;
  dismissError: () => void;
  setHostname: (hostname: string) => void;
  setBackendUrl: (url: string) => void;
  refetchInitialData: () => Promise<void>;
}

const initialSections: HomeSections = {
  trending: [],
  popularMovies: [],
  popularTv: [],
  topRated: [],
  scifi: [],
  action: [],
};

export function useAetherApp(): UseAetherAppReturn {
  const seasonsDataRef = useRef<{ season_number: number; episode_count: number }[]>([]);

  // Sections and search results
  const [sections, setSections] = useState<HomeSections>(initialSections);
  const [searchResults, setSearchResults] = useState<MediaItem[]>([]);

  // Navigation and search
  const [activeTab, setActiveTabState] = useState<'home' | 'watchlist'>('home');
  const [watchlist, setWatchlist] = useState<MediaItem[]>(() => watchlistService.load());
  const [genres, setGenres] = useState<Genre[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchSectionVisible, setIsSearchSectionVisible] = useState(false);
  const [searchHeading, setSearchHeading] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Modal state
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [currentMedia, setCurrentMedia] = useState<MediaItem | null>(null);
  const [activeServerIndex, setActiveServerIndex] = useState(() =>
    apiService.getActiveServerIndex()
  );
  const [currentSeason, setCurrentSeason] = useState(1);
  const [currentEpisode, setCurrentEpisode] = useState(1);
  const [isServerModalOpen, setIsServerModalOpen] = useState(false);
  const [hostname, setHostname] = useState(CONFIG.HOSTNAME || 'aether.ist');
  const [backendUrl, setBackendUrl] = useState(
    CONFIG.BACKEND_URL || 'https://backend.raccoonunbutteredbagel.zip'
  );

  // Rich details
  const [seasons, setSeasons] = useState(1);
  const [episodes, setEpisodes] = useState(1);
  const [cast, setCast] = useState<{ name: string; character: string; profile_path: string }[]>([]);
  const [tagline, setTagline] = useState('');
  const [duration, setDuration] = useState('');
  const [quality, setQuality] = useState('');

  // Initial catalog load
  const refetchInitialData = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const [loadedGenres, loadedSections] = await Promise.all([
        apiService.fetchGenres().catch(err => {
          console.warn('Failed to load genres:', err);
          return [] as Genre[];
        }),
        apiService.fetchHomeSections().catch(err => {
          console.warn('Failed to load catalog sections:', err);
          throw err;
        }),
      ]);

      if (loadedGenres.length > 0) {
        setGenres(loadedGenres);
      }
      if (loadedSections) {
        setSections(loadedSections);
      }
    } catch (err: any) {
      console.error('Initial data loading failed:', err);
      setErrorMessage(
        'Failed to load catalog from TMDB. Please check your network connection.'
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refetchInitialData();
  }, [refetchInitialData]);

  // Synchronize watchlist with service
  useEffect(() => {
    watchlistService.save(watchlist);
  }, [watchlist]);

  const setActiveTab = useCallback((tab: 'home' | 'watchlist') => {
    setActiveTabState(tab);
  }, []);

  const handleSearch = useCallback(
    async (queryOverride?: string) => {
      const q = queryOverride !== undefined ? queryOverride : searchQuery;
      const trimmed = q.trim();

      if (!trimmed) {
        setIsSearchSectionVisible(false);
        setSearchResults([]);
        setSearchHeading('');
        return;
      }

      setIsLoading(true);
      setIsSearchSectionVisible(true);
      setSearchHeading(`Search Results for "${trimmed}"`);

      try {
        const filters: SearchFilters = { query: trimmed, genreId: '', type: 'all' };
        const results = await apiService.fetchSearchResults(filters);
        setSearchResults(results);
      } catch (err) {
        console.error('Search failed:', err);
        setErrorMessage('Search query failed. Please try again.');
        setSearchResults([]);
      } finally {
        setIsLoading(false);
      }
    },
    [searchQuery]
  );

  const handleClearSearch = useCallback(() => {
    setSearchQuery('');
    setSearchResults([]);
    setIsSearchSectionVisible(false);
    setSearchHeading('');
  }, []);

  const handleServerChange = useCallback((index: number) => {
    setActiveServerIndex(index);
    apiService.setActiveServerIndex(index);
  }, []);

  const handleSeasonChange = useCallback((season: number) => {
    setCurrentSeason(season);
    apiService.setCurrentSeason(season);
    setCurrentEpisode(1);
    apiService.setCurrentEpisode(1);

    // Update available episodes for the selected season
    const seasonObj = seasonsDataRef.current.find(s => s.season_number === season);
    if (seasonObj) {
      setEpisodes(seasonObj.episode_count || 12);
    }
  }, []);

  const handleEpisodeChange = useCallback((episode: number) => {
    setCurrentEpisode(episode);
    apiService.setCurrentEpisode(episode);
  }, []);

  const handleFullscreenToggle = useCallback(() => {
    const container = document.getElementById('player-container');
    if (!container) return;
    if (!document.fullscreenElement) {
      void container.requestFullscreen?.();
    } else {
      void document.exitFullscreen?.();
    }
  }, []);

  const handleWatchlistToggle = useCallback(() => {
    if (!currentMedia) return;
    setWatchlist(prev => {
      const exists = prev.some(m => m.id === currentMedia.id);
      if (exists) {
        return prev.filter(m => m.id !== currentMedia.id);
      } else {
        return [currentMedia, ...prev];
      }
    });
  }, [currentMedia]);

  const handleToggleItemWatchlist = useCallback((item: MediaItem) => {
    if (!item) return;
    setWatchlist(prev => {
      const exists = prev.some(m => m.id === item.id);
      if (exists) {
        return prev.filter(m => m.id !== item.id);
      } else {
        return [item, ...prev];
      }
    });
  }, []);

  const handleRemoveFromWatchlist = useCallback((id: string) => {
    setWatchlist(prev => prev.filter(m => m.id !== id));
  }, []);

  const openVideoModal = useCallback(async (media: MediaItem | null) => {
    if (!media) return;
    setCurrentMedia(media);
    apiService.setCurrentMedia(media);
    setIsVideoModalOpen(true);
    setActiveServerIndex(0);
    apiService.setActiveServerIndex(0);
    setCurrentSeason(1);
    apiService.setCurrentSeason(1);
    setCurrentEpisode(1);
    apiService.setCurrentEpisode(1);

    // Initial placeholder metadata while rich details load
    setTagline('');
    setDuration(`${media.year || ''} • ${media.duration || ''}`);
    setQuality(`${media.type.toUpperCase()} • HD`);
    setCast([]);
    setSeasons(1);
    setEpisodes(1);

    try {
      const details: ItemDetails = await apiService.fetchItemDetails(media);
      setTagline(details.tagline);
      setDuration(details.duration);
      setQuality(details.quality);
      setCast(details.cast);
      setSeasons(details.seasons);
      setEpisodes(details.episodes);
      seasonsDataRef.current = details.seasonsData;
    } catch (err) {
      console.warn('Failed to load item rich details:', err);
    }
  }, []);

  const closeVideoModal = useCallback(() => {
    setIsVideoModalOpen(false);
    setCurrentMedia(null);
    apiService.setCurrentMedia(null);
    setCast([]);
    setTagline('');
    setDuration('');
    setQuality('');
    setSeasons(1);
    setEpisodes(1);
    seasonsDataRef.current = [];
  }, []);

  const openServerModal = useCallback(() => {
    setIsServerModalOpen(true);
  }, []);

  const closeServerModal = useCallback(() => {
    setIsServerModalOpen(false);
  }, []);

  const handleSaveServer = useCallback(() => {
    closeServerModal();
  }, [closeServerModal]);

  const handleResetServer = useCallback(() => {
    setHostname('aether.ist');
    setBackendUrl('https://backend.raccoonunbutteredbagel.zip');
    closeServerModal();
  }, [closeServerModal]);

  const dismissError = useCallback(() => {
    setErrorMessage(null);
  }, []);

  return {
    // State
    sections,
    searchResults,
    activeTab,
    watchlist,
    genres,
    searchQuery,
    isSearchSectionVisible,
    searchHeading,
    isLoading,
    errorMessage,

    // Modal state
    isVideoModalOpen,
    currentMedia,
    activeServerIndex,
    currentSeason,
    currentEpisode,
    isServerModalOpen,
    hostname,
    backendUrl,

    // Rich details
    seasons,
    episodes,
    cast,
    tagline,
    duration,
    quality,

    // Actions
    setActiveTab,
    setSearchQuery,
    handleSearch,
    handleClearSearch,
    handleServerChange,
    handleSeasonChange,
    handleEpisodeChange,
    handleFullscreenToggle,
    handleWatchlistToggle,
    handleToggleItemWatchlist,
    handleRemoveFromWatchlist,
    openVideoModal,
    closeVideoModal,
    openServerModal,
    closeServerModal,
    handleSaveServer,
    handleResetServer,
    dismissError,
    setHostname,
    setBackendUrl,
    refetchInitialData,
  };
}
