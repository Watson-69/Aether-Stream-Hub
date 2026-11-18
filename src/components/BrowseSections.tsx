import { MediaRow } from './MediaRow';
import type { MediaItem } from '../lib/types';

interface BrowseSectionsProps {
  sections: {
    trending: MediaItem[];
    popularMovies: MediaItem[];
    popularTv: MediaItem[];
    topRated: MediaItem[];
    scifi: MediaItem[];
    action: MediaItem[];
  };
  onItemClick: (item: MediaItem) => void;
  onToggleWatchlist?: (item: MediaItem) => void;
  watchlist?: MediaItem[];
}

export function BrowseSections({
  sections,
  onItemClick,
  onToggleWatchlist,
  watchlist = [],
}: BrowseSectionsProps) {
  return (
    <div id="browse-sections">
      <MediaRow
        title="Trending This Week"
        terminalPath="~/discover/trending"
        id="trending-row"
        items={sections.trending}
        onItemClick={onItemClick}
        onToggleWatchlist={onToggleWatchlist}
        watchlist={watchlist}
        ariaLabel="Trending media"
      />
      <MediaRow
        title="Popular Movies"
        terminalPath="~/movies/popular"
        id="popular-movies-row"
        items={sections.popularMovies}
        onItemClick={onItemClick}
        onToggleWatchlist={onToggleWatchlist}
        watchlist={watchlist}
        ariaLabel="Popular movies"
      />
      <MediaRow
        title="Popular TV Series"
        terminalPath="~/tv/popular"
        id="popular-tv-row"
        items={sections.popularTv}
        onItemClick={onItemClick}
        onToggleWatchlist={onToggleWatchlist}
        watchlist={watchlist}
        ariaLabel="Popular TV shows"
      />
      <MediaRow
        title="Top Rated Classics"
        terminalPath="~/catalog/top-rated"
        id="top-rated-row"
        items={sections.topRated}
        onItemClick={onItemClick}
        onToggleWatchlist={onToggleWatchlist}
        watchlist={watchlist}
        ariaLabel="Top rated movies"
      />
      <MediaRow
        title="Sci-Fi & Fantasy"
        terminalPath="~/genres/scifi"
        id="scifi-row"
        items={sections.scifi}
        onItemClick={onItemClick}
        onToggleWatchlist={onToggleWatchlist}
        watchlist={watchlist}
        ariaLabel="Sci-Fi media"
      />
      <MediaRow
        title="Action & Adventure"
        terminalPath="~/genres/action"
        id="action-row"
        items={sections.action}
        onItemClick={onItemClick}
        onToggleWatchlist={onToggleWatchlist}
        watchlist={watchlist}
        ariaLabel="Action media"
      />
    </div>
  );
}
