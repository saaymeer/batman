import { useState, useEffect } from 'react';
import { CEBU_CENTER } from '@/utils/statusConfig';

/**
 * Wraps navigator.geolocation.getCurrentPosition.
 * @returns {{ coords: {lat, lng, accuracy}|null, error: string|null, loading: boolean, retry: () => void }}
 */
export function useGeolocation() {
  const [coords, setCoords] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const id = navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        });
        setLoading(false);
      },
      (err) => {
        let msg = 'Unable to get your location.';
        if (err.code === err.PERMISSION_DENIED) {
          msg = 'Location access denied. Please drag the pin to your location.';
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          msg = 'Location unavailable. Please drag the pin to your location.';
        } else if (err.code === err.TIMEOUT) {
          msg = 'Location request timed out. Please drag the pin to your location.';
        }
        setError(msg);
        setLoading(false);
        // Fallback to Cebu center
        setCoords({ lat: CEBU_CENTER.lat, lng: CEBU_CENTER.lng, accuracy: null });
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );

    return () => {
      if (typeof id === 'number') navigator.geolocation.clearWatch(id);
    };
  }, [attempt]);

  const retry = () => setAttempt((n) => n + 1);

  return { coords, error, loading, retry };
}
