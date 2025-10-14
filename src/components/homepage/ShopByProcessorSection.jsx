import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export function ShopByProcessorSection() {
  const navigate = useNavigate();

  const processors = [
    {
      id: 1,
      name: 'Intel',
      image: '/shop_by_processor/hhcgat6b7qnrvtstl2rc.webp',
      filterParam: 'processor=intel',
    },
    {
      id: 2,
      name: 'AMD',
      image: '/shop_by_processor/tfkqk9yjowfrkx8t5nh5.webp',
      filterParam: 'processor=amd',
    },
    {
      id: 3,
      name: 'Apple',
      image: '/shop_by_processor/pzvigopu0y6ftdxsd4bi.webp',
      filterParam: 'brand=apple',
    },
  ];

  const handleProcessorClick = (filterParam) => {
    navigate(`/products?${filterParam}`);
  };

  return (
    <section className="shop-by-processor-section py-8 sm:py-12 md:py-16">
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
            Shop by Processor
          </h2>
          <p className="text-sm sm:text-base text-gray-600">
            Find the perfect laptop with your preferred processor
          </p>
        </motion.div>

        {/* Processor Cards Grid */}
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          variants={{
            hidden: { opacity: 0 },
            show: {
              opacity: 1,
              transition: { staggerChildren: 0.1, delayChildren: 0.1 },
            },
          }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8"
        >
          {processors.map((processor) => (
            <motion.div
              key={processor.id}
              variants={{
                hidden: { opacity: 0, y: 20 },
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
              className="group cursor-pointer"
              onClick={() => handleProcessorClick(processor.filterParam)}
            >
              <div className="relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 group-hover:scale-105 transform">
                <img
                  src={processor.image}
                  alt={`${processor.name} Processor`}
                  className="w-full h-48 sm:h-56 md:h-64 object-cover transition-transform duration-300 group-hover:scale-110"
                  style={{
                    width: '100%',
                    aspectRatio: '3/2',
                    objectFit: 'cover',
                    objectPosition: 'center',
                  }}
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
                {/* Fallback for missing images */}
                <div className="w-full h-48 sm:h-56 md:h-64 bg-gray-200 flex items-center justify-center text-gray-500 font-semibold text-sm sm:text-base hidden">
                  {processor.name}
                </div>

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
