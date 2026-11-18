import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createStorage } from '../lib/storage';

// Create a mock localStorage that works for all tests
const mockLocalStorageMap = new Map<string, string>();

const mockLocalStorage = {
  getItem: vi.fn((key: string) => mockLocalStorageMap.get(key) ?? null),
  setItem: vi.fn((key: string, value: string) => mockLocalStorageMap.set(key, value)),
  removeItem: vi.fn((key: string) => mockLocalStorageMap.delete(key)),
  clear: vi.fn(() => mockLocalStorageMap.clear()),
  _map: mockLocalStorageMap,
};

// Mock localStorage globally
vi.stubGlobal('localStorage', mockLocalStorage);

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});



// Mock fetch globally
global.fetch = vi.fn();

// Mock console.warn to reduce noise in tests
const originalWarn = console.warn;
console.warn = vi.fn();

afterAll(() => {
  console.warn = originalWarn;
});

describe('Storage Utilities - createStorage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage._map.clear();
  });

  it('should return default value when key does not exist', () => {
    const storage = createStorage('test-key', { defaultValue: 'default' });
    expect(storage.get()).toBe('default');
  });

  it('should store and retrieve values', () => {
    const storage = createStorage('test-key', { defaultValue: 'default' });
    storage.set('custom value');
    expect(storage.get()).toBe('custom value');
    expect(localStorage.setItem).toHaveBeenCalledWith('test-key', '"custom value"');
  });

  it('should use custom serializer and deserializer', () => {
    const storage = createStorage('test-key', {
      defaultValue: { count: 0 },
      serialize: v => `custom:${v.count}`,
      deserialize: v => ({ count: parseInt(v.split(':')[1], 10) }),
    });

    storage.set({ count: 42 });
    expect(localStorage.setItem).toHaveBeenCalledWith('test-key', 'custom:42');
    expect(storage.get()).toEqual({ count: 42 });
  });

  it('should handle parse errors gracefully', () => {
    localStorage.getItem.mockReturnValue('invalid json');
    const storage = createStorage('test-key', { defaultValue: 'fallback' });
    expect(storage.get()).toBe('fallback');
    expect(console.warn).toHaveBeenCalled();
  });

  it('should remove key', () => {
    const storage = createStorage('test-key', { defaultValue: 'default' });
    storage.set('value');
    storage.remove();
    expect(localStorage.removeItem).toHaveBeenCalledWith('test-key');
    expect(storage.get()).toBe('default');
  });
});
