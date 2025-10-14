import React from 'react';
import { useState, useEffect } from 'react';
import { HeroSection } from './HeroSection';

export function HomePage() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen">
      <HeroSection scrollY={scrollY} />

      {/* Placeholder for other sections */}
      <div className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">More sections coming soon...</h2>
          <p className="text-gray-600">This is where other homepage sections will be added.</p>
        </div>
      </div>
    </div>
  );
}
