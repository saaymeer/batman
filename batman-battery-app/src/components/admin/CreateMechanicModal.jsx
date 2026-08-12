import { useState, useRef, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Mail, Lock, User, Building2, Phone, CheckCircle2, MapPin, Search } from 'lucide-react';
import Button from '@/components/common/Button';
import { TECHNICIANS_DATA } from '@/utils/statusConfig';
import { searchLocationSuggestions } from '@/services/geocodingService';

// Station green pin
const stationIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41],
});

function MapFlyTo({ coords }) {
  const map = useMap();
  useEffect(() => {
    if (coords?.lat && coords?.lng) {
      map.flyTo([coords.lat, coords.lng], 15, { animate: true });
    }
  }, [coords?.lat, coords?.lng]);
  return null;
}

function LocationPicker({ coords, setCoords }) {
  useMapEvents({
    click(e) {
      setCoords({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return coords ? <Marker position={[coords.lat, coords.lng]} icon={stationIcon} /> : null;
}

export default function CreateMechanicModal({ isOpen, onClose, onCreateMechanic }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [station, setStation] = useState(TECHNICIANS_DATA[0].stationName);
  const [town, setTown] = useState(TECHNICIANS_DATA[0].town);
  const [phone, setPhone] = useState('');
  const [coords, setCoords] = useState(TECHNICIANS_DATA[0].coords || { lat: 10.3157, lng: 123.8854 });
  const [successMsg, setSuccessMsg] = useState('');

  const [suggestions, setSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchDebounceRef = useRef(null);

  if (!isOpen) return null;

  const handleStationChange = (value) => {
    setStation(value);
    setShowDropdown(true);

    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current);
    }

    if (value.trim().length >= 2) {
      setIsSearching(true);
      searchDebounceRef.current = setTimeout(async () => {
        const results = await searchLocationSuggestions(value);
        setSuggestions(results);
        setIsSearching(false);
      }, 400);
    } else {
      setSuggestions([]);
      setIsSearching(false);
    }
  };

  const handleSelectSuggestion = (sug) => {
    setStation(sug.shortName || sug.displayName.split(',')[0]);
    if (sug.town) setTown(sug.town);
    setCoords({ lat: sug.lat, lng: sug.lng });
    setSuggestions([]);
    setShowDropdown(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    const newMechanic = {
      name,
      email: cleanEmail,
      password,
      stationName: station,
      town,
      phone,
      address: `${station}, Cebu`,
      coords,
    };

    // Save dynamically created mechanic to localStorage for seamless authentication
    const existingRaw = localStorage.getItem('batman_created_mechanics');
    const existing = existingRaw ? JSON.parse(existingRaw) : [];
    existing.push(newMechanic);
    localStorage.setItem('batman_created_mechanics', JSON.stringify(existing));

    if (onCreateMechanic) {
      onCreateMechanic(newMechanic);
    }

    setSuccessMsg(`Mechanic account successfully created for ${name} (${station})! You can now log in at /mechanic/login`);
    setTimeout(() => {
      setName('');
      setEmail('');
      setPassword('');
      setPhone('');
      setSuccessMsg('');
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-ink/80 backdrop-blur-md animate-fade-in">
      <div className="bg-surface border border-white/10 rounded-2xl w-full max-w-lg p-6 shadow-2xl flex flex-col gap-4 relative z-[10000] max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-white/8 pb-3">
          <h3 className="font-display font-bold text-mist text-lg flex items-center gap-2">
            <User className="h-5 w-5 text-signal" />
            Create Mechanic Account & Station Location
          </h3>
          <button
            onClick={onClose}
            className="text-fog hover:text-mist text-sm font-display"
          >
            ✕
          </button>
        </div>

        {successMsg ? (
          <div className="py-6 text-center flex flex-col items-center gap-2 bg-go/10 border border-go/25 rounded-xl p-4">
            <CheckCircle2 className="h-10 w-10 text-go" />
            <p className="text-go font-display font-bold text-sm">{successMsg}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
            <div>
              <label className="text-xs font-display uppercase tracking-wider text-fog mb-1 block">
                Mechanic Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-fog" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Juan Santos"
                  className="w-full bg-ink border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-mist text-sm outline-none focus:border-signal"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-display uppercase tracking-wider text-fog mb-1 block">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-fog" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="mechanic@batmanbattery.ph"
                    className="w-full bg-ink border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-mist text-sm outline-none focus:border-signal"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-display uppercase tracking-wider text-fog mb-1 block">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-fog" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-ink border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-mist text-sm outline-none focus:border-signal"
                  />
                </div>
              </div>
            </div>

            <div className="relative">
              <label className="text-xs font-display uppercase tracking-wider text-fog mb-1 block">
                Assign Station Hub & Location Search
              </label>
              <div className="relative">
                <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-fog" />
                <input
                  type="text"
                  required
                  value={station}
                  onChange={(e) => handleStationChange(e.target.value)}
                  onFocus={() => setShowDropdown(true)}
                  placeholder="Type location e.g. Minglanilla, Tinaan, Lapu-Lapu..."
                  className="w-full bg-ink border border-white/10 hover:border-white/20 focus:border-signal focus:ring-1 focus:ring-signal/50 pl-10 pr-10 py-2.5 text-mist text-sm outline-none font-body transition-colors"
                />
                {isSearching && (
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-signal animate-spin" />
                )}
              </div>

              {/* Suggestions Dropdown */}
              {showDropdown && suggestions.length > 0 && (
                <div className="absolute left-0 right-0 top-full mt-1 bg-surface border border-white/15 rounded-xl shadow-2xl z-50 max-h-48 overflow-y-auto animate-fade-in">
                  {suggestions.map((sug, idx) => (
                    <button
                      type="button"
                      key={idx}
                      onClick={() => handleSelectSuggestion(sug)}
                      className="w-full text-left px-3.5 py-2.5 hover:bg-white/10 border-b border-white/5 last:border-none flex items-start gap-2 text-xs transition-colors"
                    >
                      <MapPin className="h-3.5 w-3.5 text-signal flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold text-mist font-display">
                          {sug.shortName} <span className="text-go text-[11px]">({sug.town})</span>
                        </p>
                        <p className="text-fog text-[10px] truncate max-w-sm">{sug.displayName}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Interactive Map Pin Selector */}
            <div>
              <label className="text-xs font-display uppercase tracking-wider text-signal mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1.5 font-bold">
                  <MapPin className="h-4 w-4 text-signal" />
                  Pin Station Location on Map (Click map to adjust pin)
                </span>
                <span className="font-mono text-[10px] text-fog">
                  {coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}
                </span>
              </label>
              <div className="h-44 rounded-xl overflow-hidden border border-white/10 shadow-inner relative">
                <MapContainer
                  center={[coords.lat, coords.lng]}
                  zoom={13}
                  style={{ height: '100%', width: '100%' }}
                  zoomControl={false}
                >
                  <TileLayer
                    attribution='© OpenStreetMap'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <MapFlyTo coords={coords} />
                  <LocationPicker coords={coords} setCoords={setCoords} />
                </MapContainer>
              </div>
            </div>

            <div>
              <label className="text-xs font-display uppercase tracking-wider text-fog mb-1 block">
                Mobile Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-fog" />
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="09XX XXX XXXX"
                  className="w-full bg-ink border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-mist text-sm outline-none focus:border-signal"
                />
              </div>
            </div>

            <Button type="submit" variant="primary" size="lg" className="mt-2 w-full">
              Create Mechanic Account
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
