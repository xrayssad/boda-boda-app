import { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faMotorcycle, faMapMarkerAlt, faLocationDot, faUser, 
  faSignOutAlt, faStar, faHeart, faHeadset, faBell, faCog, faWallet,
  faRoute, faMoneyBillWave, faInfoCircle, faSpinner, faCheckCircle,
  faTimesCircle
} from '@fortawesome/free-solid-svg-icons';
import { searchTanzaniaLocations } from '../utils/locationSearch';
import mqttService from '../services/mqttService';

const API_URL = 'http://localhost:8000/api';

function CustomerDashboard() {
  const [pickup, setPickup] = useState('');
  const [dropoff, setDropoff] = useState('');
  const [pickupSuggestions, setPickupSuggestions] = useState([]);
  const [dropoffSuggestions, setDropoffSuggestions] = useState([]);
  const [showPickupSuggestions, setShowPickupSuggestions] = useState(false);
  const [showDropoffSuggestions, setShowDropoffSuggestions] = useState(false);
  const [isSearchingPickup, setIsSearchingPickup] = useState(false);
  const [isSearchingDropoff, setIsSearchingDropoff] = useState(false);
  const [selectedPickup, setSelectedPickup] = useState(null);
  const [selectedDropoff, setSelectedDropoff] = useState(null);
  const [distance, setDistance] = useState(null);
  const [estimatedCost, setEstimatedCost] = useState(null);
  const [nearbyRiders, setNearbyRiders] = useState([]);
  const [selectedRider, setSelectedRider] = useState(null);
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('request');
  const [customerName] = useState('John Doe');
  const [customerPhone] = useState('+255 712 345 678');
  const [notifications, setNotifications] = useState([]);
  const [mqttConnected, setMqttConnected] = useState(false);
  const navigate = useNavigate();

  const isMounted = useRef(true);
  const mqttHandlerRef = useRef(null);
  const pickupRef = useRef(null);
  const dropoffRef = useRef(null);
  // use refs for debounce timers (not let variables — those reset on every render)
  const pickupSearchTimeout = useRef(null);
  const dropoffSearchTimeout = useRef(null);

  const PRICE_PER_KM = 1500;
  const BASE_FARE = 2000;
  const MINIMUM_FARE = 3000;

  // ─── MQTT setup — runs ONCE ───────────────────────────────────
  useEffect(() => {
    isMounted.current = true;

    mqttService.connect();

   const handleRideStatus = (topic, payload) => {
  if (!isMounted.current) return;

  // ✅ Double protection: Only process status messages
  if (!topic.includes('status')) {
    console.log('❌ Customer ignoring non-status message:', topic);
    return;
  }

  console.log('📨 Customer received MQTT status:', topic, payload);

  // Rest of your code remains the same...
  const notifId = `${payload.ride_id}-${payload.status}`;

  const notification = {
    id: notifId,
    ride_id: payload.ride_id,
    status: payload.status,
    rider: payload.rider || payload.rider_name || 'a rider',
    eta: payload.eta ?? '?',
    timestamp: new Date().toLocaleTimeString(),
  };

  setNotifications((prev) => {
    if (prev.some((n) => n.id === notifId)) return prev;
    return [notification, ...prev].slice(0, 20);
  });

  if (payload.status === 'accepted') {
    setMessage(`🎉 Ride accepted! Rider ${notification.rider} is on the way. ETA: ${notification.eta} min`);
    setTimeout(() => setMessage(''), 5000);
  } else if (payload.status === 'started') {
    setMessage('🚀 Ride started! Enjoy your journey!');
    setTimeout(() => setMessage(''), 5000);
  } else if (payload.status === 'completed') {
    setMessage('✅ Ride completed! Thank you for riding with TwendeGo!');
    setTimeout(() => setMessage(''), 5000);
  }
};

    mqttHandlerRef.current = handleRideStatus;

    // ✅ Subscribe ONLY to ride/status — not the wildcard twendego/ride/#
    mqttService.subscribe('twendego/ride/status', handleRideStatus);

    const interval = setInterval(() => {
      if (isMounted.current) {
        setMqttConnected(mqttService.isConnected());
      }
    }, 5000);

    return () => {
      isMounted.current = false;
      clearInterval(interval);
      if (mqttHandlerRef.current) {
        mqttService.unsubscribe(mqttHandlerRef.current);
        mqttHandlerRef.current = null;
      }
    };
  }, []); // ✅ EMPTY — runs once only

  // ─── Click outside to close suggestions ──────────────────────
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (pickupRef.current && !pickupRef.current.contains(event.target)) {
        setShowPickupSuggestions(false);
      }
      if (dropoffRef.current && !dropoffRef.current.contains(event.target)) {
        setShowDropoffSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ─── Distance & cost calculation ─────────────────────────────
  useEffect(() => {
    if (selectedPickup?.lat && selectedDropoff?.lat) {
      const dist = calculateDistanceBetween(
        selectedPickup.lat, selectedPickup.lon,
        selectedDropoff.lat, selectedDropoff.lon
      );
      let cost = BASE_FARE + dist * PRICE_PER_KM;
      if (cost < MINIMUM_FARE) cost = MINIMUM_FARE;

      setDistance({ km: dist.toFixed(1), meters: Math.round(dist * 1000) });
      setEstimatedCost({
        amount: Math.round(cost),
        formatted: `TSh ${Math.round(cost).toLocaleString()}`,
      });
    } else {
      setDistance(null);
      setEstimatedCost(null);
    }
  }, [selectedPickup, selectedDropoff]);

  // ─── Helpers ──────────────────────────────────────────────────
  const calculateDistanceBetween = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  const searchPickupLocations = async (query) => {
    if (!query || query.length < 2) {
      setPickupSuggestions([]);
      setShowPickupSuggestions(false);
      return;
    }
    setIsSearchingPickup(true);
    try {
      const results = await searchTanzaniaLocations(query);
      setPickupSuggestions(results);
      setShowPickupSuggestions(results.length > 0);
    } catch (e) {
      setPickupSuggestions([]);
    } finally {
      setIsSearchingPickup(false);
    }
  };

  const searchDropoffLocations = async (query) => {
    if (!query || query.length < 2) {
      setDropoffSuggestions([]);
      setShowDropoffSuggestions(false);
      return;
    }
    setIsSearchingDropoff(true);
    try {
      const results = await searchTanzaniaLocations(query);
      setDropoffSuggestions(results);
      setShowDropoffSuggestions(results.length > 0);
    } catch (e) {
      setDropoffSuggestions([]);
    } finally {
      setIsSearchingDropoff(false);
    }
  };

  const handlePickupChange = (e) => {
    const value = e.target.value;
    setPickup(value);
    setSelectedPickup(null);
    clearTimeout(pickupSearchTimeout.current);
    pickupSearchTimeout.current = setTimeout(() => searchPickupLocations(value), 500);
  };

  const handleDropoffChange = (e) => {
    const value = e.target.value;
    setDropoff(value);
    setSelectedDropoff(null);
    clearTimeout(dropoffSearchTimeout.current);
    dropoffSearchTimeout.current = setTimeout(() => searchDropoffLocations(value), 500);
  };

  const selectPickup = (location) => {
    setPickup(location.name);
    setSelectedPickup(location);
    setShowPickupSuggestions(false);
    setPickupSuggestions([]);
    if (location.lat && location.lon) searchNearbyRiders(location);
  };

  const selectDropoff = (location) => {
    setDropoff(location.name);
    setSelectedDropoff(location);
    setShowDropoffSuggestions(false);
    setDropoffSuggestions([]);
  };

  const searchNearbyRiders = (location) => {
    if (!location?.lat || !location?.lon) return;
    const mockRiders = [
      { id: 'R001', name: 'Juma R.', rating: 4.9, distance: '0.5', eta: 3, bike: 'Honda 125cc' },
      { id: 'R002', name: 'Hamisi',  rating: 4.8, distance: '0.8', eta: 4, bike: 'Bajaj 150cc' },
      { id: 'R003', name: 'Salim',   rating: 4.9, distance: '1.2', eta: 6, bike: 'Boxer 150cc' },
    ];
    setNearbyRiders(mockRiders);
    setSelectedRider(mockRiders[0]);
  };

  // ─── Request ride ─────────────────────────────────────────────
  const requestRide = async () => {
    if (!selectedPickup || !selectedDropoff) {
      setMessage('Please select both pickup and dropoff locations');
      setTimeout(() => setMessage(''), 3000);
      return;
    }
    if (!selectedRider) {
      setMessage('No riders available nearby. Please try again.');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    setIsSubmitting(true);
    try {
      const rideData = {
        pickup_location:  selectedPickup.name,
        dropoff_location: selectedDropoff.name,
        pickup_lat:       selectedPickup.lat,
        pickup_lon:       selectedPickup.lon,
        dropoff_lat:      selectedDropoff.lat,
        dropoff_lon:      selectedDropoff.lon,
        distance_km:      parseFloat(distance.km),
        estimated_cost:   estimatedCost.amount,
        customer_name:    customerName,
        customer_phone:   customerPhone,
      };

      // Backend saves ride AND publishes MQTT to riders
      const response = await axios.post(`${API_URL}/request-ride/`, rideData);

      if (response.data.success) {
        setMessage('✅ Ride requested! Waiting for a rider to accept...');

        // Add a local "requested" notification immediately
        const notifId = `${response.data.ride_id}-requested`;
        setNotifications((prev) => {
          if (prev.some((n) => n.id === notifId)) return prev;
          return [
            {
              id: notifId,
              ride_id: response.data.ride_id,
              status: 'requested',
              timestamp: new Date().toLocaleTimeString(),
            },
            ...prev,
          ].slice(0, 20);
        });

        // Reset form
        setPickup('');
        setDropoff('');
        setSelectedPickup(null);
        setSelectedDropoff(null);
        setSelectedRider(null);
        setNearbyRiders([]);
        setDistance(null);
        setEstimatedCost(null);

        setTimeout(() => setMessage(''), 5000);
      }
    } catch (error) {
      console.error('Error requesting ride:', error);
      setMessage('Error requesting ride. Please try again.');
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const clearNotification = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const handleLogout = () => navigate('/');

  const isRequestButtonActive = selectedPickup && selectedDropoff && selectedRider && !isSubmitting;

  const menuItems = [
    { id: 'request',   icon: faMotorcycle, label: 'Request Ride', description: 'Get a ride now'      },
    { id: 'favorites', icon: faHeart,      label: 'Favorites',    description: 'Saved places'        },
    { id: 'wallet',    icon: faWallet,     label: 'Wallet',       description: 'Balance & payments'  },
    { id: 'support',   icon: faHeadset,    label: 'Support',      description: '24/7 help'           },
    { id: 'profile',   icon: faUser,       label: 'Profile',      description: 'Your info'           },
    { id: 'settings',  icon: faCog,        label: 'Settings',     description: 'Preferences'         },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-80 bg-white border-r-2 border-gray-100 shadow-lg fixed h-full overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-8 pb-6 border-b-2 border-gray-100">
            <img
              src="/images/logo.png"
              alt="TwendeGo"
              className="h-10 w-auto"
              onError={(e) => (e.target.style.display = 'none')}
            />
            <div>
              <span className="text-xl font-bold text-[#1E3A8A]">TwendeGo</span>
              <p className="text-xs text-gray-500">Ride Fast. Ride Easy.</p>
            </div>
          </div>

          <div className="mb-6 p-4 bg-blue-50 rounded-2xl">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-[#1E3A8A] rounded-full flex items-center justify-center">
                <FontAwesomeIcon icon={faUser} className="text-white text-sm" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Welcome back,</p>
                <p className="text-sm font-bold text-[#1E3A8A]">{customerName} 👋</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <div className={`w-2 h-2 rounded-full ${mqttConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
              <span>{mqttConnected ? 'MQTT Connected' : 'MQTT Connecting...'}</span>
            </div>
          </div>

          <nav className="space-y-1">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full text-left px-4 py-2.5 rounded-xl transition-all duration-200 ${
                  activeTab === item.id
                    ? 'bg-[#1E3A8A] text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <FontAwesomeIcon icon={item.icon} className="text-sm" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold">{item.label}</p>
                    <p className={`text-xs ${activeTab === item.id ? 'text-blue-200' : 'text-gray-400'}`}>
                      {item.description}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </nav>

          <button
            onClick={handleLogout}
            className="w-full mt-6 px-4 py-2.5 rounded-xl bg-red-50 text-red-600 hover:bg-red-500 hover:text-white transition flex items-center justify-center gap-2 text-sm font-semibold"
          >
            <FontAwesomeIcon icon={faSignOutAlt} /> Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 ml-80">
        {/* Header */}
        <div className="bg-white border-b-2 border-gray-100 sticky top-0 z-10 shadow-sm">
          <div className="px-8 py-4 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-[#1E3A8A]">Request Ride 🏍️</h1>
              <p className="text-sm text-gray-500 mt-1">Real-time ride tracking with MQTT</p>
            </div>
            <div className="relative">
              <FontAwesomeIcon
                icon={faBell}
                className="text-xl text-gray-400 hover:text-[#1E3A8A] cursor-pointer"
              />
              {notifications.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                  {notifications.length}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Notifications Panel */}
        {notifications.length > 0 && (
          <div className="fixed top-16 right-4 w-80 z-50 space-y-2">
            {notifications.slice(0, 5).map((notif) => (
              <div
                key={notif.id}
                className="bg-white rounded-lg shadow-lg border-l-4 border-[#1E3A8A] p-3 animate-slideIn"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-[#1E3A8A]">
                      {notif.status === 'accepted'  && '✅ Ride Accepted'}
                      {notif.status === 'started'   && '🚀 Ride Started'}
                      {notif.status === 'completed' && '🏁 Ride Completed'}
                      {notif.status === 'requested' && '📢 Ride Requested'}
                    </p>
                    <p className="text-sm mt-1">
                      {notif.status === 'accepted'  && `Rider ${notif.rider} accepted your ride! ETA: ${notif.eta} min`}
                      {notif.status === 'started'   && 'Your ride has started!'}
                      {notif.status === 'completed' && 'Ride completed! Thank you!'}
                      {notif.status === 'requested' && 'Searching for a rider...'}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">{notif.timestamp}</p>
                  </div>
                  <button onClick={() => clearNotification(notif.id)} className="text-gray-400 hover:text-gray-600">
                    <FontAwesomeIcon icon={faTimesCircle} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="p-8">
          <div className="bg-white rounded-2xl border-2 border-gray-100 shadow-lg p-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-[#1E3A8A] mb-2">Where are you going? 🏍️</h2>
              <p className="text-gray-500 text-sm">Search for streets, areas, or landmarks</p>
            </div>

            <div className="space-y-4">
              {/* Pickup */}
              <div ref={pickupRef} className="relative">
                <label className="block text-xs font-semibold text-gray-600 mb-1">📍 Pickup Location</label>
                <div className="relative">
                  <FontAwesomeIcon icon={faMapMarkerAlt} className="absolute left-3 top-2.5 text-gray-400 text-sm" />
                  <input
                    type="text"
                    placeholder="Search for streets or areas..."
                    value={pickup}
                    onChange={handlePickupChange}
                    className="w-full pl-9 pr-8 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#1E3A8A] transition text-sm"
                    autoComplete="off"
                  />
                  {isSearchingPickup && (
                    <FontAwesomeIcon icon={faSpinner} className="absolute right-2 top-2.5 text-gray-400 animate-spin text-sm" />
                  )}
                </div>
                {showPickupSuggestions && pickupSuggestions.length > 0 && (
                  <div className="absolute z-20 w-full mt-1 bg-white border-2 border-gray-100 rounded-lg shadow-lg max-h-56 overflow-y-auto">
                    {pickupSuggestions.map((loc, idx) => (
                      <button
                        key={`pickup-${idx}-${loc.name}`}
                        onClick={() => selectPickup(loc)}
                        className="w-full text-left px-3 py-2 hover:bg-gray-50 transition flex items-center gap-2 border-b border-gray-50"
                      >
                        <FontAwesomeIcon icon={faMapMarkerAlt} className="text-[#1E3A8A] text-xs" />
                        <div className="flex-1">
                          <p className="text-xs font-semibold text-gray-800">{loc.name}</p>
                          <p className="text-[10px] text-gray-500">{loc.type}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Dropoff */}
              <div ref={dropoffRef} className="relative">
                <label className="block text-xs font-semibold text-gray-600 mb-1">🎯 Destination</label>
                <div className="relative">
                  <FontAwesomeIcon icon={faLocationDot} className="absolute left-3 top-2.5 text-gray-400 text-sm" />
                  <input
                    type="text"
                    placeholder="Search for destinations..."
                    value={dropoff}
                    onChange={handleDropoffChange}
                    className="w-full pl-9 pr-8 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#1E3A8A] transition text-sm"
                    autoComplete="off"
                  />
                  {isSearchingDropoff && (
                    <FontAwesomeIcon icon={faSpinner} className="absolute right-2 top-2.5 text-gray-400 animate-spin text-sm" />
                  )}
                </div>
                {showDropoffSuggestions && dropoffSuggestions.length > 0 && (
                  <div className="absolute z-20 w-full mt-1 bg-white border-2 border-gray-100 rounded-lg shadow-lg max-h-56 overflow-y-auto">
                    {dropoffSuggestions.map((loc, idx) => (
                      <button
                        key={`dropoff-${idx}-${loc.name}`}
                        onClick={() => selectDropoff(loc)}
                        className="w-full text-left px-3 py-2 hover:bg-gray-50 transition flex items-center gap-2 border-b border-gray-50"
                      >
                        <FontAwesomeIcon icon={faLocationDot} className="text-[#1E3A8A] text-xs" />
                        <div className="flex-1">
                          <p className="text-xs font-semibold text-gray-800">{loc.name}</p>
                          <p className="text-[10px] text-gray-500">{loc.type}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Nearby Riders */}
              {selectedPickup && (
                <div className="mt-4">
                  <label className="block text-xs font-semibold text-gray-600 mb-2">
                    🏍️ Nearby Riders near {selectedPickup.name}
                  </label>
                  {nearbyRiders.length === 0 ? (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
                      <p className="text-sm text-yellow-700">No riders found nearby. Please try again.</p>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {nearbyRiders.map((rider) => (
                        <div
                          key={rider.id}
                          onClick={() => setSelectedRider(rider)}
                          className={`border-2 rounded-lg p-3 cursor-pointer transition-all ${
                            selectedRider?.id === rider.id
                              ? 'border-[#1E3A8A] bg-blue-50'
                              : 'border-gray-200 hover:border-[#1E3A8A]/50 hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                <FontAwesomeIcon icon={faMotorcycle} className="text-[#1E3A8A]" />
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <p className="font-semibold text-gray-800">{rider.name}</p>
                                  <div className="flex items-center gap-1">
                                    <FontAwesomeIcon icon={faStar} className="text-yellow-500 text-xs" />
                                    <span className="text-xs font-semibold">{rider.rating}</span>
                                  </div>
                                </div>
                                <div className="flex items-center gap-3 mt-1">
                                  <span className="text-xs text-gray-500">{rider.distance} km away</span>
                                  <span className="text-xs text-green-600">ETA: {rider.eta} min</span>
                                </div>
                              </div>
                            </div>
                            {selectedRider?.id === rider.id && (
                              <FontAwesomeIcon icon={faCheckCircle} className="text-green-500 text-lg" />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Distance & Cost */}
              {selectedPickup && selectedDropoff && distance && estimatedCost && (
                <div className="bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-200 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1">
                      <FontAwesomeIcon icon={faRoute} className="text-[#1E3A8A] text-xs" />
                      <span className="text-xs font-semibold">Distance:</span>
                    </div>
                    <span className="text-sm font-bold text-[#1E3A8A]">{distance.km} km</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <FontAwesomeIcon icon={faMoneyBillWave} className="text-green-600 text-xs" />
                      <span className="text-xs font-semibold">Estimated Cost:</span>
                    </div>
                    <span className="text-base font-bold text-green-600">{estimatedCost.formatted}</span>
                  </div>
                </div>
              )}

              {/* Request Button */}
              <div className="flex justify-center mt-2">
                <button
                  onClick={requestRide}
                  disabled={!isRequestButtonActive}
                  className={`inline-flex items-center gap-2 font-semibold py-2 px-5 rounded-lg transition text-sm ${
                    isRequestButtonActive
                      ? 'bg-[#1E3A8A] hover:bg-[#1E3A8A]/90 text-white'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <FontAwesomeIcon icon={faMotorcycle} />
                      {selectedPickup && selectedDropoff && selectedRider
                        ? `Request ${selectedRider.name} (ETA: ${selectedRider.eta} min)`
                        : selectedPickup && selectedDropoff
                        ? 'Select a rider first'
                        : 'Select pickup and dropoff'}
                    </>
                  )}
                </button>
              </div>

              {message && (
                <div className="p-2 bg-green-50 border border-green-100 rounded-lg">
                  <p className="text-xs text-green-700 text-center">{message}</p>
                </div>
              )}
            </div>

            {/* Info Box */}
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <div className="flex items-start gap-2">
                <FontAwesomeIcon icon={faInfoCircle} className="text-[#1E3A8A] text-sm mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-[#1E3A8A] mb-0.5">Real-time MQTT Updates</p>
                  <p className="text-[10px] text-gray-600">
                    When a rider accepts your ride, you'll receive an instant notification. No page refresh needed!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }s
        }
        .animate-slideIn { animation: slideIn 0.3s ease-out; }
      `}</style>
    </div>
  );
}

export default CustomerDashboard;