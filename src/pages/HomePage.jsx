import React from 'react';
import { useState, useEffect } from 'react';
import { apiService } from '../services/api.js';
import ProductList from '../components/ProductList.jsx';
import {
  HeroSection,
  BannerCarousel,
  FeaturedSection,
  ShopByBrandSection,
  ShopByProcessorSection,
  CompanyLogoSection,
  ShopByOSSection,
} from '../components/homepage';

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [scrollY, setScrollY] = useState(0);

  const loadProducts = async (page = 1) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getProducts(page);
      setProducts(response.products);
      setPagination(response.pagination);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          setScrollY(window.scrollY);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearch = async (query) => {
    try {
      setLoading(true);
      setError(null);
      const q = typeof query === 'string' ? query : searchQuery;
      if (!q || q.trim() === '') {
        await loadProducts(1);
      } else {
        const response = await apiService.searchProducts(q.trim());
        setProducts(response.products);
        setPagination({});
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Hero Section - Full width */}
      <HeroSection scrollY={scrollY} />

      {/* Banner Carousel */}
      <BannerCarousel />

      {/* Featured Section */}
      <FeaturedSection />

      {/* Shop by Brand Section */}
      <ShopByBrandSection />

      {/* Shop by Processor Section */}
      <ShopByProcessorSection />

      {/* Company Logo Section */}
      <CompanyLogoSection />

      {/* Shop by OS Section */}
      <ShopByOSSection />
    </>
  );
}
