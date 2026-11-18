import { Bookmark, X, Play, Trash2, Star } from 'lucide-react';
import type { MediaItem } from '../lib/types';

interface WatchlistDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: MediaItem[];
  onPlayMedia: (item: MediaItem) => void;
  onRemove: (id: string) => void;
}

export function WatchlistDrawer({
  isOpen,
  onClose,
  items,
  onPlayMedia,
  onRemove,
}: WatchlistDrawerProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <aside
        className="w-full sm:w-[380px] h-full bg-mantle border-l border-border shadow-2xl flex flex-col font-mono text-fg animate-slide-in"
        onClick={e => e.stopPropagation()}
      >
        {/* Drawer Titlebar */}
        <div className="flex items-center justify-between px-4 py-3 bg-crust border-b border-border">
          <div className="flex items-center gap-2">
            <Bookmark className="w-4 h-4 text-secondary" />
            <span className="font-bold text-xs text-fg">~/bookmarks/watchlist</span>
            <span className="text-[11px] px-2 py-0.5 rounded bg-secondary/15 text-secondary font-bold">
              {items.length}
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded bg-card hover:bg-mantle text-subtext hover:text-red border border-border flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-crust"
            aria-label="Close watchlist drawer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* List of Watchlist Items */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
          {items.map(item => (
            <div
              key={item.id}
              className="flex items-center gap-3 p-3 rounded-lg bg-card border border-border hover:border-primary transition-all group"
            >
              {/* Mini Poster */}
              <div className="w-14 h-20 rounded overflow-hidden bg-crust border border-border flex-shrink-0">
                <img
                  src={item.poster}
                  alt={item.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>

              {/* Title & Metadata */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-1">
                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded border uppercase ${
                      item.type === 'tv'
                        ? 'bg-secondary/20 text-secondary border-secondary/40'
                        : 'bg-primary/20 text-primary border-primary/40'
                    }`}
                  >
                    {item.type}
                  </span>
                  <h4
                    className="font-sans font-semibold text-sm text-fg truncate"
                    title={item.title}
                  >
                    {item.title}
                  </h4>
                </div>

                <div className="flex items-center gap-2 text-xs text-fg/70 mb-2">
                  <span>{item.year || 'N/A'}</span>
                  <span>•</span>
                  <span className="flex items-center gap-0.5 text-accent font-bold">
                    <Star className="w-3 h-3 fill-current text-accent" />
                    {item.rating}
                  </span>
                </div>

                {/* Action Buttons: Play + Remove - larger touch targets */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      onPlayMedia(item);
                      onClose();
                    }}
                    className="flex items-center gap-1.5 px-3 py-2 rounded bg-primary hover:opacity-90 text-crust font-bold text-xs transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-crust min-h-[44px]"
                    aria-label={`Play ${item.title}`}
                  >
                    <Play className="w-4 h-4 fill-current text-crust" />
                    <span>Play</span>
                  </button>
                  <button
                    onClick={() => onRemove(item.id)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded bg-crust hover:bg-red/20 text-subtext hover:text-red border border-border text-xs transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red focus-visible:ring-offset-2 focus-visible:ring-offset-crust min-h-[44px]"
                    aria-label={`Remove ${item.title} from watchlist`}
                  >
                    <Trash2 className="w-4 h-4" />
                    <span className="hidden sm:inline">Remove</span>
                  </button>
                </div>
              </div>
            </div>
          ))}

          {items.length === 0 && (
            <div className="p-8 text-center text-fg/50">
              <Bookmark className="w-10 h-10 mx-auto mb-3 opacity-30 text-secondary" />
              <p className="text-sm text-fg/60 font-bold mb-1">Watchlist Empty</p>
              <p className="text-xs text-fg/50">
                Hover over any movie or series tile and click the bookmark button to save it.
              </p>
            </div>
          )}
        </div>

        {/* Drawer Footer */}
        <div className="p-3 bg-crust border-t border-border text-xs text-fg/50 flex items-center justify-between">
          <span>Synced locally via localStorage</span>
          <button
            onClick={onClose}
            className="text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-crust px-2 py-1"
          >
            Done
          </button>
        </div>
      </aside>
    </div>
  );
}
