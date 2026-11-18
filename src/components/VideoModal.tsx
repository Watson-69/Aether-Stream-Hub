import {
  Maximize2,
  X,
  Bookmark,
  BookmarkCheck,
  ExternalLink,
  Play,
  SkipForward,
  Star,
  Tv,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import type { MediaItem } from '../lib/types';
import { apiService } from '../lib/services';

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  media: MediaItem | null;
  activeServerIndex: number;
  servers: {
    id: string;
    name: string;
    getMovieUrl: (id: string) => string;
    getTvUrl: (id: string, s?: number, e?: number) => string;
  }[];
  onServerChange: (index: number) => void;
  currentSeason: number;
  currentEpisode: number;
  onSeasonChange: (season: number) => void;
  onEpisodeChange: (episode: number) => void;
  onFullscreenToggle: () => void;
  isInWatchlist: boolean;
  onWatchlistToggle: () => void;
  seasons: number;
  episodes: number;
  cast: { name: string; character: string; profile_path: string }[];
  tagline: string;
  duration: string;
  quality: string;
}

export function VideoModal({
  isOpen,
  onClose,
  media,
  activeServerIndex,
  servers,
  onServerChange,
  currentSeason,
  currentEpisode,
  onSeasonChange,
  onEpisodeChange,
  onFullscreenToggle,
  isInWatchlist,
  onWatchlistToggle,
  seasons,
  episodes,
  cast,
  tagline,
  duration,
  quality,
}: VideoModalProps) {
  const [isLoadingIframe, setIsLoadingIframe] = useState(true);
  const [episodeList, setEpisodeList] = useState<{ episode_number: number; name: string }[]>([]);

  const currentServer = servers[activeServerIndex] || servers[0];
  const streamUrl = media
    ? media.type === 'tv'
      ? currentServer?.getTvUrl?.(String(media.tmdbId), currentSeason, currentEpisode)
      : currentServer?.getMovieUrl?.(String(media.tmdbId))
    : '';

  // Reset loading spinner whenever streamUrl changes
  useEffect(() => {
    if (!isOpen || !streamUrl) return;
    setIsLoadingIframe(true);
    const timer = setTimeout(() => setIsLoadingIframe(false), 2000);
    return () => clearTimeout(timer);
  }, [isOpen, streamUrl]);

  // Fetch season episodes when viewing TV show
  useEffect(() => {
    if (!isOpen || !media || media.type !== 'tv') {
      setEpisodeList([]);
      return;
    }

    let isMounted = true;
    async function loadEpisodes() {
      try {
        const eps = await apiService.fetchTvSeasonEpisodes(media!.tmdbId, currentSeason);
        if (isMounted && eps.length > 0) {
          setEpisodeList(eps);
        }
      } catch (err) {
        console.warn('Could not load season episodes:', err);
      }
    }

    void loadEpisodes();

    return () => {
      isMounted = false;
    };
  }, [isOpen, media, currentSeason]);

  if (!isOpen || !media) return null;

  const getImageUrl = (path: string | null, size: string = 'w185') => {
    if (!path) {
      return 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="90" height="90" fill="%231E1E2E"%3E%3Crect width="100%25" height="100%25"/%3E%3C/svg%3E';
    }
    return `https://image.tmdb.org/t/p/${size}${path}`;
  };

  const cleanTagline = tagline ? tagline.replace(/^["“”']+|["“”']+$/g, '').trim() : '';
  const currentEpObj = episodeList.find(e => e.episode_number === currentEpisode);
  const currentEpName = currentEpObj?.name || `Episode ${currentEpisode}`;
  const totalEpisodesCount = Math.max(episodes, episodeList.length);

  const handleNextEpisode = () => {
    if (currentEpisode < totalEpisodesCount) {
      onEpisodeChange(currentEpisode + 1);
    } else if (currentSeason < seasons) {
      onSeasonChange(currentSeason + 1);
    }
  };

  return (
    <div
      id="video-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      {/* Background Overlay */}
      <div className="fixed inset-0 z-0" onClick={onClose} tabIndex={-1} aria-hidden="true" />

      {/* Split-Pane Tiling Workspace Window */}
      <div
        className="relative z-10 max-w-6xl w-full max-h-[94vh] flex flex-col bg-mantle border border-primary/40 rounded-xl shadow-2xl overflow-hidden font-mono text-fg animate-modal-in"
        onClick={e => e.stopPropagation()}
      >
        {/* Hyprland Window Titlebar */}
        <div className="flex-shrink-0 flex items-center justify-between gap-3 px-4 py-2.5 bg-crust border-b border-border">
          <div className="flex items-center gap-3 min-w-0">
            {/* Window control dots */}
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <button
                onClick={onClose}
                className="w-3 h-3 rounded-full bg-red hover:opacity-80 transition-opacity"
                title="Close Window"
              />
              <span className="w-3 h-3 rounded-full bg-accent" />
              <span className="w-3 h-3 rounded-full bg-emerald" />
            </div>

            {/* Prompt Path & Media Title */}
            <div className="flex items-center gap-2 truncate text-xs">
              <span className="text-primary font-bold hidden sm:inline">aether@hyprland:</span>
              <span className="text-subtext/70 hidden sm:inline">~/watch/</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded uppercase border font-bold bg-card border-border text-primary">
                {media.type}
              </span>
              <h2
                id="modal-title"
                className="font-bold text-fg truncate font-sans text-xs sm:text-sm"
              >
                {media.type === 'tv'
                  ? `${media.title} — S${currentSeason} E${currentEpisode}: ${currentEpName}`
                  : media.title}
              </h2>
            </div>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={onFullscreenToggle}
              className="p-1.5 rounded hover:bg-card text-subtext hover:text-primary transition-colors"
              title="Fullscreen"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
            {streamUrl && (
              <a
                href={streamUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 rounded hover:bg-card text-subtext hover:text-primary transition-colors hidden sm:inline-flex"
                title="Open stream in new tab"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded hover:bg-red/20 text-subtext hover:text-red transition-colors"
              title="Close (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Main Content Area (Split-Pane on Large Screens for TV) */}
        <div className="flex-1 overflow-y-auto flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-border">
          {/* LEFT MAIN PANE: Video Player + Controls + Bottom Metadata */}
          <div className={`flex flex-col ${media.type === 'tv' ? 'lg:w-[68%]' : 'w-full'} min-w-0`}>
            {/* 16:9 Video Player Container */}
            <div
              id="player-container"
              className="w-full aspect-video bg-black relative border-b border-border overflow-hidden flex-shrink-0"
            >
              {isLoadingIframe && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-crust/95 z-20 gap-3 text-fg">
                  <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
                  <p className="text-xs text-subtext flex items-center gap-2">
                    <Play className="w-3.5 h-3.5 text-primary fill-primary" />
                    Connecting to {currentServer.name}...
                  </p>
                </div>
              )}

              <iframe
                key={streamUrl}
                id="stream-player-frame"
                className="w-full h-full bg-black relative z-10"
                src={streamUrl || ''}
                onLoad={() => setIsLoadingIframe(false)}
                allowFullScreen
                referrerPolicy="origin"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
                title={`${media.title} player`}
              />
            </div>

            {/* Terminal-Style Server Status & Switcher Bar */}
            <div className="px-3 sm:px-4 py-2 bg-crust border-b border-border flex items-center justify-between gap-2 text-xs flex-wrap flex-shrink-0">
              {/* Server Pills */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="flex items-center gap-1.5 text-[11px] text-emerald">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald animate-pulse" />
                  <span>node-0{activeServerIndex + 1}</span>
                </span>
                <span className="text-border">|</span>
                <div className="flex items-center gap-1">
                  {servers.map((s, idx) => (
                    <button
                      key={s.id}
                      onClick={() => onServerChange(idx)}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-all ${
                        idx === activeServerIndex
                          ? 'bg-primary text-crust border-primary'
                          : 'bg-card text-subtext hover:border-primary hover:text-fg border-border'
                      }`}
                      title={s.name}
                    >
                      node-0{idx + 1}
                    </button>
                  ))}
                </div>
              </div>

              {/* TV Next Episode Button */}
              {media.type === 'tv' && (
                <button
                  onClick={handleNextEpisode}
                  className="flex items-center gap-1 px-2.5 py-1 rounded bg-card hover:bg-mantle border border-border hover:border-primary text-primary text-[11px] font-bold transition-all ml-auto"
                  title="Next Episode"
                >
                  <span>next_ep</span>
                  <SkipForward className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Bottom Metadata & Cast Panel */}
            <div className="p-4 sm:p-5 flex-1 overflow-y-auto space-y-4 bg-mantle">
              {/* Header Info Row */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-3 border-b border-border">
                <div>
                  <h3 className="font-sans font-bold text-base sm:text-lg text-fg mb-1">
                    {media.title}
                  </h3>
                  {cleanTagline && (
                    <p className="text-xs text-subtext italic">&ldquo;{cleanTagline}&rdquo;</p>
                  )}
                  {media.type === 'tv' && currentEpObj && (
                    <p className="text-xs text-primary font-bold mt-1">
                      S{currentSeason} E{currentEpisode} :: {currentEpObj.name}
                    </p>
                  )}
                </div>

                {/* Watchlist Toggle Button */}
                <button
                  onClick={onWatchlistToggle}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all self-start flex-shrink-0 ${
                    isInWatchlist
                      ? 'bg-secondary text-crust'
                      : 'bg-card hover:bg-mantle border border-border hover:border-primary text-fg'
                  }`}
                >
                  {isInWatchlist ? (
                    <>
                      <BookmarkCheck className="w-3.5 h-3.5" />
                      <span>Bookmarked</span>
                    </>
                  ) : (
                    <>
                      <Bookmark className="w-3.5 h-3.5" />
                      <span>Bookmark</span>
                    </>
                  )}
                </button>
              </div>

              {/* Tags & Badges */}
              <div className="flex items-center gap-2 flex-wrap text-xs">
                <span className="px-2 py-0.5 rounded bg-card border border-border text-fg text-[11px]">
                  {duration}
                </span>
                <span className="px-2 py-0.5 rounded bg-primary/15 border border-primary/40 text-primary text-[11px]">
                  {quality}
                </span>
                <span className="flex items-center gap-1 text-accent font-bold text-[11px] ml-1">
                  <Star className="w-3 h-3 fill-accent" />
                  {media.rating}
                </span>
                {(media.genres || [media.genre]).map(g => (
                  <span
                    key={g}
                    className="px-2 py-0.5 rounded bg-crust border border-border text-secondary text-[11px]"
                  >
                    {g}
                  </span>
                ))}
              </div>

              {/* Overview Synopsis */}
              <div>
                <span className="text-[10px] text-subtext/60 uppercase tracking-wider block mb-1">
                  Synopsis
                </span>
                <p className="text-xs text-subtext leading-relaxed font-sans">
                  {media.overview || 'No synopsis available for this title.'}
                </p>
              </div>

              {/* Cast Avatars Section (Non-truncated, clean tiling) */}
              {cast.length > 0 && (
                <div className="pt-2">
                  <span className="text-[10px] text-subtext/60 uppercase tracking-wider block mb-2">
                    Cast & Characters
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                    {cast.map((c, i) => (
                      <div
                        key={`${c.name}-${i}`}
                        className="flex flex-col items-center text-center p-2 rounded-lg bg-crust border border-border"
                      >
                        <img
                          src={getImageUrl(c.profile_path, 'w185')}
                          alt={c.name}
                          className="w-12 h-12 rounded-full object-cover border border-border mb-1.5"
                          loading="lazy"
                        />
                        <span
                          className="text-[11px] font-sans font-semibold text-fg truncate w-full"
                          title={c.name}
                        >
                          {c.name}
                        </span>
                        <span
                          className="text-[10px] text-subtext/60 truncate w-full"
                          title={c.character}
                        >
                          {c.character}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT DOCKED PANE: For TV Shows (Season selector & vertical episode list) */}
          {media.type === 'tv' && (
            <div className="w-full lg:w-[32%] flex-shrink-0 bg-crust flex flex-col overflow-hidden">
              {/* Dock Titlebar + Season Picker */}
              <div className="p-3 border-b border-border flex items-center justify-between gap-2 bg-mantle">
                <div className="flex items-center gap-1.5 text-xs text-primary font-bold">
                  <Tv className="w-3.5 h-3.5" />
                  <span>~/episodes</span>
                </div>

                {/* Season Dropdown */}
                <div className="flex items-center gap-1.5">
                  <label htmlFor="season-dropdown" className="text-[11px] text-subtext/70">
                    Season:
                  </label>
                  <select
                    id="season-dropdown"
                    value={currentSeason}
                    onChange={e => onSeasonChange(parseInt(e.target.value, 10))}
                    className="bg-crust border border-border text-fg text-xs px-2 py-1 rounded outline-none cursor-pointer"
                  >
                    {Array.from({ length: seasons }, (_, i) => i + 1).map(s => (
                      <option key={s} value={s}>
                        Season {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Vertical Scrollable Episode List */}
              <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {Array.from({ length: totalEpisodesCount }, (_, i) => {
                  const epNum = i + 1;
                  const epData = episodeList.find(e => e.episode_number === epNum);
                  const epTitle = epData?.name || `Episode ${epNum}`;
                  const isCurrent = epNum === currentEpisode;

                  return (
                    <button
                      key={epNum}
                      onClick={() => onEpisodeChange(epNum)}
                      className={`w-full text-left p-2 rounded-lg text-xs transition-all flex items-center justify-between gap-2 ${
                        isCurrent
                          ? 'bg-primary/15 border border-primary text-primary font-bold'
                          : 'bg-mantle hover:bg-card border border-transparent hover:border-border text-subtext hover:text-fg'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span className="font-mono text-[11px] text-subtext/60 flex-shrink-0">
                          {String(epNum).padStart(2, '0')} ::
                        </span>
                        <span className="truncate font-sans font-medium text-xs">{epTitle}</span>
                      </div>
                      {isCurrent && (
                        <span className="flex-shrink-0 w-2 h-2 rounded-full bg-emerald animate-pulse" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
