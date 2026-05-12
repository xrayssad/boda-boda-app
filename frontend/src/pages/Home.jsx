// frontend/src/pages/Home.jsx
import { useState } from 'react';
import axios from 'axios';

const commonLocations = [
  "Kampala Mall", "Makerere University", "Garden City", "Kampala Serena Hotel",
  "Old Taxi Park", "New Taxi Park", "Wandegeya", "Ntinda", "Kisaasi", "Lugogo Mall",
  "Entebbe Airport", "Mukono", "Jinja Road", "Victoria Mall"
];

function Home({ setCurrentPage }) {
  const [pickup, setPickup] = useState('');
  const [dropoff, setDropoff] = useState('');
  const [message, setMessage] = useState('');

  const requestRide = async () => {
    if (!pickup || !dropoff) return;
    try {
      const res = await axios.post('http://localhost:8000/api/request-ride/', {
        pickup, dropoff, customer: "Demo User"
      });
      setMessage(`Ride requested! ID: ${res.data.ride_id}`);
      setPickup(''); setDropoff('');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage("Error requesting ride");
      setTimeout(() => setMessage(''), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex justify-between items-center mb-16">
          <div className="flex items-center gap-4">
            <span className="text-5xl">🏍️</span>
            <h1 className="text-5xl font-bold text-orange-400">boda</h1>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={() => setCurrentPage('customer')} 
              className="px-8 py-3 border border-orange-400 rounded-full hover:bg-orange-400 hover:text-black transition"
            >
              Login as Customer
            </button>
            <button 
              onClick={() => setCurrentPage('rider')} 
              className="px-8 py-3 bg-orange-500 text-black font-semibold rounded-full hover:bg-orange-600 transition"
            >
              Login as Rider
            </button>
          </div>
        </div>

        <div className="text-center mb-16">
          <h2 className="text-6xl font-bold mb-6">Fast & Reliable<br />Boda Boda Rides</h2>
          <p className="text-2xl text-zinc-400 max-w-2xl mx-auto">
            Get from point A to B safely and affordably across Kampala and beyond.
          </p>
        </div>

        {/* Quick Request Section */}
        <div className="max-w-2xl mx-auto bg-zinc-900 rounded-3xl p-10">
          <h3 className="text-3xl font-semibold mb-8 text-center">Request a Ride Now</h3>
          <div className="space-y-6">
            <input 
              type="text" 
              placeholder="Pickup Location" 
              value={pickup} 
              onChange={(e) => setPickup(e.target.value)} 
              className="w-full bg-zinc-800 border border-zinc-700 rounded-2xl py-5 px-6 text-lg focus:outline-none focus:border-orange-400"
            />
            <input 
              type="text" 
              placeholder="Drop-off Location" 
              value={dropoff} 
              onChange={(e) => setDropoff(e.target.value)} 
              className="w-full bg-zinc-800 border border-zinc-700 rounded-2xl py-5 px-6 text-lg focus:outline-none focus:border-orange-400"
            />
            <button 
              onClick={requestRide} 
              className="w-full bg-orange-500 hover:bg-orange-600 py-5 rounded-2xl font-bold text-xl text-black transition"
            >
              Request Boda
            </button>
          </div>
          {message && <p className="text-center mt-6 text-orange-400">{message}</p>}
        </div>
      </div>
    </div>
  );
}

export default Home;