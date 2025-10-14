import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export function BannerCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const banners = [
    {
      id: 1,
      image: '/banners/banner-1.webp',
    },
    {
      id: 2,
      image: '/banners/banner-2.webp',
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval);
  }, [banners.length]);

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  const goToPrevious = () => {
    setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const goToNext = () => {
    setCurrentSlide((prev) => (prev + 1) % banners.length);
  };

  return (
    <section className="banner-carousel-section py-8 sm:py-12 md:py-16 hidden lg:block">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="banner-carousel-container relative mx-auto rounded-xl overflow-hidden shadow-2xl group">
          {/* Banner Slides */}
          <div className="relative w-full h-full">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0, x: 300 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -300 }}
                transition={{ duration: 0.5, ease: 'easeInOut' }}
                className="absolute inset-0"
              >
                <div
                  className="w-full h-full bg-no-repeat bg-center bg-cover rounded-xl"
                  style={{
                    backgroundImage: `url(${banners[currentSlide].image})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center center',
                  }}
                />
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={goToPrevious}
            className="absolute left-1 sm:left-2 md:left-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white p-1.5 sm:p-2 md:p-3 rounded-full transition-all duration-300 opacity-0 group-hover:opacity-100 focus:opacity-100"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" />
          </button>

          <button
            onClick={goToNext}
            className="absolute right-1 sm:right-2 md:right-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white p-1.5 sm:p-2 md:p-3 rounded-full transition-all duration-300 opacity-0 group-hover:opacity-100 focus:opacity-100"
            aria-label="Next slide"
          >
            <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" />
          </button>

          {/* Navigation Dots */}
          <div className="absolute bottom-2 sm:bottom-3 md:bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-1.5 sm:space-x-2">
            {banners.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-1.5 h-1.5 sm:w-2 sm:h-2 md:w-3 md:h-3 rounded-full transition-all duration-300 ${
                  index === currentSlide ? 'bg-white scale-125' : 'bg-white/50 hover:bg-white/75'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>

          {/* Progress Bar */}
          <div className="absolute bottom-0 left-0 w-full h-1 bg-white/20">
            <motion.div
              className="h-full bg-white"
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{ duration: 5, ease: 'linear' }}
              key={currentSlide}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
