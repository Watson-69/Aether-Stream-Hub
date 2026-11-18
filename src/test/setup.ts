import { vi } from 'vitest';

// Enable act environment for React 18 testing
// @ts-ignore
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

// Mock localStorage with actual storage
const storageMap = new Map<string, string>();

const localStorageMock = {
  getItem: vi.fn((key: string) => storageMap.get(key) ?? null),
  setItem: vi.fn((key: string, value: string) => storageMap.set(key, value)),
  removeItem: vi.fn((key: string) => storageMap.delete(key)),
  clear: vi.fn(() => storageMap.clear()),
};

Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

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
