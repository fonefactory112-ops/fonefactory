import React from 'react';
import { Link } from 'react-router-dom';
import { FiSettings } from 'react-icons/fi';
import './Footer.css';

export default function Footer({ settings }) {
  const currentYear = new Date().getFullYear();
  const footerText = settings?.footer_text || 'Farhaan Pvt Presents';

  return (
    <footer className="site-footer">
      <div className="container footer-content">
        <div className="footer-copyright">
          &copy; {currentYear} {settings?.shop_name || 'Fone Factory'}. All rights reserved.
        </div>
        <div className="footer-branding">
          {footerText}
        </div>
        <div className="footer-admin-link">
          <Link to="/admin/login" className="admin-subtle-btn" title="Admin Panel" id="btn-admin-panel">
            <FiSettings size={14} />
          </Link>
        </div>
      </div>
    </footer>
  );
}
