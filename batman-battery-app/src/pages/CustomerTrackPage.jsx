import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useRequest } from '@/hooks/useRequest';
import { submitRating } from '@/services/requestService';
import { STATUS_CONFIG, ISSUE_TYPES, BATMAN_SHOP_LOCATION, getTechnicianInfo } from '@/utils/statusConfig';
import { formatDate } from '@/utils/formatTime';
import StatusStepper from '@/components/common/StatusStepper';
import StatusBadge from '@/components/common/StatusBadge';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import RatingControl from '@/components/customer/RatingControl';
import { getRoadRoute } from '@/services/routingService';
import { formatETADisplay } from '@/utils/geoUtils';
import { Phone, Zap, Car, MapPin, User, Clock, AlertTriangle, Navigation, Building2, Navigation2, Bell, WifiOff } from 'lucide-react';

// Fix Leaflet default icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Orange pin = customer (you)
const customerIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41],
});

// Blue pin = technician (moving)
const techIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41],
});

// Gold pin = Batman Battery HQ / Shop
const shopIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-gold.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41],
});

// Green pin = Technician Station Hub
const stationIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41],
});

function MapFitter({ positions }) {
  const map = useMap();
  useEffect(() => {
    if (!positions || positions.length === 0) return;
    if (positions.length === 1) {
      map.setView(positions[0], 15, { animate: true });
    } else {
      map.fitBounds(positions, { padding: [50, 50], animate: true });
    }
  }, [JSON.stringify(positions)]);
  return null;
}

function getDistance(lat1, lng1, lat2, lng2) {
  const R = 6371000;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function formatDist(m) {
  if (m < 1000) return `${Math.round(m)} m away`;
  return `${(m / 1000).toFixed(1)} km away`;
}

function InfoRow({ icon: Icon, label, value }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3">
      <Icon className="h-4 w-4 text-fog flex-shrink-0 mt-0.5" />
      <div className="min-w-0">
        <p className="text-[11px] text-fog font-display uppercase tracking-wider">{label}</p>
        <p className="text-mist text-sm font-medium mt-0.5">{value}</p>
      </div>
    </div>
  );
}

