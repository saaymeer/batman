/**
 * requestService.js
 *
 * ALL Firestore reads/writes go through this file.
 * Features idempotency keys, offline queue fallback, logging telemetry,
 * and connection error handling for subscriptions.
 */

import {
  collection,
  addDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  updateDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import {
  isDemoMode,
  demoCreateRequest,
  demoSubscribeToRequest,
  demoSubscribeToAllRequests,
  demoUpdateStatus,
  demoAssignTechnician,
  demoUpdateTechnician,
  demoSubmitRating,
} from '@/utils/demo';
import { logger } from '@/utils/logger';
import { enqueueOfflineRequest, flushOfflineQueue } from './offlineQueue';

const COLLECTION = 'requests';
const requestsCol = () => collection(db, COLLECTION);
const requestDoc = (id) => doc(db, COLLECTION, id);

// Generate clientRequestId (idempotency key) if not provided
function ensureIdempotencyKey(data) {
  if (data.clientRequestId) return data.clientRequestId;
  const hashSource = `${data.customerName}-${data.customerPhone}-${data.vehicleMake}-${data.vehicleModel}`;
  return `idemp-${Math.abs(hashSource.split('').reduce((acc, char) => (acc << 5) - acc + char.charCodeAt(0), 0))}-${Date.now()}`;
}

// ── Create ───────────────────────────────────────────────

export async function createRequest(data, options = {}) {
  const clientRequestId = ensureIdempotencyKey(data);
  const payload = { ...data, clientRequestId };

  // Check if offline
  if (!navigator.onLine && !options.isOfflineSync) {
    logger.warn('Device is offline. Forwarding dispatch request to offline queue.', { clientRequestId });
    const item = enqueueOfflineRequest(payload);
    return item.tempId;
  }

  logger.info(`Initiating request creation [idempotencyKey=${clientRequestId}]`, {
    customerName: data.customerName,
    issueType: data.issueType,
  });

  if (isDemoMode()) {
    const id = await demoCreateRequest(payload);
    logger.success(`Demo request created successfully`, { id, clientRequestId });
    return id;
  }

  try {
    // Check for duplicate clientRequestId (Idempotency check)
    const existingQ = query(requestsCol(), where('clientRequestId', '==', clientRequestId));
    const existingSnap = await getDocs(existingQ);
    if (!existingSnap.empty) {
      const existingId = existingSnap.docs[0].id;
      logger.warn(`Idempotent request duplicate detected. Returning existing request ID.`, { existingId, clientRequestId });
      return existingId;
    }

    const ref = await addDoc(requestsCol(), {
      clientRequestId,
      customerName: data.customerName,
      customerPhone: data.customerPhone,
      vehicle: {
        make: data.vehicleMake,
        model: data.vehicleModel,
        plate: data.plate || '',
      },
      issueType: data.issueType,
      notes: data.notes || '',
      location: data.location || null,
      addressText: data.addressText || '',
      status: 'pending',
      assignedTechnician: null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      completedAt: null,
      rating: null,
    });

    logger.success(`Firestore request document created`, { id: ref.id, clientRequestId });
    return ref.id;
  } catch (error) {
    logger.error('Failed to create request in Firestore', { error: error.message, clientRequestId });
    // If network error occurred during creation, save to offline queue
    if (!options.isOfflineSync) {
      const item = enqueueOfflineRequest(payload);
      return item.tempId;
    }
    throw error;
  }
}

// Auto-sync listener on connection restore
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    flushOfflineQueue(createRequest);
  });
}

// ── Subscriptions (real-time) ────────────────────────────

export function subscribeToRequest(id, callback, onError) {
  logger.info(`Subscribing to request stream`, { id });
  if (isDemoMode()) return demoSubscribeToRequest(id, callback);

  return onSnapshot(
    requestDoc(id),
    (snap) => {
      if (!snap.exists()) {
        callback(null);
        return;
      }
      callback({ id: snap.id, ...snap.data() });
    },
    (err) => {
      logger.error(`Snapshot listener error for request ${id}`, { error: err.message });
      if (onError) onError(err);
    }
  );
}

export function subscribeToAllRequests(callback, onError) {
  logger.info(`Subscribing to all dispatches stream`);
  if (isDemoMode()) return demoSubscribeToAllRequests(callback);

  const q = query(requestsCol(), orderBy('createdAt', 'desc'));
  return onSnapshot(
    q,
    (snap) => {
      callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    },
    (err) => {
      logger.error(`Snapshot listener error for all requests`, { error: err.message });
      if (onError) onError(err);
    }
  );
}

// ── Update ───────────────────────────────────────────────

export async function updateRequestStatus(id, status, extra = {}) {
  logger.info(`Updating status of request ${id} to '${status}'`);
  if (isDemoMode()) return demoUpdateStatus(id, status, extra);

  const payload = { status, updatedAt: serverTimestamp(), ...extra };
  if (status === 'completed') payload.completedAt = serverTimestamp();
  await updateDoc(requestDoc(id), payload);
  logger.success(`Status updated for request ${id}`, { status });
}

export async function assignTechnician(id, technicianName) {
  logger.info(`Assigning technician '${technicianName}' to request ${id}`);
  if (isDemoMode()) return demoAssignTechnician(id, technicianName);

  await updateDoc(requestDoc(id), {
    assignedTechnician: technicianName,
    status: 'assigned',
    updatedAt: serverTimestamp(),
  });
  logger.success(`Technician assigned`, { id, technicianName });
}

export async function updateTechnician(id, technicianName) {
  logger.info(`Updating technician assignment for ${id} to '${technicianName}'`);
  if (isDemoMode()) return demoUpdateTechnician(id, technicianName);

  await updateDoc(requestDoc(id), {
    assignedTechnician: technicianName,
    updatedAt: serverTimestamp(),
  });
}

export async function submitRating(id, rating) {
  logger.info(`Submitting ${rating}-star rating for request ${id}`);
  if (isDemoMode()) return demoSubmitRating(id, rating);
  await updateDoc(requestDoc(id), { rating, updatedAt: serverTimestamp() });
}

// ── Technician real-time location ────────────────────────

export async function updateTechnicianLocation(id, { lat, lng, heading = null }) {
  if (isDemoMode()) {
    window.dispatchEvent(
      new CustomEvent('batman_demo_tech_location', { detail: { id, lat, lng, heading } })
    );
    return;
  }
  await updateDoc(requestDoc(id), {
    technicianLocation: {
      lat,
      lng,
      heading,
      updatedAt: serverTimestamp(),
    },
  });
}
