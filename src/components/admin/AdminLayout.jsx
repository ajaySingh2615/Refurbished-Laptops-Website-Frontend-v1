import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function AdminLayout({ children }) {
  const location = useLocation();
  const navItems = [
    { path: '/admin', label: 'Dashboard', icon: '📊' },
    { path: '/admin/products', label: 'Products', icon: '💻' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex">
      {/* Sidebar */}
      <aside className="hidden md:flex md:w-72 backdrop-blur bg-white/70 border-r border-slate-200 flex-col">
        <div className="h-16 px-5 flex items-center border-b border-slate-200/70">
          <Link to="/admin" className="flex items-center gap-2">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white font-bold">
              RL
            </span>
            <h1 className="text-lg font-bold text-slate-900">Admin Panel</h1>
          </Link>
        </div>
        <nav className="relative flex-1 overflow-y-auto p-3">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const active = location.pathname === item.path;
              return (
                <li key={item.path} className="relative">
                  {active && (
                    <motion.span
                      layoutId="admin-active"
                      className="absolute inset-0 rounded-md bg-blue-600/10 border border-blue-600/20"
                      transition={{ type: 'spring', stiffness: 320, damping: 28 }}
                    />
                  )}
                  <Link
                    to={item.path}
                    className={`relative flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      active ? 'text-blue-700' : 'text-slate-700 hover:text-blue-700'
                    }`}
                  >
                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-slate-100 text-slate-700">
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="p-3 border-t border-slate-200/70">
          <Link
            to="/"
            className="block w-full text-center px-3 py-2 text-sm font-medium text-slate-700 hover:text-blue-700 hover:bg-slate-100 rounded-md"
          >
            View Site
          </Link>
        </div>
      </aside>

      {/* Content */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Top bar (mobile) */}
        <div className="md:hidden bg-white/80 backdrop-blur border-b border-slate-200 h-16 flex items-center justify-between px-4">
          <Link to="/admin" className="text-base font-semibold text-slate-900">
            Admin Panel
          </Link>
          <Link
            to="/"
            className="text-sm text-slate-700 px-3 py-1.5 border rounded-md hover:bg-slate-50"
          >
            View Site
          </Link>
        </div>
        <main className="p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
