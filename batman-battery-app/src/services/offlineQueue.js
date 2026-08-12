/**
 * offlineQueue.js
 * 
 * Manages pending dispatches queued when network is offline,
 * automatically syncing them to Firestore / Demo Store upon network reconnection.
 */

import { logger } from '@/utils/logger';

const QUEUE_KEY = 'batman_offline_request_queue';

function getQueue() {
  try {
    const raw = localStorage.getItem(QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    logger.error('Failed to read offline queue from storage', { error: err.message });
    return [];
  }
}

function saveQueue(queue) {
  try {
    localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
    notify();
  } catch (err) {
    logger.error('Failed to save offline queue to storage', { error: err.message });
  }
}

const listeners = new Set();

function notify() {
  const current = getQueue();
  listeners.forEach((cb) => cb(current));
}

let isSyncing = false;

export function enqueueOfflineRequest(requestData) {
  const queue = getQueue();
  const id = `offline-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  const item = {
    tempId: id,
    data: requestData,
    queuedAt: new Date().toISOString(),
    attempts: 0,
  };
  queue.push(item);
  saveQueue(queue);

  logger.warn(`Device offline. Request queued locally`, { tempId: id, name: requestData.customerName });
  return item;
}

export function getOfflineQueue() {
  return getQueue();
}

export function removeOfflineItem(tempId) {
  const queue = getQueue().filter((item) => item.tempId !== tempId);
  saveQueue(queue);
}

export function subscribeToOfflineQueue(callback) {
  listeners.add(callback);
  callback(getQueue());
  return () => listeners.delete(callback);
}

/**
 * Flush and auto-sync queued items when internet connection returns.
 * Takes a processor callback (e.g. createRequest implementation).
 */
export async function flushOfflineQueue(processFn) {
  if (isSyncing || !navigator.onLine) return;
  const queue = getQueue();
  if (queue.length === 0) return;

  isSyncing = true;
  logger.info(`Flushing offline queue (${queue.length} items)...`);

  const remaining = [];

  for (const item of queue) {
    try {
      logger.info(`Syncing queued request ${item.tempId}...`, { data: item.data });
      const realId = await processFn(item.data, { isOfflineSync: true });
      logger.success(`Queued request synced successfully!`, { tempId: item.tempId, realId });

      // Dispatch window event so tracking pages can update their active ID if needed
      window.dispatchEvent(
        new CustomEvent('batman_offline_synced', {
          detail: { tempId: item.tempId, realId },
        })
      );
    } catch (err) {
      logger.error(`Failed to sync queued request ${item.tempId}`, { error: err.message });
      item.attempts += 1;
      if (item.attempts < 5) {
        remaining.push(item);
      }
    }
  }

  saveQueue(remaining);
  isSyncing = false;
}

// Auto-listen for network online event
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    logger.info('Network connection restored (online)');
    window.dispatchEvent(new CustomEvent('batman_network_status_change', { detail: { online: true } }));
  });

  window.addEventListener('offline', () => {
    logger.warn('Network connection lost (offline)');
    window.dispatchEvent(new CustomEvent('batman_network_status_change', { detail: { online: false } }));
  });
}
