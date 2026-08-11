import React from 'react';
import { FiPhone, FiMail, FiMapPin, FiClock } from 'react-icons/fi';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import './About.css';

export default function About({ settings, loading }) {
  if (loading) {
    return <LoadingSpinner fullPage />;
  }

  const shopName = settings?.shop_name || 'Fone Factory';
  const aboutDescription = settings?.about_description || 'Your premium mobile repair and gadget partner.';
  const email = settings?.email || 'fonefactory112@gmail.com';
  const phone = settings?.phone_number || '';
  const address = settings?.address || '';
  const workingHours = settings?.working_hours || '';
  const logoUrl = settings?.logo_url;
  
  const founderName = settings?.founder_name || 'Farhaan';
  const founderDescription = settings?.founder_description || 'Founder of Fone Factory.';
  const founderPhotoUrl = settings?.founder_photo_url;

  return (
    <div className="about-page-container">
      {/* Hero Section */}
      <section className="about-hero section">
        <div className="container hero-grid">
          <div className="hero-left">
            <h1 className="hero-title text-gradient">{shopName}</h1>
            <p className="hero-tagline">Premium Mobile Repair & Accessories Shop</p>
            <p className="hero-description">{aboutDescription}</p>
          </div>
          <div className="hero-right">
            {logoUrl ? (
              <img src={logoUrl} alt={`${shopName} Logo`} className="about-shop-logo" />
            ) : (
              <div className="about-logo-placeholder">
                <span>{shopName}</span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Info Boxes Section */}
      <section className="about-info-section">
        <div className="container">
          <div className="grid-4 info-grid">
            <div className="info-box glass-card">
              <div className="info-icon-wrapper"><FiPhone size={20} /></div>
              <h4>Call Us</h4>
              <p>{phone || 'Not available'}</p>
            </div>
            
            <div className="info-box glass-card">
              <div className="info-icon-wrapper"><FiMail size={20} /></div>
              <h4>Email Us</h4>
              <p>{email}</p>
            </div>

            <div className="info-box glass-card">
              <div className="info-icon-wrapper"><FiMapPin size={20} /></div>
              <h4>Visit Us</h4>
              <p>{address || 'Not available'}</p>
            </div>

            <div className="info-box glass-card">
              <div className="info-icon-wrapper"><FiClock size={20} /></div>
              <h4>Working Hours</h4>
              <p>{workingHours || 'Not available'}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Founder Section */}
      <section className="about-founder-section section">
        <div className="container">
          <h2 className="section-title text-center">Meet Our Founder</h2>
          <div className="founder-card glass-card">
            <div className="founder-img-col">
              {founderPhotoUrl ? (
                <img src={founderPhotoUrl} alt={founderName} className="founder-image" />
              ) : (
                <div className="founder-photo-placeholder">
                  <span>{founderName.charAt(0)}</span>
                </div>
              )}
            </div>
            <div className="founder-info-col">
              <h3 className="founder-name">{founderName}</h3>
              <p className="founder-title">Founder & Tech Expert</p>
              <p className="founder-description">{founderDescription}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
