/**
 * ============================================================================
 * PRELOADER CONFIGURATION & USAGE
 * ============================================================================
 *
 * Timings:
 * - MIN_DISPLAY_TIME_MS (default: 600ms):
 *   The minimum time the preloader remains visible on screen before fading out.
 *   Prevents brief visual flashes when catalogue data loads quickly.
 *
 * - TIMEOUT_DURATION_MS (default: 8000ms / 8s):
 *   Duration before replacing the loading spinner with the message:
 *   "Still loading. Check your connection and try again," along with a Retry button.
 *
 * - FADE_OUT_DURATION_MS (default: 300ms):
 *   Duration of the opacity fade-out animation before the component is completely
 *   removed from the DOM.
 *
 * - CSS_FALLBACK_TIMEOUT (default: 10s in index.html):
 *   Fallback in index.html ensuring the initial HTML preloader automatically
 *   fades out and unblocks user interaction even if JavaScript fails to load.
 *
 * Imperative API:
 *   import { PreLoader, preloader } from './components/PreLoader';
 *   preloader.show()            - Force display the preloader
 *   preloader.hide()            - Force hide and fade out the preloader
 *   preloader.onReady(callback) - Register callback fired once content is ready
 * ============================================================================
 */

/* eslint-disable react-refresh/only-export-components */
import { useState, useEffect, useRef, useCallback } from 'react';

export const PRELOADER_CONFIG = {
  MIN_DISPLAY_TIME_MS: 600,
  TIMEOUT_DURATION_MS: 8000,
  FADE_OUT_DURATION_MS: 300,
};

type ReadyCallback = () => void;

class PreloaderController {
  private readyListeners: Set<ReadyCallback> = new Set();
  private showListeners: Set<() => void> = new Set();
  private hideListeners: Set<() => void> = new Set();
  private isContentReady: boolean = false;

  show(): void {
    this.showListeners.forEach(fn => fn());
  }

  hide(): void {
    this.hideListeners.forEach(fn => fn());
  }

  onReady(callback: ReadyCallback): () => void {
    if (this.isContentReady) {
      callback();
      return () => {};
    }
    this.readyListeners.add(callback);
    return () => {
      this.readyListeners.delete(callback);
    };
  }

  _notifyReady(): void {
    this.isContentReady = true;
    this.readyListeners.forEach(fn => {
      try {
        fn();
      } catch (err) {
        console.error('Error in preloader onReady listener:', err);
      }
    });
    this.readyListeners.clear();
  }

  _subscribe(onShow: () => void, onHide: () => void): () => void {
    this.showListeners.add(onShow);
    this.hideListeners.add(onHide);
    return () => {
      this.showListeners.delete(onShow);
      this.hideListeners.delete(onHide);
    };
  }

  _reset(): void {
    this.isContentReady = false;
    this.readyListeners.clear();
  }
}

export const preloader = new PreloaderController();

if (typeof window !== 'undefined') {
  (window as unknown as { preloader: PreloaderController }).preloader = preloader;
}

export interface PreLoaderProps {
  /** True when initial catalogue data (trending and popular rows) is loaded */
  isReady?: boolean;
  /** True when catalogue data fails to load */
  hasError?: boolean;
  /** Action called when clicking the Retry button */
  onRetry?: () => void;
  /** Callback fired once content is ready and preloader starts fading out */
  onReady?: () => void;
  /** Minimum display time in ms (default: 600ms) */
  minDisplayTime?: number;
  /** Timeout in ms before connection warning (default: 8000ms) */
  timeoutDuration?: number;
}

