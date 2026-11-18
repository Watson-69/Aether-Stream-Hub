import { useState, useCallback, useEffect } from 'react';
import { Waybar } from './components/Waybar';
import { RofiSearchModal } from './components/RofiSearchModal';
import { WatchlistDrawer } from './components/WatchlistDrawer';
import { StreamLogPanel } from './components/StreamLogPanel';
import { BrowseSections } from './components/BrowseSections';
import { SearchSection } from './components/SearchSection';
import { VideoModal } from './components/VideoModal';
import { PreLoader } from './components/PreLoader';
import { ErrorBanner } from './components/ErrorBanner';
import { ErrorBoundary } from './components/ErrorBoundary';
import { useAetherApp } from './hooks/useAetherApp';
import { useRiceTheme } from './hooks/useRiceTheme';
import { streamLogsStorage } from './lib/storage';
import type { MediaItem, StreamLogEntry } from './lib/types';
import CONFIG from './lib/config';

function App() {
  const { theme: riceTheme, setTheme: setRiceTheme, themes: riceThemes } = useRiceTheme();

  const [isRofiOpen, setIsRofiOpen] = useState(false);
  const [isWatchlistDrawerOpen, setIsWatchlistDrawerOpen] = useState(false);
  const [isLogPanelOpen, setIsLogPanelOpen] = useState(false);

  // Stream activity logs with localStorage persistence
  const [streamLogs, setStreamLogs] = useState<StreamLogEntry[]>(() => {
    return streamLogsStorage.get();
  });

  useEffect(() => {
    streamLogsStorage.set(streamLogs);
  }, [streamLogs]);

  const addStreamLog = useCallback(
    (
      type: 'connect' | 'server' | 'watchlist' | 'episode',
      tag: string,
      message: string,
      media: MediaItem,
      season?: number,
      episode?: number,
      serverIndex?: number
    ) => {
      const now = new Date();
      const timestamp = now.toTimeString().split(' ')[0];
      const newEntry: StreamLogEntry = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        timestamp,
        type,
        tag,
        message,
        media,
        season,
        episode,
        serverIndex,
      };
      setStreamLogs(prev => [newEntry, ...prev.slice(0, 49)]);
    },
    []
  );

  const clearStreamLogs = useCallback(() => {
    setStreamLogs([]);
    try {
      localStorage.removeItem('aether-stream-logs');
    } catch {}
  }, []);

  const {
    // State
    sections,
    searchResults,
    watchlist,
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

    // Rich details
    seasons,
    episodes,
    cast,
    tagline,
    duration,
    quality,

    // Actions
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
    dismissError,
    refetchInitialData,
  } = useAetherApp();

  const isCatalogueReady = sections.trending.length > 0 && sections.popularMovies.length > 0;
  const hasInitialLoadError = !!errorMessage && sections.trending.length === 0;

  const isInWatchlist = currentMedia ? watchlist.some(m => m.id === currentMedia.id) : false;

  // Stream launcher wrapper that logs events
  const handleLaunchMedia = useCallback(
    (
      media: MediaItem,
      targetSeason?: number,
      targetEpisode?: number,
      targetServerIndex?: number
    ) => {
      void openVideoModal(media);
      if (targetServerIndex !== undefined) {
        handleServerChange(targetServerIndex);
      }
      if (media.type === 'tv') {
        if (targetSeason !== undefined) handleSeasonChange(targetSeason);
        if (targetEpisode !== undefined) handleEpisodeChange(targetEpisode);
      }

      const season = targetSeason !== undefined ? targetSeason : currentSeason;
      const ep = targetEpisode !== undefined ? targetEpisode : currentEpisode;
      const serverIdx = targetServerIndex !== undefined ? targetServerIndex : activeServerIndex;

      addStreamLog(
        'connect',
        'CONNECTED',
        `node-0${serverIdx + 1} -> ${media.title} ${media.type === 'tv' ? `[S${season} E${ep}]` : ''}`,
        media,
        season,
        ep,
        serverIdx
      );
    },
    [
      openVideoModal,
      handleServerChange,
      handleSeasonChange,
      handleEpisodeChange,
      currentSeason,
      currentEpisode,
      activeServerIndex,
      addStreamLog,
    ]
  );

  // Log server switches
  const onServerSwitchLogged = useCallback(
    (index: number) => {
      handleServerChange(index);
      if (currentMedia) {
        addStreamLog(
          'server',
          'NODE_SWITCH',
          `Switched to node-0${index + 1} for ${currentMedia.title}`,
          currentMedia,
          currentSeason,
          currentEpisode,
          index
        );
      }
    },
    [handleServerChange, currentMedia, currentSeason, currentEpisode, addStreamLog]
  );

  // Log episode switches
  const onEpisodeChangeLogged = useCallback(
    (episode: number) => {
      handleEpisodeChange(episode);
      if (currentMedia) {
        addStreamLog(
          'episode',
          'EPISODE',
          `${currentMedia.title} -> Jumped to S${currentSeason}E${episode}`,
          currentMedia,
          currentSeason,
          episode,
          activeServerIndex
        );
      }
    },
    [handleEpisodeChange, currentMedia, currentSeason, activeServerIndex, addStreamLog]
  );

  // Log watchlist actions
  const onWatchlistToggleLogged = useCallback(() => {
    handleWatchlistToggle();
    if (currentMedia) {
      const willAdd = !isInWatchlist;
      addStreamLog(
        'watchlist',
        willAdd ? 'BOOKMARK_ADD' : 'BOOKMARK_DEL',
        `${willAdd ? 'Saved' : 'Removed'} "${currentMedia.title}" from watchlist`,
        currentMedia
      );
    }
  }, [handleWatchlistToggle, currentMedia, isInWatchlist, addStreamLog]);

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-bg text-fg font-sans antialiased selection:bg-primary/30 selection:text-fg">
        {/* Floating Waybar Top Navigation with Rice Theme & Stream Log pill */}
        <Waybar
          onOpenSearch={() => setIsRofiOpen(true)}
          onToggleWatchlist={() => setIsWatchlistDrawerOpen(prev => !prev)}
          watchlistCount={watchlist.length}
          onToggleLogPanel={() => setIsLogPanelOpen(prev => !prev)}
          logCount={streamLogs.length}
          currentRiceTheme={riceTheme}
          onSelectRiceTheme={setRiceTheme}
          themes={riceThemes}
        />

        {/* Main Window Pane Body */}
        <main className="max-w-7xl mx-auto px-3 sm:px-6 pb-20">
          {!hasInitialLoadError && <ErrorBanner message={errorMessage} onDismiss={dismissError} />}

          {/* Search Results Pane (if active) */}
          <SearchSection
            isVisible={isSearchSectionVisible}
            heading={searchHeading}
            items={searchResults}
            onItemClick={handleLaunchMedia}
            onClear={handleClearSearch}
            isLoading={isLoading && isSearchSectionVisible}
            onQuickSearch={genre => {
              setSearchQuery(genre);
              void handleSearch(genre);
            }}
            onToggleWatchlist={handleToggleItemWatchlist}
            watchlist={watchlist}
          />

          {/* Discovery Panes (Default view) */}
          {!isSearchSectionVisible && (
            <BrowseSections
              sections={sections}
              onItemClick={handleLaunchMedia}
              onToggleWatchlist={handleToggleItemWatchlist}
              watchlist={watchlist}
            />
          )}
        </main>

        {/* Centered Rofi Search Launcher Modal */}
        <RofiSearchModal
          isOpen={isRofiOpen}
          onClose={() => setIsRofiOpen(false)}
          onSelectMedia={handleLaunchMedia}
        />

        {/* Docked Right-Side Watchlist Drawer */}
        <WatchlistDrawer
          isOpen={isWatchlistDrawerOpen}
          onClose={() => setIsWatchlistDrawerOpen(false)}
          items={watchlist}
          onPlayMedia={handleLaunchMedia}
          onRemove={handleRemoveFromWatchlist}
        />

        {/* Stream Activity Log Terminal Panel */}
        <StreamLogPanel
          isOpen={isLogPanelOpen}
          onClose={() => setIsLogPanelOpen(false)}
          logs={streamLogs}
          onClearLogs={clearStreamLogs}
          onResumeMedia={handleLaunchMedia}
        />

        {/* Split-Pane Theater Player Modal */}
        <VideoModal
          isOpen={isVideoModalOpen}
          onClose={closeVideoModal}
          media={currentMedia}
          activeServerIndex={activeServerIndex}
          servers={CONFIG.EMBED_SERVERS}
          onServerChange={onServerSwitchLogged}
          currentSeason={currentSeason}
          currentEpisode={currentEpisode}
          onSeasonChange={handleSeasonChange}
          onEpisodeChange={onEpisodeChangeLogged}
          onFullscreenToggle={handleFullscreenToggle}
          isInWatchlist={isInWatchlist}
          onWatchlistToggle={onWatchlistToggleLogged}
          seasons={seasons}
          episodes={episodes}
          cast={cast}
          tagline={tagline}
          duration={duration}
          quality={quality}
        />

        {/* Full-Screen Cream Preloader on Initial Load */}
        <PreLoader
          isReady={isCatalogueReady}
          hasError={hasInitialLoadError}
          onRetry={() => {
            void refetchInitialData();
          }}
        />
      </div>
    </ErrorBoundary>
  );
}

export default App;
