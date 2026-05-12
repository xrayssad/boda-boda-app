import axios from 'axios';

// Cache for API results to reduce calls
const apiCache = new Map();
let pendingRequest = null;

// Tanzania bounding box
const TANZANIA_BOUNDS = {
  minLat: -11.5,
  maxLat: -0.5,
  minLon: 29.0,
  maxLon: 40.5
};

// Check if coordinates are in Tanzania
const isInTanzania = (lat, lon) => {
  return lat >= TANZANIA_BOUNDS.minLat && 
         lat <= TANZANIA_BOUNDS.maxLat && 
         lon >= TANZANIA_BOUNDS.minLon && 
         lon <= TANZANIA_BOUNDS.maxLon;
};

// Direct fetch from OpenStreetMap without custom headers
export const searchRealTimeLocations = async (query) => {
  if (!query || query.length < 2) return [];
  
  // Check cache (5 minute expiry)
  const cached = apiCache.get(query);
  if (cached && (Date.now() - cached.timestamp) < 300000) {
    return cached.data;
  }
  
  // Cancel previous request
  if (pendingRequest) {
    pendingRequest.cancel();
  }
  
  try {
    const controller = new AbortController();
    pendingRequest = controller;
    
    // Use JSONP approach or simple fetch without custom headers
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)},+Tanzania&format=json&limit=10&addressdetails=1&accept-language=en`;
    
    const response = await fetch(url, {
      method: 'GET',
      signal: controller.signal,
      headers: {
        'Accept': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const data = await response.json();
    pendingRequest = null;
    
    const locations = data
      .filter(loc => {
        const lat = parseFloat(loc.lat);
        const lon = parseFloat(loc.lon);
        return isInTanzania(lat, lon);
      })
      .map(loc => ({
        name: loc.display_name.split(',')[0].trim(),
        fullAddress: loc.display_name,
        lat: parseFloat(loc.lat),
        lon: parseFloat(loc.lon),
        type: loc.type,
        category: loc.category,
        city: loc.address?.city || loc.address?.town || loc.address?.state || 'Tanzania'
      }));
    
    // Cache results
    apiCache.set(query, {
      data: locations,
      timestamp: Date.now()
    });
    
    return locations;
    
  } catch (error) {
    if (error.name === 'AbortError') {
      return [];
    }
    console.error('API Error:', error);
    return [];
  }
};

// Debounced search function
let debounceTimer;
export const debouncedRealTimeSearch = (query, callback, delay = 500) => {
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(async () => {
    const results = await searchRealTimeLocations(query);
    callback(results);
  }, delay);
};

// Preload popular locations for instant suggestions
export const getPopularLocations = () => {
  return [
    { name: "Kariakoo", city: "Dar es Salaam", type: "market", lat: -6.8176, lon: 39.2803 },
    { name: "Posta", city: "Dar es Salaam", type: "business", lat: -6.8135, lon: 39.2868 },
    { name: "Mlimani City", city: "Dar es Salaam", type: "mall", lat: -6.7825, lon: 39.2245 },
    { name: "Ubungo", city: "Dar es Salaam", type: "terminal", lat: -6.7898, lon: 39.2065 },
    { name: "Mwenge", city: "Dar es Salaam", type: "bus stand", lat: -6.8024, lon: 39.2198 },
    { name: "Mbezi Beach", city: "Dar es Salaam", type: "beach", lat: -6.7465, lon: 39.2156 },
    { name: "Arusha City Centre", city: "Arusha", type: "city", lat: -3.3869, lon: 36.6820 },
    { name: "Stone Town", city: "Zanzibar", type: "tourist", lat: -6.1659, lon: 39.2026 },
    { name: "Mwanza City Centre", city: "Mwanza", type: "city", lat: -2.5167, lon: 32.9000 },
    { name: "Dodoma City Centre", city: "Dodoma", type: "city", lat: -6.1731, lon: 35.7410 }
  ];
};
