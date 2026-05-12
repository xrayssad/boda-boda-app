import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { useState, useEffect } from 'react'

// Loading component with TwendeGo logo and slogan
function LoadingScreen({ onComplete }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (progress < 100) {
        setProgress(prev => Math.min(prev + 10, 100));
      } else {
        onComplete();
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [progress, onComplete]);

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-white to-blue-50 flex items-center justify-center z-50">
      <div className="text-center">
        {/* TwendeGo Logo */}
        <div className="mb-6">
          <img 
            src="/images/logo.png" 
            alt="TwendeGo" 
            className="w-24 h-24 mx-auto animate-bounce"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='45' fill='%231E3A8A'/%3E%3Ctext x='50' y='67' text-anchor='middle' fill='white' font-size='40' font-weight='bold'%3ET%3C/text%3E%3C/svg%3E";
            }}
          />
        </div>
        
        {/* Rotating spinner */}
        <div className="relative w-16 h-16 mx-auto mb-4">
          <div className="absolute inset-0 rounded-full border-4 border-gray-200"></div>
          <div className="absolute inset-0 rounded-full border-4 border-[#1E3A8A] border-t-transparent loading-spinner"></div>
        </div>
        
        {/* Company name */}
        <h1 className="text-3xl font-bold text-[#1E3A8A] mb-2">TwendeGo</h1>
        
        {/* Slogan */}
        <p className="text-gray-500 text-sm mb-4">Ride Fast. Ride Easy.</p>
        
        {/* Progress bar */}
        <div className="w-48 h-1 bg-gray-200 rounded-full mx-auto overflow-hidden">
          <div 
            className="h-full bg-[#1E3A8A] transition-all duration-300 rounded-full"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        
        <p className="text-xs text-gray-400 mt-3">Loading...</p>
      </div>
    </div>
  );
}

function AppWithLoading() {
  const [loading, setLoading] = useState(true);

  return (
    <>
      {loading && <LoadingScreen onComplete={() => setLoading(false)} />}
      {!loading && <App />}
    </>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AppWithLoading />
  </React.StrictMode>,
)
