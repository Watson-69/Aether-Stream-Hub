import { X, AlertCircle } from 'lucide-react';

interface ErrorBannerProps {
  message: string | null;
  onDismiss: () => void;
}

export function ErrorBanner({ message, onDismiss }: ErrorBannerProps) {
  if (!message) return null;

  return (
    <div
      id="error-banner"
      className="flex items-center justify-between gap-3 p-3 bg-[#F38BA8]/10 border border-[#F38BA8]/40 rounded-lg mb-6 font-mono text-xs text-[#F38BA8] animate-fade-in"
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-center gap-2">
        <AlertCircle className="w-4 h-4 text-[#F38BA8] flex-shrink-0" />
        <span>{message}</span>
      </div>
      <button
        onClick={onDismiss}
        className="px-2 py-1 rounded bg-[#F38BA8]/20 hover:bg-[#F38BA8]/30 text-[#F38BA8] transition-colors flex items-center gap-1 text-[11px] font-bold"
      >
        <X className="w-3.5 h-3.5" />
        <span>Dismiss</span>
      </button>
    </div>
  );
}
