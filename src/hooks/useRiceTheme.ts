import { useState, useEffect } from 'react';

export type ThemeId =
  | 'mocha'
  | 'tokyo'
  | 'gruvbox'
  | 'solarized'
  | 'nord'
  | 'everforest'
  | 'rose-pine'
  | 'dracula'
  | 'kanagawa'
  | 'cyberpunk'
  | 'doom-one'
  | 'ayu'
  | 'one-dark'
  | 'github-dark'
  | 'frappe';

export interface ThemeOption {
  id: ThemeId;
  name: string;
  badge: string;
  accentPrimary: string;
  accentHighlight: string;
  bgCrust: string;
}

export const THEMES: ThemeOption[] = [
  {
    id: 'mocha',
    name: 'Catppuccin Mocha',
    badge: 'Mocha',
    accentPrimary: '#89B4FA',
    accentHighlight: '#CBA6F7',
    bgCrust: '#11111B',
  },
  {
    id: 'tokyo',
    name: 'Tokyo Night',
    badge: 'Tokyo',
    accentPrimary: '#7aa2f7',
    accentHighlight: '#bb9af7',
    bgCrust: '#1a1b26',
  },
  {
    id: 'gruvbox',
    name: 'Gruvbox Dark',
    badge: 'Gruvbox',
    accentPrimary: '#fabd2f',
    accentHighlight: '#b8bb26',
    bgCrust: '#1d2021',
  },
  {
    id: 'solarized',
    name: 'Solarized Dark',
    badge: 'Solarized',
    accentPrimary: '#268bd2',
    accentHighlight: '#b58900',
    bgCrust: '#002b36',
  },
  {
    id: 'nord',
    name: 'Nord',
    badge: 'Nord',
    accentPrimary: '#88c0d0',
    accentHighlight: '#81a1c1',
    bgCrust: '#2e3440',
  },
  {
    id: 'everforest',
    name: 'Everforest',
    badge: 'Everforest',
    accentPrimary: '#a7c080',
    accentHighlight: '#dbbc7f',
    bgCrust: '#2d353b',
  },
  {
    id: 'rose-pine',
    name: 'Rosé Pine',
    badge: 'Rosé Pine',
    accentPrimary: '#ebbcba',
    accentHighlight: '#9ccfd8',
    bgCrust: '#191724',
  },
  {
    id: 'dracula',
    name: 'Dracula',
    badge: 'Dracula',
    accentPrimary: '#BD93F9',
    accentHighlight: '#FF79C6',
    bgCrust: '#191A21',
  },
  {
    id: 'kanagawa',
    name: 'Kanagawa',
    badge: 'Kanagawa',
    accentPrimary: '#7e9cd8',
    accentHighlight: '#ffa066',
    bgCrust: '#1f1f28',
  },
  {
    id: 'cyberpunk',
    name: 'Cyberpunk',
    badge: 'Cyberpunk',
    accentPrimary: '#ff007f',
    accentHighlight: '#ffe600',
    bgCrust: '#0a0a0f',
  },
  {
    id: 'doom-one',
    name: 'Doom One',
    badge: 'Doom One',
    accentPrimary: '#61afef',
    accentHighlight: '#c678dd',
    bgCrust: '#21242b',
  },
  {
    id: 'ayu',
    name: 'Ayu Dark',
    badge: 'Ayu',
    accentPrimary: '#ffcc66',
    accentHighlight: '#39bae6',
    bgCrust: '#0b0e14',
  },
  {
    id: 'one-dark',
    name: 'One Dark',
    badge: 'One Dark',
    accentPrimary: '#569cd6',
    accentHighlight: '#c586c0',
    bgCrust: '#1e1e1e',
  },
  {
    id: 'github-dark',
    name: 'GitHub Dark',
    badge: 'GitHub',
    accentPrimary: '#58a6ff',
    accentHighlight: '#bc8cff',
    bgCrust: '#0d1117',
  },
  {
    id: 'frappe',
    name: 'Catppuccin Frappé',
    badge: 'Frappé',
    accentPrimary: '#8caaee',
    accentHighlight: '#ca9ee6',
    bgCrust: '#232634',
  },
];

export function useRiceTheme() {
  const [theme, setThemeState] = useState<ThemeId>(() => {
    try {
      const saved = localStorage.getItem('aether_theme') as ThemeId;
      if (saved && THEMES.some(t => t.id === saved)) {
        return saved;
      }
    } catch {}
    return 'mocha';
  });

  const setTheme = (newTheme: ThemeId) => {
    setThemeState(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    try {
      localStorage.setItem('aether_theme', newTheme);
    } catch (e) {
      console.warn('Failed to save theme to localStorage:', e);
    }
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try {
      localStorage.setItem('aether_theme', theme);
    } catch {}
  }, [theme]);

  return {
    theme,
    setTheme,
    themes: THEMES,
  };
}
