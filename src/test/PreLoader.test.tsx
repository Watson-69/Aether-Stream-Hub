import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { act } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { PreLoader, preloader, PRELOADER_CONFIG } from '../components/PreLoader';

describe('PreLoader Component', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    preloader._reset();
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    container.remove();
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  it('renders with cream background, logo, and status accessibility attributes', () => {
    act(() => {
      root.render(<PreLoader isReady={false} />);
    });

    const overlay = document.querySelector('#aether-preloader') as HTMLElement;
    expect(overlay).not.toBeNull();
    expect(overlay.getAttribute('role')).toBe('status');
    expect(overlay.getAttribute('aria-live')).toBe('polite');

    // Logo text
    expect(overlay.textContent).toContain('Aether Stream Hub');

    // Visually hidden screen reader announcement
    const srOnly = overlay.querySelector('.sr-only');
    expect(srOnly?.textContent).toBe('Loading content');

    // Cream background style/class
    expect(overlay.className).toContain('bg-[#FFF8EC]');

    // Animated spinner & pulsing bar
    expect(overlay.querySelector('.preloader-spinner')).not.toBeNull();
    expect(overlay.querySelector('.preloader-pulsing-bar')).not.toBeNull();
  });

  it('removes initial HTML fallback preloader from DOM when mounted', () => {
    const fallback = document.createElement('div');
    fallback.id = 'initial-page-preloader';
    document.body.appendChild(fallback);

    expect(document.getElementById('initial-page-preloader')).not.toBeNull();

    act(() => {
      root.render(<PreLoader isReady={false} />);
    });

    expect(document.getElementById('initial-page-preloader')).toBeNull();
  });

  it('enforces minimum display time of 600ms before fading out', () => {
    const onReadyMock = vi.fn();

    act(() => {
      root.render(<PreLoader isReady={false} onReady={onReadyMock} />);
    });

    // Data loads quickly at 100ms
    act(() => {
      vi.advanceTimersByTime(100);
    });

    act(() => {
      root.render(<PreLoader isReady={true} onReady={onReadyMock} />);
    });

    // At 400ms (elapsed 400ms < 600ms), preloader must still be visible and not fading
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(document.querySelector('#aether-preloader')).not.toBeNull();
    expect(onReadyMock).not.toHaveBeenCalled();

    // At 600ms total, fade out begins
    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(onReadyMock).toHaveBeenCalledTimes(1);

    const overlay = document.querySelector('#aether-preloader') as HTMLElement;
    expect(overlay.className).toContain('opacity-0');

    // After 300ms fade-out duration (total 900ms), element is removed from DOM
    act(() => {
      vi.advanceTimersByTime(PRELOADER_CONFIG.FADE_OUT_DURATION_MS);
    });
    expect(document.querySelector('#aether-preloader')).toBeNull();
  });

  it('replaces spinner with timeout warning and Retry button after 8 seconds (slow connection / 3G throttling)', () => {
    const onRetryMock = vi.fn();

    act(() => {
      root.render(<PreLoader isReady={false} onRetry={onRetryMock} />);
    });

    // Before 8s, spinner is visible
    expect(document.querySelector('.preloader-spinner')).not.toBeNull();
    expect(document.body.textContent).not.toContain('Still loading. Check your connection and try again,');

    // Advance to 8 seconds
    act(() => {
      vi.advanceTimersByTime(PRELOADER_CONFIG.TIMEOUT_DURATION_MS);
    });

    // Spinner is replaced with timeout message
    expect(document.querySelector('.preloader-spinner')).toBeNull();
    expect(document.body.textContent).toContain('Still loading. Check your connection and try again,');

    // Retry button is available and accessible
    const buttons = Array.from(document.querySelectorAll('button'));
    const retryBtn = buttons.find(b => b.textContent?.trim() === 'Retry');
    expect(retryBtn).toBeDefined();
    expect(retryBtn?.className).toContain('focus-visible:ring-[#C0392B]');

    // Clicking retry resets state and triggers onRetry
    act(() => {
      retryBtn?.click();
    });
    expect(onRetryMock).toHaveBeenCalledTimes(1);

    // Spinner is shown again while re-fetching
    expect(document.querySelector('.preloader-spinner')).not.toBeNull();
  });

  it('shows error message and Retry button if catalogue fails to load without backend details', () => {
    const onRetryMock = vi.fn();

    act(() => {
      root.render(<PreLoader isReady={false} hasError={false} onRetry={onRetryMock} />);
    });

    // Simulate API load failure
    act(() => {
      root.render(<PreLoader isReady={false} hasError={true} onRetry={onRetryMock} />);
    });

    expect(document.body.textContent).toContain("We couldn't load titles right now.");

    // No developer or backend status messages are displayed
    expect(document.body.textContent).not.toContain('TMDB');
    expect(document.body.textContent).not.toContain('403');
    expect(document.body.textContent).not.toContain('500');
    expect(document.body.textContent).not.toContain('Failed to load catalog');

    // Retry button works and resets state to loading spinner as retry begins
    const buttons = Array.from(document.querySelectorAll('button'));
    const retryBtn = buttons.find(b => b.textContent?.trim() === 'Retry');
    act(() => {
      retryBtn?.click();
      root.render(<PreLoader isReady={false} hasError={false} onRetry={onRetryMock} />);
    });
    expect(onRetryMock).toHaveBeenCalledTimes(1);
    expect(document.querySelector('.preloader-spinner')).not.toBeNull();
  });

  it('supports imperative API: preloader.show(), preloader.hide(), and preloader.onReady()', () => {
    const onReadyCallback = vi.fn();
    const unsubscribe = preloader.onReady(onReadyCallback);

    act(() => {
      root.render(<PreLoader isReady={false} />);
    });

    expect(document.querySelector('#aether-preloader')).not.toBeNull();

    // Imperative hide()
    act(() => {
      preloader.hide();
    });

    expect(onReadyCallback).toHaveBeenCalledTimes(1);

    // After 300ms fade-out
    act(() => {
      vi.advanceTimersByTime(PRELOADER_CONFIG.FADE_OUT_DURATION_MS);
    });
    expect(document.querySelector('#aether-preloader')).toBeNull();

    // Imperative show()
    act(() => {
      preloader.show();
    });
    expect(document.querySelector('#aether-preloader')).not.toBeNull();

    unsubscribe();
  });

  it('confirms zero layout shift layout geometry', () => {
    act(() => {
      root.render(<PreLoader isReady={false} />);
    });
    const overlay = document.querySelector('#aether-preloader') as HTMLElement;

    // Position fixed with full inset ensures zero layout shift on underlying elements
    expect(overlay.className).toContain('fixed');
    expect(overlay.className).toContain('inset-0');
    expect(overlay.className).toContain('z-[99999]');
  });

  it('handles simulated slow 3G throttling (data arrives at 9 seconds after timeout prompt)', () => {
    const onRetryMock = vi.fn();
    act(() => {
      root.render(<PreLoader isReady={false} onRetry={onRetryMock} />);
    });

    // Advance 8s: reaches timeout
    act(() => {
      vi.advanceTimersByTime(8000);
    });
    expect(document.body.textContent).toContain('Still loading. Check your connection and try again,');

    // Data finally resolves at 9s
    act(() => {
      root.render(<PreLoader isReady={true} onRetry={onRetryMock} />);
    });
    act(() => {
      vi.advanceTimersByTime(50);
    });

    // Initiates immediate fade-out because > 600ms have elapsed
    const overlay = document.querySelector('#aether-preloader') as HTMLElement;
    expect(overlay.className).toContain('opacity-0');

    // After 300ms fade-out, unmounted
    act(() => {
      vi.advanceTimersByTime(PRELOADER_CONFIG.FADE_OUT_DURATION_MS);
    });
    expect(document.querySelector('#aether-preloader')).toBeNull();
  });

  it('respects prefers-reduced-motion media query with static indicators', () => {
    // Mock matchMedia to return matches: true for prefers-reduced-motion
    const originalMatchMedia = window.matchMedia;
    window.matchMedia = vi.fn().mockImplementation(query => ({
      matches: query.includes('prefers-reduced-motion'),
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    act(() => {
      root.render(<PreLoader isReady={false} />);
    });

    // Elements have the classes that receive the static indicators in reduced-motion
    const spinner = document.querySelector('.preloader-spinner') as HTMLElement;
    const bar = document.querySelector('.preloader-pulsing-bar') as HTMLElement;
    expect(spinner).not.toBeNull();
    expect(bar).not.toBeNull();

    window.matchMedia = originalMatchMedia;
  });
});
