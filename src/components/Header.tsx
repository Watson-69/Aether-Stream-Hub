import { Sun, Moon, Film } from 'lucide-react';
import type { Theme } from '../hooks/useTheme';

interface HeaderProps {
  theme: Theme;
  onToggleTheme: () => void;
}

export function Header({ theme, onToggleTheme }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-bg/95 backdrop-blur-md border-b-4 border-border px-6 py-4 transition-colors duration-fast">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-md bg-primary border-3 border-border shadow-brutal-sm flex items-center justify-center text-fg font-black">
            <Film className="w-5 h-5 text-fg" />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="font-heading font-extrabold text-h3 sm:text-h2 text-fg tracking-tight leading-none">
              Aether Stream
            </h1>
            <span className="badge badge-primary text-xs px-2 py-0.5 font-mono hidden sm:inline-flex">
              HD Player
            </span>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleTheme}
            className="btn btn-secondary px-3.5 py-2 text-body-sm flex items-center gap-2"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
            aria-label="Toggle dark/light theme"
          >
            {theme === 'dark' ? (
              <>
                <Sun className="w-4 h-4 text-fg" />
                <span className="font-heading font-bold text-caption uppercase hidden sm:inline">
                  Light
                </span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-fg" />
                <span className="font-heading font-bold text-caption uppercase hidden sm:inline">
                  Dark
                </span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
