import { STATUS_CONFIG } from '@/utils/statusConfig';

/**
 * StatusBadge — colored pill badge for a request status.
 * @param {{ status: string, className?: string }} props
 */
export default function StatusBadge({ status, className = '' }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.pending;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border font-display ${cfg.bgClass} ${className}`}
    >
      <span className={`inline-block h-1.5 w-1.5 rounded-full ${cfg.dotClass}`} />
      {cfg.shortLabel}
    </span>
  );
}
