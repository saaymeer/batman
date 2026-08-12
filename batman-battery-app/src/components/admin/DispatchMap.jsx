import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, CircleMarker, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { STATUS_CONFIG, CEBU_CENTER, TECHNICIANS_DATA } from '@/utils/statusConfig';
import { timeAgo } from '@/utils/formatTime';
import { formatETADisplay } from '@/utils/geoUtils';
import L from 'leaflet';

// Fix default icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Green marker for Technician Base Stations
const stationIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [22, 36],
  iconAnchor: [11, 36],
  popupAnchor: [1, -30],
  shadowSize: [36, 36],
});

/**
 * Syncs the map view to newly arriving requests — keeps it from jumping around.
 */
function MapFitter({ requests }) {
  const map = useMap();
  const prevCount = useRef(0);

  useEffect(() => {
    const validRequests = requests.filter((r) => r.location?.lat && r.location?.lng);
    if (validRequests.length > 0 && validRequests.length > prevCount.current) {
      // Only auto-fit on new requests arriving, not on every render
      const bounds = validRequests.map((r) => [r.location.lat, r.location.lng]);
      if (bounds.length === 1) {
        map.setView(bounds[0], 14, { animate: true });
      } else {
        map.fitBounds(bounds, { padding: [40, 40], animate: true });
      }
    }
    prevCount.current = validRequests.length;
  }, [requests, map]);

  return null;
}

export default function DispatchMap({ requests, onSelectRequest, selectedId }) {
  const activeRequests = requests.filter((r) => r.location?.lat && r.location?.lng);

  return (
    <MapContainer
      center={[CEBU_CENTER.lat, CEBU_CENTER.lng]}
      zoom={12}
      style={{ height: '100%', width: '100%' }}
      scrollWheelZoom
      zoomControl
    >
      <TileLayer
        attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <MapFitter requests={activeRequests} />

      {/* Render Technician Station Hubs */}
      {TECHNICIANS_DATA.map((tech) => (
        <Marker
          key={tech.name}
          position={[tech.coords.lat, tech.coords.lng]}
          icon={stationIcon}
        >
          <Popup>
            <div className="font-body text-xs">
              <p className="font-bold text-mist">🏬 {tech.stationName}</p>
              <p className="text-signal font-semibold mt-0.5">{tech.name} ({tech.town})</p>
              <p className="text-fog text-[11px] mt-0.5">{tech.phone}</p>
            </div>
          </Popup>
        </Marker>
      ))}

      {/* Active Customer Requests & Dispatch Connections */}
      {activeRequests.map((req) => {
        const cfg = STATUS_CONFIG[req.status] ?? STATUS_CONFIG.pending;
        const isSelected = req.id === selectedId;

        const assignedTech = req.assignedTechnician
          ? TECHNICIANS_DATA.find((t) => t.name === req.assignedTechnician)
          : null;

        const etaInfo = assignedTech
          ? formatETADisplay(assignedTech.coords, req.location)
          : null;

        return (
          <div key={req.id}>
            {/* Connection Line from Technician Base Station to Customer */}
            {assignedTech && req.status !== 'completed' && req.status !== 'cancelled' && (
              <Polyline
                positions={[
                  [assignedTech.coords.lat, assignedTech.coords.lng],
                  [req.location.lat, req.location.lng],
                ]}
                pathOptions={{
                  color: cfg.hex,
                  weight: isSelected ? 3 : 2,
                  dashArray: '6, 8',
                  opacity: 0.8,
                }}
              />
            )}

            <CircleMarker
              center={[req.location.lat, req.location.lng]}
              radius={isSelected ? 16 : 11}
              pathOptions={{
                color: cfg.hex,
                fillColor: cfg.hex,
                fillOpacity: isSelected ? 0.9 : 0.7,
                weight: isSelected ? 3 : 2,
              }}
              eventHandlers={{
                click: () => onSelectRequest(req),
              }}
            >
              <Popup>
                <div className="font-body text-sm min-w-[160px]">
                  <p className="font-bold text-mist">{req.customerName}</p>
                  <p className="text-fog text-xs">{cfg.label}</p>
                  {req.assignedTechnician && (
                    <div className="mt-1 pt-1 border-t border-white/10">
                      <p className="text-go text-xs font-semibold">
                        Assigned: {req.assignedTechnician}
                      </p>
                      {etaInfo && (
                        <p className="text-signal text-[11px] font-mono mt-0.5">
                          ⏱ {etaInfo.label}
                        </p>
                      )}
                    </div>
                  )}
                  <p className="text-fog text-xs mt-1">{timeAgo(req.createdAt)}</p>
                  <button
                    onClick={() => onSelectRequest(req)}
                    className="mt-2 text-signal text-xs underline hover:no-underline focus-visible:outline-none"
                  >
                    View details →
                  </button>
                </div>
              </Popup>
            </CircleMarker>
          </div>
        );
      })}
    </MapContainer>
  );
}
