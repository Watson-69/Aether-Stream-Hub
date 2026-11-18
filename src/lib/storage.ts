// Centralized localStorage utility for type-safe storage operations

export interface StorageOptions<T> {
  /** Default value if key doesn't exist or parsing fails */
  defaultValue: T;
  /** Custom serializer (default: JSON.stringify) */
  serialize?: (value: T) => string;
  /** Custom deserializer (default: JSON.parse) */
  deserialize?: (value: string) => T;
}

/**
 * Creates a type-safe localStorage getter/setter for a specific key
 */
export function createStorage<T>(key: string, options: StorageOptions<T>) {
  const { defaultValue, serialize = JSON.stringify, deserialize = JSON.parse } = options;

  const storage = {
    get(): T {
      try {
        const item = globalThis.localStorage.getItem(key);
        if (item === null) return defaultValue;
        return deserialize(item);
      } catch (error) {
        console.warn(`Failed to read ${key} from localStorage:`, error);
        return defaultValue;
      }
    },

    set(value: T): void {
      try {
        globalThis.localStorage.setItem(key, serialize(value));
      } catch (error) {
        console.warn(`Failed to write ${key} to localStorage:`, error);
      }
    },

    remove(): void {
      try {
        globalThis.localStorage.removeItem(key);
      } catch (error) {
        console.warn(`Failed to remove ${key} from localStorage:`, error);
      }
    },

    clear(): void {
      storage.remove();
    },
  };

  return storage;
}

// ==========================================
// Pre-defined storage keys for the app
// ==========================================

export const STORAGE_KEYS = {
  WATCHLIST: 'aether_saved_watchlist',
  STREAM_LOGS: 'aether-stream-logs',
  THEME: 'aether_theme',
  COLOR_SCHEME: 'aether-theme',
} as const;

import type { MediaItem } from './types';
import type { StreamLogEntry } from './types';

// Lazy storage getters - created on first access to allow mocking in tests
let _watchlistStorage: ReturnType<typeof createStorage<MediaItem[]>> | null = null;
let _streamLogsStorage: ReturnType<typeof createStorage<StreamLogEntry[]>> | null = null;
let _themeStorage: ReturnType<typeof createStorage<string>> | null = null;
let _colorSchemeStorage: ReturnType<typeof createStorage<'light' | 'dark'>> | null = null;

export const watchlistStorage = {
  get(): MediaItem[] {
    return (_watchlistStorage ??= createStorage<MediaItem[]>(STORAGE_KEYS.WATCHLIST, {
      defaultValue: [],
    })).get();
  },
  set(value: MediaItem[]): void {
    return (_watchlistStorage ??= createStorage<MediaItem[]>(STORAGE_KEYS.WATCHLIST, {
      defaultValue: [],
    })).set(value);
  },
  remove(): void {
    return (_watchlistStorage ??= createStorage<MediaItem[]>(STORAGE_KEYS.WATCHLIST, {
      defaultValue: [],
    })).remove();
  },
  clear(): void {
    return (_watchlistStorage ??= createStorage<MediaItem[]>(STORAGE_KEYS.WATCHLIST, {
      defaultValue: [],
    })).clear();
  },
};

export const streamLogsStorage = {
  get(): StreamLogEntry[] {
    return (_streamLogsStorage ??= createStorage<StreamLogEntry[]>(STORAGE_KEYS.STREAM_LOGS, {
      defaultValue: [],
    })).get();
  },
  set(value: StreamLogEntry[]): void {
    return (_streamLogsStorage ??= createStorage<StreamLogEntry[]>(STORAGE_KEYS.STREAM_LOGS, {
      defaultValue: [],
    })).set(value);
  },
  remove(): void {
    return (_streamLogsStorage ??= createStorage<StreamLogEntry[]>(STORAGE_KEYS.STREAM_LOGS, {
      defaultValue: [],
    })).remove();
  },
  clear(): void {
    return (_streamLogsStorage ??= createStorage<StreamLogEntry[]>(STORAGE_KEYS.STREAM_LOGS, {
      defaultValue: [],
    })).clear();
  },
};

export const themeStorage = {
  get(): string {
    return (_themeStorage ??= createStorage<string>(STORAGE_KEYS.THEME, {
      defaultValue: 'mocha',
    })).get();
  },
  set(value: string): void {
    return (_themeStorage ??= createStorage<string>(STORAGE_KEYS.THEME, {
      defaultValue: 'mocha',
    })).set(value);
  },
  remove(): void {
    return (_themeStorage ??= createStorage<string>(STORAGE_KEYS.THEME, {
      defaultValue: 'mocha',
    })).remove();
  },
  clear(): void {
    return (_themeStorage ??= createStorage<string>(STORAGE_KEYS.THEME, {
      defaultValue: 'mocha',
    })).clear();
  },
};

export const colorSchemeStorage = {
  get(): 'light' | 'dark' {
    return (_colorSchemeStorage ??= createStorage<'light' | 'dark'>(STORAGE_KEYS.COLOR_SCHEME, {
      defaultValue: 'dark',
    })).get();
  },
  set(value: 'light' | 'dark'): void {
    return (_colorSchemeStorage ??= createStorage<'light' | 'dark'>(STORAGE_KEYS.COLOR_SCHEME, {
      defaultValue: 'dark',
    })).set(value);
  },
  remove(): void {
    return (_colorSchemeStorage ??= createStorage<'light' | 'dark'>(STORAGE_KEYS.COLOR_SCHEME, {
      defaultValue: 'dark',
    })).remove();
  },
  clear(): void {
    return (_colorSchemeStorage ??= createStorage<'light' | 'dark'>(STORAGE_KEYS.COLOR_SCHEME, {
      defaultValue: 'dark',
    })).clear();
  },
};
