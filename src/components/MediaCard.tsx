import { Play, Bookmark, BookmarkCheck, Star } from 'lucide-react';
import type { MediaItem } from '../lib/types';

interface MediaCardProps {
  item: MediaItem;
  isWatchlist?: boolean;
  isInWatchlist?: boolean;
  onClick: (item: MediaItem) => void;
  onRemove?: (id: string) => void;
  onToggleWatchlist?: (item: MediaItem) => void;
}

export function MediaCard({
  item,
  isWatchlist = false,
  isInWatchlist = false,
  onClick,
  onRemove,
  onToggleWatchlist,
}: MediaCardProps) {
  const handleClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.card-action-btn')) {
      return;
    }
    onClick(item);
  };

  const handleWatchlistClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isWatchlist && onRemove) {
      onRemove(item.id);
    } else if (onToggleWatchlist) {
      onToggleWatchlist(item);
    }
  };

  return (
    <article
      className="group relative flex flex-col h-full rounded-lg bg-card border border-border hover:border-primary hover:shadow-tile-glow transition-all duration-200 cursor-pointer overflow-hidden"
      role="listitem"
      tabIndex={0}
      data-media-id={item.id}
      onClick={handleClick}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick(item);
        }
      }}
    >
      {/* Poster Image Container (aspect 2/3) */}
      <div className="relative aspect-[2/3] bg-crust overflow-hidden flex-shrink-0 border-b border-border">
        <img
          src={item.poster}
          alt={item.title}
          loading="lazy"
          className="w-full h-full object-cover object-top transition-transform duration-300 ease-out group-hover:scale-105"
        />

        {/* Top-Left Floating MOVIE / TV Badge */}
        <span
          className={`absolute top-2 left-2 text-[11px] font-mono font-bold px-2 py-0.5 rounded uppercase border backdrop-blur-md shadow-sm ${
            item.type === 'tv'
              ? 'bg-crust/90 text-secondary border-secondary/50'
              : 'bg-crust/90 text-primary border-primary/50'
          }`}
        >
          {item.type}
        </span>

        {/* Top-Right Quick Watchlist Toggle Button - always visible, larger touch target */}
        {(onToggleWatchlist || isWatchlist) && (
          <button
            className={`card-action-btn absolute top-2 right-2 w-9 h-9 rounded-md border flex items-center justify-center transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-crust ${
              isInWatchlist || isWatchlist
                ? 'opacity-100 bg-secondary text-crust border-secondary'
                : 'opacity-60 group-hover:opacity-100 bg-crust/80 hover:bg-card text-fg hover:text-secondary border-border'
            }`}
            onClick={handleWatchlistClick}
            aria-label={isInWatchlist || isWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'}
            aria-pressed={isInWatchlist || isWatchlist}
          >
            {isInWatchlist || isWatchlist ? (
              <BookmarkCheck className="w-4 h-4" />
            ) : (
              <Bookmark className="w-4 h-4" />
            )}
          </button>
        )}

        {/* Center Play Overlay on Hover/Focus */}
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-200 pointer-events-none">
          <div className="w-12 h-12 rounded-full bg-primary text-crust flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-110 group-focus-within:scale-110">
            <Play className="w-6 h-6 fill-crust ml-0.5" />
          </div>
        </div>
      </div>

      {/* Info Bottom Metadata */}
      <div className="p-3 flex flex-col flex-1 justify-between gap-1.5 bg-card">
        <h3
          className="font-sans font-semibold text-sm text-fg group-hover:text-primary truncate transition-colors"
          title={item.title}
        >
          {item.title}
        </h3>

        <div className="flex items-center justify-between text-xs font-mono text-fg/80 pt-1 border-t border-border/40 mt-auto">
          <span className="truncate max-w-[140px]">
            {item.year || item.type.toUpperCase()} • {item.genre}
          </span>
          <span className="flex items-center gap-1 text-accent font-bold flex-shrink-0 ml-2">
            <Star className="w-3.5 h-3.5 fill-accent" />
            {item.rating}
          </span>
        </div>
      </div>
    </article>
  );
}
