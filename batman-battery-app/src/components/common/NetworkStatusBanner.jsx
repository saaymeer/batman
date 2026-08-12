import { useState, useEffect } from 'react';
import { WifiOff, RefreshCw, CheckCircle2 } from 'lucide-react';
import { subscribeToOfflineQueue } from '@/services/offlineQueue';

export default function NetworkStatusBanner() {
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [queuedItems, setQueuedItems] = useState([]);
  const [syncing, setSyncing] = useState(false);
  const [justSynced, setJustSynced] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setSyncing(true);
      setTimeout(() => setSyncing(false), 2500);
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const unsubQueue = subscribeToOfflineQueue((queue) => {
      setQueuedItems(queue);
    });

    const handleSynced = () => {
      setJustSynced(true);
      setTimeout(() => setJustSynced(false), 4000);
    };
    window.addEventListener('batman_offline_synced', handleSynced);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('batman_offline_synced', handleSynced);
      unsubQueue();
    };
  }, []);

  if (isOnline && queuedItems.length === 0 && !justSynced && !syncing) {
    return null;
  }

  return (
    <aside aria-label="Network Status Alert" className="w-full bg-signal/15 border-b border-signal/30 text-mist text-xs px-4 py-2 flex items-center justify-between z-50 animate-fade-in backdrop-blur-md">
      <div className="flex items-center gap-2 max-w-7xl mx-auto w-full justify-between">
        <div className="flex items-center gap-2">
          {!isOnline ? (
            <>
              <WifiOff className="h-4 w-4 text-alert animate-pulse" />
              <span className="font-semibold text-alert font-display">Offline Mode:</span>
              <span>
                Weak signal detected. Emergency requests will be saved offline and synced automatically.
              </span>
            </>
          ) : syncing ? (
            <>
              <RefreshCw className="h-4 w-4 text-signal animate-spin" />
              <span className="font-semibold text-signal font-display">Connection Restored:</span>
              <span>Syncing pending offline dispatches...</span>
            </>
          ) : justSynced ? (
            <>
              <CheckCircle2 className="h-4 w-4 text-go" />
              <span className="font-semibold text-go font-display">Synced:</span>
              <span>Offline request successfully submitted to dispatch team!</span>
            </>
          ) : null}
        </div>

        {queuedItems.length > 0 && (
          <div className="px-2 py-0.5 rounded bg-signal/20 font-mono text-[11px] text-signal font-bold border border-signal/30">
            {queuedItems.length} queued
          </div>
        )}
      </div>
    </aside>
  );
}
