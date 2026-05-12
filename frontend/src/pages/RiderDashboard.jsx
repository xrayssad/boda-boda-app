import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faMotorcycle, faList, faMoneyBillWave, faUser, faSignOutAlt, 
  faMapMarkerAlt, faLocationDot, faCheck, faTimes, faStar, 
  faClock, faChartLine, faHistory, faHeadset, faCog, faBell,
  faSpinner, faCheckCircle, faTrash
} from '@fortawesome/free-solid-svg-icons';

const API_URL = 'http://localhost:8000/api';

function RiderDashboard() {
  const [rides, setRides] = useState([]);
  const [activeTab, setActiveTab] = useState('requests');
  const [loading, setLoading] = useState(false);
  const [submittingId, setSubmittingId] = useState(null);
  const [message, setMessage] = useState('');
  const [riderName, setRiderName] = useState('Juma R.');
  const [riderPhone, setRiderPhone] = useState('+255 756 789 012');
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate('/');
  };

  const fetchPendingRides = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/rides/pending/`);
      if (response.data.success) {
        setRides(response.data.rides);
      } else {
        setRides([]);
      }
    } catch (error) {
      console.error('Error fetching rides:', error);
      setRides([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllRides = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/rides/`);
      if (response.data.success) {
        setRides(response.data.rides);
      } else {
        setRides([]);
      }
    } catch (error) {
      console.error('Error fetching rides:', error);
      setRides([]);
    } finally {
      setLoading(false);
    }
  };

  const acceptRide = async (rideId) => {
    setSubmittingId(rideId);
    try {
      await axios.put(`${API_URL}/rides/${rideId}/accept/`, {
        rider_name: riderName,
        rider_phone: riderPhone
      });
      fetchPendingRides();
    } catch (error) {
      console.error('Error accepting ride:', error);
    } finally {
      setSubmittingId(null);
    }
  };

  const cancelRide = async (rideId) => {
    if (!confirm('Je, una uhakika unataka kufuta ombi hili la safari?')) return;
    
    setSubmittingId(rideId);
    try {
      await axios.put(`${API_URL}/rides/${rideId}/cancel/`);
      fetchPendingRides();
    } catch (error) {
      console.error('Error cancelling ride:', error);
    } finally {
      setSubmittingId(null);
    }
  };

  useEffect(() => {
    if (activeTab === 'requests') {
      fetchPendingRides();
    } else if (activeTab === 'history') {
      fetchAllRides();
    }
  }, [activeTab]);

  const menuItems = [
    { id: 'requests', icon: faList, label: 'Available Requests', description: 'View pending ride requests' },
    { id: 'earnings', icon: faMoneyBillWave, label: 'Earnings', description: 'Your daily/weekly earnings' },
    { id: 'history', icon: faHistory, label: 'Ride History', description: 'All completed rides' },
    { id: 'stats', icon: faChartLine, label: 'Statistics', description: 'Your performance' },
    { id: 'support', icon: faHeadset, label: 'Support', description: 'Get help' },
    { id: 'profile', icon: faUser, label: 'Profile', description: 'Your information' },
    { id: 'settings', icon: faCog, label: 'Settings', description: 'Preferences' }
  ];

  const earnings = [
    { period: "Today", amount: "45,000", rides: 6 },
    { period: "This Week", amount: "245,000", rides: 32 },
    { period: "This Month", amount: "892,000", rides: 118 }
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-80 bg-white border-r-2 border-gray-100 shadow-lg fixed h-full overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-8 pb-6 border-b-2 border-gray-100">
            <img src="/images/logo.png" alt="TwendeGo" className="h-10 w-auto" />
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

          <button onClick={handleLogout} className="w-full mt-6 px-4 py-2.5 rounded-xl bg-red-50 text-red-600 hover:bg-red-500 hover:text-white transition flex items-center justify-center gap-2 text-sm font-semibold">
            <FontAwesomeIcon icon={faSignOutAlt} /> Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 ml-80">
        <div className="bg-white border-b-2 border-gray-100 sticky top-0 z-10 shadow-sm">
          <div className="px-8 py-4 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-[#1E3A8A]">
                {activeTab === 'requests' && 'Available Ride Requests 📋'}
                {activeTab === 'earnings' && 'My Earnings 💰'}
                {activeTab === 'history' && 'Ride History 📜'}
                {activeTab === 'stats' && 'Statistics 📊'}
                {activeTab === 'support' && 'Support 💬'}
                {activeTab === 'profile' && 'My Profile 👤'}
                {activeTab === 'settings' && 'Settings ⚙️'}
              </h1>
              <p className="text-sm text-gray-500 mt-1">Dashboard for riders</p>
            </div>
            <div className="flex items-center gap-3">
              <FontAwesomeIcon icon={faBell} className="text-xl text-gray-400 hover:text-[#1E3A8A] cursor-pointer" />
              <div className="flex items-center gap-2 bg-green-50 px-3 py-1.5 rounded-full">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-green-700 font-semibold">Online</span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-8">
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
                    <p className="text-sm text-gray-400 mt-1">Check back later for new requests</p>
                  </div>
                )}
                
                {rides.map(ride => (
                  <div key={ride.id} className="bg-white rounded-2xl border-2 border-gray-100 p-5 hover:border-[#1E3A8A]/20 transition shadow-sm">
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                          <span className="text-xs font-bold text-green-600 uppercase">New Request</span>
                          <span className="text-xs text-gray-400">• {new Date(ride.created_at).toLocaleTimeString()}</span>
                        </div>
                        
                        <div className="space-y-3">
                          <div className="flex items-start gap-3">
                            <FontAwesomeIcon icon={faMapMarkerAlt} className="text-[#1E3A8A] text-sm mt-1" />
                            <div>
                              <p className="text-xs text-gray-500">Pickup Location</p>
                              <p className="text-sm font-semibold text-[#1E3A8A]">{ride.pickup_location}</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <FontAwesomeIcon icon={faLocationDot} className="text-[#1E3A8A] text-sm mt-1" />
                            <div>
                              <p className="text-xs text-gray-500">Dropoff Location</p>
                              <p className="text-sm font-semibold text-[#1E3A8A]">{ride.dropoff_location}</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex gap-4 mt-4 pt-3 border-t border-gray-100">
                          <div>
                            <p className="text-xs text-gray-400">Customer</p>
                            <p className="text-sm font-semibold">{ride.customer_name || 'Anonymous'}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-400">Distance</p>
                            <p className="text-sm font-semibold">{ride.distance_km || '0'} km</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-400">Est. Fare</p>
                            <p className="text-sm font-bold text-[#1E3A8A]">TSh {parseInt(ride.estimated_cost || 0).toLocaleString()}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-2">
                        <button 
                          onClick={() => acceptRide(ride.id)} 
                          disabled={submittingId === ride.id}
                          className="px-5 py-2 bg-[#1E3A8A] hover:bg-[#1E3A8A]/90 text-white rounded-xl text-sm font-semibold transition flex items-center gap-2"
                        >
                          {submittingId === ride.id ? (
                            <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
                          ) : (
                            <FontAwesomeIcon icon={faCheck} />
                          )}
                          Accept Ride
                        </button>
                        <button 
                          onClick={() => cancelRide(ride.id)} 
                          disabled={submittingId === ride.id}
                          className="px-5 py-2 border-2 border-red-300 hover:bg-red-500 text-red-600 hover:text-white rounded-xl text-sm font-semibold transition flex items-center gap-2"
                        >
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

          {activeTab === 'history' && (
            <div className="bg-white rounded-2xl border-2 border-gray-100 shadow-lg p-6">
              <h2 className="text-xl font-bold text-[#1E3A8A] mb-4">Ride History</h2>
              {loading && (
                <div className="text-center py-8">
                  <FontAwesomeIcon icon={faSpinner} className="text-2xl text-[#1E3A8A] animate-spin" />
                </div>
              )}
              {!loading && rides.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-400">No rides yet</p>
                </div>
              )}
              <div className="space-y-3">
                {rides.filter(r => r.status !== 'pending').map((ride) => (
                  <div key={ride.id} className="p-4 border-2 border-gray-100 rounded-xl hover:bg-gray-50 transition">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-semibold text-[#1E3A8A]">{ride.pickup_location} → {ride.dropoff_location}</p>
                        <div className="flex items-center gap-4 mt-1">
                          <p className="text-xs text-gray-500">{ride.customer_name || 'Anonymous'}</p>
                          <p className="text-xs text-gray-500">{new Date(ride.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-green-600 font-bold">TSh {parseInt(ride.estimated_cost || 0).toLocaleString()}</p>
                        <p className="text-xs text-green-500">
                          {ride.status === 'completed' ? '✓ Completed' : ride.status === 'accepted' ? '⏳ Accepted' : ride.status === 'cancelled' ? '✗ Cancelled' : ride.status}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'earnings' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-[#1E3A8A] mb-4">Your earnings summary 💰</h2>
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

          {activeTab === 'support' && (
            <div className="bg-white rounded-2xl border-2 border-gray-100 shadow-lg p-6">
              <h2 className="text-xl font-bold text-[#1E3A8A] mb-4">Support</h2>
              <div className="space-y-3">
                <div className="p-4 bg-gray-50 rounded-xl"><p className="text-sm font-semibold">📞 Phone: +255 712 345 678</p></div>
                <div className="p-4 bg-gray-50 rounded-xl"><p className="text-sm font-semibold">📧 Email: support@twendego.co.tz</p></div>
                <div className="p-4 bg-gray-50 rounded-xl"><p className="text-sm font-semibold">💬 WhatsApp: +255 712 345 678</p></div>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="bg-white rounded-2xl border-2 border-gray-100 shadow-lg p-6">
              <h2 className="text-xl font-bold text-[#1E3A8A] mb-4">Settings</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
                  <div><p className="font-semibold">Ride Notifications</p><p className="text-xs text-gray-500">Receive new ride alerts</p></div>
                  <div className="w-10 h-6 bg-green-500 rounded-full relative"><div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div></div>
                </div>
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
                  <div><p className="font-semibold">Language</p><p className="text-xs text-gray-500">Kiswahili / English</p></div>
                  <FontAwesomeIcon icon={faCog} className="text-gray-400" />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default RiderDashboard;
