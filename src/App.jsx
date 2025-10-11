import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import HomePage from './pages/HomePage.jsx';
import ProductsPage from './pages/ProductsPage.jsx';
import ProductPage from './pages/ProductPage.jsx';
import CategoryPage from './pages/CategoryPage.jsx';
import NotFound from './pages/NotFound.jsx';
import Login from './pages/auth/Login.jsx';
import Register from './pages/auth/Register.jsx';
import VerifyEmail from './pages/auth/VerifyEmail.jsx';
import ForgotPassword from './pages/auth/ForgotPassword.jsx';
import ResetPassword from './pages/auth/ResetPassword.jsx';
import AdminDashboard from './pages/admin/AdminDashboard.jsx';
import ProductManagement from './pages/admin/ProductManagement.jsx';
import UserManagement from './pages/admin/UserManagement.jsx';
import CategoryManagement from './pages/admin/CategoryManagement.jsx';
import ImageManagement from './pages/admin/ImageManagement.jsx';
import ReviewManagement from './pages/admin/ReviewManagement.jsx';
import { AdminProvider } from './contexts/AdminContext.jsx';
import { RequireAdmin } from './contexts/Guards.jsx';

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
          path="/product/:sku"
          element={
            <Layout onSearch={handleSearch}>
              <ProductPage />
            </Layout>
          }
        />
        <Route
          path="/c/*"
          element={
            <Layout onSearch={handleSearch}>
              <CategoryPage />
            </Layout>
          }
        />

        {/* Auth */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Admin routes use their own layout */}
        <Route
          path="/admin"
          element={
            <RequireAdmin>
              <AdminProvider>
                <AdminDashboard />
              </AdminProvider>
            </RequireAdmin>
          }
        />
        <Route
          path="/admin/products"
          element={
            <RequireAdmin>
              <AdminProvider>
                <ProductManagement />
              </AdminProvider>
            </RequireAdmin>
          }
        />
        <Route
          path="/admin/users"
          element={
            <RequireAdmin>
              <AdminProvider>
                <UserManagement />
              </AdminProvider>
            </RequireAdmin>
          }
        />
        <Route
          path="/admin/categories"
          element={
            <RequireAdmin>
              <AdminProvider>
                <CategoryManagement />
              </AdminProvider>
            </RequireAdmin>
          }
        />
        <Route
          path="/admin/images"
          element={
            <RequireAdmin>
              <AdminProvider>
                <ImageManagement />
              </AdminProvider>
            </RequireAdmin>
          }
        />
        <Route
          path="/admin/reviews"
          element={
            <RequireAdmin>
              <AdminProvider>
                <ReviewManagement />
              </AdminProvider>
            </RequireAdmin>
          }
        />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
