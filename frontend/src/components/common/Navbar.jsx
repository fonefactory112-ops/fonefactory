import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { FiMenu, FiX } from 'react-icons/fi';
import './Navbar.css';

export default function Navbar({ settings }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);
  const closeMobileMenu = () => setMobileMenuOpen(false);

  const logoUrl = settings?.logo_url;
  const shopName = settings?.shop_name || 'Fone Factory';

  return (
    <nav className="site-navbar">
      <div className="container nav-container">
        {/* Left Side: Shop Brand Name */}
        <Link to="/" className="nav-logo-text" onClick={closeMobileMenu}>
          <span className="text-gradient">{shopName}</span>
        </Link>

        {/* Center/Main Navigation Links */}
        <div className={`nav-menu ${mobileMenuOpen ? 'active' : ''}`}>
          <NavLink to="/" end className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={closeMobileMenu}>
            About
          </NavLink>
          <NavLink to="/services" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={closeMobileMenu}>
            Services
          </NavLink>
          <NavLink to="/accessories" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={closeMobileMenu}>
            Accessories & Gadgets
          </NavLink>
        </div>

        {/* Right Side: Optional Shop Logo */}
        <div className="nav-logo-right">
          {logoUrl ? (
            <img src={logoUrl} alt={`${shopName} Logo`} className="nav-logo-img" />
          ) : (
            <div className="nav-logo-placeholder">{shopName.charAt(0)}</div>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <button className="mobile-nav-toggle" onClick={toggleMobileMenu} aria-label="Toggle navigation menu">
          {mobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>
      </div>
    </nav>
  );
}
