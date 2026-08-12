import { useState, useEffect } from 'react';
import { subscribeToRequest } from '@/services/requestService';

/**
 * Subscribes to a single request document in real time.
 * @param {string|undefined} id
 * @returns {{ request: object|null, loading: boolean, error: string|null }}
 */
export function useRequest(id) {
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);

    let unsub;
    try {
      unsub = subscribeToRequest(id, (data) => {
        setRequest(data);
        setLoading(false);
      });
    } catch (err) {
      console.error('useRequest error:', err);
      setError(err.message ?? 'Failed to load request');
      setLoading(false);
    }

    return () => unsub?.();
  }, [id]);

  return { request, loading, error };
}
