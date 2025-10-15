import React from 'react';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { FloatingNav } from './ui/FloatingNav.jsx';
import CartIcon from './cart/CartIcon.jsx';
import { apiService } from '../services/api.js';

export default function Header({ onSearch }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = React.useRef(null);
  const [categories, setCategories] = useState([]);

  React.useEffect(() => {
    function onDocClick(e) {
      if (!profileOpen) return;
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    }
    function onKey(e) {
      if (e.key === 'Escape') setProfileOpen(false);
    }
    document.addEventListener('mousedown', onDocClick);
    window.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      window.removeEventListener('keydown', onKey);
    };
  }, [profileOpen]);

  // Fetch categories on mount
  useEffect(() => {
    async function fetchCategories() {
      try {
        const data = await apiService.getAllCategories();
        // Filter only parent categories (those without parentId)
        const parentCategories = data.filter((cat) => !cat.parentId);
        setCategories(parentCategories);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
        setCategories([]);
      }
    }
    fetchCategories();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (onSearch && searchQuery.trim()) {
      onSearch(searchQuery.trim());
    }
  };

  // Build navigation items dynamically
  const buildNavItems = () => {
    const items = [
      { name: 'Home', link: '/' },
      { name: 'Products', link: '/products' },
    ];

    // Show first 2 parent categories
    const visibleCategories = categories.slice(0, 2);
    visibleCategories.forEach((cat) => {
      items.push({
        name: cat.name,
        link: `/products?category=${cat.slug || cat.name.toLowerCase().replace(/\s+/g, '-')}`,
      });
    });

    // If there are more than 2 categories, add "Others" dropdown
    if (categories.length > 2) {
      items.push({
        name: 'Others',
        isDropdown: true,
        children: categories.slice(2).map((cat) => ({
          name: cat.name,
          link: `/products?category=${cat.slug || cat.name.toLowerCase().replace(/\s+/g, '-')}`,
        })),
      });
    }

    return items;
  };

  return (
    <>
      <FloatingNav
        navItems={buildNavItems()}
        onLoginClick={() => (window.location.href = '/login')}
        onRegisterClick={() => (window.location.href = '/register')}
      />
      <header className="hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">Refurbished Laptops</h1>
            </Link>

            {/* Mobile menu button */}
            <button
              type="button"
              className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:bg-gray-100"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="Toggle navigation"
            >
              {mobileOpen ? (
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              )}
            </button>

            {/* Search Bar (hidden on small screens) */}
            <form onSubmit={handleSearch} className="hidden md:block flex-1 max-w-lg mx-8">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search laptops..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg
                    className="h-5 w-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
              </div>
            </form>

            {/* Navigation (hidden because FloatingNav handles desktop) */}
            <nav className="hidden">
              <Link
                to="/"
                className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
              >
                Home
              </Link>
              <Link
                to="/products"
                className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
              >
                Products
              </Link>
              <Link
                to="/c/electronics"
                className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
              >
                Electronics
              </Link>
              <Link
                to="/c/peripherals"
                className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
              >
                Peripherals
              </Link>
              <Link
                to="/admin"
                className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
              >
                Admin
              </Link>

              {/* Cart Icon */}
              <CartIcon className="text-gray-600 hover:text-gray-900" />

              {/* Auth links */}
              {!user ? (
                <></>
              ) : (
                <div className="relative" ref={profileRef}>
                  <button
                    className={`group inline-flex items-center gap-2 pl-2 pr-2.5 py-1.5 rounded-full border border-slate-200 bg-white/80 backdrop-blur hover:bg-white transition shadow-sm ${profileOpen ? 'ring-1 ring-slate-200' : ''}`}
                    onClick={() => setProfileOpen((v) => !v)}
                    aria-label="Open profile menu"
                  >
                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-white text-xs font-semibold">
                      {(user.name || user.email || '?').toString().trim().charAt(0).toUpperCase()}
                    </span>
                    <span className="text-sm text-slate-700 max-w-[140px] truncate">
                      Hi, {user.name || user.email}
                    </span>
                    <svg
                      className={`h-4 w-4 text-slate-500 transition-transform ${profileOpen ? 'rotate-180' : ''}`}
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                  {profileOpen && (
                    <div className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-200 bg-white/95 backdrop-blur shadow-xl z-50 overflow-hidden">
                      <div className="px-4 py-3 bg-slate-50/70">
                        <div className="text-[11px] text-slate-500">Signed in as</div>
                        <div className="text-sm font-medium text-slate-800 truncate">
                          {user.email}
                        </div>
                      </div>
                      <Link
                        to="/orders"
                        onClick={() => setProfileOpen(false)}
                        className="block w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
                      >
                        My Orders
                      </Link>
                      <Link
                        to="/profile"
                        onClick={() => setProfileOpen(false)}
                        className="block w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
                      >
                        Profile
                      </Link>
                      <div className="h-px bg-slate-200" />
                      <button
                        onClick={() => {
                          setProfileOpen(false);
                          logout();
                        }}
                        className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              )}
            </nav>
          </div>
        </div>

        {/* Mobile dropdown */}
        {mobileOpen && (
          <div className="md:hidden border-t bg-white">
            <div className="px-4 py-3 space-y-2">
              <form onSubmit={handleSearch} className="block">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search laptops..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg
                      className="h-5 w-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>
                </div>
              </form>
              <div className="grid grid-cols-2 gap-2">
                <Link
                  to="/"
                  className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100"
                  onClick={() => setMobileOpen(false)}
                >
                  Home
                </Link>
                <Link
                  to="/products"
                  className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100"
                  onClick={() => setMobileOpen(false)}
                >
                  Products
                </Link>
                {categories.map((cat) => (
                  <Link
                    key={cat.id}
                    to={`/products?categoryId=${cat.id}`}
                    className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100"
                    onClick={() => setMobileOpen(false)}
                  >
                    {cat.name}
                  </Link>
                ))}
                <Link
                  to="/admin"
                  className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100"
                  onClick={() => setMobileOpen(false)}
                >
                  Admin
                </Link>
                {!user ? (
                  <>
                    <Link
                      to="/login"
                      className="inline-flex h-10 items-center justify-center cursor-pointer border text-sm font-medium border-slate-200 text-slate-700 px-4 rounded-full bg-white hover:bg-slate-50 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-400/40 active:scale-[0.99] transition-colors"
                      aria-label="Login"
                    >
                      Login
                    </Link>
                    <Link
                      to="/register"
                      className="inline-flex h-10 items-center justify-center cursor-pointer text-sm font-semibold relative text-white px-5 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 shadow hover:from-blue-600/95 hover:to-purple-600/95 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-purple-400/40 active:scale-[0.99] transition-colors"
                      aria-label="Register"
                    >
                      Register
                    </Link>
                  </>
                ) : (
                  <button
                    onClick={logout}
                    className="col-span-2 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 text-left"
                  >
                    Logout
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
