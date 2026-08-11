import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  FiHome, FiSettings, FiBriefcase, FiFolder, FiShoppingBag, 
  FiLayers, FiMail, FiUser, FiLogOut, FiMenu, FiX 
} from 'react-icons/fi';
import './AdminLayout.css';

export default function AdminLayout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { logout, adminProfile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: FiHome },
    { name: 'Shop Settings', path: '/admin/settings', icon: FiSettings },
    { name: 'Services', path: '/admin/services', icon: FiBriefcase },
    { name: 'Service Categories', path: '/admin/service-categories', icon: FiFolder },
    { name: 'Accessories', path: '/admin/accessories', icon: FiShoppingBag },
    { name: 'Accessory Categories', path: '/admin/accessory-categories', icon: FiLayers },
    { name: 'Enquiries', path: '/admin/enquiries', icon: FiMail },
    { name: 'Profile / Admin', path: '/admin/profile', icon: FiUser },
  ];

  return (
    <div className="admin-layout">
      {/* Mobile Top Bar */}
      <header className="admin-mobile-header">
        <button className="admin-mobile-toggle" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>
        <span className="admin-mobile-title">
          {navItems.find(item => item.path === location.pathname)?.name || 'Admin Panel'}
        </span>
        <div className="admin-avatar-small">
          {adminProfile?.full_name?.charAt(0) || 'A'}
        </div>
      </header>

      {/* Sidebar Navigation */}
      <aside className={`admin-sidebar ${mobileOpen ? 'open' : ''}`}>
        <div className="admin-sidebar-header">
          <h3 className="text-gradient">Fone Factory</h3>
          <p className="sidebar-subtitle">Control Dashboard</p>
        </div>

        <div className="admin-sidebar-profile">
          <div className="admin-profile-circle">
            {adminProfile?.full_name?.charAt(0) || 'A'}
          </div>
          <div className="admin-profile-info">
            <span className="admin-profile-name">{adminProfile?.full_name || 'Administrator'}</span>
            <span className="admin-profile-role badge badge-success">Approved</span>
          </div>
        </div>

        <nav className="admin-sidebar-nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                onClick={() => setMobileOpen(false)}
              >
                <Icon size={18} />
                <span>{item.name}</span>
              </NavLink>
            );
          })}

          <button onClick={handleLogout} className="sidebar-link logout-btn">
            <FiLogOut size={18} />
            <span>Logout</span>
          </button>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="admin-main">
        <div className="admin-content-container">
          {children}
        </div>
      </main>

      {/* Backdrop for Mobile */}
      {mobileOpen && (
        <div className="admin-sidebar-backdrop" onClick={() => setMobileOpen(false)}></div>
      )}
    </div>
  );
}
