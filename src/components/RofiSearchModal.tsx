import { X, Star, Sparkles, CornerDownLeft, Hash } from 'lucide-react';
import { useState, useEffect, useRef, useCallback } from 'react';
import type { MediaItem, SearchFilters } from '../lib/types';
import { apiService } from '../lib/services';

interface RofiSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectMedia: (item: MediaItem) => void;
}

const QUICK_CATEGORIES = [
  { label: 'Action', emoji: '💥' },
  { label: 'Sci-Fi', emoji: '🚀' },
  { label: 'Comedy', emoji: '😂' },
  { label: 'Horror', emoji: '👻' },
  { label: 'Animation', emoji: '🎬' },
  { label: 'Drama', emoji: '🎭' },
  { label: 'Thriller', emoji: '🕵️' },
  { label: 'Adventure', emoji: '🤠' },
];

export function RofiSearchModal({ isOpen, onClose, onSelectMedia }: RofiSearchModalProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<MediaItem[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const resultsContainerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  // Focus input whenever modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setSelectedIndex(0);
    } else {
      setQuery('');
      setResults([]);
    }
  }, [isOpen]);

  // Debounced search query
  const executeSearch = useCallback(async (q: string) => {
    const trimmed = q.trim();
    if (!trimmed) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const filters: SearchFilters = { query: trimmed, genreId: '', type: 'all' };
      const items = await apiService.fetchSearchResults(filters);
      setResults(items);
      setSelectedIndex(0);
    } catch (err) {
      console.warn('Rofi search failed:', err);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      void executeSearch(val);
    }, 250);
  };

  const isRawId = /^\d+$/.test(query.trim()) || /^tt\d+$/i.test(query.trim());

  // Keyboard navigation inside Rofi
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
      return;
    }

    if (e.key === 'Enter') {
      e.preventDefault();
      if (results.length > 0 && results[selectedIndex]) {
        onSelectMedia(results[selectedIndex]);
        onClose();
      } else if (isRawId && !isLoading) {
        // Direct trigger on enter
        void executeSearch(query);
      }
      return;
    }

    if (results.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => {
        const next = prev < results.length - 1 ? prev + 1 : 0;
        scrollIndexIntoView(next);
        return next;
      });
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => {
        const next = prev > 0 ? prev - 1 : results.length - 1;
        scrollIndexIntoView(next);
        return next;
      });
    }
  };

  const scrollIndexIntoView = (index: number) => {
    const container = resultsContainerRef.current;
    if (!container) return;
    const itemEl = container.children[index] as HTMLElement;
    if (itemEl) {
      itemEl.scrollIntoView({ block: 'nearest' });
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-14 sm:pt-20 px-3 sm:px-4 bg-black/80 backdrop-blur-md animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="w-full max-w-2xl bg-mantle border border-primary/60 rounded-xl shadow-2xl overflow-hidden font-mono text-fg flex flex-col max-h-[82vh] animate-modal-in"
        onClick={e => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Rofi Window Titlebar */}
        <div className="flex items-center justify-between px-4 py-2 bg-crust border-b border-border text-[11px] text-subtext">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red" />
            <span className="w-2.5 h-2.5 rounded-full bg-accent" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald" />
            <span className="text-primary font-bold ml-1">rofi // command palette</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-subtext/60 hidden sm:inline">Navigate:</span>
            <kbd className="px-1 py-0.5 rounded bg-mantle border border-border text-[10px] text-subtext">
              ↑↓
            </kbd>
            <kbd className="px-1 py-0.5 rounded bg-mantle border border-border text-[10px] text-subtext">
              ↵
            </kbd>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded bg-card hover:bg-mantle text-subtext hover:text-red flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-crust ml-2"
              aria-label="Close (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Input Bar with Prompt Glyph */}
        <div className="flex items-center gap-3 px-4 py-3 bg-mantle border-b border-border">
          <span className="text-primary font-bold text-sm">❯</span>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleInputChange}
            placeholder="Type movie/show title, or paste TMDB/IMDb ID (e.g. 550, tt0137523)..."
            className="flex-1 bg-transparent text-sm text-fg placeholder:text-subtext/60 outline-none font-mono"
            autoComplete="off"
            spellCheck="false"
          />
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin flex-shrink-0" />
          ) : query ? (
            <button
              onClick={() => {
                setQuery('');
                setResults([]);
                inputRef.current?.focus();
              }}
              className="w-10 h-10 rounded bg-card hover:bg-mantle text-subtext hover:text-fg flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-crust"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <kbd className="text-xs px-2 py-1 rounded bg-crust border border-border text-primary font-bold">
              ESC
            </kbd>
          )}
        </div>

        {/* Raw ID Direct Match Notice */}
        {isRawId && (
          <div className="px-4 py-1.5 bg-primary/10 border-b border-primary/20 flex items-center justify-between text-xs text-primary">
            <div className="flex items-center gap-2">
              <Hash className="w-3.5 h-3.5" />
              <span>
                Direct ID detected: <strong>{query.trim()}</strong>
              </span>
            </div>
            <span className="text-[11px] text-subtext">Press [Enter] to launch</span>
          </div>
        )}

        {/* Results Body */}
        <div
          ref={resultsContainerRef}
          className="overflow-y-auto flex-1 p-2 space-y-1 divide-y divide-border/20"
          role="listbox"
        >
          {/* Quick Category Hints when search is empty */}
          {!query && (
            <div className="p-4 text-center">
              <div className="flex items-center justify-center gap-1.5 text-xs text-primary mb-3">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Quick Category Launchers</span>
              </div>
              <div className="flex flex-wrap justify-center gap-2">
                {QUICK_CATEGORIES.map(cat => (
                  <button
                    key={cat.label}
                    onClick={() => {
                      setQuery(cat.label);
                      void executeSearch(cat.label);
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-card hover:bg-mantle border border-border hover:border-primary text-xs text-fg transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-crust min-h-[44px]"
                    aria-label={`Browse ${cat.label} movies and shows`}
                  >
                    <span aria-hidden="true">{cat.emoji}</span>
                    <span>{cat.label}</span>
                  </button>
                ))}
              </div>
              <div className="mt-4 p-2.5 rounded bg-crust border border-border/60 text-[11px] text-subtext/70 text-left space-y-1">
                <p className="text-primary font-bold">Pro-tip: Direct ID Streaming</p>
                <p>
                  Paste any TMDB ID (e.g. <code className="text-fg">550</code>,{' '}
                  <code className="text-fg">1399</code>) or IMDb ID (e.g.{' '}
                  <code className="text-fg">tt0137523</code>,{' '}
                  <code className="text-fg">tt0944947</code>) to stream instantly.
                </p>
              </div>
            </div>
          )}

          {/* Result Items */}
          {results.map((item, index) => {
            const isSelected = index === selectedIndex;
            return (
              <div
                key={item.id}
                role="option"
                aria-selected={isSelected}
                tabIndex={isSelected ? 0 : -1}
                onClick={() => {
                  onSelectMedia(item);
                  onClose();
                }}
                onKeyDown={e => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelectMedia(item);
                    onClose();
                  }
                }}
                onMouseEnter={() => setSelectedIndex(index)}
                className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-crust ${
                  isSelected
                    ? 'bg-primary/15 border border-primary/60 text-fg'
                    : 'hover:bg-card text-fg/80 border border-transparent'
                }`}
              >
                {/* Mini Poster Thumbnail */}
                <div className="w-10 h-14 bg-crust rounded overflow-hidden flex-shrink-0 border border-border">
                  <img
                    src={item.poster}
                    alt={item.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>

                {/* Info Text */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.2 rounded border uppercase ${
                        item.type === 'tv'
                          ? 'bg-secondary/20 text-secondary border-secondary/40'
                          : 'bg-primary/20 text-primary border-primary/40'
                      }`}
                    >
                      {item.type}
                    </span>
                    <span className="font-semibold text-xs text-fg truncate font-sans">
                      {item.title}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-[11px] text-subtext">
                    <span>{item.year || 'N/A'}</span>
                    <span>•</span>
                    <span className="truncate max-w-[140px]">{item.genre}</span>
                    <span className="ml-auto flex items-center gap-1 text-accent font-bold">
                      <Star className="w-3 h-3 fill-accent" />
                      {item.rating}
                    </span>
                  </div>
                </div>

                {isSelected && (
                  <div className="flex-shrink-0 hidden sm:flex items-center text-[10px] text-primary gap-1 px-1.5 py-0.5 rounded bg-crust border border-primary/40">
                    <CornerDownLeft className="w-3 h-3" />
                    <span>play</span>
                  </div>
                )}
              </div>
            );
          })}

          {/* Empty search results state */}
          {query && !isLoading && results.length === 0 && (
            <div className="p-8 text-center text-subtext">
              <p className="text-xs font-bold text-red mb-1">No matching titles found</p>
              <p className="text-[11px] text-subtext/60">
                Check for typos or try pasting a raw numeric TMDB ID or IMDb ID.
              </p>
            </div>
          )}
        </div>

        {/* Footer Navigation Bar */}
        <div className="flex items-center justify-between px-4 py-2 bg-crust border-t border-border text-[10px] text-subtext/60">
          <span>{results.length > 0 ? `${results.length} matches` : 'aether command palette'}</span>
          <div className="flex items-center gap-3">
            <span>[Enter] Launch stream</span>
            <span>[Esc] Dismiss</span>
          </div>
        </div>
      </div>
    </div>
  );
}
