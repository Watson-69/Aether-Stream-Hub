import { Terminal, Search, Bookmark, ChevronDown, Check } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import type { ThemeId, ThemeOption } from '../hooks/useRiceTheme';

interface WaybarProps {
  onOpenSearch: () => void;
  onToggleWatchlist: () => void;
  watchlistCount: number;
  onToggleLogPanel: () => void;
  logCount: number;
  currentRiceTheme: ThemeId;
  onSelectRiceTheme: (theme: ThemeId) => void;
  themes: ThemeOption[];
}

export function Waybar({
  onOpenSearch,
  onToggleWatchlist,
  watchlistCount,
  onToggleLogPanel,
  logCount,
  currentRiceTheme,
  onSelectRiceTheme,
  themes,
}: WaybarProps) {
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);
  const themeMenuRef = useRef<HTMLDivElement>(null);

  // Global keyboard shortcuts: "/" or "Ctrl+K" / "Cmd+K" to trigger search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      const isInput =
        activeEl instanceof HTMLInputElement || activeEl instanceof HTMLTextAreaElement;
      if (isInput) return;

      if (e.key === '/' || ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k')) {
        e.preventDefault();
        onOpenSearch();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onOpenSearch]);

  // Click outside to close theme dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (themeMenuRef.current && !themeMenuRef.current.contains(e.target as Node)) {
        setIsThemeMenuOpen(false);
      }
    };

    if (isThemeMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isThemeMenuOpen]);

  const activeThemeObj = themes.find(t => t.id === currentRiceTheme) || themes[0];

  return (
    <header className="sticky top-3 z-40 mx-auto max-w-7xl px-3 sm:px-4 mb-8">
      <nav
        aria-label="Waybar Top Navigation"
        className="bg-mantle/95 backdrop-blur-md border border-border rounded-xl px-3 sm:px-4 py-2 shadow-2xl shadow-black/50 flex items-center justify-between gap-2.5 sm:gap-3 text-xs font-mono"
      >
        {/* Left Module: Brand Terminal Pill */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-crust border border-border text-primary font-bold">
            <Terminal className="w-4 h-4 text-primary" />
            <span className="tracking-widest hidden sm:inline text-xs font-extrabold">
              AETHER // STREAM
            </span>
            <span className="tracking-widest sm:hidden text-xs font-extrabold">AETHER</span>
          </div>
        </div>

        {/* Center Module: Interactive Search Trigger Bar (Rofi trigger) */}
        <button
          onClick={onOpenSearch}
          className="flex-1 max-w-md flex items-center justify-between px-3 py-1.5 rounded-lg bg-crust border border-border hover:border-primary text-subtext hover:text-fg transition-all group"
          title="Open command palette (/ or ⌘K)"
        >
          <div className="flex items-center gap-2 truncate">
            <Search className="w-3.5 h-3.5 text-primary flex-shrink-0 group-hover:scale-110 transition-transform" />
            <span className="text-[11px] truncate hidden sm:inline">
              Search title or enter TMDB / IMDb ID...
            </span>
            <span className="text-[11px] truncate sm:hidden">Search...</span>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0 ml-2">
            <kbd className="px-1.5 py-0.5 rounded bg-card border border-border text-[10px] text-primary font-bold shadow-sm">
              /
            </kbd>
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 rounded bg-card border border-border text-[10px] text-subtext/70">
              ⌘K
            </kbd>
          </div>
        </button>

        {/* Right Module: Rice Switcher (15 Themes) + Stream Log + Watchlist Drawer Trigger */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Rice Theme Switcher Pill Dropdown */}
          <div className="relative" ref={themeMenuRef}>
            <button
              onClick={() => setIsThemeMenuOpen(prev => !prev)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-crust hover:bg-card border border-border hover:border-primary text-fg transition-all"
              title="Select Rice Palette (15 Themes)"
              aria-label="Switch Theme Palette"
              aria-expanded={isThemeMenuOpen}
            >
              <span
                className="w-2.5 h-2.5 rounded-full border border-black/30"
                style={{ backgroundColor: activeThemeObj.accentPrimary }}
              />
              <span className="hidden md:inline text-[11px] font-bold">{activeThemeObj.badge}</span>
              <ChevronDown className="w-3 h-3 text-subtext" />
            </button>

            {isThemeMenuOpen && (
              <div
                className="absolute right-0 top-full mt-2 w-56 max-h-80 overflow-y-auto bg-mantle border border-border rounded-xl shadow-2xl p-1.5 space-y-0.5 z-50 animate-modal-in"
                role="menu"
              >
                <div className="px-2.5 py-1.5 text-[10px] text-subtext/70 uppercase font-bold tracking-wider border-b border-border/40 mb-1">
                  Hyprland Rice Themes ({themes.length})
                </div>
                {themes.map(t => {
                  const isCurrent = t.id === currentRiceTheme;
                  return (
                    <button
                      key={t.id}
                      onClick={() => {
                        onSelectRiceTheme(t.id);
                        setIsThemeMenuOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left text-xs transition-colors ${
                        isCurrent
                          ? 'bg-card text-primary font-bold border border-primary/40'
                          : 'text-fg hover:bg-card/70 border border-transparent'
                      }`}
                      role="menuitem"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full border border-black/30 flex-shrink-0"
                          style={{ backgroundColor: t.accentPrimary }}
                        />
                        <span className="truncate">{t.name}</span>
                      </div>
                      {isCurrent && <Check className="w-3.5 h-3.5 text-primary flex-shrink-0" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Stream Log Terminal Toggle Pill */}
          <button
            onClick={onToggleLogPanel}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-crust hover:bg-card border border-border hover:border-emerald text-emerald transition-all"
            title="Toggle Stream Activity Log (stream.log)"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald animate-pulse" />
            <span className="text-[11px]">stream.log</span>
            <span className="text-[10px] px-1 rounded bg-emerald/15 text-emerald">{logCount}</span>
          </button>

          {/* Watchlist Pill Button */}
          <button
            onClick={onToggleWatchlist}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-card hover:bg-mantle border border-border hover:border-secondary text-fg transition-all active:scale-95"
            title="Open Watchlist Drawer"
          >
            <Bookmark className="w-3.5 h-3.5 text-secondary" />
            <span className="hidden sm:inline text-xs font-semibold">Watchlist</span>
            <span className="px-1.5 py-0.2 rounded-full bg-secondary/20 text-secondary font-bold text-[10px]">
              {watchlistCount}
            </span>
          </button>
        </div>
      </nav>
    </header>
  );
}
