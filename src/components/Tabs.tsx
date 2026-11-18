interface TabsProps {
  activeTab: 'home' | 'watchlist';
  onTabChange: (tab: 'home' | 'watchlist') => void;
  watchlistCount: number;
}

export function Tabs({ activeTab, onTabChange, watchlistCount }: TabsProps) {
  return (
    <nav
      className="tabs flex items-center gap-3 border-b-4 border-border pb-4 mb-8"
      role="tablist"
      aria-label="Main navigation"
    >
      <button
        id="tab-home"
        role="tab"
        onClick={() => onTabChange('home')}
        className={`tab-btn px-5 py-2.5 font-heading font-bold text-body-sm border-3 rounded-md transition-all duration-fast ease-snappy shadow-brutal-sm hover:shadow-brutal active:shadow-brutal-pressed active:translate-x-0.5 active:translate-y-0.5 ${
          activeTab === 'home'
            ? 'bg-primary text-fg border-border'
            : 'bg-card-bg text-fg/70 border-border hover:bg-fg/10'
        }`}
        aria-selected={activeTab === 'home'}
        aria-controls="panel-home"
        tabIndex={activeTab === 'home' ? 0 : -1}
      >
        Browse Catalog
      </button>
      <button
        id="tab-watchlist"
        role="tab"
        onClick={() => onTabChange('watchlist')}
        className={`tab-btn px-5 py-2.5 font-heading font-bold text-body-sm border-3 rounded-md transition-all duration-fast ease-snappy shadow-brutal-sm hover:shadow-brutal active:shadow-brutal-pressed active:translate-x-0.5 active:translate-y-0.5 ${
          activeTab === 'watchlist'
            ? 'bg-primary text-fg border-border'
            : 'bg-card-bg text-fg/70 border-border hover:bg-fg/10'
        }`}
        aria-selected={activeTab === 'watchlist'}
        aria-controls="panel-watchlist"
        tabIndex={activeTab === 'watchlist' ? 0 : -1}
      >
        My Watchlist (<span id="watchlist-count">{watchlistCount}</span>)
      </button>
    </nav>
  );
}
