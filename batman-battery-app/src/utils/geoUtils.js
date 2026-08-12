/**
 * geoUtils.js
 * 
 * Geographic calculations: Haversine distance, speed models, and ETA formatting.
 */

/**
 * Calculates the straight-line (Haversine) distance between two GPS points in kilometers.
 */
export function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null;
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // distance in km
}

/**
 * Estimates arrival time in minutes based on distance (km) and city traffic speed (~30 km/h)
 * with a baseline 3-minute emergency dispatch setup delay.
 */
export function estimateETA(distanceKm, averageSpeedKmH = 30) {
  if (distanceKm === null || distanceKm === undefined) return null;
  // Road factor accounts for non-straight urban road paths vs straight-line distance
  const roadDistanceKm = distanceKm * 1.35;
  const travelHours = roadDistanceKm / averageSpeedKmH;
  const travelMinutes = Math.round(travelHours * 60) + 3; // +3 mins prep
  return Math.max(2, travelMinutes);
}

/**
 * Formats distance into clean readable string (e.g. "450 m" or "3.4 km")
 */
export function formatDistance(distanceKm) {
  if (distanceKm === null || distanceKm === undefined) return 'Location unknown';
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)} m`;
  }
  return `${distanceKm.toFixed(1)} km`;
}

/**
 * Formats full ETA display string (e.g. "~12 mins away (3.4 km)")
 */
export function formatETADisplay(originCoords, destCoords) {
  if (!originCoords?.lat || !originCoords?.lng || !destCoords?.lat || !destCoords?.lng) {
    return null;
  }
  const dist = calculateHaversineDistance(
    originCoords.lat,
    originCoords.lng,
    destCoords.lat,
    destCoords.lng
  );
  if (dist === null) return null;

  const etaMins = estimateETA(dist);
  const distStr = formatDistance(dist);
  return {
    distanceKm: dist,
    etaMinutes: etaMins,
    distanceText: distStr,
    label: `~${etaMins} mins away (${distStr})`,
  };
}