export function PreLoader({
  isReady = false,
  hasError = false,
  onRetry,
  onReady,
  minDisplayTime = PRELOADER_CONFIG.MIN_DISPLAY_TIME_MS,
  timeoutDuration = PRELOADER_CONFIG.TIMEOUT_DURATION_MS,
}: PreLoaderProps) {
  const [phase, setPhase] = useState<'loading' | 'timeout' | 'error'>('loading');
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [isUnmounted, setIsUnmounted] = useState(false);

  const mountTimeRef = useRef<number>(Date.now());
  const timeoutTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const readyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fadeOutTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasTriggeredReadyRef = useRef<boolean>(false);

  // Clean up any initial raw HTML preloader present in index.html upon React hydration
  useEffect(() => {
    const rawFallback = document.getElementById('initial-page-preloader');
    if (rawFallback) {
      rawFallback.remove();
    }
  }, []);

  // Subscribe to imperative API (show / hide)
  useEffect(() => {
    const unsubscribe = preloader._subscribe(
      () => {
        setIsUnmounted(false);
        setIsFadingOut(false);
        hasTriggeredReadyRef.current = false;
        mountTimeRef.current = Date.now();
        setPhase('loading');
      },
      () => {
        if (!hasTriggeredReadyRef.current) {
          hasTriggeredReadyRef.current = true;
          if (timeoutTimerRef.current) clearTimeout(timeoutTimerRef.current);
          if (readyTimerRef.current) clearTimeout(readyTimerRef.current);
          onReady?.();
          preloader._notifyReady();
          setIsFadingOut(true);
          fadeOutTimerRef.current = setTimeout(() => {
            setIsUnmounted(true);
          }, PRELOADER_CONFIG.FADE_OUT_DURATION_MS);
        }
      }
    );

    return () => {
      unsubscribe();
    };
  }, [onReady]);

  // Handle 8-second slow connection timeout
  useEffect(() => {
    if (phase === 'loading' && !hasError && !isReady) {
      timeoutTimerRef.current = setTimeout(() => {
        setPhase('timeout');
      }, timeoutDuration);
    }

    return () => {
      if (timeoutTimerRef.current) {
        clearTimeout(timeoutTimerRef.current);
      }
    };
  }, [phase, hasError, isReady, timeoutDuration]);

  // Handle data load failure
  useEffect(() => {
    if (hasError && phase !== 'error') {
      if (timeoutTimerRef.current) clearTimeout(timeoutTimerRef.current);
      if (readyTimerRef.current) clearTimeout(readyTimerRef.current);
      setPhase('error');
    }
  }, [hasError, phase]);

  // Handle successful data loading with minimum 600ms display time and 300ms fade-out
  useEffect(() => {
    if (isReady && !hasError && !hasTriggeredReadyRef.current && phase !== 'error') {
      hasTriggeredReadyRef.current = true;
      if (timeoutTimerRef.current) clearTimeout(timeoutTimerRef.current);

      const elapsed = Date.now() - mountTimeRef.current;
      const delay = Math.max(0, minDisplayTime - elapsed);
      // console.log('isReady triggered, elapsed:', elapsed, 'delay:', delay);

      readyTimerRef.current = setTimeout(() => {
        onReady?.();
        preloader._notifyReady();

        setIsFadingOut(true);

        fadeOutTimerRef.current = setTimeout(() => {
          setIsUnmounted(true);
        }, PRELOADER_CONFIG.FADE_OUT_DURATION_MS);
      }, delay);
    }
  }, [isReady, hasError, minDisplayTime, phase, onReady]);

  const handleRetryClick = useCallback(() => {
    if (timeoutTimerRef.current) clearTimeout(timeoutTimerRef.current);
    if (readyTimerRef.current) clearTimeout(readyTimerRef.current);
    if (fadeOutTimerRef.current) clearTimeout(fadeOutTimerRef.current);

    hasTriggeredReadyRef.current = false;
    mountTimeRef.current = Date.now();
    setPhase('loading');

    onRetry?.();
  }, [onRetry]);

  if (isUnmounted) {
    return null;
  }

  return (
    <div
      id="aether-preloader"
      className={`fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-[#FFF8EC] text-[#1E1E2E] font-sans transition-opacity duration-300 ease-out select-none ${
        isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100 pointer-events-auto'
      }`}
      role="status"
      aria-live="polite"
    >
      {/* Visually hidden accessibility label */}
      <span className="sr-only">Loading content</span>

      <div className="flex flex-col items-center max-w-sm px-6 text-center">
        {/* Centred Brand Logo */}
        <div className="flex flex-col items-center mb-6">
          <div className="flex items-center gap-2 mb-1.5" aria-hidden="true">
            <span className="w-2.5 h-2.5 rounded-full bg-[#C0392B]" />
            <span className="text-xs uppercase tracking-widest font-mono text-[#8C7A6B] font-semibold">
              Aether // Stream
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1E1E2E] tracking-tight font-sans">
            Aether Stream Hub
          </h1>
        </div>

        {/* Phase 1: Active Loading Spinner & Pulsing Bar */}
        {phase === 'loading' && (
          <div className="flex flex-col items-center gap-4">
            {/* Red Spinner (< 1.5s per loop, 1.2s subtle spin) */}
            <div
              className="preloader-spinner w-8 h-8 rounded-full border-2 border-[#C0392B]/20 border-t-[#C0392B] animate-spin"
              style={{ animationDuration: '1.2s' }}
              aria-hidden="true"
            />

            {/* Subtle Pulsing Progress Indicator */}
            <div
              className="w-32 h-1 bg-[#C0392B]/15 rounded-full overflow-hidden relative"
              aria-hidden="true"
            >
              <div className="preloader-pulsing-bar absolute inset-y-0 w-1/2 bg-[#C0392B] rounded-full" />
            </div>

            <p className="text-xs text-[#7F8C8D] font-medium tracking-wide">
              Loading titles...
            </p>
          </div>
        )}

        {/* Phase 2: Timeout Warning (> 8 seconds) */}
        {phase === 'timeout' && (
          <div className="flex flex-col items-center gap-3 animate-fade-in">
            <div
              className="w-10 h-10 rounded-full bg-[#C0392B]/10 flex items-center justify-center text-[#C0392B]"
              aria-hidden="true"
            >
              <svg
                className="w-5 h-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </div>
            <p className="text-sm text-[#2C3E50] font-medium leading-relaxed">
              Still loading. Check your connection and try again,
            </p>
            <button
              type="button"
              onClick={handleRetryClick}
              className="mt-2 px-5 py-2 rounded-lg bg-[#C0392B] text-white text-xs font-bold tracking-wider uppercase transition-all duration-150 hover:bg-[#A93226] active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C0392B] focus-visible:ring-offset-2 focus-visible:ring-offset-[#FFF8EC] shadow-sm cursor-pointer"
            >
              Retry
            </button>
          </div>
        )}

        {/* Phase 3: Error Loading Failure */}
        {phase === 'error' && (
          <div className="flex flex-col items-center gap-3 animate-fade-in">
            <div
              className="w-10 h-10 rounded-full bg-[#C0392B]/10 flex items-center justify-center text-[#C0392B]"
              aria-hidden="true"
            >
              <svg
                className="w-5 h-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <p className="text-sm text-[#2C3E50] font-medium leading-relaxed">
              We couldn&apos;t load titles right now.
            </p>
            <button
              type="button"
              onClick={handleRetryClick}
              className="mt-2 px-5 py-2 rounded-lg bg-[#C0392B] text-white text-xs font-bold tracking-wider uppercase transition-all duration-150 hover:bg-[#A93226] active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C0392B] focus-visible:ring-offset-2 focus-visible:ring-offset-[#FFF8EC] shadow-sm cursor-pointer"
            >
              Retry
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// Attach static imperative methods for convenience
PreLoader.show = () => preloader.show();
PreLoader.hide = () => preloader.hide();
PreLoader.onReady = (callback: ReadyCallback) => preloader.onReady(callback);
