import { useState, useEffect } from 'react';
import { subscribeToAllRequests } from '@/services/requestService';

/**
 * Subscribes to all request documents in real time.
 * @returns {{ requests: object[], loading: boolean, error: string|null }}
 */
export function useRequestsList() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let unsub;
    try {
      unsub = subscribeToAllRequests((data) => {
        setRequests(data);
        setLoading(false);
      });
    } catch (err) {
      console.error('useRequestsList error:', err);
      setError(err.message ?? 'Failed to load requests');
      setLoading(false);
    }

    return () => unsub?.();
  }, []);

  return { requests, loading, error };
}
