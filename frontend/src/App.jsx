import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Landing from './pages/Landing';
import CustomerDashboard from './pages/CustomerDashboard';
import RiderDashboard from './pages/RiderDashboard';

function AppContent() {
  const location = useLocation();
  const navigate = useNavigate();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);

  useEffect(() => {
    if (location.pathname === '/login') {
      setShowLoginModal(true);
      setShowSignupModal(false);
    } else if (location.pathname === '/signup') {
      setShowSignupModal(true);
      setShowLoginModal(false);
    } else {
      setShowLoginModal(false);
      setShowSignupModal(false);
    }
  }, [location.pathname]);

  const handleCloseLogin = () => {
    setShowLoginModal(false);
    navigate('/');
  };

  const handleCloseSignup = () => {
    setShowSignupModal(false);
    navigate('/');
  };

  const handleSwitchToSignup = () => {
    setShowLoginModal(false);
    setShowSignupModal(true);
    navigate('/signup');
  };

  const handleSwitchToLogin = () => {
    setShowSignupModal(false);
    setShowLoginModal(true);
    navigate('/login');
  };

  return (
    <Landing 
      initialLoginModal={showLoginModal}
      initialSignupModal={showSignupModal}
      onCloseLogin={handleCloseLogin}
      onCloseSignup={handleCloseSignup}
      onSwitchToSignup={handleSwitchToSignup}
      onSwitchToLogin={handleSwitchToLogin}
    />
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AppContent />} />
        <Route path="/login" element={<AppContent />} />
        <Route path="/signup" element={<AppContent />} />
        <Route path="/customer" element={<CustomerDashboard />} />
        <Route path="/rider" element={<RiderDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
