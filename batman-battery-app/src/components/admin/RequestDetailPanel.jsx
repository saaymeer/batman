import { useState } from 'react';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  updateRequestStatus,
  assignTechnician,
  updateTechnician,
} from '@/services/requestService';
import {
  STATUS_CONFIG,
  VALID_TRANSITIONS,
  TECHNICIANS_DATA,
  getTechnicianInfo,
  ISSUE_TYPES,
} from '@/utils/statusConfig';
import { formatDate, timeAgo } from '@/utils/formatTime';
import StatusBadge from '@/components/common/StatusBadge';
import Button from '@/components/common/Button';
import { Phone, MapPin, Car, User, FileText, X, Zap, Battery, HelpCircle, Clock, ExternalLink, Navigation } from 'lucide-react';

// Fix Leaflet icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const ISSUE_ICONS = {
  jumpstart: <Zap className="h-4 w-4" />,
  replacement: <Battery className="h-4 w-4" />,
  unsure: <HelpCircle className="h-4 w-4" />,
};

const STATUS_BUTTON_LABELS = {
  pending: 'pending → Assign',
  assigned: 'assigned → On the way',
  en_route: 'en_route → Arrived',
  arrived: 'arrived → Mark done',
};

const NEXT_STATUS = {
  pending: 'assigned',
  assigned: 'en_route',
  en_route: 'arrived',
  arrived: 'completed',
};

const NEXT_LABEL = {
  pending: 'Assign technician',
  assigned: 'Mark on the way',
  en_route: 'Mark arrived',
  arrived: 'Mark as done',
};

function InfoRow({ icon: Icon, label, children, className = '' }) {
  return (
    <div className={`flex items-start gap-3 ${className}`}>
      <Icon className="h-4 w-4 text-fog flex-shrink-0 mt-0.5" />
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-display uppercase tracking-wider text-fog/70">{label}</p>
        <div className="mt-0.5">{children}</div>
      </div>
    </div>
  );
}

/**
 * RequestDetailPanel — slide-in panel on the right (or bottom sheet on mobile).
 * Shows full customer info, location map, status controls, and technician assignment.
 *
 * @param {{ request: object, onClose: () => void }} props
 */
