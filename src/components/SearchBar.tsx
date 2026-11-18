import { Search, X } from 'lucide-react';
import { useRef, useCallback } from 'react';

interface SearchBarProps {
  onSearch: (query: string) => void;
  query: string;
  onQueryChange: (query: string) => void;
}

export function SearchBar({ onSearch, query, onQueryChange }: SearchBarProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      onQueryChange(value);

      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        onSearch(value.trim());
      }, 400);
    },
    [onQueryChange, onSearch]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        onSearch(query.trim());
      }
    },
    [onSearch, query]
  );

  const handleSearchClick = useCallback(() => {
    onSearch(query.trim());
  }, [onSearch, query]);

  const handleClearInput = useCallback(() => {
    onQueryChange('');
    onSearch('');
    inputRef.current?.focus();
  }, [onQueryChange, onSearch]);

  return (
    <div
      id="scraper-controls"
      className="bg-card-bg border-4 border-border rounded-lg p-3 sm:p-4 mb-8 shadow-brutal"
    >
      <div className="flex flex-col sm:flex-row gap-3" id="url-input-wrapper">
        <label htmlFor="media-input" className="sr-only">
          Search media or enter TMDB ID
        </label>
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-fg/40 pointer-events-none" />
          <input
            ref={inputRef}
            id="media-input"
            type="text"
            placeholder="Search thousands of movies, TV shows, or enter TMDB ID..."
            value={query}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            autoComplete="off"
            className="input pl-12 pr-10"
          />
          {query && (
            <button
              onClick={handleClearInput}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-fg/10 text-fg hover:bg-primary hover:text-fg flex items-center justify-center transition-all duration-fast"
              aria-label="Clear input"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <button
          id="search-media-btn"
          onClick={handleSearchClick}
          className="btn btn-primary whitespace-nowrap px-6"
          title="Search media"
        >
          <Search className="w-4 h-4" />
          Search
        </button>
      </div>
    </div>
  );
}
