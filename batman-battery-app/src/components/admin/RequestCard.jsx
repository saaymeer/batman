import { timeAgo } from '@/utils/formatTime';
import { ISSUE_TYPES, STATUS_CONFIG } from '@/utils/statusConfig';
import StatusBadge from '@/components/common/StatusBadge';
import { Zap, Battery, HelpCircle, Clock } from 'lucide-react';

const ISSUE_ICONS = {
  jumpstart: <Zap className="h-3.5 w-3.5" />,
  replacement: <Battery className="h-3.5 w-3.5" />,
  unsure: <HelpCircle className="h-3.5 w-3.5" />,
};

/**
 * RequestCard — single row in the admin request list.
 * @param {{ request: object, selected: boolean, onSelect: () => void }} props
 */
export default function RequestCard({ request, selected, onSelect }) {
  const issueCfg = ISSUE_TYPES[request.issueType];

  return (
    <button
      type="button"
      onClick={onSelect}
      className={[
        'w-full text-left px-4 py-3.5 flex flex-col gap-2 transition-all duration-150',
        'border-l-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal focus-visible:ring-inset',
        'hover:bg-white/3',
        selected
          ? 'border-signal bg-signal/8'
          : 'border-transparent',
      ].join(' ')}
    >
      {/* Top row: name + status */}
      <div className="flex items-center justify-between gap-2">
        <p className="text-mist font-semibold font-display text-sm leading-tight truncate">
          {request.customerName}
        </p>
        <StatusBadge status={request.status} className="flex-shrink-0 text-[10px]" />
      </div>

      {/* Middle: vehicle + issue */}
      <div className="flex items-center gap-2 text-fog text-xs">
        <span className="flex items-center gap-1">
          {ISSUE_ICONS[request.issueType]}
          <span>{issueCfg?.label ?? request.issueType}</span>
        </span>
        {request.vehicle?.make && (
          <>
            <span className="text-white/20">·</span>
            <span className="truncate">
              {request.vehicle.make} {request.vehicle.model}
            </span>
          </>
        )}
      </div>

      {/* Bottom: time + technician */}
      <div className="flex items-center gap-2 text-[11px] text-fog/70">
        <Clock className="h-3 w-3 flex-shrink-0" />
        <span>{timeAgo(request.createdAt)}</span>
        {request.assignedTechnician && (
          <>
            <span className="text-white/20">·</span>
            <span className="text-signal truncate">{request.assignedTechnician}</span>
          </>
        )}
      </div>
    </button>
  );
}
