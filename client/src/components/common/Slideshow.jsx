import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const slides = [
  {
    id: 1,
    title: 'Protect Your Gig Income',
    description: 'Get automatic payouts when bad weather affects your earnings',
    icon: '🛡️',
    bgColor: 'from-blue-500 to-purple-600'
  },
  {
    id: 2,
    title: 'Zero-Touch Claims',
    description: 'AI automatically detects weather disruptions and files claims',
    icon: '⚡',
    bgColor: 'from-purple-500 to-pink-600'
  },
  {
    id: 3,
    title: 'Live Weather Tracking',
    description: 'Real-time weather alerts for your delivery locations',
    icon: '🌤️',
    bgColor: 'from-orange-500 to-red-600'
  },
  {
    id: 4,
    title: 'Dynamic Premium Pricing',
    description: 'Pay less in safe zones based on your location',
    icon: '💰',
    bgColor: 'from-green-500 to-teal-600'
  },
  {
    id: 5,
    title: '24/7 Support',
    description: 'Round-the-clock assistance for all your needs',
    icon: '📞',
    bgColor: 'from-indigo-500 to-blue-600'
  }
];

const Slideshow = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setDirection(1);
      setCurrentIndex((prevIndex) => (prevIndex + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const goToSlide = (index) => {
    setDirection(index > currentIndex ? 1 : -1);
    setCurrentIndex(index);
  };

  const nextSlide = () => {
    setDirection(1);
    setCurrentIndex((prevIndex) => (prevIndex + 1) % slides.length);
  };

  const prevSlide = () => {
    setDirection(-1);
    setCurrentIndex((prevIndex) => (prevIndex - 1 + slides.length) % slides.length);
  };

  const slideVariants = {
    enter: (direction) => ({
      x: direction > 0 ? '100%' : '-100%',
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1
    },
    exit: (direction) => ({
      x: direction > 0 ? '-100%' : '100%',
      opacity: 0
    })
  };

  return (
    <div className="relative w-full overflow-hidden rounded-2xl shadow-2xl">
      <div className="relative h-64 md:h-80">
        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: 'spring', stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 }
            }}
            className={`absolute inset-0 bg-gradient-to-r ${slides[currentIndex].bgColor} rounded-2xl p-8 text-white flex flex-col items-center justify-center text-center`}
          >
            <div className="text-6xl mb-4 float">{slides[currentIndex].icon}</div>
            <h2 className="text-2xl md:text-3xl font-bold mb-3 gradient-text bg-white bg-clip-text text-transparent">
              {slides[currentIndex].title}
            </h2>
            <p className="text-white/90 text-sm md:text-base max-w-md">
              {slides[currentIndex].description}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Navigation Arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white rounded-full p-2 transition-all duration-300 hover:scale-110"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white rounded-full p-2 transition-all duration-300 hover:scale-110"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Dots Indicator */}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              index === currentIndex
                ? 'w-6 bg-white'
                : 'bg-white/50 hover:bg-white/80'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default Slideshow;