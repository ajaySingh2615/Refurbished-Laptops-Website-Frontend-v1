import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import HomePage from './pages/HomePage.jsx';
import ProductsPage from './pages/ProductsPage.jsx';
import ProductPage from './pages/ProductPage.jsx';
import NotFound from './pages/NotFound.jsx';
import AdminDashboard from './pages/admin/AdminDashboard.jsx';
import ProductManagement from './pages/admin/ProductManagement.jsx';
import { AdminProvider } from './contexts/AdminContext.jsx';

export default function App() {
  const handleSearch = (query) => {
    // Handled inside HomePage; kept for Layout compatibility
    console.log('Search query:', query);
  };

  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes wrapped in site Layout */}
        <Route
          path="/"
          element={
            <Layout onSearch={handleSearch}>
              <HomePage />
            </Layout>
          }
        />
        <Route
          path="/products"
          element={
            <Layout onSearch={handleSearch}>
              <ProductsPage />
            </Layout>
          }
        />
        <Route
          path="/product/:id"
          element={
            <Layout onSearch={handleSearch}>
              <ProductPage />
            </Layout>
          }
        />

        {/* Admin routes use their own layout */}
        <Route
          path="/admin"
          element={
            <AdminProvider>
              <AdminDashboard />
            </AdminProvider>
          }
        />
        <Route
          path="/admin/products"
          element={
            <AdminProvider>
              <ProductManagement />
            </AdminProvider>
          }
        />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
