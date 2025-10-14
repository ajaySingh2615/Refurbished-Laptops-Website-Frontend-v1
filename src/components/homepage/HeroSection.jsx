import React from 'react';
import { HiShoppingBag } from 'react-icons/hi';
import { motion } from 'framer-motion';
import { BrandStrip } from './BrandStrip';

export function HeroSection({ scrollY = 0 }) {
  const clamped = Math.min(scrollY || 0, 300);
  const scale = 1 + clamped * 0.0007;
  const opacity = 1 - clamped * 0.0015;

  return (
    <section className="home-hero relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/hero-section/hero-image-1.webp')",
          transform: `translateY(${scrollY * 0.08}px)`,
        }}
      />

      {/* Overlay */}
      <div
        className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70"
        style={{ transform: `translateY(${scrollY * 0.08}px)` }}
      />

      {/* Content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-12 sm:py-16 md:py-20">
        <motion.div
          className="text-center"
          style={{ scale, opacity }}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-extrabold text-white mb-4 sm:mb-6 leading-tight drop-shadow-2xl px-2">
            Premium Refurbished{' '}
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              Electronics
            </span>
          </h1>

          <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-100 mb-6 sm:mb-8 md:mb-10 max-w-xs sm:max-w-2xl md:max-w-3xl mx-auto leading-relaxed drop-shadow-lg px-4">
            Get the latest smartphones, laptops, and tablets at unbeatable prices. All devices come
            with quality guarantee and warranty.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center mb-8 sm:mb-12 md:mb-16 px-4">
            <button className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white px-6 sm:px-8 md:px-10 py-3 sm:py-4 rounded-xl font-bold text-base sm:text-lg transition-all duration-300 flex items-center justify-center gap-2 sm:gap-3 w-full sm:w-auto shadow-xl hover:shadow-2xl active:scale-95 sm:hover:scale-105 transform touch-manipulation">
              <HiShoppingBag className="w-5 h-5 sm:w-6 sm:h-6" />
              Start Shopping
            </button>
            <button className="border-2 border-white bg-white/10 backdrop-blur-sm text-white hover:bg-white hover:text-gray-900 active:bg-white/20 px-6 sm:px-8 md:px-10 py-3 sm:py-4 rounded-xl font-bold text-base sm:text-lg transition-all duration-300 w-full sm:w-auto shadow-xl hover:shadow-2xl active:scale-95 sm:hover:scale-105 transform touch-manipulation">
              Learn More
            </button>
          </div>
        </motion.div>

        {/* Brand strip */}
        <div className="mt-4 sm:mt-6 md:mt-8">
          <BrandStrip />
        </div>
      </div>
    </section>
  );
}
