export function LoadingOverlay({ isVisible }: { isVisible: boolean }) {
  if (!isVisible) return null;

  return (
    <div
      id="loading-overlay"
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#11111B]/95 backdrop-blur-md gap-4 font-mono text-[#CDD6F4]"
      role="status"
      aria-live="polite"
    >
      <div className="w-10 h-10 border-2 border-[#89B4FA]/20 border-t-[#89B4FA] rounded-full animate-spin" />
      <div className="text-center">
        <p className="text-xs font-bold text-[#89B4FA] mb-1">
          aether // hyprland session initializing
        </p>
        <p className="text-[11px] text-[#A6ADC8]">Querying TMDB live stream index...</p>
      </div>
    </div>
  );
}
