/**
 * logger.js
 * 
 * Structured telemetry and event logging with traceId support.
 * Useful for monitoring dispatch lifecycle and system performance.
 */

const LOG_STORAGE_KEY = 'batman_system_telemetry_logs';
const MAX_LOGS = 100;

function getSessionTraceId() {
  let traceId = sessionStorage.getItem('batman_trace_id');
  if (!traceId) {
    traceId = `tr-${Math.random().toString(36).substring(2, 9)}-${Date.now().toString(36)}`;
    sessionStorage.setItem('batman_trace_id', traceId);
  }
  return traceId;
}

let logsMemory = [];

try {
  const saved = localStorage.getItem(LOG_STORAGE_KEY);
  if (saved) logsMemory = JSON.parse(saved);
} catch (_) {}

function persist() {
  try {
    localStorage.setItem(LOG_STORAGE_KEY, JSON.stringify(logsMemory.slice(-MAX_LOGS)));
  } catch (_) {}
}

const listeners = new Set();

function emit() {
  listeners.forEach((cb) => cb([...logsMemory]));
}

export function logEvent(level, message, meta = {}) {
  const entry = {
    id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    timestamp: new Date().toISOString(),
    traceId: meta.traceId || getSessionTraceId(),
    level, // 'info' | 'warn' | 'error' | 'success'
    message,
    meta,
  };

  logsMemory.push(entry);
  if (logsMemory.length > MAX_LOGS) {
    logsMemory = logsMemory.slice(-MAX_LOGS);
  }
  persist();
  emit();

  const formattedMsg = `[Telemetry ${entry.level.toUpperCase()}] [${entry.traceId}] ${message}`;
  if (level === 'error') console.error(formattedMsg, meta);
  else if (level === 'warn') console.warn(formattedMsg, meta);
  else console.log(formattedMsg, meta);

  return entry;
}

export const logger = {
  info: (msg, meta) => logEvent('info', msg, meta),
  warn: (msg, meta) => logEvent('warn', msg, meta),
  error: (msg, meta) => logEvent('error', msg, meta),
  success: (msg, meta) => logEvent('success', msg, meta),
};

export function subscribeToLogs(callback) {
  listeners.add(callback);
  callback([...logsMemory]);
  return () => listeners.delete(callback);
}

export function getLogs() {
  return [...logsMemory];
}

export function clearLogs() {
  logsMemory = [];
  try {
    localStorage.removeItem(LOG_STORAGE_KEY);
  } catch (_) {}
  emit();
}
