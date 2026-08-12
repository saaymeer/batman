/**
 * demo.js
 *
 * Demo mode data and utilities.
 * Active when Firebase credentials are not configured (placeholder values).
 * Simulates real-time Firestore behaviour with localStorage + setInterval.
 */

// ── Detection ─────────────────────────────────────────────

const PLACEHOLDER_KEY = 'your-api-key-here';

export function isDemoMode() {
  return (
    !import.meta.env.VITE_FIREBASE_API_KEY ||
    import.meta.env.VITE_FIREBASE_API_KEY === PLACEHOLDER_KEY
  );
}

// ── Demo credentials ──────────────────────────────────────

export const DEMO_EMAIL = 'admin@batmanbattery.ph';
export const DEMO_PASSWORD = 'batman247';

// ── Demo request data ─────────────────────────────────────

const now = () => new Date();
const minutesAgo = (n) => new Date(Date.now() - n * 60 * 1000);

const INITIAL_REQUESTS = [
  {
    id: 'demo-001',
    customerName: 'Juan dela Cruz',
    customerPhone: '09171234567',
    vehicle: { make: 'Toyota', model: 'Vios', plate: 'ABC 1234' },
    issueType: 'jumpstart',
    notes: 'Near SM City Cebu Gate 2, under the overpass',
    location: { lat: 10.3119, lng: 123.9180, accuracy: 10 },
    addressText: 'SM City Cebu Gate 2',
    status: 'pending',
    assignedTechnician: null,
    createdAt: { toDate: () => minutesAgo(3) },
    updatedAt: { toDate: () => minutesAgo(3) },
    completedAt: null,
    rating: null,
  },
  {
    id: 'demo-002',
    customerName: 'Maria Santos',
    customerPhone: '09281234567',
    vehicle: { make: 'Honda', model: 'City', plate: 'XYZ 5678' },
    issueType: 'replacement',
    notes: 'Battery completely dead, car wont start at all',
    location: { lat: 10.3310, lng: 123.9069, accuracy: 15 },
    addressText: 'Ayala Center Cebu Parking',
    status: 'en_route',
    assignedTechnician: 'Rico M.',
    createdAt: { toDate: () => minutesAgo(25) },
    updatedAt: { toDate: () => minutesAgo(10) },
    completedAt: null,
    rating: null,
  },
  {
    id: 'demo-003',
    customerName: 'Roberto Tan',
    customerPhone: '09091234567',
    vehicle: { make: 'Mitsubishi', model: 'Montero', plate: 'DEF 9012' },
    issueType: 'unsure',
    notes: '',
    location: { lat: 10.2931, lng: 123.8993, accuracy: 20 },
    addressText: 'Talisay City Hall area',
    status: 'completed',
    assignedTechnician: 'Jun D.',
    createdAt: { toDate: () => minutesAgo(90) },
    updatedAt: { toDate: () => minutesAgo(20) },
    completedAt: { toDate: () => minutesAgo(20) },
    rating: 5,
  },
  {
    id: 'demo-004',
    customerName: 'Liza Reyes',
    customerPhone: '09171112222',
    vehicle: { make: 'Suzuki', model: 'Jimny', plate: 'GHI 3456' },
    issueType: 'jumpstart',
    notes: 'First time this happened, not sure what to do',
    location: { lat: 10.3497, lng: 123.9107, accuracy: 12 },
    addressText: 'Near Mandaue City Hall',
    status: 'assigned',
    assignedTechnician: 'Mark T.',
    createdAt: { toDate: () => minutesAgo(12) },
    updatedAt: { toDate: () => minutesAgo(5) },
    completedAt: null,
    rating: null,
  },
];

// ── In-memory store (acts like Firestore) ─────────────────

const STORAGE_KEY = 'batman_demo_requests';

function loadRequests() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Rehydrate date objects
      return parsed.map((r) => ({
        ...r,
        createdAt: { toDate: () => new Date(r._createdAt) },
        updatedAt: { toDate: () => new Date(r._updatedAt) },
        completedAt: r._completedAt
          ? { toDate: () => new Date(r._completedAt) }
          : null,
      }));
    }
  } catch (_) {}
  return INITIAL_REQUESTS;
}

function saveRequests(requests) {
  try {
    const serialized = requests.map((r) => ({
      ...r,
      _createdAt: r.createdAt?.toDate?.()?.toISOString() ?? new Date().toISOString(),
      _updatedAt: r.updatedAt?.toDate?.()?.toISOString() ?? new Date().toISOString(),
      _completedAt: r.completedAt?.toDate?.()?.toISOString() ?? null,
    }));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(serialized));
  } catch (_) {}
}

let _requests = loadRequests();
const _listeners = new Set();

function notify() {
  _listeners.forEach((cb) => cb([..._requests]));
}

// ── Demo service API (mirrors requestService.js) ──────────

export function demoSubscribeToAllRequests(callback) {
  _listeners.add(callback);
  callback([..._requests]);
  return () => _listeners.delete(callback);
}

export function demoSubscribeToRequest(id, callback) {
  const handler = (list) => {
    const found = list.find((r) => r.id === id) ?? null;
    callback(found);
  };
  _listeners.add(handler);
  handler(_requests);
  return () => _listeners.delete(handler);
}

export async function demoCreateRequest(data) {
  if (data.clientRequestId) {
    const existing = _requests.find((r) => r.clientRequestId === data.clientRequestId);
    if (existing) return existing.id;
  }

  const id = `demo-${Date.now()}`;
  const ts = { toDate: () => now() };
  const req = {
    id,
    clientRequestId: data.clientRequestId || `idemp-${Date.now()}`,
    customerName: data.customerName,
    customerPhone: data.customerPhone,
    vehicle: { make: data.vehicleMake, model: data.vehicleModel, plate: data.plate },
    issueType: data.issueType,
    notes: data.notes || '',
    location: data.location || null,
    addressText: data.addressText || '',
    status: 'pending',
    assignedTechnician: null,
    createdAt: ts,
    updatedAt: ts,
    completedAt: null,
    rating: null,
  };
  _requests = [req, ..._requests];
  saveRequests(_requests);
  notify();
  return id;
}

export async function demoUpdateStatus(id, status, extra = {}) {
  _requests = _requests.map((r) => {
    if (r.id !== id) return r;
    const ts = { toDate: () => now() };
    return {
      ...r,
      status,
      updatedAt: ts,
      completedAt: status === 'completed' ? ts : r.completedAt,
      ...extra,
    };
  });
  saveRequests(_requests);
  notify();
}

export async function demoAssignTechnician(id, technicianName) {
  _requests = _requests.map((r) => {
    if (r.id !== id) return r;
    const ts = { toDate: () => now() };
    return { ...r, status: 'assigned', assignedTechnician: technicianName, updatedAt: ts };
  });
  saveRequests(_requests);
  notify();
}

export async function demoUpdateTechnician(id, technicianName) {
  _requests = _requests.map((r) => {
    if (r.id !== id) return r;
    const ts = { toDate: () => now() };
    return { ...r, assignedTechnician: technicianName, updatedAt: ts };
  });
  saveRequests(_requests);
  notify();
}

export async function demoSubmitRating(id, rating) {
  _requests = _requests.map((r) => {
    if (r.id !== id) return r;
    return { ...r, rating };
  });
  saveRequests(_requests);
  notify();
}

export function demoResetData() {
  localStorage.removeItem(STORAGE_KEY);
  _requests = INITIAL_REQUESTS;
  notify();
}
