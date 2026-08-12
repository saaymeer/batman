/**
 * geocodingService.js
 * Uses OpenStreetMap Nominatim API to search locations in Cebu & Philippines
 */
export async function searchLocationSuggestions(query) {
  if (!query || query.trim().length < 2) return [];

  try {
    const searchQuery = encodeURIComponent(`${query.trim()}, Cebu, Philippines`);
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${searchQuery}&limit=5&addressdetails=1`
    );
    if (!res.ok) return [];
    const data = await res.json();
    return data.map((item) => ({
      displayName: item.display_name,
      shortName: item.name || item.display_name.split(',')[0],
      town: item.address?.city || item.address?.town || item.address?.municipality || item.address?.county || 'Metro Cebu',
      lat: parseFloat(item.lat),
      lng: parseFloat(item.lon),
    }));
  } catch (err) {
    console.warn('Geocoding search error:', err);
    return [];
  }
}
