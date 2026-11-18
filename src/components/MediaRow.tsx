import { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { MediaCard } from './MediaCard';
import type { MediaItem } from '../lib/types';

export type { MediaItem } from '../lib/types';

interface MediaRowProps {
  title: string;
  terminalPath?: string;
  id: string;
  items: MediaItem[];
  onItemClick: (item: MediaItem) => void;
  onToggleWatchlist?: (item: MediaItem) => void;
  watchlist?: MediaItem[];
  ariaLabel: string;
}

export function MediaRow({
  title,
  terminalPath,
  id,
  items,
  onItemClick,
  onToggleWatchlist,
  watchlist = [],
  ariaLabel,
}: MediaRowProps) {
  const rowRef = useRef<HTMLDivElement>(null);

  if (items.length === 0) return null;

  const scroll = (direction: 'left' | 'right') => {
    if (rowRef.current) {
      const scrollAmount = direction === 'left' ? -520 : 520;
      rowRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const pathDisplay = terminalPath || `~/discover/${id.replace('-row', '')}`;

  return (
    <section className="movie-section mb-10" aria-labelledby={`${id}-title`}>
      {/* Tiling Window Pane Header */}
      <div className="flex items-center justify-between mb-3 px-1 font-mono">
        <div className="flex items-center gap-2.5">
          {/* Hyprland Window Dots */}
          <div className="flex items-center gap-1.5 opacity-80">
            <span className="w-2.5 h-2.5 rounded-full bg-red" />
            <span className="w-2.5 h-2.5 rounded-full bg-accent" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald" />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-primary font-bold">{pathDisplay}</span>
            <span className="text-xs text-fg/60 hidden sm:inline">—</span>
            <h2 id={`${id}-title`} className="text-xs text-fg font-medium hidden sm:inline">
              {title}
            </h2>
          </div>
        </div>

        {/* Navigation scroll arrows - larger touch targets, better focus states */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-fg/60 mr-2 hidden sm:inline">[{items.length} tiles]</span>
          <button
            onClick={() => scroll('left')}
            className="w-10 h-10 rounded-md border border-border bg-mantle hover:bg-card text-fg/80 hover:text-primary hover:border-primary flex items-center justify-center transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-crust"
            aria-label={`Scroll ${title} left`}
            title="Scroll left"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => scroll('right')}
            className="w-10 h-10 rounded-md border border-border bg-mantle hover:bg-card text-fg/80 hover:text-primary hover:border-primary flex items-center justify-center transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-crust"
            aria-label={`Scroll ${title} right`}
            title="Scroll right"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Horizontal Carousel */}
      <div
        ref={rowRef}
        id={id}
        className="movie-row items-stretch py-2 px-1 gap-4"
        role="list"
        aria-label={ariaLabel}
      >
        {items.map(item => {
          const inWatchlist = watchlist.some(m => m.id === item.id);
          return (
            <div
              key={item.id}
              className="flex-shrink-0 w-[190px] sm:w-[210px] snap-start flex flex-col"
            >
              <MediaCard
                item={item}
                isInWatchlist={inWatchlist}
                onClick={onItemClick}
                onToggleWatchlist={onToggleWatchlist}
              />
            </div>
          );
        })}
      </div>
    </section>
  );
}
