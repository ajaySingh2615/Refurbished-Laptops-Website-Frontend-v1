import React from 'react';
import { motion } from 'framer-motion';

export function CompanyLogoSection() {
  const companies = [
    {
      id: 1,
      name: 'Apple',
      logo: '/companies_logo/apple.webp',
    },
    {
      id: 2,
      name: 'Samsung',
      logo: '/companies_logo/sumsung.webp',
    },
    {
      id: 3,
      name: 'Microsoft',
      logo: '/companies_logo/microsoft.webp',
    },
    {
      id: 4,
      name: 'Dell',
      logo: '/companies_logo/dell.webp',
    },
    {
      id: 5,
      name: 'HP',
      logo: '/companies_logo/hp.webp',
    },
    {
      id: 6,
      name: 'Lenovo',
      logo: '/companies_logo/lenovo.webp',
    },
    {
      id: 7,
      name: 'ASUS',
      logo: '/companies_logo/asus.webp',
    },
    {
      id: 8,
      name: 'Acer',
      logo: '/companies_logo/acer.webp',
    },
    {
      id: 9,
      name: 'LG',
      logo: '/companies_logo/lg.webp',
    },
    {
      id: 10,
      name: 'MSI',
      logo: '/companies_logo/msi.webp',
    },
    {
      id: 11,
      name: 'HONOR',
      logo: '/companies_logo/honor.webp',
    },
    {
      id: 12,
      name: 'Xiaomi',
      logo: '/companies_logo/mi.webp',
    },
  ];

  return (
    <section className="company-logo-section py-8 sm:py-12 md:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Scrolling Company Logos */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden"
        >
          <div className="company-logos-scroll flex items-center space-x-6 sm:space-x-8 md:space-x-10 whitespace-nowrap">
            {/* First set of logos */}
            {companies.map((company) => (
              <div key={company.id} className="flex-shrink-0 group">
                <img
                  src={company.logo}
                  alt={`${company.name} Logo`}
                  className="h-12 w-auto sm:h-16 md:h-20 object-contain transition-all duration-300 opacity-80 group-hover:opacity-100 group-hover:scale-110 transform"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'block';
                  }}
                />
                {/* Fallback for missing logos */}
                <div className="text-gray-400 font-semibold text-xs sm:text-sm hidden">
                  {company.name}
                </div>
              </div>
            ))}

            {/* Duplicate set for seamless loop */}
            {companies.map((company) => (
              <div key={`dup-${company.id}`} className="flex-shrink-0 group">
                <img
                  src={company.logo}
                  alt={`${company.name} Logo`}
                  className="h-12 w-auto sm:h-16 md:h-20 object-contain transition-all duration-300 opacity-80 group-hover:opacity-100 group-hover:scale-110 transform"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'block';
                  }}
                />
                {/* Fallback for missing logos */}
                <div className="text-gray-400 font-semibold text-xs sm:text-sm hidden">
                  {company.name}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
