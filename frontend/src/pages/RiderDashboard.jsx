import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faMotorcycle, faList, faMoneyBillWave, faUser, faSignOutAlt, 
  faMapMarkerAlt, faLocationDot, faCheck, faStar, 
  faChartLine, faHistory, faHeadset, faCog, faBell,
  faSpinner, faTrash, faPhone, faUserCircle, faTimesCircle
} from '@fortawesome/free-solid-svg-icons';
import mqttService from '../services/mqttService';

const API_URL = 'http://localhost:8000/api';

function RiderDashboard() {
  const [rides, setRides] = useState([]);
  const [activeTab, setActiveTab] = useState('requests');
  const [loading, setLoading] = useState(false);
  const [submittingId, setSubmittingId] = useState(null);
  const [message, setMessage] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [riderName] = useState('Juma R.');
  const [riderPhone] = useState('+255 756 789 012');
  const [mqttConnected, setMqttConnected] = useState(false);
  const navigate = useNavigate();

  const isMounted = useRef(true);
  const mqttHandlerRef = useRef(null);
  const activeTabRef = useRef('requests');

  useEffect(() => {
    activeTabRef.current = activeTab;
  }, [activeTab]);

  // ─── Data fetching ────────────────────────────────────────────
  const fetchPendingRides = useCallback(async () => {
    if (!isMounted.current) return;
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/rides/pending/`);
      if (isMounted.current && response.data.success) {
        setRides(response.data.rides);
      } else if (isMounted.current) {
        setRides([]);
      }
    } catch (error) {
      console.error('Error fetching rides:', error);
      if (isMounted.current) setRides([]);
    } finally {
      if (isMounted.current) setLoading(false);
    }
  }, []);

  const fetchAllRides = useCallback(async () => {
    if (!isMounted.current) return;
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/rides/`);
      if (isMounted.current && response.data.success) {
        setRides(response.data.rides);
      } else if (isMounted.current) {
        setRides([]);
      }
    } catch (error) {
      console.error('Error fetching rides:', error);
      if (isMounted.current) setRides([]);
    } finally {
      if (isMounted.current) setLoading(false);
    }
  }, []);

  // ─── Tab switching ────────────────────────────────────────────
  useEffect(() => {
    if (activeTab === 'requests') fetchPendingRides();
    else if (activeTab === 'history') fetchAllRides();
  }, [activeTab, fetchPendingRides, fetchAllRides]);

  // ─── MQTT — runs ONCE ─────────────────────────────────────────
  useEffect(() => {
    isMounted.current = true;
    mqttService.connect();

    const handleMQTTMessage = (topic, payload) => {
      if (!isMounted.current) return;
      console.log(`📨 Rider received MQTT on ${topic}:`, payload);

      if (topic === 'twendego/ride/request' && payload.status === 'requested') {
        const customerName = payload.customer_name || 'customer';
        const notifId = `${payload.ride_id}-requested`;

        // ✅ Add popup notification
        const notification = {
          id: notifId,
          ride_id: payload.ride_id,
          status: 'requested',
          customer: customerName,
          pickup: payload.pickup_location,
          dropoff: payload.dropoff_location,
          fare: payload.estimated_cost,
          timestamp: new Date().toLocaleTimeString(),
        };

        setNotifications(prev => {
          if (prev.some(n => n.id === notifId)) return prev;
          return [notification, ...prev].slice(0, 10);
        });

        setMessage(`🔔 New ride request from ${customerName}!`);
        setTimeout(() => setMessage(''), 5000);

        if (activeTabRef.current === 'requests') {
          fetchPendingRides();
        }
      }
    };

    mqttHandlerRef.current = handleMQTTMessage;
    mqttService.subscribe('twendego/ride/request', handleMQTTMessage);

    const interval = setInterval(() => {
      if (isMounted.current) setMqttConnected(mqttService.isConnected());
    }, 5000);

    fetchPendingRides();

    return () => {
      isMounted.current = false;
      clearInterval(interval);
      if (mqttHandlerRef.current) {
        mqttService.unsubscribe(mqttHandlerRef.current);
        mqttHandlerRef.current = null;
      }
    };
  }, []); // ✅ EMPTY

  // ─── Actions ──────────────────────────────────────────────────
  const acceptRide = async (rideId) => {
    setSubmittingId(rideId);
    try {
      await axios.put(`${API_URL}/rides/${rideId}/accept/`, {
        rider_name: riderName,
        rider_phone: riderPhone,
        eta: 7,
      });

      // Remove notification for this ride
      setNotifications(prev => prev.filter(n => n.ride_id !== rideId));

      fetchPendingRides();
      setMessage(`✅ Ride #${rideId} accepted! Customer notified.`);
      setTimeout(() => setMessage(''), 4000);
    } catch (error) {
      console.error('Error accepting ride:', error);
      setMessage('❌ Failed to accept ride. Please try again.');
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setSubmittingId(null);
    }
  };

  const cancelRide = async (rideId) => {
    if (!confirm('Je, una uhakika unataka kufuta ombi hili la safari?')) return;
    setSubmittingId(rideId);
    try {
      await axios.put(`${API_URL}/rides/${rideId}/cancel/`);
      setNotifications(prev => prev.filter(n => n.ride_id !== rideId));
      fetchPendingRides();
      setMessage(`✅ Ride #${rideId} cancelled.`);
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error cancelling ride:', error);
      setMessage('❌ Failed to cancel ride.');
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setSubmittingId(null);
    }
  };

  const clearNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const handleLogout = () => navigate('/');

  const menuItems = [
    { id: 'requests', icon: faList,          label: 'Available Requests', description: 'View pending ride requests' },
    { id: 'earnings', icon: faMoneyBillWave,  label: 'Earnings',           description: 'Your daily/weekly earnings' },
    { id: 'history',  icon: faHistory,        label: 'Ride History',       description: 'All completed rides' },
    { id: 'stats',    icon: faChartLine,      label: 'Statistics',         description: 'Your performance' },
    { id: 'support',  icon: faHeadset,        label: 'Support',            description: 'Get help' },
    { id: 'profile',  icon: faUser,           label: 'Profile',            description: 'Your information' },
    { id: 'settings', icon: faCog,            label: 'Settings',           description: 'Preferences' },
  ];

  const earnings = [
    { period: 'Today',      amount: '45,000',  rides: 6   },
    { period: 'This Week',  amount: '245,000', rides: 32  },
    { period: 'This Month', amount: '892,000', rides: 118 },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-80 bg-white border-r-2 border-gray-100 shadow-lg fixed h-full overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-8 pb-6 border-b-2 border-gray-100">
            <img src="/images/logo.png" alt="TwendeGo" className="h-10 w-auto"
              onError={(e) => (e.target.style.display = 'none')} />
            <div>
              <span className="text-xl font-bold text-[#1E3A8A]">TwendeGo</span>
              <p className="text-xs text-gray-500">Rider Partner</p>
            </div>
          </div>

          <div className="mb-6 p-4 bg-green-50 rounded-2xl">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                <FontAwesomeIcon icon={faMotorcycle} className="text-white text-sm" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Welcome back,</p>
                <p className="text-sm font-bold text-green-700">{riderName} 👋</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-green-600">Online - Ready for rides</span>
            </div>
            <div className="flex items-center gap-2 text-xs mt-2">
              <div className={`w-2 h-2 rounded-full ${mqttConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className={mqttConnected ? 'text-green-600' : 'text-red-600'}>
                {mqttConnected ? 'MQTT Connected' : 'MQTT Connecting...'}
              </span>
            </div>
          </div>

          <nav className="space-y-1">
            {menuItems.map((item) => (
              <button key={item.id} onClick={() => setActiveTab(item.id)}
                className={`w-full text-left px-4 py-2.5 rounded-xl transition-all duration-200 ${
                  activeTab === item.id ? 'bg-[#1E3A8A] text-white shadow-md' : 'text-gray-600 hover:bg-gray-50'
                }`}>
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

          <button onClick={handleLogout}
            className="w-full mt-6 px-4 py-2.5 rounded-xl bg-red-50 text-red-600 hover:bg-red-500 hover:text-white transition flex items-center justify-center gap-2 text-sm font-semibold">
            <FontAwesomeIcon icon={faSignOutAlt} /> Logout
          </button>
        </div>
      </div>

      {/* ── Popup Notifications (top-right) ── */}
      {notifications.length > 0 && (
        <div className="fixed top-16 right-4 w-80 z-50 space-y-2">
          {notifications.slice(0, 5).map(notif => (
            <div key={notif.id}
              className="bg-white rounded-lg shadow-lg border-l-4 border-green-500 p-3 animate-slideIn">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <p className="text-xs font-semibold text-green-700">
                    🔔 New Ride Request!
                  </p>
                  <p className="text-sm mt-1 font-medium">
                    {notif.customer} needs a ride
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    📍 {notif.pickup} → {notif.dropoff}
                  </p>
                  {notif.fare && (
                    <p className="text-xs font-bold text-[#1E3A8A] mt-0.5">
                      TSh {parseInt(notif.fare).toLocaleString()}
                    </p>
                  )}
                  <p className="text-xs text-gray-400 mt-1">{notif.timestamp}</p>
                </div>
                <button onClick={() => clearNotification(notif.id)}
                  className="text-gray-400 hover:text-gray-600 ml-2">
                  <FontAwesomeIcon icon={faTimesCircle} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 ml-80">
        <div className="bg-white border-b-2 border-gray-100 sticky top-0 z-10 shadow-sm">
          <div className="px-8 py-4 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-[#1E3A8A]">
                {activeTab === 'requests' && 'Available Ride Requests 📋'}
                {activeTab === 'earnings' && 'My Earnings 💰'}
                {activeTab === 'history'  && 'Ride History 📜'}
                {activeTab === 'stats'    && 'Statistics 📊'}
                {activeTab === 'support'  && 'Support 💬'}
                {activeTab === 'profile'  && 'My Profile 👤'}
                {activeTab === 'settings' && 'Settings ⚙️'}
              </h1>
              <p className="text-sm text-gray-500 mt-1">Real-time ride requests via MQTT</p>
            </div>
            <div className="flex items-center gap-3">
              {/* Bell icon with notification count */}
              <div className="relative">
                <FontAwesomeIcon icon={faBell}
                  className="text-xl text-gray-400 hover:text-[#1E3A8A] cursor-pointer" />
                {notifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                    {notifications.length}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 bg-green-50 px-3 py-1.5 rounded-full">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-green-700 font-semibold">Online</span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-8">

          {/* ── Requests Tab ── */}
          {activeTab === 'requests' && (
            <div>
              <div className="mb-6">
                <h2 className="text-xl font-bold text-[#1E3A8A] mb-2">New ride requests near you 🏍️</h2>
                <p className="text-sm text-gray-500">Accept or cancel rides</p>
              </div>

              {message && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-700">{message}</p>
                </div>
              )}

              <div className="space-y-4">
                {loading && (
                  <div className="bg-white rounded-2xl border-2 border-gray-100 p-8 text-center">
                    <FontAwesomeIcon icon={faSpinner} className="text-3xl text-[#1E3A8A] animate-spin" />
                    <p className="text-gray-400 text-sm mt-3">Loading requests...</p>
                  </div>
                )}

                {!loading && rides.length === 0 && (
                  <div className="bg-white rounded-2xl border-2 border-gray-100 p-12 text-center">
                    <FontAwesomeIcon icon={faMotorcycle} className="text-5xl text-gray-300 mb-3" />
                    <p className="text-gray-400 text-base">No ride requests available</p>
                    <p className="text-xs text-gray-400 mt-2">MQTT will notify you instantly when a ride is requested!</p>
                  </div>
                )}

                {rides.map((ride) => (
                  <div key={ride.id}
                    className="bg-white rounded-2xl border-2 border-gray-100 p-5 hover:border-[#1E3A8A]/20 transition shadow-sm">
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                          <span className="text-xs font-bold text-green-600 uppercase">New Request</span>
                          <span className="text-xs text-gray-400">• {new Date(ride.created_at).toLocaleTimeString()}</span>
                        </div>

                        <div className="bg-blue-50 rounded-lg p-3 mb-3">
                          <div className="flex items-center gap-2 mb-2">
                            <FontAwesomeIcon icon={faUserCircle} className="text-[#1E3A8A] text-sm" />
                            <span className="text-xs font-semibold text-[#1E3A8A]">Customer Details</span>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <p className="text-xs text-gray-500">Name</p>
                              <p className="text-sm font-semibold">{ride.customer_name || 'Anonymous'}</p>
                            </div>
                            {ride.customer_phone && (
                              <div>
                                <p className="text-xs text-gray-500">Phone</p>
                                <p className="text-sm font-semibold flex items-center gap-1">
                                  <FontAwesomeIcon icon={faPhone} className="text-xs text-green-600" />
                                  {ride.customer_phone}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-start gap-3">
                            <FontAwesomeIcon icon={faMapMarkerAlt} className="text-[#1E3A8A] text-sm mt-1" />
                            <div>
                              <p className="text-xs text-gray-500">Pickup</p>
                              <p className="text-sm font-semibold text-[#1E3A8A]">{ride.pickup_location}</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <FontAwesomeIcon icon={faLocationDot} className="text-[#1E3A8A] text-sm mt-1" />
                            <div>
                              <p className="text-xs text-gray-500">Dropoff</p>
                              <p className="text-sm font-semibold text-[#1E3A8A]">{ride.dropoff_location}</p>
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-4 mt-4 pt-3 border-t border-gray-100">
                          <div>
                            <p className="text-xs text-gray-400">Distance</p>
                            <p className="text-sm font-semibold">{ride.distance_km || '0'} km</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-400">Est. Fare</p>
                            <p className="text-sm font-bold text-[#1E3A8A]">
                              TSh {parseInt(ride.estimated_cost || 0).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 min-w-[120px]">
                        <button onClick={() => acceptRide(ride.id)} disabled={submittingId === ride.id}
                          className="px-5 py-2 bg-[#1E3A8A] hover:bg-[#1E3A8A]/90 text-white rounded-xl text-sm font-semibold transition flex items-center gap-2">
                          {submittingId === ride.id
                            ? <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
                            : <FontAwesomeIcon icon={faCheck} />}
                          Accept
                        </button>
                        <button onClick={() => cancelRide(ride.id)} disabled={submittingId === ride.id}
                          className="px-5 py-2 border-2 border-red-300 hover:bg-red-500 text-red-600 hover:text-white rounded-xl text-sm font-semibold transition flex items-center gap-2">
                          <FontAwesomeIcon icon={faTrash} />
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── History Tab ── */}
          {activeTab === 'history' && (
            <div className="bg-white rounded-2xl border-2 border-gray-100 shadow-lg p-6">
              <h2 className="text-xl font-bold text-[#1E3A8A] mb-4">Ride History</h2>
              {loading && (
                <div className="text-center py-8">
                  <FontAwesomeIcon icon={faSpinner} className="text-2xl text-[#1E3A8A] animate-spin" />
                </div>
              )}
              {!loading && rides.filter(r => r.status !== 'pending').length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-400">No completed rides yet</p>
                </div>
              )}
              <div className="space-y-3">
                {rides.filter(r => r.status !== 'pending').map((ride) => (
                  <div key={ride.id} className="p-4 border-2 border-gray-100 rounded-xl hover:bg-gray-50 transition">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-semibold text-[#1E3A8A]">
                          {ride.pickup_location} → {ride.dropoff_location}
                        </p>
                        <div className="flex items-center gap-4 mt-1">
                          <p className="text-xs text-gray-500">{ride.customer_name || 'Anonymous'}</p>
                          <p className="text-xs text-gray-500">{new Date(ride.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-green-600 font-bold">TSh {parseInt(ride.estimated_cost || 0).toLocaleString()}</p>
                        <p className="text-xs">
                          {ride.status === 'completed' && '✓ Completed'}
                          {ride.status === 'accepted'  && '⏳ Accepted'}
                          {ride.status === 'cancelled' && '✗ Cancelled'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Earnings Tab ── */}
          {activeTab === 'earnings' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {earnings.map((item, idx) => (
                  <div key={idx} className="bg-white rounded-2xl border-2 border-gray-100 p-5 hover:shadow-md transition">
                    <p className="text-sm text-gray-500 mb-2">{item.period}</p>
                    <p className="text-2xl font-bold text-[#1E3A8A] mb-2">TSh {item.amount}</p>
                    <p className="text-xs text-gray-400">{item.rides} rides completed</p>
                  </div>
                ))}
              </div>
              <div className="bg-green-50 rounded-2xl p-5 border-2 border-green-100">
                <div className="flex items-center gap-3">
                  <FontAwesomeIcon icon={faChartLine} className="text-2xl text-[#1E3A8A]" />
                  <div>
                    <p className="text-sm font-semibold text-[#1E3A8A]">Great job! 🎉</p>
                    <p className="text-xs text-gray-600">You've completed 118 rides this month!</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── Profile Tab ── */}
          {activeTab === 'profile' && (
            <div className="bg-white rounded-2xl border-2 border-gray-100 shadow-lg p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <FontAwesomeIcon icon={faMotorcycle} className="text-3xl text-[#1E3A8A]" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-[#1E3A8A]">{riderName}</h2>
                  <p className="text-sm text-gray-500">Rider since 2024</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-3 border-b-2 border-gray-100">
                  <span className="text-sm text-gray-500">📧 Email</span>
                  <span className="text-sm">juma@example.com</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b-2 border-gray-100">
                  <span className="text-sm text-gray-500">📱 Phone</span>
                  <span className="text-sm">{riderPhone}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b-2 border-gray-100">
                  <span className="text-sm text-gray-500">🏍️ Bike Plate</span>
                  <span className="text-sm font-mono font-semibold">T 123 ABC</span>
                </div>
                <div className="flex justify-between items-center py-3">
                  <span className="text-sm text-gray-500">⭐ Rating</span>
                  <div className="flex items-center gap-1">
                    <FontAwesomeIcon icon={faStar} className="text-yellow-500" />
                    <span className="text-sm font-semibold">4.9 (247 reviews)</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── Support Tab ── */}
          {activeTab === 'support' && (
            <div className="bg-white rounded-2xl border-2 border-gray-100 shadow-lg p-6">
              <h2 className="text-xl font-bold text-[#1E3A8A] mb-4">Support</h2>
              <div className="space-y-3">
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-sm font-semibold">📞 Phone: +255 712 345 678</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-sm font-semibold">📧 Email: support@twendego.co.tz</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-sm font-semibold">💬 WhatsApp: +255 712 345 678</p>
                </div>
              </div>
            </div>
          )}

          {/* ── Settings Tab ── */}
          {activeTab === 'settings' && (
            <div className="bg-white rounded-2xl border-2 border-gray-100 shadow-lg p-6">
              <h2 className="text-xl font-bold text-[#1E3A8A] mb-4">Settings</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
                  <div>
                    <p className="font-semibold">Ride Notifications</p>
                    <p className="text-xs text-gray-500">Receive new ride alerts</p>
                  </div>
                  <div className="w-10 h-6 bg-green-500 rounded-full relative">
                    <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                  </div>
                </div>
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
                  <div>
                    <p className="font-semibold">Language</p>
                    <p className="text-xs text-gray-500">Kiswahili / English</p>
                  </div>
                  <FontAwesomeIcon icon={faCog} className="text-gray-400" />
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }
        .animate-slideIn { animation: slideIn 0.3s ease-out; }
      `}</style>
    </div>
  );
}

export default RiderDashboard;