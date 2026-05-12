import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', password: '' });
  const navigate = useNavigate();
  const location = useLocation();

  const slides = [
    { url: "/images/slide1.jpg", title: "Safe Riding First", features: ["GPS Tracking", "Emergency Button", "Helmet Provided"] },
    { url: "/images/slide2.avif", title: "Secured & Insured Workers", features: ["Verified Riders", "Full Insurance", "Professional Training"] },
    { url: "/images/slide3.webp", title: "Excellent Customer Service", features: ["24/7 Support", "Quick Response", "Problem Resolution"] },
    { url: "/images/slide4.avif", title: "Accurate Location & Destination", features: ["Real-time Tracking", "Accurate ETA", "Best Routes"] }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 10000);
    return () => clearInterval(interval);
  }, [slides.length]);

  useEffect(() => {
    if (location.pathname === '/signup') setIsLogin(false);
  }, [location]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const userRole = (isLogin && formData.email.includes('rider')) ? 'rider' : 'customer';
    navigate(userRole === 'customer' ? '/customer' : '/rider');
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const getTitle = () => {
    if (isLogin) {
      return { main: "Welcome Back!", sub: "Login to your account to continue" };
    } else {
      return { main: "Join Us!", sub: "Create your account and start riding" };
    }
  };

  const title = getTitle();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-4">
      <div className="max-w-5xl w-full bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="flex flex-col md:flex-row">
          {/* Image Side with Slideshow */}
          <div className="hidden md:block w-1/2 relative overflow-hidden">
            {slides.map((slide, idx) => (
              <div key={idx} className={`absolute inset-0 transition-all duration-1000 ease-in-out ${idx === currentSlide ? 'opacity-100 scale-100' : 'opacity-0 scale-105'}`}>
                <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: `url('${slide.url}')` }}>
                  <div className="absolute inset-0 bg-gradient-to-br from-[#1E3A8A]/40 to-blue-800/40"></div>
                </div>
                <div className="relative h-full flex flex-col justify-center p-8 text-white">
                  <div className="text-center mb-8">
                    <div className="text-6xl mb-4 animate-pulse">🏍️</div>
                    <h2 className="text-2xl font-bold mb-2">{slide.title}</h2>
                    <div className="w-16 h-0.5 bg-[#F97316] mx-auto mb-4"></div>
                  </div>
                  <div className="space-y-3">
                    {slide.features.map((feature, i) => (
                      <div key={i} className="flex items-center gap-3 bg-black/20 backdrop-blur-sm rounded-lg p-3 transform transition hover:scale-105">
                        <span className="text-[#F97316] text-xl">✓</span>
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-8 pt-6 border-t border-white/20 text-center">
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div><div className="text-lg font-bold">50K+</div><div className="opacity-80">Riders</div></div>
                      <div><div className="text-lg font-bold">5K+</div><div className="opacity-80">Riders</div></div>
                      <div><div className="text-lg font-bold">4.9</div><div className="opacity-80">Rating</div></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 z-10">
              {slides.map((_, idx) => (
                <button key={idx} onClick={() => setCurrentSlide(idx)} className={`transition-all duration-300 rounded-full ${idx === currentSlide ? 'w-8 h-1.5 bg-[#F97316]' : 'w-1.5 h-1.5 bg-white/50 hover:bg-white/70'}`} />
              ))}
            </div>
            
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 z-10">
              <div className="h-full bg-[#F97316] transition-all duration-[10000ms] linear" style={{ width: '100%', animation: 'shrink 10s linear forwards' }} key={currentSlide}></div>
            </div>
          </div>

          {/* Form Side */}
          <div className="w-full md:w-1/2 p-8 overflow-y-auto max-h-screen">
            <button onClick={() => navigate('/')} className="flex items-center gap-2 text-gray-500 text-sm mb-6 hover:text-[#1E3A8A] transition group">
              <span className="group-hover:-translate-x-1 transition">←</span> Home
            </button>
            
            <div className="text-center mb-6">
              <img src="/images/logo.png" alt="TwendeGo" className="h-16 w-auto mx-auto mb-3" onError={(e) => { e.target.onerror = null; e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='45' fill='%231E3A8A'/%3E%3Ctext x='50' y='67' text-anchor='middle' fill='white' font-size='40' font-weight='bold'%3ET%3C/text%3E%3C/svg%3E"; }} />
              <h2 className="text-2xl font-bold text-[#1E3A8A] mb-1">TwendeGo</h2>
              <p className="text-xs text-gray-500 mb-2">Ride Fast. Ride Easy.</p>
              <p className="text-sm text-gray-500">{title.sub}</p>
            </div>
            
            <div className="flex gap-2 mb-6 bg-gray-100 p-1 rounded-lg">
              <button onClick={() => setIsLogin(true)} className={`flex-1 py-2 rounded-md text-sm font-semibold transition ${isLogin ? 'bg-[#1E3A8A] text-white shadow-md' : 'text-gray-600 hover:text-[#1E3A8A]'}`}>Login</button>
              <button onClick={() => setIsLogin(false)} className={`flex-1 py-2 rounded-md text-sm font-semibold transition ${!isLogin ? 'bg-[#1E3A8A] text-white shadow-md' : 'text-gray-600 hover:text-[#1E3A8A]'}`}>Sign Up</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <>
                  <div className="relative"><span className="absolute left-3 top-3 text-gray-400">👤</span><input type="text" name="name" placeholder="Full Name" value={formData.name} onChange={handleChange} className="w-full pl-10 p-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#1E3A8A] focus:ring-2 focus:ring-[#1E3A8A]/10 transition" required /></div>
                  <div className="relative"><span className="absolute left-3 top-3 text-gray-400">📱</span><input type="tel" name="phone" placeholder="Phone Number" value={formData.phone} onChange={handleChange} className="w-full pl-10 p-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#1E3A8A] focus:ring-2 focus:ring-[#1E3A8A]/10 transition" required /></div>
                </>
              )}
              <div className="relative"><span className="absolute left-3 top-3 text-gray-400">📧</span><input type="email" name="email" placeholder="Email Address" value={formData.email} onChange={handleChange} className="w-full pl-10 p-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#1E3A8A] focus:ring-2 focus:ring-[#1E3A8A]/10 transition" required /></div>
              <div className="relative"><span className="absolute left-3 top-3 text-gray-400">🔒</span><input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} className="w-full pl-10 p-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#1E3A8A] focus:ring-2 focus:ring-[#1E3A8A]/10 transition" required /></div>
              {isLogin && <div className="text-right"><button type="button" className="text-xs text-[#1E3A8A] hover:underline">Forgot password?</button></div>}
              <button type="submit" className="w-full bg-[#1E3A8A] text-white py-3 rounded-lg hover:bg-[#1E3A8A]/90 transition font-semibold shadow-md hover:shadow-lg">{isLogin ? 'Login Now' : 'Create Account'}</button>
            </form>
            
            <div className="relative my-6"><div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div><div className="relative flex justify-center text-xs"><span className="px-3 bg-white text-gray-400">or</span></div></div>
            
            <div className="text-center text-sm text-gray-500">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button onClick={() => setIsLogin(!isLogin)} className="text-[#1E3A8A] font-semibold hover:underline">{isLogin ? 'Sign up now' : 'Login now'}</button>
            </div>
            
            <div className="mt-6 pt-4 border-t border-gray-100 md:hidden">
              <div className="grid grid-cols-2 gap-2 text-center text-xs text-gray-500"><div>✓ GPS Tracking</div><div>✓ Insured Riders</div><div>✓ 24/7 Support</div><div>✓ Best Price</div></div>
            </div>
          </div>
        </div>
      </div>

      <style>{`@keyframes shrink { from { width: 100%; } to { width: 0%; } }`}</style>
    </div>
  );
}

export default Auth;
