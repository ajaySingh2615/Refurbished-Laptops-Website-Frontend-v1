import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function AdminLayout({ children }) {
  const location = useLocation();
  const navItems = [
    { path: '/admin', label: 'Dashboard', icon: '📊' },
    { path: '/admin/products', label: 'Products', icon: '💻' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="hidden md:flex md:w-64 bg-white border-r flex-col">
        <div className="h-16 px-4 flex items-center border-b">
          <Link to="/admin" className="flex items-center">
            <h1 className="text-lg font-bold text-gray-900">Admin Panel</h1>
          </Link>
        </div>
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium ${
                location.pathname === item.path
                  ? 'bg-blue-50 text-blue-700 border border-blue-100'
                  : 'text-gray-700 hover:text-blue-700 hover:bg-gray-50'
              }`}
            >
              <span className="text-base">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
        <div className="p-3 border-t">
          <Link
            to="/"
            className="block w-full text-center px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md"
          >
            View Site
          </Link>
        </div>
      </aside>

      {/* Content */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Top bar (mobile) */}
        <div className="md:hidden bg-white border-b h-16 flex items-center justify-between px-4">
          <Link to="/admin" className="text-base font-semibold text-gray-900">
            Admin Panel
          </Link>
          <Link
            to="/"
            className="text-sm text-gray-700 px-3 py-1.5 border rounded-md hover:bg-gray-50"
          >
            View Site
          </Link>
        </div>
        <main className="p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
