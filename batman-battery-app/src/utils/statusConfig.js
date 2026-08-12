// Single source of truth for all status values, labels, colors, and valid transitions.
// Every other file imports from here — no hardcoded status strings in components.

export const STATUS_CONFIG = {
  pending: {
    label: 'Request sent',
    shortLabel: 'Pending',
    customerLabel: 'Request sent — help is on the way',
    color: 'alert',        // tailwind token
    hex: '#E85D4A',
    step: 0,
    bgClass: 'bg-alert/15 text-alert border-alert/30',
    dotClass: 'bg-alert',
  },
  assigned: {
    label: 'Technician assigned',
    shortLabel: 'Assigned',
    customerLabel: 'A technician has been assigned to you',
    color: 'signal',
    hex: '#F5A623',
    step: 1,
    bgClass: 'bg-signal/15 text-signal border-signal/30',
    dotClass: 'bg-signal',
  },
  en_route: {
    label: 'On the way',
    shortLabel: 'On the way',
    customerLabel: 'Your technician is on the way',
    color: 'signal',
    hex: '#F5A623',
    step: 2,
    bgClass: 'bg-signal/15 text-signal border-signal/30',
    dotClass: 'bg-signal',
  },
  arrived: {
    label: 'Arrived',
    shortLabel: 'Arrived',
    customerLabel: 'Your technician has arrived',
    color: 'go',
    hex: '#3FBF7F',
    step: 3,
    bgClass: 'bg-go/15 text-go border-go/30',
    dotClass: 'bg-go',
  },
  completed: {
    label: 'Done',
    shortLabel: 'Done',
    customerLabel: 'Job complete — thank you for choosing Batman Battery!',
    color: 'go',
    hex: '#3FBF7F',
    step: 4,
    bgClass: 'bg-go/15 text-go border-go/30',
    dotClass: 'bg-go',
  },
  cancelled: {
    label: 'Cancelled',
    shortLabel: 'Cancelled',
    customerLabel: 'This request was cancelled',
    color: 'fog',
    hex: '#9AA1AC',
    step: -1,
    bgClass: 'bg-fog/15 text-fog border-fog/30',
    dotClass: 'bg-fog',
  },
};

// Ordered steps for the status stepper (excludes cancelled)
export const STATUS_STEPS = ['pending', 'assigned', 'en_route', 'arrived', 'completed'];

// Valid transitions from each status (admin controls)
export const VALID_TRANSITIONS = {
  pending: ['assigned', 'cancelled'],
  assigned: ['en_route', 'cancelled'],
  en_route: ['arrived', 'cancelled'],
  arrived: ['completed', 'cancelled'],
  completed: [],
  cancelled: [],
};

// Technician list with assigned base locations across Cebu City and Cebu Province
export const TECHNICIANS_DATA = [
  {
    name: 'Rico M.',
    town: 'Talisay City',
    stationName: 'Talisay SRP Hub',
    address: 'South Road Properties, Talisay City, Cebu',
    coords: { lat: 10.2447, lng: 123.8481 },
    phone: '0917-123-4567',
  },
  {
    name: 'Jun D.',
    town: 'Mandaue City',
    stationName: 'Mandaue Reclamation Hub',
    address: 'Subangdaku, Mandaue City, Cebu',
    coords: { lat: 10.3310, lng: 123.9400 },
    phone: '0928-123-4567',
  },
  {
    name: 'Mark T.',
    town: 'Cebu City',
    stationName: 'Cebu IT Park Base',
    address: 'Salinas Drive, Lahug, Cebu City',
    coords: { lat: 10.3283, lng: 123.9060 },
    phone: '0909-123-4567',
  },
  {
    name: 'Boyet R.',
    town: 'Lapu-Lapu City',
    stationName: 'Mactan Airport Hub',
    address: 'Pajo, Lapu-Lapu City, Mactan Island, Cebu',
    coords: { lat: 10.3150, lng: 123.9753 },
    phone: '0917-111-2222',
  },
  {
    name: 'Noel S.',
    town: 'Minglanilla (South Cebu)',
    stationName: 'Minglanilla South Hub',
    address: 'Poblacion, Minglanilla, Cebu',
    coords: { lat: 10.2450, lng: 123.7960 },
    phone: '0918-999-8888',
  },
  {
    name: 'Cardo K.',
    town: 'Consolacion (North Cebu)',
    stationName: 'Consolacion North Hub',
    address: 'Pitogo, Consolacion, Cebu',
    coords: { lat: 10.3776, lng: 123.9555 },
    phone: '0919-444-5555',
  },
  {
    name: 'Jojo V.',
    town: 'Carcar City (South Cebu)',
    stationName: 'Carcar Heritage Hub',
    address: 'Poblacion I, Carcar City, Cebu',
    coords: { lat: 10.1065, lng: 123.6397 },
    phone: '0920-777-8888',
  },
  {
    name: 'Bong A.',
    town: 'Danao City (North Cebu)',
    stationName: 'Danao Port Hub',
    address: 'Poblacion, Danao City, Cebu',
    coords: { lat: 10.5234, lng: 124.0253 },
    phone: '0922-333-1111',
  },
];

export const TECHNICIANS = TECHNICIANS_DATA.map((t) => t.name);

export function getTechnicianInfo(name) {
  if (!name) return null;
  const cleanName = name.toLowerCase().trim();

  // Check static list
  const found = TECHNICIANS_DATA.find(
    (t) => t.name.toLowerCase().trim() === cleanName
  );
  if (found) return found;

  // Check dynamically created mechanics from Admin
  try {
    const createdMechsRaw = localStorage.getItem('batman_created_mechanics');
    const createdMechs = createdMechsRaw ? JSON.parse(createdMechsRaw) : [];
    const matched = createdMechs.find(
      (m) => m.name.toLowerCase().trim() === cleanName
    );
    if (matched) return matched;
  } catch (_) {}

  return {
    name,
    town: 'Metro Cebu Hub',
    stationName: 'Batman Battery Station',
    coords: { lat: 10.3157, lng: 123.8854 },
    phone: '0917-000-0000',
  };
}

export const ISSUE_TYPES = {
  jumpstart: { label: 'Jumpstart', icon: '⚡' },
  replacement: { label: 'Battery replacement', icon: '🔋' },
  unsure: { label: 'Not sure / other', icon: '❓' },
};

// Cebu City center coordinates (default map center & Batman Battery Shop location)
export const CEBU_CENTER = { lat: 10.3157, lng: 123.8854 };
export const BATMAN_SHOP_LOCATION = {
  lat: 10.3157,
  lng: 123.8854,
  name: 'Batman Battery 24/7 HQ',
  address: 'Metro Cebu, Cebu City, Philippines 6000',
};
export const DEFAULT_ZOOM = 14;
