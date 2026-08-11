import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { api } from './services/api';

// Common components
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import LoadingSpinner from './components/common/LoadingSpinner';

// Customer pages
import About from './pages/customer/About';
import Services from './pages/customer/Services';
import Accessories from './pages/customer/Accessories';

// Admin pages
import Login from './pages/admin/Login';
import AdminLayout from './components/admin/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import ShopSettings from './pages/admin/ShopSettings';
import ServiceManagement from './pages/admin/ServiceManagement';
import ServiceCategories from './pages/admin/ServiceCategories';
import AccessoryManagement from './pages/admin/AccessoryManagement';
import AccessoryCategories from './pages/admin/AccessoryCategories';
import EnquiryManagement from './pages/admin/EnquiryManagement';
import Profile from './pages/admin/Profile';

// Helper component for private routes
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner fullPage />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  return <AdminLayout>{children}</AdminLayout>;
}

export default function App() {
  const [settings, setSettings] = useState(null);
  const [loadingSettings, setLoadingSettings] = useState(true);
  const location = useLocation();

  const fetchSettings = async () => {
    try {
      const data = await api.getSettings();
      setSettings(data);
    } catch (err) {
      console.error('Failed to load shop settings:', err);
    } finally {
      setLoadingSettings(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <>
      {/* Show navigation bar on customer-facing pages */}
      {!isAdminRoute && <Navbar settings={settings} />}

      <main style={{ flex: 1 }}>
        <Routes>
          {/* Customer Facing Pages */}
          <Route path="/" element={<About settings={settings} loading={loadingSettings} />} />
          <Route path="/services" element={<Services />} />
          <Route path="/accessories" element={<Accessories />} />

          {/* Admin Authentication */}
          <Route path="/admin/login" element={<Login />} />

          {/* Protected Control Panel Routes */}
          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/settings"
            element={
              <ProtectedRoute>
                <ShopSettings settings={settings} onUpdate={fetchSettings} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/services"
            element={
              <ProtectedRoute>
                <ServiceManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/service-categories"
            element={
              <ProtectedRoute>
                <ServiceCategories />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/accessories"
            element={
              <ProtectedRoute>
                <AccessoryManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/accessory-categories"
            element={
              <ProtectedRoute>
                <AccessoryCategories />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/enquiries"
            element={
              <ProtectedRoute>
                <EnquiryManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          {/* Fallback Catch-All Redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Show footer on customer-facing pages */}
      {!isAdminRoute && <Footer settings={settings} />}
    </>
  );
}
