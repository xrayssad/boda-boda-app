// Mock real-time rider locations
// In production, this would come from your backend API with live GPS data from riders' phones

export const getNearbyRiders = (userLat, userLon, radiusKm = 2) => {
  // This function would normally call your backend API
  // For demo purposes, we return mock data based on user location
  
  // Mock riders with real-time positions (simulating moving riders)
  const allRiders = [
    { id: "R001", name: "Juma", phone: "+255 712 345 678", rating: 4.9, rides: 1245, bike: "Boxer 150cc", status: "available" },
    { id: "R002", name: "Hamisi", phone: "+255 756 789 012", rating: 4.8, rides: 982, bike: "Bajaj 125cc", status: "available" },
    { id: "R003", name: "Salim", phone: "+255 689 345 678", rating: 4.9, rides: 2156, bike: "Honda 125cc", status: "available" },
    { id: "R004", name: "Rashid", phone: "+255 745 678 901", rating: 4.7, rides: 756, bike: "TVS 110cc", status: "available" },
    { id: "R005", name: "Omar", phone: "+255 765 432 109", rating: 4.9, rides: 1892, bike: "Yamaha 150cc", status: "available" },
    { id: "R006", name: "Iddi", phone: "+255 754 321 098", rating: 4.8, rides: 1143, bike: "Suzuki 125cc", status: "available" },
    { id: "R007", name: "Kassim", phone: "+255 713 456 789", rating: 4.9, rides: 2341, bike: "Hero 110cc", status: "available" },
    { id: "R008", name: "Said", phone: "+255 768 901 234", rating: 4.7, rides: 567, bike: "Bajaj 150cc", status: "available" }
  ];
  
  // Simulate distance calculation based on user location
  // In real app, this would be calculated from actual GPS coordinates
  const ridersWithDistance = allRiders.map(ride => ({
    ...ride,
    distance: (Math.random() * radiusKm).toFixed(1),
    eta: Math.floor(Math.random() * 15) + 2,
    currentLocation: "Moving in your area"
  }));
  
  // Sort by distance and filter within radius
  return ridersWithDistance
    .filter(r => parseFloat(r.distance) <= radiusKm)
    .sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance))
    .slice(0, 10);
};

// Function to simulate real-time location updates
export const subscribeToRiderLocations = (userLat, userLon, callback, interval = 5000) => {
  // In production, this would be a WebSocket connection
  const timer = setInterval(() => {
    const nearbyRiders = getNearbyRiders(userLat, userLon);
    callback(nearbyRiders);
  }, interval);
  
  return () => clearInterval(timer);
};