export default function RequestDetailPanel({ request, onClose }) {
  const [advancing, setAdvancing] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [techValue, setTechValue] = useState(request.assignedTechnician ?? '');
  const [assigningTech, setAssigningTech] = useState(false);

  const cfg = STATUS_CONFIG[request.status] ?? STATUS_CONFIG.pending;
  const transitions = VALID_TRANSITIONS[request.status] ?? [];
  const nextStatus = NEXT_STATUS[request.status];
  const canAdvance = !!nextStatus && transitions.includes(nextStatus);
  const canCancel = transitions.includes('cancelled');
  const issueCfg = ISSUE_TYPES[request.issueType];

  const handleAdvance = async () => {
    if (!nextStatus) return;
    setAdvancing(true);
    try {
      if (nextStatus === 'assigned' && techValue) {
        await assignTechnician(request.id, techValue);
      } else {
        await updateRequestStatus(request.id, nextStatus);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAdvancing(false);
    }
  };

  const handleCancel = async () => {
    if (!confirm('Cancel this request? This cannot be undone.')) return;
    setCancelling(true);
    try {
      await updateRequestStatus(request.id, 'cancelled');
    } catch (err) {
      console.error(err);
    } finally {
      setCancelling(false);
    }
  };

  const handleTechAssign = async () => {
    if (!techValue) return;
    setAssigningTech(true);
    try {
      if (request.status === 'pending') {
        await assignTechnician(request.id, techValue);
      } else {
        await updateTechnician(request.id, techValue);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAssigningTech(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-surface overflow-hidden">
      {/* Panel header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/8 flex-shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <StatusBadge status={request.status} />
          <p className="text-fog text-xs truncate">{timeAgo(request.createdAt)}</p>
        </div>
        <button
          onClick={onClose}
          className="h-8 w-8 rounded-lg flex items-center justify-center text-fog hover:text-mist hover:bg-white/5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal"
          aria-label="Close detail panel"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-5">
        {/* Customer name */}
        <h2 className="text-xl font-bold font-display text-mist leading-tight">
          {request.customerName}
        </h2>

        {/* Info rows */}
        <div className="flex flex-col gap-4">
          {/* Phone */}
          <InfoRow icon={Phone} label="Mobile number">
            <a
              href={`tel:${request.customerPhone}`}
              className="text-signal font-semibold text-sm hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal rounded"
            >
              {request.customerPhone}
            </a>
          </InfoRow>

          {/* Vehicle */}
          <InfoRow icon={Car} label="Vehicle">
            <p className="text-mist text-sm">
              {request.vehicle?.make} {request.vehicle?.model}
              {request.vehicle?.plate && (
                <span className="ml-2 px-2 py-0.5 rounded bg-white/8 text-fog text-xs font-mono">
                  {request.vehicle.plate}
                </span>
              )}
            </p>
          </InfoRow>

          {/* Issue */}
          <InfoRow icon={ISSUE_ICONS[request.issueType] ? Zap : HelpCircle} label="Service needed">
            <span className="flex items-center gap-1.5 text-mist text-sm">
              {ISSUE_ICONS[request.issueType]}
              {issueCfg?.label ?? request.issueType}
            </span>
          </InfoRow>

          {/* Notes */}
          {request.notes && (
            <InfoRow icon={FileText} label="Notes">
              <p className="text-mist text-sm leading-relaxed">{request.notes}</p>
            </InfoRow>
          )}

          {/* Location text */}
          {request.addressText && (
            <InfoRow icon={MapPin} label="Location note">
              <p className="text-mist text-sm">{request.addressText}</p>
            </InfoRow>
          )}

          {/* Timestamps */}
          <InfoRow icon={Clock} label="Submitted">
            <p className="text-mist text-sm">{formatDate(request.createdAt)}</p>
          </InfoRow>
        </div>

        {/* Mini map */}
        {request.location?.lat && (
          <div className="rounded-xl overflow-hidden border border-white/10" style={{ height: 160 }}>
            <MapContainer
              center={[request.location.lat, request.location.lng]}
              zoom={15}
              style={{ height: '100%', width: '100%' }}
              scrollWheelZoom={false}
              zoomControl={false}
              dragging={false}
            >
              <TileLayer
                attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <Marker position={[request.location.lat, request.location.lng]} />
            </MapContainer>
          </div>
        )}

        {/* Open in maps link */}
        {request.location?.lat && (
          <a
            href={`https://www.google.com/maps?q=${request.location.lat},${request.location.lng}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-signal text-xs hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal rounded -mt-3"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Open in Google Maps
          </a>
        )}

        {/* Technician assignment */}
        {request.status !== 'completed' && request.status !== 'cancelled' && (
          <div className="flex flex-col gap-2">
            <p className="text-[10px] font-display uppercase tracking-wider text-fog/70 flex items-center gap-1.5">
              <User className="h-3.5 w-3.5" />
              Assign technician
            </p>
            <div className="flex gap-2">
              <select
                value={techValue}
                onChange={(e) => setTechValue(e.target.value)}
                className="flex-1 rounded-xl bg-ink border border-white/10 hover:border-white/20 focus:border-signal focus:ring-1 focus:ring-signal/50 px-4 py-2.5 text-mist outline-none font-body text-sm transition-colors"
                id="technician-select"
              >
                <option value="">Select technician…</option>
                {TECHNICIANS_DATA.map((t) => (
                  <option key={t.name} value={t.name}>
                    {t.name} ({t.town})
                  </option>
                ))}
              </select>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleTechAssign}
                loading={assigningTech}
                disabled={!techValue || techValue === request.assignedTechnician}
                className="flex-shrink-0"
              >
                {request.assignedTechnician ? 'Update' : 'Assign'}
              </Button>
            </div>
            {request.assignedTechnician && (
              <div className="text-xs text-fog flex items-center justify-between mt-1">
                <span>Currently: <span className="text-signal font-semibold">{request.assignedTechnician}</span></span>
                {getTechnicianInfo(request.assignedTechnician) && (
                  <span className="text-go font-medium text-[11px] bg-go/10 px-2 py-0.5 rounded border border-go/20">
                    📍 {getTechnicianInfo(request.assignedTechnician).town}
                  </span>
                )}
              </div>
            )}

            {/* Technician tracking link */}
            {request.assignedTechnician && (
              <div className="mt-2 flex flex-col gap-1.5">
                <p className="text-[10px] font-display uppercase tracking-wider text-fog/70 flex items-center gap-1.5">
                  <Navigation className="h-3.5 w-3.5" />
                  Technician tracking link
                </p>
                <div className="flex items-center gap-2">
                  <input
                    readOnly
                    value={`${window.location.origin}/tech/${request.id}`}
                    className="flex-1 bg-ink border border-white/10 rounded-lg px-3 py-2 text-xs text-fog font-mono truncate focus:outline-none focus:border-signal/50"
                    onClick={(e) => e.target.select()}
                  />
                  <button
                    onClick={() => {
                      navigator.clipboard?.writeText(`${window.location.origin}/tech/${request.id}`);
                    }}
                    className="flex-shrink-0 px-3 py-2 rounded-lg bg-signal/10 border border-signal/25 text-signal text-xs font-semibold font-display hover:bg-signal/20 transition-colors"
                    title="Copy link"
                  >
                    Copy
                  </button>
                </div>
                <p className="text-[10px] text-fog/50">
                  Send this link to {request.assignedTechnician} ({getTechnicianInfo(request.assignedTechnician)?.town}) to start live tracking
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Action buttons — sticky at the bottom */}
      {(canAdvance || canCancel) && (
        <div className="border-t border-white/8 px-5 py-4 flex flex-col gap-2 flex-shrink-0">
          {canAdvance && (
            <Button
              variant="primary"
              size="md"
              onClick={handleAdvance}
              loading={advancing}
              className="w-full"
              id="advance-status-btn"
            >
              {NEXT_LABEL[request.status]}
            </Button>
          )}
          {canCancel && (
            <Button
              variant="danger"
              size="sm"
              onClick={handleCancel}
              loading={cancelling}
              className="w-full"
              id="cancel-request-btn"
            >
              Cancel request
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
