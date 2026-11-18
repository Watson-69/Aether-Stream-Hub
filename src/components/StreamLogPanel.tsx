import { Terminal, Trash2, X, ArrowRight } from 'lucide-react';
import type { MediaItem } from '../lib/types';

export interface StreamLogEntry {
  id: string;
  timestamp: string;
  type: 'connect' | 'server' | 'watchlist' | 'episode';
  tag: string;
  message: string;
  media: MediaItem;
  serverIndex?: number;
  season?: number;
  episode?: number;
}

interface StreamLogPanelProps {
  isOpen: boolean;
  onClose: () => void;
  logs: StreamLogEntry[];
  onClearLogs: () => void;
  onResumeMedia: (
    media: MediaItem,
    season?: number,
    episode?: number,
    serverIndex?: number
  ) => void;
}

export function StreamLogPanel({
  isOpen,
  onClose,
  logs,
  onClearLogs,
  onResumeMedia,
}: StreamLogPanelProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-40 px-3 sm:px-6 pb-3 animate-slide-in pointer-events-none"
      role="region"
      aria-label="Stream Activity Log"
    >
      <div className="max-w-7xl mx-auto bg-mantle border border-border rounded-xl shadow-2xl overflow-hidden font-mono text-fg pointer-events-auto">
        {/* Terminal Header */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-crust border-b border-border text-xs">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 opacity-80">
              <span className="w-2.5 h-2.5 rounded-full bg-red" />
              <span className="w-2.5 h-2.5 rounded-full bg-accent" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald" />
            </div>
            <div className="flex items-center gap-1.5 font-bold text-primary">
              <Terminal className="w-3.5 h-3.5" />
              <span>~/var/log/stream.log</span>
            </div>
            <span className="text-[10px] text-subtext/70 hidden sm:inline">
              [{logs.length} logged events]
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClearLogs}
              className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] bg-card hover:bg-mantle text-subtext hover:text-red border border-border transition-colors"
              title="Clear activity log"
            >
              <Trash2 className="w-3 h-3" />
              <span className="hidden sm:inline">clear</span>
            </button>
            <button
              onClick={onClose}
              className="w-5 h-5 rounded hover:bg-card text-subtext hover:text-fg flex items-center justify-center transition-colors"
              title="Close Log Panel"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Log Lines Output Window */}
        <div className="max-h-56 overflow-y-auto p-3 space-y-1 bg-crust text-xs divide-y divide-border/20">
          {logs.length === 0 ? (
            <div className="text-subtext/60 text-[11px] py-4 text-center">
              <span>
                [00:00:00] DAEMON_INIT :: Stream activity logging daemon active. No stream events
                recorded yet.
              </span>
            </div>
          ) : (
            logs.map(log => {
              const tagColor =
                log.type === 'connect'
                  ? 'text-emerald bg-emerald/10 border-emerald/30'
                  : log.type === 'server'
                    ? 'text-primary bg-primary/10 border-primary/30'
                    : log.type === 'watchlist'
                      ? 'text-secondary bg-secondary/10 border-secondary/30'
                      : 'text-accent bg-accent/10 border-accent/30';

              return (
                <div
                  key={log.id}
                  onClick={() => onResumeMedia(log.media, log.season, log.episode, log.serverIndex)}
                  className="flex items-center justify-between gap-3 p-1.5 rounded hover:bg-mantle cursor-pointer transition-colors group"
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <span className="text-[11px] text-subtext/60 flex-shrink-0">
                      [{log.timestamp}]
                    </span>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.2 rounded border uppercase flex-shrink-0 ${tagColor}`}
                    >
                      {log.tag}
                    </span>
                    <span className="truncate text-fg group-hover:text-primary font-sans text-xs">
                      {log.message}
                    </span>
                  </div>

                  <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-[11px] text-primary">
                    <span>resume</span>
                    <ArrowRight className="w-3 h-3" />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Hint */}
        <div className="px-4 py-1.5 bg-mantle border-t border-border flex items-center justify-between text-[10px] text-subtext/70">
          <span>Click any line above to immediately resume playback.</span>
          <span className="hidden sm:inline">Persisted to localStorage</span>
        </div>
      </div>
    </div>
  );
}
