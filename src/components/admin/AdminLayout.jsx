import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion as Motion } from 'framer-motion';
import { useAdmin } from '../../contexts/AdminContext.jsx';

export default function AdminLayout({ children }) {
  const location = useLocation();
  const { lowStockCount } = useAdmin();

  const navItems = [
    { path: '/admin', label: 'Dashboard', icon: '📊' },
    { path: '/admin/orders', label: 'Orders', icon: '📦' },
    { path: '/admin/products', label: 'Products', icon: '💻', badge: lowStockCount },
    { path: '/admin/categories', label: 'Categories', icon: '📁' },
    { path: '/admin/coupons', label: 'Coupons', icon: '🎫' },
    { path: '/admin/images', label: 'Images', icon: '🖼️' },
    { path: '/admin/reviews', label: 'Reviews', icon: '⭐' },
    { path: '/admin/users', label: 'Users', icon: '👤' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex">
      {/* Sidebar */}
      <aside className="hidden md:flex md:w-80 backdrop-blur-xl bg-white/80 border-r border-slate-200/60 flex-col shadow-xl shadow-slate-200/50">
        {/* Header */}
        <div className="h-20 px-6 flex items-center border-b border-slate-200/60 bg-gradient-to-r from-slate-50/50 to-white/50">
          <Link to="/admin" className="flex items-center gap-3 group">
            <div className="relative">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-lg shadow-lg shadow-blue-500/25 group-hover:shadow-xl group-hover:shadow-blue-500/30 transition-all duration-300">
                RL
              </span>
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 group-hover:text-blue-700 transition-colors duration-300">
                Admin Panel
              </h1>
              <p className="text-xs text-slate-500 font-medium">Refurbished Laptops</p>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="relative flex-1 overflow-y-auto p-4">
          <ul className="space-y-2">
            {navItems.map((item) => {
              const active = location.pathname === item.path;
              return (
                <li key={item.path} className="relative">
                  {active && (
                    <Motion.span
                      layoutId="admin-active"
                      className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 shadow-sm"
                      transition={{ type: 'spring', stiffness: 320, damping: 28 }}
                    />
                  )}
                  <Link
                    to={item.path}
                    className={`relative flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 group ${
                      active
                        ? 'text-blue-700 bg-blue-50/50 shadow-sm'
                        : 'text-slate-700 hover:text-blue-700 hover:bg-slate-50/80 hover:shadow-sm'
                    }`}
                  >
                    <span
                      className={`inline-flex h-8 w-8 items-center justify-center rounded-lg text-lg transition-all duration-300 ${
                        active
                          ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md'
                          : 'bg-slate-100 text-slate-600 group-hover:bg-blue-100 group-hover:text-blue-600'
                      }`}
                    >
                      {item.icon}
                    </span>
                    <span className="flex-1">{item.label}</span>
                    {item.badge && item.badge > 0 && (
                      <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold text-white bg-red-500 rounded-full min-w-[20px] h-5 animate-pulse">
                        {item.badge}
                      </span>
                    )}
                    {active && (
                      <div className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-600"></div>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200/60 bg-gradient-to-r from-slate-50/50 to-white/50">
          <Link
            to="/"
            className="block w-full text-center px-4 py-3 text-sm font-semibold text-slate-700 hover:text-blue-700 hover:bg-slate-100/80 rounded-xl transition-all duration-300 border border-slate-200/60 hover:border-blue-200/60 hover:shadow-sm group"
          >
            <span className="flex items-center justify-center gap-2">
              <svg
                className="h-4 w-4 group-hover:scale-110 transition-transform duration-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
              View Site
            </span>
          </Link>
        </div>
      </aside>

      {/* Content */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Top bar (mobile) */}
        <div className="md:hidden bg-white/90 backdrop-blur-xl border-b border-slate-200/60 h-16 flex items-center justify-between px-4 shadow-sm">
          <Link to="/admin" className="flex items-center gap-2 group">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-sm shadow-md">
              RL
            </span>
            <span className="text-base font-bold text-slate-900 group-hover:text-blue-700 transition-colors duration-300">
              Admin Panel
            </span>
          </Link>
          <Link
            to="/"
            className="text-sm font-semibold text-slate-700 px-3 py-2 border border-slate-200/60 rounded-lg hover:bg-slate-50/80 hover:border-blue-200/60 hover:text-blue-700 transition-all duration-300 flex items-center gap-1.5"
          >
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
            View Site
          </Link>
        </div>
        <main className="p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
