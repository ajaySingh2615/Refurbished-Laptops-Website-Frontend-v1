import React from 'react';
import { HiShieldCheck, HiRefresh, HiBadgeCheck } from 'react-icons/hi';
import { motion } from 'framer-motion';

export function FeaturedSection() {
  const features = [
    {
      icon: <HiShieldCheck className="w-6 h-6 sm:w-8 sm:h-8" />,
      title: '32-Point Quality Check',
      description:
        'Every device undergoes rigorous testing for performance, battery life, display quality, and all ports.',
    },
    {
      icon: <HiRefresh className="w-6 h-6 sm:w-8 sm:h-8" />,
      title: '15-Day Replacement',
      description:
        "If something's not right, we'll replace it quickly with no lengthy forms or hassles.",
    },
    {
      icon: <HiBadgeCheck className="w-6 h-6 sm:w-8 sm:h-8" />,
      title: '6-Month Warranty',
      description: 'Peace of mind on all refurbished devices with comprehensive warranty coverage.',
    },
  ];

  return (
    <section className="featured-section py-8 sm:py-12 md:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          className="text-center mb-6 sm:mb-8 md:mb-10"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 mb-2 sm:mb-3">
            Why Choose DeviceHub?
          </h2>
          <p className="text-sm sm:text-base text-gray-600 max-w-xl mx-auto">
            Quality devices with peace of mind
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          variants={{
            hidden: { opacity: 0 },
            show: {
              opacity: 1,
              transition: { staggerChildren: 0.15, delayChildren: 0.1 },
            },
          }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={{
                hidden: { opacity: 0, y: 30 },
                show: {
                  opacity: 1,
                  y: 0,
                  transition: {
                    type: 'spring',
                    stiffness: 100,
                    damping: 15,
                    duration: 0.6,
                  },
                },
              }}
              className="text-center group"
            >
              {/* Icon Container */}
              <motion.div
                className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3 sm:mb-4 group-hover:bg-blue-200 transition-colors duration-300 shadow-md group-hover:shadow-lg"
                whileHover={{ scale: 1.05 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              >
                <div className="text-blue-600 group-hover:text-blue-700 transition-colors duration-300">
                  {feature.icon}
                </div>
              </motion.div>

              {/* Content */}
              <h3 className="text-base sm:text-lg md:text-xl font-semibold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors duration-300">
                {feature.title}
              </h3>
              <p className="text-xs sm:text-sm md:text-base text-gray-600 leading-relaxed max-w-xs mx-auto">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          className="text-center mt-8 sm:mt-10 md:mt-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 sm:px-6 md:px-8 py-2 sm:py-3 rounded-lg font-medium text-xs sm:text-sm md:text-base transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105 transform">
            Learn More About Our Quality
          </button>
        </motion.div>
      </div>
    </section>
  );
}
