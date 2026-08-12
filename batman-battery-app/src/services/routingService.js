/**
 * routingService.js
 *
 * Uses the free Open Source Routing Machine (OSRM) API to get real turn-by-turn
 * road navigation paths, distance, and ETA travel time in minutes.
 */

export async function getRoadRoute(fromLat, fromLng, toLat, toLng) {
  if (!fromLat || !fromLng || !toLat || !toLng) return null;

  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${fromLng},${fromLat};${toLng},${toLat}?overview=full&geometries=geojson`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();

    if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
      const route = data.routes[0];
      // Leaflet Polyline expects [lat, lng], whereas GeoJSON returns [lng, lat]
      const coordinates = route.geometry.coordinates.map(([lng, lat]) => [lat, lng]);
      const durationMin = Math.max(1, Math.round(route.duration / 60));
      const distanceKm = (route.distance / 1000).toFixed(1);

      return {
        coordinates,
        durationMin,
        distanceKm,
        distanceMeters: Math.round(route.distance),
      };
    }
  } catch (err) {
    console.warn('OSRM routing fetch error (falling back to straight line):', err);
  }

  return null;
}
