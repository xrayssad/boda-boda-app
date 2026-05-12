// Fallback Tanzania locations - works even without backend
export const fallbackLocations = [
  { name: "Kariakoo", city: "Dar es Salaam", type: "market", lat: -6.8176, lon: 39.2803 },
  { name: "Posta", city: "Dar es Salaam", type: "business", lat: -6.8135, lon: 39.2868 },
  { name: "Mlimani City", city: "Dar es Salaam", type: "mall", lat: -6.7825, lon: 39.2245 },
  { name: "Ubungo", city: "Dar es Salaam", type: "terminal", lat: -6.7898, lon: 39.2065 },
  { name: "Mwenge", city: "Dar es Salaam", type: "bus stand", lat: -6.8024, lon: 39.2198 },
  { name: "Mbezi Beach", city: "Dar es Salaam", type: "beach", lat: -6.7465, lon: 39.2156 },
  { name: "Oyster Bay", city: "Dar es Salaam", type: "area", lat: -6.7803, lon: 39.2878 },
  { name: "Mikocheni", city: "Dar es Salaam", type: "residential", lat: -6.7654, lon: 39.2367 },
  { name: "Masaki", city: "Dar es Salaam", type: "beach", lat: -6.7756, lon: 39.2845 },
  { name: "Kinondoni", city: "Dar es Salaam", type: "municipal", lat: -6.7912, lon: 39.2456 },
  { name: "Temeke", city: "Dar es Salaam", type: "municipal", lat: -6.8456, lon: 39.2756 },
  { name: "Ilala", city: "Dar es Salaam", type: "municipal", lat: -6.8345, lon: 39.2654 },
  { name: "Morogoro Road", city: "Dar es Salaam", type: "road", lat: -6.8135, lon: 39.2868 },
  { name: "Samora Avenue", city: "Dar es Salaam", type: "road", lat: -6.8125, lon: 39.2858 },
  { name: "Julius Nyerere Airport", city: "Dar es Salaam", type: "airport", lat: -6.8786, lon: 39.2026 },
  { name: "Arusha City Centre", city: "Arusha", type: "city", lat: -3.3869, lon: 36.6820 },
  { name: "Stone Town", city: "Zanzibar", type: "tourist", lat: -6.1659, lon: 39.2026 },
  { name: "Mwanza City Centre", city: "Mwanza", type: "city", lat: -2.5167, lon: 32.9000 },
  { name: "Dodoma City Centre", city: "Dodoma", type: "city", lat: -6.1731, lon: 35.7410 }
];

export const searchFallbackLocations = (query) => {
  if (!query || query.length < 2) return [];
  const searchTerm = query.toLowerCase();
  return fallbackLocations
    .filter(loc => 
      loc.name.toLowerCase().includes(searchTerm) ||
      loc.city.toLowerCase().includes(searchTerm)
    )
    .slice(0, 10);
};
