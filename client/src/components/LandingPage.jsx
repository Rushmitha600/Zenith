import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import Slideshow from './common/Slideshow';

const LandingPage = () => {
  const { isAuthenticated } = useAuth();
  const [weather, setWeather] = useState(null);
  const [city, setCity] = useState('');
  const [loading, setLoading] = useState(false);

  // Fetch weather by city name
  const fetchWeather = async (cityName) => {
    if (!cityName || cityName.trim() === '') {
      return;
    }
    
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/tracking/weather?city=${cityName}`);
      setWeather(response.data);
    } catch (error) {
      console.error('Weather fetch error:', error);
      setWeather(null);
    } finally {
      setLoading(false);
    }
  };

  // Handle search button click
  const handleSearch = () => {
    if (city && city.trim()) {
      fetchWeather(city);
    }
  };

  // Handle Enter key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const getWeatherIcon = (iconCode) => {
    return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
  };

  const plans = [
    { name: 'Basic Shield', price: 99, coverage: 2000, features: ['Rain Coverage', 'Heat Wave Protection', 'Cold Wave Coverage', '24/7 Support'], icon: '🛡️', color: 'from-blue-500 to-blue-600' },
    { name: 'Standard Shield', price: 199, coverage: 5000, features: ['Everything in Basic', 'Storm Coverage', 'Air Pollution', 'Double Weekends'], icon: '⭐', color: 'from-purple-500 to-purple-600', popular: true },
    { name: 'Premium Shield', price: 299, coverage: 10000, features: ['Everything in Standard', 'Natural Disasters', 'Holiday Bonus', 'Priority Claims'], icon: '👑', color: 'from-orange-500 to-orange-600' }
  ];

  const features = [
    { icon: '🤖', title: 'AI-Powered Protection', description: 'Advanced AI monitors weather patterns and automatically processes claims' },
    { icon: '⚡', title: 'Zero-Touch Claims', description: 'No paperwork, no delays - instant payouts when weather disrupts your work' },
    { icon: '📍', title: 'Live Location Tracking', description: 'Real-time monitoring with hyper-local weather alerts and safety tips' },
    { icon: '🔒', title: 'Fraud Detection', description: 'Advanced AI detects suspicious activities and protects your account' },
    { icon: '💰', title: 'Dynamic Pricing', description: 'Pay less in safe zones, get adjusted premiums based on real-time risks' },
    { icon: '📱', title: '24/7 Support', description: 'Round-the-clock assistance for all your insurance needs' }
  ];

  const triggers = [
    { icon: '🌧️', name: 'Heavy Rain', threshold: '>50mm', compensation: '₹500' },
    { icon: '🔥', name: 'Heat Wave', threshold: '>40°C', compensation: '₹300' },
    { icon: '😷', name: 'Air Pollution', threshold: 'AQI >300', compensation: '₹200' },
    { icon: '⛈️', name: 'Storm', threshold: 'Thunderstorm', compensation: '₹400' },
    { icon: '🌊', name: 'Flood', threshold: 'Flood Warning', compensation: '₹600' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-purple-50">
      {/* Header */}
      <nav className="bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <motion.h1 initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                ▲ Zenith
              </motion.h1>
            </div>
            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <Link to="/dashboard" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">Go to Dashboard</Link>
              ) : (
                <>
                  <Link to="/login" className="text-gray-600 hover:text-blue-600 transition">Login</Link>
                  <Link to="/admin/login" className="text-gray-600 hover:text-blue-600 transition">Admin Login</Link>
                  <Link to="/register" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">Get Started</Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>
      

      {/* Hero Section with Weather */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              Protect Your Gig Income
              <span className="text-blue-600"> From Weather Disruptions</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              India's first AI-powered insurance platform for delivery partners. 
              Get automatic payouts when bad weather affects your earnings.
            </p>
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
              <Link to="/register" className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-lg hover:shadow-lg transition text-center">Get Protected Now</Link>
              <a href="#features" className="border-2 border-blue-600 text-blue-600 px-8 py-3 rounded-lg hover:bg-blue-50 transition text-center">Learn More</a>
            </div>
          </motion.div>

          {/* Weather Widget - FIXED */}
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-2xl shadow-xl p-6">
            <h3 className="text-lg font-semibold mb-4">🌤️ Check Weather</h3>
            
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Enter city name (e.g., Mumbai, Delhi)"
                className="input-field flex-1"
              />
              <button onClick={handleSearch} disabled={loading} className="btn-primary">
                {loading ? 'Loading...' : 'Get Weather'}
              </button>
            </div>
            
            {loading && (
              <div className="text-center py-8">
                <div className="spinner mx-auto"></div>
                <p className="text-gray-500 mt-2">Loading weather...</p>
              </div>
            )}
            
            {!loading && weather && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <img src={getWeatherIcon(weather.icon)} alt={weather.condition} className="w-16 h-16" />
                    <div>
                      <div className="text-4xl font-bold">{weather.temp}°C</div>
                      <p className="text-gray-600 capitalize">{weather.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Feels like</p>
                    <p className="text-xl font-semibold">{weather.feelsLike}°C</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="bg-gray-50 p-2 rounded text-center">
                    <p className="text-gray-500">Humidity</p>
                    <p className="font-semibold">{weather.humidity}%</p>
                  </div>
                  <div className="bg-gray-50 p-2 rounded text-center">
                    <p className="text-gray-500">Wind</p>
                    <p className="font-semibold">{weather.windSpeed} km/h</p>
                  </div>
                </div>
                <div className="mt-3 text-center text-sm text-gray-500">
                  📍 {weather.city}
                </div>
              </div>
            )}
            
            {!loading && !weather && city && (
              <div className="text-center py-8">
                <p className="text-gray-500">City not found. Please try another name.</p>
              </div>
            )}
            
            {!loading && !weather && !city && (
              <div className="text-center py-8">
                <p className="text-gray-500">Enter a city name and click Get Weather</p>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Slideshow />
      </div>

      {/* Features Section */}
      <div id="features" className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12"><h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose Zenith?</h2><p className="text-xl text-gray-600">Elevating GIG Insurance Standards</p></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, idx) => (
              <motion.div key={idx} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }} className="text-center p-6 rounded-xl hover:shadow-lg transition">
                <div className="text-5xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Insurance Plans */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12"><h2 className="text-3xl font-bold text-gray-900 mb-4">Insurance Plans for Every Need</h2><p className="text-xl text-gray-600">Choose the perfect plan that fits your delivery schedule</p></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan, idx) => (
              <motion.div key={idx} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }} className={`bg-white rounded-2xl shadow-lg overflow-hidden ${plan.popular ? 'ring-2 ring-purple-600 transform scale-105' : ''}`}>
                {plan.popular && <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white text-center py-2 text-sm font-semibold">MOST POPULAR</div>}
                <div className={`bg-gradient-to-r ${plan.color} p-6 text-white text-center`}>
                  <div className="text-5xl mb-2">{plan.icon}</div>
                  <h3 className="text-2xl font-bold">{plan.name}</h3>
                  <p className="text-3xl font-bold mt-4">₹{plan.price}<span className="text-lg">/week</span></p>
                  <p className="text-sm mt-1">Coverage up to ₹{plan.coverage.toLocaleString()}</p>
                </div>
                <div className="p-6">
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-center"><svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>{feature}</li>
                    ))}
                  </ul>
                  <Link to="/register" className={`block text-center py-3 rounded-lg font-semibold transition ${plan.popular ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white hover:shadow-lg' : 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50'}`}>Choose Plan</Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Auto-Trigger Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 text-white"><h2 className="text-3xl font-bold mb-4">⚡ 5 Automated Triggers</h2><p className="text-xl text-white/90">Zero-touch claims when you need it most</p></div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {triggers.map((trigger, idx) => (
              <motion.div key={idx} initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center text-white">
                <div className="text-4xl mb-2">{trigger.icon}</div>
                <p className="font-semibold text-sm">{trigger.name}</p>
                <p className="text-xs text-white/80 mt-1">{trigger.threshold}</p>
                <p className="text-sm font-bold mt-2">{trigger.compensation}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to Protect Your Income?</h2>
          <p className="text-xl text-gray-600 mb-8">Join thousands of delivery partners who trust us for weather protection</p>
          <Link to="/register" className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-lg hover:shadow-lg transition inline-block">Get Started Now - Free 7-Day Trial</Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div><h3 className="text-xl font-bold mb-4">▲ Zenith</h3><p className="text-gray-400 text-sm">Elevating GIG Insurance Standards</p></div>
            <div><h4 className="font-semibold mb-4">Product</h4><ul className="space-y-2 text-sm text-gray-400"><li><a href="#features" className="hover:text-white">Features</a></li><li><a href="#" className="hover:text-white">Pricing</a></li><li><a href="#" className="hover:text-white">FAQ</a></li></ul></div>
            <div><h4 className="font-semibold mb-4">Support</h4><ul className="space-y-2 text-sm text-gray-400"><li><a href="#" className="hover:text-white">Help Center</a></li><li><a href="#" className="hover:text-white">Contact Us</a></li><li><a href="#" className="hover:text-white">Status</a></li><li><Link to="/admin/login" className="hover:text-white">Admin portal</Link></li></ul></div>
            <div><h4 className="font-semibold mb-4">Legal</h4><ul className="space-y-2 text-sm text-gray-400"><li><a href="#" className="hover:text-white">Privacy Policy</a></li><li><a href="#" className="hover:text-white">Terms of Service</a></li><li><a href="#" className="hover:text-white">Cookie Policy</a></li></ul></div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400"><p> 2026 Zenith. Elevating GIG Insurance Standards</p></div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;