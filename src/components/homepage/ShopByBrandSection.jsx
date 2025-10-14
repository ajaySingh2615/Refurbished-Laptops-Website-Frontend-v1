import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export function ShopByBrandSection() {
  const navigate = useNavigate();

  const brands = [
    {
      id: 1,
      name: 'Apple',
      slug: 'apple',
      image: '/shop_by_brand/apple.webp',
    },
    {
      id: 2,
      name: 'Dell',
      slug: 'dell',
      image: '/shop_by_brand/dell.webp',
    },
    {
      id: 3,
      name: 'HP',
      slug: 'hp',
      image: '/shop_by_brand/hp.webp',
    },
    {
      id: 4,
      name: 'Lenovo',
      slug: 'lenovo',
      image: '/shop_by_brand/lenovo.webp',
    },
  ];

  const handleBrandClick = (brandSlug) => {
    navigate(`/products?brand=${brandSlug}`);
  };

  return (
    <section className="shop-by-brand-section py-8 sm:py-12 md:py-16">
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
            Shop by Brand
          </h2>
          <p className="text-sm sm:text-base text-gray-600">
            Discover products from your favorite brands
          </p>
        </motion.div>

        {/* Brand Cards Grid */}
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
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8"
        >
          {brands.map((brand) => (
            <motion.div
              key={brand.id}
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
              onClick={() => handleBrandClick(brand.slug)}
            >
              <div className="relative overflow-hidden rounded-xl shadow-md hover:shadow-xl transition-all duration-300 group-hover:scale-105 transform">
                <img
                  src={brand.image}
                  alt={`${brand.name} Brand`}
                  className="w-full h-48 sm:h-56 md:h-64 object-contain bg-white transition-transform duration-300 group-hover:scale-110"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                    objectPosition: 'center',
                  }}
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
                {/* Fallback for missing images */}
                <div className="w-full h-48 sm:h-56 md:h-64 bg-gray-200 flex items-center justify-center text-gray-500 font-semibold text-sm sm:text-base hidden">
                  {brand.name}
                </div>

                {/* Overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
