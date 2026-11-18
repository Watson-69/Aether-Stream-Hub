import { SearchX, Sparkles } from 'lucide-react';
import { MediaCard } from './MediaCard';
import type { MediaItem } from '../lib/types';

const POPULAR_GENRES = [
  { name: 'Action', emoji: '💥' },
  { name: 'Sci-Fi', emoji: '🚀' },
  { name: 'Comedy', emoji: '😂' },
  { name: 'Horror', emoji: '👻' },
  { name: 'Animation', emoji: '🎬' },
  { name: 'Drama', emoji: '🎭' },
  { name: 'Thriller', emoji: '🕵️' },
  { name: 'Adventure', emoji: '🤠' },
  { name: 'Fantasy', emoji: '🧙‍♂️' },
  { name: 'Mystery', emoji: '🔍' },
];

interface SearchSectionProps {
  isVisible: boolean;
  heading: string;
  items: MediaItem[];
  onItemClick: (item: MediaItem) => void;
  onClear: () => void;
  isLoading: boolean;
  onQuickSearch?: (genre: string) => void;
  onToggleWatchlist?: (item: MediaItem) => void;
  watchlist?: MediaItem[];
}

export function SearchSection({
  isVisible,
  heading,
  items,
  onItemClick,
  onClear,
  isLoading,
  onQuickSearch,
  onToggleWatchlist,
  watchlist = [],
}: SearchSectionProps) {
  if (!isVisible) return null;

  return (
    <section
      id="search-section"
      className="movie-section animate-fade-in mb-12 font-mono"
      aria-labelledby="search-heading"
    >
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-border">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-red" />
          <span className="w-2.5 h-2.5 rounded-full bg-accent" />
          <span className="w-2.5 h-2.5 rounded-full bg-emerald" />
          <h2 id="search-heading" className="text-xs text-primary font-bold ml-1">
            ~/search/results: <span className="text-fg font-medium">{heading}</span>
          </h2>
        </div>
        <button
          id="clear-search-btn"
          onClick={onClear}
          className="btn text-xs px-3 py-1 text-secondary border-border hover:border-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-crust"
        >
          Close Search [Esc]
        </button>
      </div>

      {isLoading && (
        <div
          id="loading-overlay"
          className="py-16 flex flex-col items-center justify-center gap-3 text-fg/70"
          role="status"
          aria-live="polite"
        >
          <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
          <p className="text-xs">Querying TMDB index...</p>
        </div>
      )}

      {items.length > 0 && (
        <div
          id="search-grid"
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4"
          role="list"
        >
          {items.map(item => {
            const inWatchlist = watchlist.some(m => m.id === item.id);
            return (
              <div key={item.id} className="flex flex-col min-w-0">
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
      )}

      {items.length === 0 && !isLoading && (
        <div
          id="no-search-results"
          className="my-6 max-w-xl mx-auto p-8 bg-mantle border border-border rounded-xl text-center shadow-xl animate-fade-in"
          aria-live="polite"
        >
          <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-card border border-border flex items-center justify-center text-primary">
            <SearchX className="w-6 h-6 stroke-[2]" />
          </div>

          <h3 className="font-bold text-sm text-fg mb-1">No Matching Results</h3>

          <p className="text-xs text-fg/70 max-w-md mx-auto mb-5 leading-relaxed font-sans">
            We couldn&apos;t find any titles matching your query. Check for typos or jump directly
            into a curated genre below:
          </p>

          <div className="mb-6">
            <div className="flex items-center justify-center gap-1.5 text-xs text-fg/60 uppercase tracking-wider mb-2.5">
              <Sparkles className="w-3 h-3 text-primary" />
              <span>Recommended Categories</span>
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              {POPULAR_GENRES.map(genre => (
                <button
                  key={genre.name}
                  onClick={() => onQuickSearch?.(genre.name)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md text-xs border border-border bg-card text-fg hover:border-primary hover:text-primary hover:bg-mantle transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-crust min-h-[44px]"
                  aria-label={`Browse ${genre.name} movies and shows`}
                >
                  <span aria-hidden="true">{genre.emoji}</span>
                  <span>{genre.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-border flex justify-center">
            <button onClick={onClear} className="btn btn-primary text-xs px-4 py-2">
              Back to Catalog
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
