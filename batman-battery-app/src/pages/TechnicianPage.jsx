import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useRequest } from '@/hooks/useRequest';
import { updateTechnicianLocation, updateRequestStatus } from '@/services/requestService';
import { getRoadRoute } from '@/services/routingService';
import { STATUS_CONFIG, BATMAN_SHOP_LOCATION, getTechnicianInfo } from '@/utils/statusConfig';
import { Zap, Navigation, MapPin, User, Phone, CheckCircle2, AlertTriangle, WifiOff, Navigation2, Building2, Radio } from 'lucide-react';
import LoadingSpinner from '@/components/common/LoadingSpinner';

// Fix Leaflet default icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Orange marker for customer location
const customerIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Blue marker for technician
const techIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Gold pin = Batman HQ / Station
const shopIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-gold.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Green pin = Technician Station / Hub
const stationIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

function MapFitter({ positions }) {
  const map = useMap();
  useEffect(() => {
    if (positions.length === 0) return;
    if (positions.length === 1) {
      map.setView(positions[0], 15, { animate: true });
    } else {
      map.fitBounds(positions, { padding: [50, 50], animate: true });
    }
  }, [positions.length]);
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

function formatDist(meters) {
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(1)} km`;
}

export default function TechnicianPage() {
  const { id } = useParams();
  const { request, loading } = useRequest(id);

  const [tracking, setTracking] = useState(false);
  const [techPos, setTechPos] = useState(null);
  const [geoError, setGeoError] = useState(null);
  const [lastSync, setLastSync] = useState(null);
  const [isAdvancingStatus, setIsAdvancingStatus] = useState(false);
  const watchId = useRef(null);
  const syncInterval = useRef(null);
  const pendingPos = useRef(null);

  const techInfo = getTechnicianInfo(request?.assignedTechnician);

  const startTracking = useCallback(() => {
    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported on this device.');
      return;
    }
    setGeoError(null);
    setTracking(true);

    watchId.current = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude: lat, longitude: lng, heading } = pos.coords;
        setTechPos({ lat, lng });
        pendingPos.current = { lat, lng, heading };
      },
      (err) => {
        setGeoError(`GPS error: ${err.message}`);
        setTracking(false);
      },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 }
    );

    // Push to Firestore every 5 seconds
    syncInterval.current = setInterval(async () => {
      if (!pendingPos.current) return;
      try {
        await updateTechnicianLocation(id, pendingPos.current);
        setLastSync(new Date());
      } catch (e) {
        console.error('Location sync failed:', e);
      }
    }, 5000);
  }, [id]);

  const stopTracking = useCallback(() => {
    if (watchId.current !== null) {
      navigator.geolocation.clearWatch(watchId.current);
      watchId.current = null;
    }
    if (syncInterval.current) {
      clearInterval(syncInterval.current);
      syncInterval.current = null;
    }
    setTracking(false);
  }, []);

  useEffect(() => {
    return () => {
      stopTracking();
    };
  }, [stopTracking]);

  // Handler for technician clicking "Ready to Share Location"
  const handleReadyToShare = async () => {
    setIsAdvancingStatus(true);
    try {
      if (request?.status === 'assigned' || request?.status === 'pending') {
        await updateRequestStatus(id, 'en_route');
      }
      startTracking();
    } catch (err) {
      console.error('Failed to update status:', err);
    } finally {
      setIsAdvancingStatus(false);
    }
  };

  const customerLoc = request?.location;
  const cfg = STATUS_CONFIG[request?.status] ?? STATUS_CONFIG.pending;

  const [roadRoute, setRoadRoute] = useState(null);
  const [isRerouting, setIsRerouting] = useState(false);
  const [isOffRoute, setIsOffRoute] = useState(false);

  // Dynamic turn-by-turn road route recalculation via OSRM API whenever mechanic moves
  useEffect(() => {
    let isMounted = true;
    async function fetchNav() {
      const origin = techPos?.lat
        ? techPos
        : (techInfo?.coords ? techInfo.coords : BATMAN_SHOP_LOCATION);
      const dest = customerLoc?.lat ? customerLoc : null;

      if (origin?.lat && dest?.lat) {
        setIsRerouting(true);
        const routeData = await getRoadRoute(origin.lat, origin.lng, dest.lat, dest.lng);
        if (isMounted) {
          setRoadRoute(routeData);
          setIsRerouting(false);

          // Detect off-route deviation (>80m from route path) if currently travelling
          if (techPos?.lat && routeData?.coordinates?.length > 0) {
            let minDistanceToPath = Infinity;
            for (const [rLat, rLng] of routeData.coordinates) {
              const d = getDistance(techPos.lat, techPos.lng, rLat, rLng);
              if (d < minDistanceToPath) minDistanceToPath = d;
            }
            if (minDistanceToPath > 80) {
              setIsOffRoute(true);
            } else {
              setIsOffRoute(false);
            }
          }
        }
      }
    }

    fetchNav();
    return () => { isMounted = false; };
  }, [techPos?.lat, techPos?.lng, customerLoc?.lat, customerLoc?.lng, techInfo?.coords?.lat, techInfo?.coords?.lng]);

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
        <p className="text-fog text-sm">This link may be invalid or expired.</p>
        <Link to="/" className="text-signal underline text-sm">Go home</Link>
      </div>
    );
  }

  // Base location for technician station
  const stationLoc = techInfo?.coords
    ? [techInfo.coords.lat, techInfo.coords.lng]
    : [BATMAN_SHOP_LOCATION.lat, BATMAN_SHOP_LOCATION.lng];

  const mapPositions = roadRoute?.coordinates?.length
    ? roadRoute.coordinates
    : [stationLoc];

  if (!roadRoute?.coordinates?.length) {
    if (customerLoc?.lat) mapPositions.push([customerLoc.lat, customerLoc.lng]);
    if (techPos?.lat) mapPositions.push([techPos.lat, techPos.lng]);
  }

  const fallbackRoutePositions = [stationLoc];
  if (techPos?.lat) {
    fallbackRoutePositions.push([techPos.lat, techPos.lng]);
  }
  if (customerLoc?.lat) {
    fallbackRoutePositions.push([customerLoc.lat, customerLoc.lng]);
  }

  const defaultCenter = customerLoc?.lat
    ? [customerLoc.lat, customerLoc.lng]
    : stationLoc;

  const distance =
    techPos && customerLoc?.lat
      ? getDistance(techPos.lat, techPos.lng, customerLoc.lat, customerLoc.lng)
      : null;

  return (
    <div className="min-h-screen bg-ink flex flex-col">
      {/* Header with Back to Mechanic Portal button */}
      <header className="px-5 pt-6 pb-4 border-b border-white/8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            to="/mechanic"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-fog hover:text-mist hover:bg-white/10 text-xs font-display transition-colors"
          >
            ← Back to Dispatch
          </Link>
          <div>
            <p className="font-bold font-display text-mist text-sm leading-tight">
              Batman Battery <span className="text-signal">24/7</span>
            </p>
            <p className="text-fog text-[11px]">
              {request.assignedTechnician || 'Technician'} Portal
            </p>
          </div>
        </div>
        <span className={`text-[11px] font-semibold font-display px-2.5 py-1 rounded-full border ${cfg.bgClass}`}>
          {cfg.label}
        </span>
      </header>

      {/* Technician Station Banner */}
      {techInfo && (
        <div className="bg-go/10 border-b border-go/20 px-5 py-3 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-mist font-display">
            <Building2 className="h-4 w-4 text-go flex-shrink-0" />
            <span>
              Station: <strong className="text-go">{techInfo.stationName}</strong> ({techInfo.town})
            </span>
          </div>
          <span className="text-fog font-mono text-[11px]">{techInfo.phone}</span>
        </div>
      )}

      {/* Customer info */}
      <div className="px-5 py-4 bg-surface/50 border-b border-white/8">
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center gap-3">
            <User className="h-4 w-4 text-signal flex-shrink-0" />
            <div>
              <p className="text-[10px] text-fog font-display uppercase tracking-wider">Customer</p>
              <p className="text-mist font-semibold text-sm">{request.customerName}</p>
            </div>
          </div>
          {request.customerPhone && (
            <a
              href={`tel:${request.customerPhone}`}
              className="flex items-center gap-3 hover:opacity-80 transition-opacity"
            >
              <Phone className="h-4 w-4 text-go flex-shrink-0" />
              <div>
                <p className="text-[10px] text-fog font-display uppercase tracking-wider">Phone</p>
                <p className="text-go font-semibold text-sm">{request.customerPhone}</p>
              </div>
            </a>
          )}
          {request.addressText && (
            <div className="flex items-center gap-3">
              <MapPin className="h-4 w-4 text-fog flex-shrink-0" />
              <div>
                <p className="text-[10px] text-fog font-display uppercase tracking-wider">Location note</p>
                <p className="text-mist text-sm">{request.addressText}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Map */}
      <div className="mx-4 mt-4 rounded-2xl overflow-hidden border border-white/10 shadow-2xl h-[550px] relative">
        <MapContainer
          center={defaultCenter}
          zoom={14}
          style={{ height: '100%', width: '100%' }}
          zoomControl={false}
        >
          <TileLayer
            attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Technician Station Marker (Green) */}
          <Marker position={stationLoc} icon={stationIcon}>
            <Popup>
              <strong>🏬 {techInfo?.stationName || 'Technician Station'}</strong>
              <br />
              Base: {techInfo?.town || 'Metro Cebu'}
            </Popup>
          </Marker>

          {customerLoc?.lat && (
            <Marker position={[customerLoc.lat, customerLoc.lng]} icon={customerIcon}>
              <Popup>
                <strong>{request.customerName}</strong><br />Stranded location
              </Popup>
            </Marker>
          )}

          {techPos?.lat && (
            <Marker position={[techPos.lat, techPos.lng]} icon={techIcon}>
              <Popup><strong>You</strong><br />Your live position</Popup>
            </Marker>
          )}

          {/* Turn-by-turn road polyline */}
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

      {/* Distance & Route info callout with dynamic Rerouting notification */}
      {isOffRoute && (
        <div className="mx-4 mt-3 bg-alert/20 border border-alert/40 rounded-xl px-4 py-2.5 flex items-center justify-between animate-pulse">
          <div className="flex items-center gap-2 text-alert text-xs font-display font-bold">
            <AlertTriangle className="h-4 w-4 text-alert flex-shrink-0" />
            <span>Wrong Turn / Off-Route Detected! Recalculating road path…</span>
          </div>
        </div>
      )}

      {roadRoute ? (
        <div className="mx-4 mt-3 bg-surface rounded-xl border border-white/8 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Navigation2 className="h-4 w-4 text-signal" />
            <span className="text-fog text-sm font-display">
              {isRerouting ? '🔄 Recalculating route…' : `Route to customer from ${techPos ? 'Current GPS Location' : (techInfo?.town || 'Station')}`}
            </span>
          </div>
          <div className="text-right">
            <span className="font-bold font-display text-signal text-base">{roadRoute.distanceKm} km</span>
            <span className="text-fog text-xs ml-1.5">(~{roadRoute.durationMin} mins)</span>
          </div>
        </div>
      ) : (
        distance !== null && (
          <div className="mx-4 mt-3 bg-surface rounded-xl border border-white/8 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Navigation className="h-4 w-4 text-signal" />
              <span className="text-fog text-sm font-display">Distance to customer</span>
            </div>
            <span className="font-bold font-display text-signal text-base">{formatDist(distance)}</span>
          </div>
        )
      )}

      {/* Location Sharing Controls & Large Gold Button */}
      <div className="px-4 mt-4 flex flex-col gap-3">
        {geoError && (
          <div className="flex items-center gap-2 bg-alert/10 border border-alert/25 rounded-xl px-4 py-3">
            <WifiOff className="h-4 w-4 text-alert flex-shrink-0" />
            <p className="text-alert text-sm">{geoError}</p>
          </div>
        )}

        {lastSync && (
          <div className="flex items-center justify-center gap-2 text-xs text-go bg-go/10 border border-go/20 py-2 rounded-xl">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Live location streaming to customer • Synced {lastSync.toLocaleTimeString()}
          </div>
        )}

        {/* Big Gold Location Sharing Button */}
        {!tracking ? (
          <button
            id="ready-share-location-btn"
            onClick={handleReadyToShare}
            disabled={isAdvancingStatus}
            className="w-full flex items-center justify-center gap-2.5 px-5 py-4 rounded-2xl bg-[#F5A623] text-black font-bold font-display text-base hover:bg-[#e0951a] active:scale-[0.98] transition-all shadow-[0_4px_24px_rgba(245,166,35,0.4)] disabled:opacity-50"
          >
            <Navigation className="h-5 w-5 fill-black text-black" />
            {isAdvancingStatus ? 'Updating status…' : 'Start sharing my location'}
          </button>
        ) : (
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-go/15 border border-go/30">
              <span className="h-3 w-3 rounded-full bg-go animate-ping" />
              <span className="text-go font-bold font-display text-sm uppercase tracking-wider">
                Live Location Broadcast Active
              </span>
            </div>
            <button
              id="stop-tracking-btn"
              onClick={stopTracking}
              className="w-full py-3 rounded-xl border border-white/10 text-fog text-sm font-display hover:bg-white/5 transition-colors"
            >
              Stop sharing location
            </button>
          </div>
        )}

        {/* Job Status Update Actions */}
        <div className="flex flex-col gap-2 pt-2">
          {request.status === 'en_route' && (
            <button
              onClick={async () => {
                setIsAdvancingStatus(true);
                await updateRequestStatus(id, 'arrived');
                setIsAdvancingStatus(false);
              }}
              disabled={isAdvancingStatus}
              className="w-full py-3.5 rounded-2xl bg-go/20 border border-go/40 text-go font-bold font-display text-sm hover:bg-go/30 transition-all shadow-md"
            >
              Mark as Arrived at Customer Location
            </button>
          )}

          {request.status === 'arrived' && (
            <button
              onClick={async () => {
                setIsAdvancingStatus(true);
                await updateRequestStatus(id, 'completed');
                stopTracking();
                setIsAdvancingStatus(false);
              }}
              disabled={isAdvancingStatus}
              className="w-full py-4 rounded-2xl bg-go text-ink font-bold font-display text-sm hover:bg-go/90 transition-all shadow-[0_0_20px_rgba(63,191,127,0.35)]"
            >
              Mark Job Completed (Done)
            </button>
          )}

          {request.status === 'completed' && (
            <div className="py-3 rounded-2xl bg-go/10 border border-go/20 text-center text-go font-bold font-display text-sm">
              ✓ Job Completed Successfully
            </div>
          )}
        </div>
      </div>

      <p className="text-center text-[11px] text-fog/40 mt-6 mb-4 px-5">
        Your location is only shared while this page is open. The customer can see you moving on their map.
      </p>
    </div>
  );
}

