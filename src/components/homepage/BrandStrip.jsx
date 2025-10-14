import React from 'react';

export function BrandStrip() {
  const brands = [
    { name: 'Apple', logo: '/companies_logo/apple.webp' },
    { name: 'Samsung', logo: '/companies_logo/sumsung.webp' },
    { name: 'Microsoft', logo: '/companies_logo/microsoft.webp' },
    { name: 'Dell', logo: '/companies_logo/dell.webp' },
    { name: 'HP', logo: '/companies_logo/hp.webp' },
    { name: 'Lenovo', logo: '/companies_logo/lenovo.webp' },
    { name: 'ASUS', logo: '/companies_logo/asus.webp' },
    { name: 'Acer', logo: '/companies_logo/acer.webp' },
    { name: 'LG', logo: '/companies_logo/lg.webp' },
    { name: 'MSI', logo: '/companies_logo/msi.webp' },
    { name: 'HONOR', logo: '/companies_logo/honor.webp' },
    { name: 'Xiaomi', logo: '/companies_logo/mi.webp' },
    { name: 'Infinix', logo: '/companies_logo/infinix.webp' },
  ];

  return (
    <div className="brand-strip relative overflow-hidden py-4 sm:py-6 md:py-8">
      <div className="text-center mb-4 sm:mb-6">
        <p className="text-gray-300 text-xs sm:text-sm font-medium uppercase tracking-wider">
          Trusted Brands
        </p>
      </div>
      <div className="brand-marquee flex animate-scroll">
        <div className="brand-track flex items-center space-x-3 sm:space-x-4 md:space-x-6 whitespace-nowrap">
          {brands.map((brand, i) => (
            <div key={i} className="brand-pill flex-shrink-0">
              <div className="flex items-center justify-center w-20 h-14 sm:w-24 sm:h-16 md:w-28 md:h-20 bg-white/5 backdrop-blur-md rounded-lg sm:rounded-xl border border-white/10 hover:bg-white/10 hover:border-white/30 transition-all duration-300 shadow-lg hover:shadow-xl">
                <img
                  src={brand.logo}
                  alt={brand.name}
                  className="max-h-6 max-w-12 sm:max-h-8 sm:max-w-16 md:max-h-10 md:max-w-20 object-contain filter brightness-0 invert opacity-80 hover:opacity-100 transition-opacity"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'block';
                  }}
                />
                <span className="text-white text-xs sm:text-sm font-semibold hidden">
                  {brand.name}
                </span>
              </div>
            </div>
          ))}
        </div>
        {/* Duplicate track for seamless loop */}
        <div className="brand-track flex items-center space-x-3 sm:space-x-4 md:space-x-6 whitespace-nowrap ml-3 sm:ml-4 md:ml-6">
          {brands.map((brand, i) => (
            <div key={`dup-${i}`} className="brand-pill flex-shrink-0">
              <div className="flex items-center justify-center w-20 h-14 sm:w-24 sm:h-16 md:w-28 md:h-20 bg-white/5 backdrop-blur-md rounded-lg sm:rounded-xl border border-white/10 hover:bg-white/10 hover:border-white/30 transition-all duration-300 shadow-lg hover:shadow-xl">
                <img
                  src={brand.logo}
                  alt={brand.name}
                  className="max-h-6 max-w-12 sm:max-h-8 sm:max-w-16 md:max-h-10 md:max-w-20 object-contain filter brightness-0 invert opacity-80 hover:opacity-100 transition-opacity"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'block';
                  }}
                />
                <span className="text-white text-xs sm:text-sm font-semibold hidden">
                  {brand.name}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
