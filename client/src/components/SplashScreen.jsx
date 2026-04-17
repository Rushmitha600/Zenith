import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const SplashScreen = () => {
  const navigate = useNavigate();
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowButton(true);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 to-purple-700 flex flex-col items-center justify-center p-4">
      {/* Logo Animation */}
      <motion.div
        initial={{ scale: 0, rotate: -180, opacity: 0 }}
        animate={{ scale: 1, rotate: 0, opacity: 1 }}
        transition={{ duration: 0.8, type: 'spring', bounce: 0.4 }}
        className="text-center"
      >
        <div className="w-32 h-32 mx-auto bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl shadow-2xl flex items-center justify-center mb-6">
          <span className="text-5xl">▲</span>
        </div>
      </motion.div>

      {/* App Name */}
      <motion.h1
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="text-5xl md:text-6xl font-bold text-white text-center mb-3 tracking-wider"
      >
        ZENITH➕
      </motion.h1>

      {/* Subtitle */}
      <motion.p
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        className="text-lg md:text-xl text-white/80 text-center max-w-md"
      >
        Elevating GIG Insurance Standards
      </motion.p>

      {/* Tagline */}
      <motion.p
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.7 }}
        className="text-sm text-white/60 text-center mt-2"
      >
        India's First AI-Powered Insurance for Gig Workers
      </motion.p>

      {/* Get Started Button */}
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: showButton ? 1 : 0, opacity: showButton ? 1 : 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        onClick={() => navigate('/landing')}
        className="mt-12 px-8 py-3 bg-white text-indigo-600 rounded-full font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
      >
        Get Started →
      </motion.button>

      {/* Loading dots */}
      {!showButton && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute bottom-10 left-0 right-0 text-center"
        >
          <div className="flex justify-center space-x-2">
            <div className="w-2 h-2 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
            <div className="w-2 h-2 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
            <div className="w-2 h-2 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default SplashScreen;