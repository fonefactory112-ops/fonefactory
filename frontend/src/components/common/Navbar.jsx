import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import './Navbar.css';

export default function Navbar({ settings }) {
  const logoUrl = settings?.logo_url;
  const shopName = settings?.shop_name || 'Fone Factory';

  return (
    <nav className="site-navbar">
      <div className="container nav-container">
        {/* Left Side: Shop Brand Name */}
        <div className="nav-top-row">
          <Link to="/" className="nav-logo-text">
            <span className="text-gradient">{shopName}</span>
          </Link>

          {/* Right Side: Shop Logo / Admin Link */}
          <div className="nav-logo-right">
            {logoUrl ? (
              <Link to="/admin/login">
                <img src={logoUrl} alt={`${shopName} Logo`} className="nav-logo-img" />
              </Link>
            ) : (
              <Link to="/admin/login" className="nav-logo-placeholder">
                {shopName.charAt(0)}
              </Link>
            )}
          </div>
        </div>

        {/* Navigation Links — always visible, scrollable on narrow screens */}
        <div className="nav-links-row">
          <NavLink to="/" end className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            About
          </NavLink>
          <NavLink to="/services" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            Services
          </NavLink>
          <NavLink to="/accessories" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            Accessories & Gadgets
          </NavLink>
        </div>
      </div>
    </nav>
  );
}
