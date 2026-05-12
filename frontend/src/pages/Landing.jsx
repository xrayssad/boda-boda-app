import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { motion, useInView, useAnimation } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faFacebookF, faTwitter, faInstagram, faWhatsapp 
} from '@fortawesome/free-brands-svg-icons';
import { 
  faBolt, faShieldAlt, faLocationDot, faCreditCard, 
  faUsers, faHeadset, faEnvelope, faPhone, faClock,
  faMapMarkerAlt, faStar, faCheckCircle, faBuilding,
  faMotorcycle, faTimes, faChevronLeft, faChevronRight, 
  faUser, faLock, faGlobe, faHeart
} from '@fortawesome/free-solid-svg-icons';

function Landing({ 
  initialLoginModal = false, 
  initialSignupModal = false,
  onCloseLogin,
  onCloseSignup,
  onSwitchToSignup,
  onSwitchToLogin
}) {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [currentModalSlide, setCurrentModalSlide] = useState(0);
  const [showLoginModal, setShowLoginModal] = useState(initialLoginModal);
  const [showSignupModal, setShowSignupModal] = useState(initialSignupModal);
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [signupData, setSignupData] = useState({ name: '', email: '', phone: '', password: '' });

  // Update modal states when props change
  useEffect(() => {
    setShowLoginModal(initialLoginModal);
    setShowSignupModal(initialSignupModal);
  }, [initialLoginModal, initialSignupModal]);

  // Refs for scroll animations
  const statsRef = useRef(null);
  const servicesRef = useRef(null);
  const aboutRef = useRef(null);
  const ctaRef = useRef(null);
  const footerRef = useRef(null);
  
  const statsInView = useInView(statsRef, { once: true, amount: 0.3 });
  const servicesInView = useInView(servicesRef, { once: true, amount: 0.2 });
  const aboutInView = useInView(aboutRef, { once: true, amount: 0.3 });
  const ctaInView = useInView(ctaRef, { once: true, amount: 0.5 });
  
  const statsControls = useAnimation();
  const servicesControls = useAnimation();
  const aboutControls = useAnimation();
  const ctaControls = useAnimation();

  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 60 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };
  
  const fadeInLeft = {
    hidden: { opacity: 0, x: -50 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };
  
  const fadeInRight = {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };
  
  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3
      }
    }
  };
  
  const statItem = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.5, type: "spring" } }
  };
  
  const serviceCard = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  // Trigger animations when elements come into view
  useEffect(() => {
    if (statsInView) statsControls.start("visible");
    if (servicesInView) servicesControls.start("visible");
    if (aboutInView) aboutControls.start("visible");
    if (ctaInView) ctaControls.start("visible");
  }, [statsInView, servicesInView, aboutInView, ctaInView]);

  const slides = [
    {
      url: "/images/slide1.jpg",
      title: "Safe Riding First",
      desc: "Your safety is our #1 priority. Every ride is tracked and monitored 24/7.",
      message: ["Helmet provided", "GPS tracking", "Emergency button"]
    },
    {
      url: "/images/slide2.avif",
      title: "Secured & Insured Workers",
      desc: "All our riders are verified, trained, and fully insured for your peace of mind.",
      message: ["Verified background", "Comprehensive insurance", "Professional training"]
    },
    {
      url: "/images/slide3.webp",
      title: "Excellent Customer Service",
      desc: "We're here for you 24/7. Our support team is always ready to assist you.",
      message: ["24/7 support", "Quick response", "Problem resolution"]
    },
    {
      url: "/images/slide4.avif",
      title: "Accurate Location & Destination",
      desc: "GPS-powered precision to ensure you never get lost. Real-time tracking from pickup to dropoff.",
      message: ["Real-time tracking", "Accurate ETA", "Best routes"]
    }
  ];

  const modalSlides = [
    {
      url: "/images/slide1.jpg",
      title: "Safe Riding First",
      features: ["GPS Tracking", "Emergency Button", "Helmet Provided"]
    },
    {
      url: "/images/slide2.avif",
      title: "Secured & Insured Workers",
      features: ["Verified Riders", "Full Insurance", "Professional Training"]
    },
    {
      url: "/images/slide3.webp",
      title: "Excellent Customer Service",
      features: ["24/7 Support", "Quick Response", "Problem Resolution"]
    },
    {
      url: "/images/slide4.avif",
      title: "Accurate Location & Destination",
      features: ["Real-time Tracking", "Accurate ETA", "Best Routes"]
    }
  ];

  // Main slideshow timer
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 10000);
    return () => clearInterval(interval);
  }, [slides.length]);

  // Modal slideshow timer
  useEffect(() => {
    if (showLoginModal || showSignupModal) {
      const interval = setInterval(() => {
        setCurrentModalSlide((prev) => (prev + 1) % modalSlides.length);
      }, 10000);
      return () => clearInterval(interval);
    }
  }, [showLoginModal, showSignupModal]);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  const nextModalSlide = () => setCurrentModalSlide((prev) => (prev + 1) % modalSlides.length);
  const prevModalSlide = () => setCurrentModalSlide((prev) => (prev - 1 + modalSlides.length) % modalSlides.length);

  const handleLogin = (e) => {
    e.preventDefault();
    const userRole = loginData.email.includes('rider') ? 'rider' : 'customer';
    if (onCloseLogin) onCloseLogin();
    if (userRole === 'customer') {
      navigate('/customer');
    } else {
      navigate('/rider');
    }
  };

  const handleSignup = (e) => {
    e.preventDefault();
    if (onCloseSignup) onCloseSignup();
    navigate('/customer');
  };

  const openLoginModal = () => {
    navigate('/login');
  };

  const openSignupModal = () => {
    navigate('/signup');
  };

  const closeLoginModal = () => {
    if (onCloseLogin) onCloseLogin();
  };

  const closeSignupModal = () => {
    if (onCloseSignup) onCloseSignup();
  };

  const switchToSignup = () => {
    if (onSwitchToSignup) onSwitchToSignup();
  };

  const switchToLogin = () => {
    if (onSwitchToLogin) onSwitchToLogin();
  };

  const services = [
    { icon: faBolt, title: "Express Rides", description: "Get a boda in under 5 minutes.", details: "Fast pickups, quick dropoffs, and efficient routing." },
    { icon: faShieldAlt, title: "Safe & Insured", description: "All riders are verified and fully insured.", details: "Every ride tracked with emergency support." },
    { icon: faLocationDot, title: "GPS Accurate", description: "Real-time tracking and accurate ETA.", details: "Live location sharing so you know where your rider is." },
    { icon: faCreditCard, title: "Easy Payment", description: "Multiple payment options available.", details: "M-Pesa, Tigo Pesa, cash, and digital receipts." },
    { icon: faUsers, title: "Professional Riders", description: "Well-trained, courteous professionals.", details: "Comprehensive safety and service training." },
    { icon: faHeadset, title: "24/7 Support", description: "Customer support around the clock.", details: "Phone, WhatsApp, and in-app chat available." }
  ];

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      {/* Top Navigation */}
      <motion.div 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="border-b bg-white sticky top-0 z-20 shadow-sm"
      >
        <div className="max-w-6xl mx-auto px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
              <img src="/images/logo.png" alt="TwendeGo" className="h-10 w-auto" />
              <div>
                <span className="text-xl font-bold text-[#1E3A8A]">TwendeGo</span>
                <p className="text-[10px] text-gray-500 -mt-1">Ride Fast. Ride Easy.</p>
              </div>
            </div>
            <div className="hidden md:flex gap-8 text-sm">
              <a href="#home" className="text-gray-600 hover:text-[#1E3A8A] transition">Home</a>
              <a href="#services" className="text-gray-600 hover:text-[#1E3A8A] transition">Services</a>
              <a href="#about" className="text-gray-600 hover:text-[#1E3A8A] transition">About</a>
              <a href="#contact" className="text-gray-600 hover:text-[#1E3A8A] transition">Contact</a>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Slideshow Container */}
      <div id="home" className="relative h-[550px] overflow-hidden">
        {slides.map((slide, idx) => (
          <div 
            key={idx} 
            className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
              idx === currentSlide ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
            }`}
          >
            <div 
              className="absolute inset-0 bg-cover bg-center bg-no-repeat"
              style={{ backgroundImage: `url('${slide.url}')` }}
            >
              <div className="absolute inset-0 bg-black/30"></div>
            </div>
            
            <div className="relative h-full flex items-center justify-center text-center text-white px-6">
              <div className="max-w-4xl">
               
                <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">{slide.title}</h1>
                <p className="text-lg md:text-xl mb-6 text-gray-100 max-w-2xl mx-auto">{slide.desc}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto mb-8">
                  {slide.message.map((item, i) => (
                    <div key={i} className="flex items-center justify-center gap-2 text-sm bg-black/20 backdrop-blur-sm rounded-lg py-2 px-3">
                      <FontAwesomeIcon icon={faCheckCircle} className="text-[#F97316] text-xs" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
                
                <div className="flex gap-4 justify-center">
                  <button onClick={openSignupModal} className="px-8 py-3 bg-[#F97316] hover:bg-[#EA580C] rounded-lg font-semibold transition transform hover:scale-105 shadow-lg flex items-center gap-2">
                    Get Started <FontAwesomeIcon icon={faMotorcycle} />
                  </button>
                  <button onClick={openLoginModal} className="px-8 py-3 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-lg font-semibold transition border border-white/30 flex items-center gap-2">
                    <FontAwesomeIcon icon={faUser} /> Login
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
        
        <button onClick={prevSlide} className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white w-12 h-12 rounded-full transition flex items-center justify-center text-xl z-10">
          <FontAwesomeIcon icon={faChevronLeft} />
        </button>
        <button onClick={nextSlide} className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white w-12 h-12 rounded-full transition flex items-center justify-center text-xl z-10">
          <FontAwesomeIcon icon={faChevronRight} />
        </button>
        
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-2 z-10">
          {slides.map((_, idx) => (
            <button key={idx} onClick={() => setCurrentSlide(idx)} className={`transition-all duration-300 rounded-full ${idx === currentSlide ? 'w-10 h-2 bg-[#F97316]' : 'w-2 h-2 bg-white/50'}`} />
          ))}
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 z-10">
          <div className="h-full bg-[#F97316] transition-all duration-[10000ms] linear" style={{ width: '100%', animation: 'shrink 10s linear forwards' }} key={currentSlide}></div>
        </div>
      </div>

      {/* Stats Section */}
      <motion.div 
        ref={statsRef}
        initial="hidden"
        animate={statsControls}
        variants={staggerContainer}
        className="bg-[#1E3A8A] py-10"
      >
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-white">
            <motion.div variants={statItem}>
              <div className="text-3xl font-bold mb-1">50K+</div>
              <div className="text-xs opacity-80">Happy Riders</div>
            </motion.div>
            <motion.div variants={statItem}>
              <div className="text-3xl font-bold mb-1">5K+</div>
              <div className="text-xs opacity-80">Active Riders</div>
            </motion.div>
            <motion.div variants={statItem}>
              <div className="text-3xl font-bold mb-1 flex items-center justify-center gap-1"><FontAwesomeIcon icon={faStar} className="text-yellow-400 text-xl" /> 4.9</div>
              <div className="text-xs opacity-80">Average Rating</div>
            </motion.div>
            <motion.div variants={statItem}>
              <div className="text-3xl font-bold mb-1">24/7</div>
              <div className="text-xs opacity-80">Support</div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Services Section */}
      <div id="services" ref={servicesRef} className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div 
            initial="hidden"
            animate={servicesControls}
            variants={fadeInUp}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 bg-blue-100 px-4 py-1.5 rounded-full mb-4">
              <FontAwesomeIcon icon={faMotorcycle} className="text-sm text-[#1E3A8A]" />
              <span className="text-xs font-semibold text-[#1E3A8A]">WHAT WE OFFER</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-[#1E3A8A] mb-3">Our Services</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">We provide fast, safe, and reliable rides across Tanzania</p>
          </motion.div>
          
          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            animate={servicesControls}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {services.map((service, idx) => (
              <motion.div 
                key={idx}
                variants={serviceCard}
                whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
                className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer"
              >
                <div className="text-5xl mb-4"><FontAwesomeIcon icon={service.icon} className="text-[#1E3A8A]" /></div>
                <h3 className="text-xl font-bold text-[#1E3A8A] mb-2">{service.title}</h3>
                <p className="text-sm text-gray-600 mb-2 leading-relaxed">{service.description}</p>
                <p className="text-xs text-gray-400 leading-relaxed">{service.details}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* About Us Section */}
      <div id="about" ref={aboutRef} className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial="hidden"
            animate={aboutControls}
            variants={fadeInUp}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 bg-green-100 px-4 py-1.5 rounded-full mb-4">
              <FontAwesomeIcon icon={faBuilding} className="text-sm text-[#1E3A8A]" />
              <span className="text-xs font-semibold text-[#1E3A8A]">ABOUT US</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-[#1E3A8A] mb-3">Who We Are</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">Learn more about TwendeGo and our mission</p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-12 items-start">
            <motion.div
              initial="hidden"
              animate={aboutControls}
              variants={fadeInLeft}
              className="space-y-6"
            >
              <div>
                <h3 className="text-2xl font-bold text-[#1E3A8A] mb-3">Our Story</h3>
                <p className="text-gray-600 leading-relaxed">
                  TwendeGo was founded in 2024 with a mission to transform urban transportation in Tanzania. 
                  We provide safe, reliable, and affordable boda boda rides to thousands of customers daily.
                </p>
              </div>
              
              <div>
                <h3 className="text-2xl font-bold text-[#1E3A8A] mb-3">Our Mission</h3>
                <p className="text-gray-600 leading-relaxed">
                  To connect riders with verified, professional boda drivers through innovative technology, 
                  ensuring safety, convenience, and fair pricing for all Tanzanians.
                </p>
              </div>
              
              <div>
                <h3 className="text-2xl font-bold text-[#1E3A8A] mb-3">Our Vision</h3>
                <p className="text-gray-600 leading-relaxed">
                  To become Tanzania's most trusted and preferred ride-hailing platform, 
                  empowering local boda drivers and providing exceptional service to customers.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial="hidden"
              animate={aboutControls}
              variants={fadeInRight}
              className="bg-gradient-to-br from-blue-50 to-white rounded-2xl p-6 shadow-lg"
            >
              <h3 className="text-xl font-bold text-[#1E3A8A] mb-4">Company Information</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <FontAwesomeIcon icon={faMapMarkerAlt} className="text-xl text-[#1E3A8A] mt-1" />
                  <div>
                    <p className="font-semibold text-gray-800">Location</p>
                    <p className="text-sm text-gray-600">UDOM - CIVE (University of Dodoma)</p>
                    <p className="text-xs text-gray-500 mt-1">P.O. Box 259, Dodoma, Tanzania</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <FontAwesomeIcon icon={faPhone} className="text-xl text-[#1E3A8A] mt-1" />
                  <div>
                    <p className="font-semibold text-gray-800">Phone Numbers</p>
                    <p className="text-sm text-gray-600">+255 712 345 678 (Customer Support)</p>
                    <p className="text-sm text-gray-600">+255 756 789 012 (Rider Support)</p>
                    <p className="text-sm text-gray-600">+255 689 345 678 (Office)</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <FontAwesomeIcon icon={faEnvelope} className="text-xl text-[#1E3A8A] mt-1" />
                  <div>
                    <p className="font-semibold text-gray-800">Email Addresses</p>
                    <p className="text-sm text-gray-600">info@twendego.co.tz</p>
                    <p className="text-sm text-gray-600">support@twendego.co.tz</p>
                    <p className="text-sm text-gray-600">riders@twendego.co.tz</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <FontAwesomeIcon icon={faClock} className="text-xl text-[#1E3A8A] mt-1" />
                  <div>
                    <p className="font-semibold text-gray-800">Working Hours</p>
                    <p className="text-sm text-gray-600">Monday - Sunday: 24/7</p>
                    <p className="text-xs text-gray-500 mt-1">Customer support available 24/7</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <FontAwesomeIcon icon={faGlobe} className="text-xl text-[#1E3A8A] mt-1" />
                  <div>
                    <p className="font-semibold text-gray-800 mb-2">Social Media</p>
                    <div className="flex gap-3">
                      <a href="https://facebook.com/twendego" target="_blank" rel="noopener noreferrer" className="w-9 h-9 bg-[#1877F2] rounded-full flex items-center justify-center text-white hover:scale-110 transition">
                        <FontAwesomeIcon icon={faFacebookF} />
                      </a>
                      <a href="https://twitter.com/twendego" target="_blank" rel="noopener noreferrer" className="w-9 h-9 bg-[#1DA1F2] rounded-full flex items-center justify-center text-white hover:scale-110 transition">
                        <FontAwesomeIcon icon={faTwitter} />
                      </a>
                      <a href="https://instagram.com/twendego" target="_blank" rel="noopener noreferrer" className="w-9 h-9 bg-gradient-to-r from-[#E4405F] to-[#F56040] rounded-full flex items-center justify-center text-white hover:scale-110 transition">
                        <FontAwesomeIcon icon={faInstagram} />
                      </a>
                      <a href="https://wa.me/255712345678" target="_blank" rel="noopener noreferrer" className="w-9 h-9 bg-[#25D366] rounded-full flex items-center justify-center text-white hover:scale-110 transition">
                        <FontAwesomeIcon icon={faWhatsapp} />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <motion.div 
        ref={ctaRef}
        initial="hidden"
        animate={ctaControls}
        variants={fadeInUp}
        className="py-16 bg-gradient-to-r from-[#1E3A8A] to-blue-800"
      >
        <div className="max-w-4xl mx-auto px-6 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to Ride?</h2>
          <p className="text-lg mb-8">Join thousands of happy riders across Tanzania</p>
          <button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={openSignupModal} 
            className="px-8 py-3 bg-[#F97316] hover:bg-[#EA580C] rounded-lg font-semibold transition shadow-lg inline-flex items-center gap-2"
          >
            Sign Up Now <FontAwesomeIcon icon={faMotorcycle} />
          </button>
        </div>
      </motion.div>

      {/* Footer */}
      <motion.div 
        ref={footerRef}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="bg-gray-900 text-white py-6 text-center text-sm"
      >
        <p>© 2024 TwendeGo. Ride Fast. Ride Easy. <FontAwesomeIcon icon={faMotorcycle} className="mx-1 text-[#F97316]" /> Tanzania</p>
        <p className="text-xs text-gray-500 mt-2">UDOM - CIVE | Dodoma, Tanzania</p>
      </motion.div>

      {/* Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto relative animate-slideUp">
            <button onClick={closeLoginModal} className="absolute right-4 top-4 z-10 bg-white rounded-full w-8 h-8 flex items-center justify-center shadow-md text-gray-400 hover:text-gray-600 transition">
              <FontAwesomeIcon icon={faTimes} />
            </button>
            <div className="flex flex-col md:flex-row">
              <div className="w-full md:w-1/2 bg-gradient-to-br from-[#1E3A8A] to-blue-800 relative overflow-hidden">
                {modalSlides.map((slide, idx) => (
                  <div key={idx} className={`absolute inset-0 transition-all duration-1000 ease-in-out ${idx === currentModalSlide ? 'opacity-100 scale-100' : 'opacity-0 scale-105'}`}>
                    <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: `url('${slide.url}')` }}>
                      <div className="absolute inset-0 bg-gradient-to-br from-[#1E3A8A]/60 to-blue-800/60"></div>
                    </div>
                    <div className="relative h-full flex flex-col justify-center p-6 text-white min-h-[300px]">
                      <div className="text-center mb-4">
                        <FontAwesomeIcon icon={faMotorcycle} className="text-5xl mb-3 animate-pulse" />
                        <h3 className="text-xl font-bold mb-2">{slide.title}</h3>
                        <div className="w-12 h-0.5 bg-[#F97316] mx-auto"></div>
                      </div>
                      <div className="space-y-2">
                        {slide.features.map((feature, i) => (
                          <div key={i} className="flex items-center gap-2 text-sm bg-black/20 backdrop-blur-sm rounded-lg p-2">
                            <FontAwesomeIcon icon={faCheckCircle} className="text-[#F97316] text-sm" />
                            <span>{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
                <button onClick={prevModalSlide} className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white w-8 h-8 rounded-full transition flex items-center justify-center z-10">
                  <FontAwesomeIcon icon={faChevronLeft} />
                </button>
                <button onClick={nextModalSlide} className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white w-8 h-8 rounded-full transition flex items-center justify-center z-10">
                  <FontAwesomeIcon icon={faChevronRight} />
                </button>
                <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex gap-1 z-10">
                  {modalSlides.map((_, idx) => (
                    <button key={idx} onClick={() => setCurrentModalSlide(idx)} className={`transition-all duration-300 rounded-full ${idx === currentModalSlide ? 'w-6 h-1 bg-[#F97316]' : 'w-1 h-1 bg-white/50'}`} />
                  ))}
                </div>
              </div>
              <div className="w-full md:w-1/2 p-8">
                <div className="text-center mb-6">
                  <img src="/images/logo.png" alt="TwendeGo" className="h-12 w-auto mx-auto mb-3" />
                  <h2 className="text-2xl font-bold text-[#1E3A8A] mb-1">Welcome Back!</h2>
                  <p className="text-sm text-gray-500">Login to your account</p>
                </div>
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="relative">
                    <FontAwesomeIcon icon={faEnvelope} className="absolute left-3 top-3 text-[#1E3A8A]" />
                    <input type="email" placeholder="Email Address" value={loginData.email} onChange={(e) => setLoginData({...loginData, email: e.target.value})} className="w-full pl-10 p-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#1E3A8A] transition" required />
                  </div>
                  <div className="relative">
                    <FontAwesomeIcon icon={faLock} className="absolute left-3 top-3 text-[#1E3A8A]" />
                    <input type="password" placeholder="Password" value={loginData.password} onChange={(e) => setLoginData({...loginData, password: e.target.value})} className="w-full pl-10 p-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#1E3A8A] transition" required />
                  </div>
                  <button type="submit" className="w-full bg-[#1E3A8A] text-white py-3 rounded-lg hover:bg-[#1E3A8A]/90 transition font-semibold">Login</button>
                </form>
                <div className="mt-4 text-center text-sm text-gray-500">
                  Don't have an account? <button onClick={switchToSignup} className="text-[#1E3A8A] font-semibold hover:underline">Sign up</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Signup Modal */}
      {showSignupModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto relative animate-slideUp">
            <button onClick={closeSignupModal} className="absolute right-4 top-4 z-10 bg-white rounded-full w-8 h-8 flex items-center justify-center shadow-md text-gray-400 hover:text-gray-600 transition">
              <FontAwesomeIcon icon={faTimes} />
            </button>
            <div className="flex flex-col md:flex-row">
              <div className="w-full md:w-1/2 bg-gradient-to-br from-[#1E3A8A] to-blue-800 relative overflow-hidden">
                {modalSlides.map((slide, idx) => (
                  <div key={idx} className={`absolute inset-0 transition-all duration-1000 ease-in-out ${idx === currentModalSlide ? 'opacity-100 scale-100' : 'opacity-0 scale-105'}`}>
                    <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: `url('${slide.url}')` }}>
                      <div className="absolute inset-0 bg-gradient-to-br from-[#1E3A8A]/60 to-blue-800/60"></div>
                    </div>
                    <div className="relative h-full flex flex-col justify-center p-6 text-white min-h-[300px]">
                      <div className="text-center mb-4">
                        <FontAwesomeIcon icon={faMotorcycle} className="text-5xl mb-3 animate-pulse" />
                        <h3 className="text-xl font-bold mb-2">{slide.title}</h3>
                        <div className="w-12 h-0.5 bg-[#F97316] mx-auto"></div>
                      </div>
                      <div className="space-y-2">
                        {slide.features.map((feature, i) => (
                          <div key={i} className="flex items-center gap-2 text-sm bg-black/20 backdrop-blur-sm rounded-lg p-2">
                            <FontAwesomeIcon icon={faCheckCircle} className="text-[#F97316] text-sm" />
                            <span>{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
                <button onClick={prevModalSlide} className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white w-8 h-8 rounded-full transition flex items-center justify-center z-10">
                  <FontAwesomeIcon icon={faChevronLeft} />
                </button>
                <button onClick={nextModalSlide} className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white w-8 h-8 rounded-full transition flex items-center justify-center z-10">
                  <FontAwesomeIcon icon={faChevronRight} />
                </button>
                <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex gap-1 z-10">
                  {modalSlides.map((_, idx) => (
                    <button key={idx} onClick={() => setCurrentModalSlide(idx)} className={`transition-all duration-300 rounded-full ${idx === currentModalSlide ? 'w-6 h-1 bg-[#F97316]' : 'w-1 h-1 bg-white/50'}`} />
                  ))}
                </div>
              </div>
              <div className="w-full md:w-1/2 p-8">
                <div className="text-center mb-6">
                  <img src="/images/logo.png" alt="TwendeGo" className="h-12 w-auto mx-auto mb-3" />
                  <h2 className="text-2xl font-bold text-[#1E3A8A] mb-1">Create Account</h2>
                  <p className="text-sm text-gray-500">Join TwendeGo today</p>
                </div>
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="relative">
                    <FontAwesomeIcon icon={faUser} className="absolute left-3 top-3 text-[#1E3A8A]" />
                    <input type="text" placeholder="Full Name" value={signupData.name} onChange={(e) => setSignupData({...signupData, name: e.target.value})} className="w-full pl-10 p-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#1E3A8A] transition" required />
                  </div>
                  <div className="relative">
                    <FontAwesomeIcon icon={faEnvelope} className="absolute left-3 top-3 text-[#1E3A8A]" />
                    <input type="email" placeholder="Email Address" value={signupData.email} onChange={(e) => setSignupData({...signupData, email: e.target.value})} className="w-full pl-10 p-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#1E3A8A] transition" required />
                  </div>
                  <div className="relative">
                    <FontAwesomeIcon icon={faPhone} className="absolute left-3 top-3 text-[#1E3A8A]" />
                    <input type="tel" placeholder="Phone Number" value={signupData.phone} onChange={(e) => setSignupData({...signupData, phone: e.target.value})} className="w-full pl-10 p-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#1E3A8A] transition" required />
                  </div>
                  <div className="relative">
                    <FontAwesomeIcon icon={faLock} className="absolute left-3 top-3 text-[#1E3A8A]" />
                    <input type="password" placeholder="Password" value={signupData.password} onChange={(e) => setSignupData({...signupData, password: e.target.value})} className="w-full pl-10 p-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#1E3A8A] transition" required />
                  </div>
                  <button type="submit" className="w-full bg-[#1E3A8A] text-white py-3 rounded-lg hover:bg-[#1E3A8A]/90 transition font-semibold">Sign Up</button>
                </form>
                <div className="mt-4 text-center text-sm text-gray-500">
                  Already have an account? <button onClick={switchToLogin} className="text-[#1E3A8A] font-semibold hover:underline">Login</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { transform: translateY(30px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
        .animate-slideUp { animation: slideUp 0.3s ease-out; }
        @keyframes shrink { from { width: 100%; } to { width: 0%; } }
      `}</style>
    </div>
  );
}

export default Landing;
