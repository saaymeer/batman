import RequestCard from '@/components/admin/RequestCard';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { Inbox } from 'lucide-react';

/**
 * RequestList — scrollable list of active requests, newest first.
 * @param {{
 *   requests: object[],
 *   loading: boolean,
 *   selectedId: string|null,
 *   onSelect: (req: object) => void
 * }} props
 */
export default function RequestList({ requests, loading, selectedId, onSelect }) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="md" />
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-12 px-5 text-center">
        <Inbox className="h-8 w-8 text-fog/40" />
        <p className="text-fog text-sm font-display">No active requests</p>
        <p className="text-fog/50 text-xs">New requests will appear here automatically.</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-white/5">
      {requests.map((req) => (
        <RequestCard
          key={req.id}
          request={req}
          selected={selectedId === req.id}
          onSelect={() => onSelect(req)}
        />
      ))}
    </div>
  );
}