export default function CustomerTrackPage() {
  const { id } = useParams();
  const { request, loading } = useRequest(id);
  const [roadRoute, setRoadRoute] = useState(null);

  const techLoc = request?.technicianLocation;
  const custLoc = request?.location;
  const techInfo = getTechnicianInfo(request?.assignedTechnician);

  const showMap = ['assigned', 'en_route', 'arrived'].includes(request?.status) &&
    (custLoc?.lat || techLoc?.lat || techInfo?.coords?.lat);
  const techIsLive = techLoc?.lat &&
    ['en_route', 'arrived'].includes(request?.status);

  // Fetch real turn-by-turn road route via OSRM API
  useEffect(() => {
    let isMounted = true;
    async function fetchNavigation() {
      const origin = techLoc?.lat
        ? techLoc
        : (techInfo?.coords ? techInfo.coords : BATMAN_SHOP_LOCATION);
      const destination = custLoc?.lat ? custLoc : null;

      if (origin?.lat && destination?.lat) {
        const routeData = await getRoadRoute(origin.lat, origin.lng, destination.lat, destination.lng);
        if (isMounted) {
          setRoadRoute(routeData);
        }
      }
    }
    fetchNavigation();
    return () => { isMounted = false; };
  }, [techLoc?.lat, techLoc?.lng, custLoc?.lat, custLoc?.lng, techInfo?.coords?.lat, techInfo?.coords?.lng]);

  if (loading) {
    return (
      <div className="min-h-screen bg-ink flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!request) {
    return (
      <div className="min-h-screen bg-ink flex flex-col items-center justify-center gap-4 px-5 text-center">
        <AlertTriangle className="h-12 w-12 text-alert" />
        <h1 className="text-xl font-bold font-display text-mist">Request not found</h1>
        <p className="text-fog text-sm">This link may be invalid or the request was removed.</p>
        <Link to="/" className="text-signal underline text-sm hover:no-underline">Submit a new request</Link>
      </div>
    );
  }

  const cfg = STATUS_CONFIG[request.status] ?? STATUS_CONFIG.pending;
  const isCompleted = request.status === 'completed';
  const isCancelled = request.status === 'cancelled';
  const issueCfg = ISSUE_TYPES[request.issueType];

  const stationLoc = techInfo?.coords
    ? [techInfo.coords.lat, techInfo.coords.lng]
    : [BATMAN_SHOP_LOCATION.lat, BATMAN_SHOP_LOCATION.lng];

  const mapPositions = roadRoute?.coordinates?.length
    ? roadRoute.coordinates
    : [stationLoc];
  if (!roadRoute?.coordinates?.length) {
    if (custLoc?.lat) mapPositions.push([custLoc.lat, custLoc.lng]);
    if (techLoc?.lat) mapPositions.push([techLoc.lat, techLoc.lng]);
  }

  const fallbackRoutePositions = [stationLoc];
  if (techLoc?.lat) {
    fallbackRoutePositions.push([techLoc.lat, techLoc.lng]);
  }
  if (custLoc?.lat) {
    fallbackRoutePositions.push([custLoc.lat, custLoc.lng]);
  }

  const defaultCenter = custLoc?.lat
    ? [custLoc.lat, custLoc.lng]
    : stationLoc;

  const distance = techLoc?.lat && custLoc?.lat
    ? getDistance(techLoc.lat, techLoc.lng, custLoc.lat, custLoc.lng)
    : null;

  return (
    <div className="min-h-screen bg-ink flex flex-col">
      {/* Header */}
      <header className="px-5 pt-8 pb-5 flex flex-col items-center gap-1 border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-signal flex items-center justify-center flex-shrink-0">
            <Zap className="h-4 w-4 text-ink fill-ink" />
          </div>
          <span className="text-lg font-bold font-display text-mist">
            Batman Battery <span className="text-signal">24/7</span>
          </span>
        </div>
        <p className="text-xs text-fog mt-0.5">Tracking your request</p>
      </header>

      <main className="flex-1 px-5 py-6 max-w-lg mx-auto w-full flex flex-col gap-4">

        {/* Offline Callout */}
        {id.startsWith('offline-') && (
          <div className="bg-signal/15 border border-signal/40 rounded-2xl p-4 flex items-start gap-3 shadow-[0_0_15px_rgba(245,166,35,0.2)]">
            <div className="h-9 w-9 rounded-xl bg-signal/20 flex items-center justify-center flex-shrink-0 text-signal">
              <WifiOff className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold font-display text-signal uppercase tracking-wider">
                Saved Offline
              </p>
              <p className="text-mist text-sm mt-0.5 leading-snug">
                Your request was saved locally while offline. It will transmit automatically once cellular connection is restored.
              </p>
            </div>
          </div>
        )}

        {/* Live Notification Callout for Customer when Technician is on the way */}
        {['en_route', 'arrived'].includes(request.status) && techInfo && (
          <div className="bg-go/15 border border-go/40 rounded-2xl p-4 flex items-start gap-3 shadow-[0_0_15px_rgba(63,191,127,0.2)] animate-pulse">
            <div className="h-9 w-9 rounded-xl bg-go/20 flex items-center justify-center flex-shrink-0 text-go">
              <Bell className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold font-display text-go uppercase tracking-wider">
                Technician Notification
              </p>
              <p className="text-mist text-sm mt-0.5 leading-snug">
                <strong>{request.assignedTechnician}</strong> from{' '}
                <span className="text-signal font-semibold">{techInfo.town}</span> is on their way to your location!
              </p>
              <p className="text-fog text-[11px] mt-1">
                You can track their live location in real-time on the map below.
              </p>
            </div>
          </div>
        )}

        {/* Status card */}
        <div className="bg-surface rounded-2xl p-5 border border-white/8 animate-fade-in">
          <div className="flex items-start justify-between gap-3 mb-4">
            <div>
              <h2 className="text-mist font-bold font-display text-lg leading-tight">{cfg.customerLabel}</h2>
              <p className="text-fog text-xs mt-1">Submitted {formatDate(request.createdAt)}</p>
            </div>
            <StatusBadge status={request.status} className="flex-shrink-0 mt-1" />
          </div>

          <StatusStepper status={request.status} />

          {request.assignedTechnician && !isCancelled && (
            <div className="mt-5 flex items-center justify-between gap-3 bg-signal/8 rounded-xl px-4 py-3 border border-signal/15 animate-fade-in">
              <div className="flex items-center gap-3">
                <User className="h-4 w-4 text-signal flex-shrink-0" />
                <div>
                  <p className="text-[11px] text-fog font-display">Your technician</p>
                  <p className="text-signal font-semibold font-display text-sm">
                    {request.assignedTechnician}
                  </p>
                </div>
              </div>
              {techInfo && (
                <div className="text-right">
                  <p className="text-[10px] text-fog font-display uppercase">Station Base</p>
                  <p className="text-go font-semibold text-xs">{techInfo.town}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── LIVE MAP ── */}
        {showMap && (
          <div className="animate-fade-in">
            {/* Real Road Navigation ETA badge */}
            {roadRoute ? (
              <div className="flex items-center justify-between mb-2 px-1 bg-surface/80 border border-white/10 rounded-xl py-2 px-3">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-go animate-pulse flex-shrink-0" />
                  <span className="text-mist text-xs font-semibold font-display">
                    ETA from {techInfo?.town || 'Station'}: ~{roadRoute.durationMin} mins ({roadRoute.distanceKm} km)
                  </span>
                </div>
                <span className="text-signal text-[11px] font-display flex items-center gap-1">
                  <Navigation2 className="h-3 w-3" /> Live route
                </span>
              </div>
            ) : (
              <>
                {techIsLive && distance !== null && (
                  <div className="flex items-center gap-2 mb-2 px-1">
                    <span className="h-2 w-2 rounded-full bg-go animate-pulse flex-shrink-0" />
                    <span className="text-go text-sm font-semibold font-display">
                      Technician is {formatDist(distance)}
                    </span>
                  </div>
                )}
                {techIsLive && distance === null && (
                  <div className="flex items-center gap-2 mb-2 px-1">
                    <span className="h-2 w-2 rounded-full bg-signal animate-pulse flex-shrink-0" />
                    <span className="text-signal text-sm font-semibold font-display">
                      Technician is on the way from {techInfo?.town || 'Station'} — acquiring GPS signal…
                    </span>
                  </div>
                )}
              </>
            )}

            <div className="rounded-2xl overflow-hidden border border-white/10 shadow-xl" style={{ height: 290 }}>
              <MapContainer
                center={defaultCenter}
                zoom={14}
                style={{ height: '100%', width: '100%' }}
                zoomControl={false}
                scrollWheelZoom={false}
              >
                <TileLayer
                  attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {/* Technician Station Hub (Green pin) */}
                {techInfo && (
                  <Marker position={stationLoc} icon={stationIcon}>
                    <Popup>
                      <strong>🏬 {techInfo.stationName}</strong>
                      <br />
                      Station: {techInfo.town}
                    </Popup>
                  </Marker>
                )}

                {/* Customer pin (orange) */}
                {custLoc?.lat && (
                  <Marker position={[custLoc.lat, custLoc.lng]} icon={customerIcon}>
                    <Popup><strong>📍 You are here</strong><br />{request.addressText || 'Your location'}</Popup>
                  </Marker>
                )}

                {/* Technician pin (blue, real-time) */}
                {techLoc?.lat && (
                  <Marker position={[techLoc.lat, techLoc.lng]} icon={techIcon}>
                    <Popup>
                      <strong>🔧 {request.assignedTechnician || 'Technician'}</strong>
                      <br />
                      {roadRoute ? `~${roadRoute.durationMin} mins away` : (distance !== null ? formatDist(distance) : 'On the way')}
                    </Popup>
                  </Marker>
                )}

                {/* Real turn-by-turn road navigation line */}
                {roadRoute?.coordinates ? (
                  <>
                    <Polyline
                      positions={roadRoute.coordinates}
                      pathOptions={{ color: '#1E40AF', weight: 8, opacity: 0.4, lineCap: 'round', lineJoin: 'round' }}
                    />
                    <Polyline
                      positions={roadRoute.coordinates}
                      pathOptions={{ color: '#3B82F6', weight: 5, opacity: 0.95, lineCap: 'round', lineJoin: 'round' }}
                    />
                  </>
                ) : (
                  fallbackRoutePositions.length > 1 && (
                    <Polyline
                      positions={fallbackRoutePositions}
                      pathOptions={{
                        color: '#F5A623',
                        weight: 4,
                        opacity: 0.8,
                        dashArray: '8, 8',
                      }}
                    />
                  )
                )}

                {mapPositions.length > 0 && <MapFitter positions={mapPositions} />}
              </MapContainer>
            </div>

            {/* Map legend */}
            <div className="flex flex-wrap items-center gap-4 mt-2 px-1 text-xs text-fog">
              {techInfo && (
                <span className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#2ECC71] border border-white/20" />
                  {techInfo.town} Hub
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-[#F5A623] border border-white/20" />
                You
              </span>
              {techLoc?.lat && (
                <span className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#4B8EF5] border border-white/20" />
                  {request.assignedTechnician}
                </span>
              )}
              {techIsLive && (
                <span className="ml-auto flex items-center gap-1 text-go">
                  <Navigation className="h-3 w-3" />
                  Live
                </span>
              )}
            </div>
          </div>
        )}

        {/* Request details */}
        <div className="bg-surface rounded-2xl p-5 border border-white/8 animate-slide-up flex flex-col gap-4">
          <h3 className="text-fog font-semibold font-display text-sm uppercase tracking-wider">Your request details</h3>
          <InfoRow icon={User} label="Name" value={request.customerName} />
          <InfoRow
            icon={Car}
            label="Vehicle"
            value={`${request.vehicle?.make ?? ''} ${request.vehicle?.model ?? ''}${request.vehicle?.plate ? ` · ${request.vehicle.plate}` : ''}`}
          />
          <InfoRow icon={Zap} label="Service needed" value={issueCfg?.label ?? request.issueType} />
          {request.addressText && <InfoRow icon={MapPin} label="Location note" value={request.addressText} />}
          {request.notes && <InfoRow icon={Clock} label="Notes" value={request.notes} />}
        </div>

        {/* Rating */}
        {isCompleted && (
          <div className="bg-surface rounded-2xl border border-go/20 animate-fade-in">
            <RatingControl requestId={id} existingRating={request.rating} />
          </div>
        )}

        {/* Call us */}
        <a
          href="tel:+639XXXXXXXXX"
          id="call-us-link"
          className="flex items-center justify-center gap-3 bg-surface border border-white/8 rounded-2xl px-5 py-4 hover:border-signal/30 hover:bg-signal/5 transition-all group"
        >
          <div className="h-10 w-10 rounded-full bg-signal/10 border border-signal/25 flex items-center justify-center group-hover:bg-signal/20 transition-colors">
            <Phone className="h-5 w-5 text-signal" />
          </div>
          <div>
            <p className="text-mist font-semibold font-display text-sm">Need help now?</p>
            <p className="text-signal text-sm">Call us directly</p>
          </div>
        </a>

        {!isCompleted && !isCancelled && (
          <p className="text-center text-xs text-fog">
            Wrong location?{' '}
            <Link to="/" className="text-signal underline hover:no-underline">Submit a new request</Link>
          </p>
        )}
      </main>

      <footer className="text-center pb-5 text-[11px] text-fog/50">
        Batman Battery 24/7 · Cebu, Philippines
      </footer>
    </div>
  );
}
