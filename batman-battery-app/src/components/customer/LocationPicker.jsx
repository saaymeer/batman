import { useEffect, useState, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useGeolocation } from '@/hooks/useGeolocation';
import { CEBU_CENTER, DEFAULT_ZOOM } from '@/utils/statusConfig';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { MapPin, LocateFixed, AlertTriangle } from 'lucide-react';

// Fix Leaflet default icon issue with Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom signal-colored pin icon
const signalIcon = L.divIcon({
  html: `<div style="
    width:28px;height:36px;position:relative;
  ">
    <svg viewBox="0 0 28 36" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M14 0C6.268 0 0 6.268 0 14c0 9.5 14 22 14 22s14-12.5 14-22C28 6.268 21.732 0 14 0z" fill="#F5A623"/>
      <circle cx="14" cy="14" r="6" fill="#12151C"/>
    </svg>
  </div>`,
  className: '',
  iconSize: [28, 36],
  iconAnchor: [14, 36],
  popupAnchor: [0, -36],
});

/**
 * Inner component that moves the map center when coords change
 */
function MapController({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView([center.lat, center.lng], DEFAULT_ZOOM, { animate: true });
    }
  }, [center, map]);
  return null;
}

/**
 * Draggable marker that calls onMove on drag end
 */
function DraggableMarker({ position, onMove }) {
  const markerRef = useRef(null);

  const eventHandlers = {
    dragend() {
      const marker = markerRef.current;
      if (marker) {
        const { lat, lng } = marker.getLatLng();
        onMove({ lat, lng, accuracy: null });
      }
    },
  };

  if (!position) return null;

  return (
    <Marker
      draggable
      eventHandlers={eventHandlers}
      position={[position.lat, position.lng]}
      icon={signalIcon}
      ref={markerRef}
    />
  );
}

/**
 * LocationPicker
 *
 * Attempts GPS geolocation, shows result on a draggable map.
 * Falls back to Cebu-centered map + optional landmark text field.
 *
 * @param {{ onChange: (loc: { lat, lng, accuracy, addressText? }) => void }} props
 */
export default function LocationPicker({ onChange }) {
  const { coords, error: geoError, loading: geoLoading, retry } = useGeolocation();
  const [pinPosition, setPinPosition] = useState(null);
  const [landmark, setLandmark] = useState('');

  // Initialize pin from geolocation
  useEffect(() => {
    if (coords && !pinPosition) {
      setPinPosition(coords);
    }
  }, [coords, pinPosition]);

  // Propagate changes up
  const handleMove = useCallback(
    (pos) => {
      setPinPosition(pos);
      onChange({ ...pos, addressText: landmark });
    },
    [landmark, onChange]
  );

  useEffect(() => {
    if (pinPosition) {
      onChange({ ...pinPosition, addressText: landmark });
    }
  }, [landmark, pinPosition, onChange]);

  const center = pinPosition ?? CEBU_CENTER;

  return (
    <div className="flex flex-col gap-3">
      {/* Status banner */}
      {geoLoading && (
        <div className="flex items-center gap-2 text-fog text-sm bg-surface rounded-xl px-4 py-3">
          <LoadingSpinner size="sm" />
          <span>Getting your location…</span>
        </div>
      )}

      {!geoLoading && geoError && (
        <div className="flex items-start gap-2 bg-alert/10 border border-alert/20 rounded-xl px-4 py-3 animate-fade-in">
          <AlertTriangle className="h-4 w-4 text-alert flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-sm text-alert">{geoError}</p>
            <button
              type="button"
              onClick={retry}
              className="text-xs text-signal underline mt-1 hover:no-underline focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-signal rounded"
            >
              Try again
            </button>
          </div>
        </div>
      )}

      {!geoLoading && !geoError && coords && (
        <div className="flex items-center gap-2 text-go text-sm bg-go/10 border border-go/20 rounded-xl px-4 py-3 animate-fade-in">
          <LocateFixed className="h-4 w-4 flex-shrink-0" />
          <span>Location detected — drag the pin if it's off</span>
        </div>
      )}

      {/* Map */}
      <div className="relative rounded-xl overflow-hidden border border-white/10" style={{ height: 240 }}>
        <MapContainer
          center={[center.lat, center.lng]}
          zoom={DEFAULT_ZOOM}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={false}
          zoomControl={false}
        >
          <TileLayer
            attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapController center={pinPosition} />
          <DraggableMarker position={pinPosition ?? center} onMove={handleMove} />
        </MapContainer>

        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-[1000] pointer-events-none">
          <span className="text-[10px] text-fog bg-ink/70 backdrop-blur px-2 py-0.5 rounded-full">
            Drag the pin to your exact location
          </span>
        </div>
      </div>

      {/* Landmark fallback field */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-fog font-display flex items-center gap-1.5">
          <MapPin className="h-3.5 w-3.5" />
          Landmark or address (optional)
        </label>
        <input
          type="text"
          value={landmark}
          onChange={(e) => setLandmark(e.target.value)}
          placeholder="e.g. Near SM City Cebu Gate 2"
          className="w-full rounded-xl bg-ink border border-white/10 hover:border-white/20 focus:border-signal focus:ring-1 focus:ring-signal/50 px-4 py-3 text-mist placeholder:text-fog/50 outline-none font-body text-base transition-colors"
        />
      </div>
    </div>
  );
}
