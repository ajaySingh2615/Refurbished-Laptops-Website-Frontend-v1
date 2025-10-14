import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export function ShopByOSSection() {
  const navigate = useNavigate();

  const topBanners = [
    {
      title: 'Windows\nLaptops',
      image: '/shop_by_os/windows-laptops.webp',
      href: '/products?operatingSystem=windows',
      gradient: 'from-rose-100 to-rose-200',
      priceText: 'Starting at',
      price: '₹9,999',
    },
    {
      title: 'Apple\nMac OS',
      image: '/shop_by_os/apple-mac-os.webp',
      href: '/products?operatingSystem=macos',
      gradient: 'from-sky-100 to-indigo-100',
      priceText: 'Starting at',
      price: '₹19,999',
    },
  ];

  const bottomBanners = [
    {
      title: 'Laptops for\nMulti-tasking',
      image: '/shop_by_os/laptop/laptops-for-multi-tasking.webp',
      href: '/products?useCase=MULTI_TASKING',
    },
    {
      title: 'Laptops that are\nTouchscreen',
      image: '/shop_by_os/laptop/laptops-that-are-touchscreen.webp',
      href: '/products?touchscreen=true',
    },
    {
      title: 'Laptops for\nEveryday Needs',
      image: '/shop_by_os/laptop/laptops-for-everyday-needs.webp',
      href: '/products?useCase=EVERYDAY_NEEDS',
    },
  ];

  const handleBannerClick = (href) => {
    navigate(href);
  };

  return (
    <section className="shop-by-os-section py-12 sm:py-16 md:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.h2
          className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-8 sm:mb-12 text-gray-800"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
        >
          Shop by Operating System
        </motion.h2>

        {/* Top row - Two main banners */}
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.25 }}
          variants={{
            hidden: { opacity: 0 },
            show: {
              opacity: 1,
              transition: { staggerChildren: 0.12, delayChildren: 0.08 },
            },
          }}
          className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6 mb-6 sm:mb-8"
        >
          {topBanners.map((banner) => (
            <motion.div
              key={banner.title}
              className={`block rounded-2xl overflow-hidden bg-gradient-to-br ${banner.gradient} cursor-pointer hover:shadow-lg transition-shadow duration-300`}
              onClick={() => handleBannerClick(banner.href)}
              variants={{
                hidden: { opacity: 0, y: 18 },
                show: {
                  opacity: 1,
                  y: 0,
                  transition: { type: 'spring', stiffness: 100, damping: 18 },
                },
              }}
            >
              <div className="p-6 sm:p-8 flex items-center gap-4 sm:gap-6">
                <div className="flex-1 min-w-0">
                  <div className="text-xl sm:text-2xl md:text-3xl font-extrabold whitespace-pre-line text-gray-800 mb-2 sm:mb-3">
                    {banner.title}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-600 mb-1">{banner.priceText}</div>
                  <div className="text-xl sm:text-2xl md:text-3xl font-black text-gray-800">
                    {banner.price}
                  </div>
                </div>
                <div className="shrink-0">
                  <img
                    src={banner.image}
                    alt={banner.title.replace('\n', ' ')}
                    className="h-24 sm:h-28 md:h-36 w-auto object-contain"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom row - Three smaller banners */}
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.25 }}
          variants={{
            hidden: { opacity: 0 },
            show: {
              opacity: 1,
              transition: { staggerChildren: 0.12, delayChildren: 0.08 },
            },
          }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5"
        >
          {bottomBanners.map((banner) => (
            <motion.div
              key={banner.title}
              className="block rounded-2xl overflow-hidden bg-white border border-gray-200 cursor-pointer hover:shadow-lg transition-shadow duration-300"
              onClick={() => handleBannerClick(banner.href)}
              variants={{
                hidden: { opacity: 0, y: 18 },
                show: {
                  opacity: 1,
                  y: 0,
                  transition: { type: 'spring', stiffness: 100, damping: 18 },
                },
              }}
            >
              <div className="p-4 sm:p-5 flex items-center justify-between gap-3 sm:gap-4">
                <div className="min-w-0">
                  <div className="text-sm sm:text-base font-semibold whitespace-pre-line mb-2 sm:mb-3 text-gray-800">
                    {banner.title}
                  </div>
                  <span className="inline-flex items-center rounded-full px-2 sm:px-3 py-1 text-xs font-medium bg-blue-100 text-blue-600">
                    Shop Now
                  </span>
                </div>
                <img
                  src={banner.image}
                  alt={banner.title.replace('\n', ' ')}
                  className="h-16 sm:h-20 md:h-24 w-auto object-contain"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
