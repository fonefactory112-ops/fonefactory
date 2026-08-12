import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import ServiceCard from '../../components/customer/ServiceCard';
import EnquiryModal from '../../components/common/EnquiryModal';
import EmptyState from '../../components/common/EmptyState';
import { FiSmartphone } from 'react-icons/fi';
import './Services.css';

export default function Services() {
  const [categories, setCategories] = useState([]);
  const [services, setServices] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enquiryItem, setEnquiryItem] = useState(null);
  const [isEnquiryModalOpen, setIsEnquiryModalOpen] = useState(false);
  const [enquiredIds, setEnquiredIds] = useState([]);

  // Load enquired IDs from sessionStorage to persist during page browsing
  useEffect(() => {
    const stored = sessionStorage.getItem('enquired_service_ids');
    if (stored) {
      try {
        setEnquiredIds(JSON.parse(stored));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [catsRes, servicesRes] = await Promise.all([
          api.getServiceCategories(true),
          api.getServices(null, true)
        ]);
        
        setCategories(catsRes || []);
        setServices(servicesRes || []);
      } catch (err) {
        console.error('Failed to load services data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleCategorySelect = (categoryId) => {
    setSelectedCategory(categoryId);
  };

  const handleEnquireClick = (service) => {
    setEnquiryItem({
      id: service.id,
      name: service.name,
      category_name: service.service_categories?.name || 'Service',
      type: 'service',
    });
    setIsEnquiryModalOpen(true);
  };

  const handleEnquirySuccess = (serviceId) => {
    const updated = [...enquiredIds, serviceId];
    setEnquiredIds(updated);
    sessionStorage.setItem('enquired_service_ids', JSON.stringify(updated));
  };

  const filteredServices = selectedCategory
    ? services.filter(s => s.category_id === selectedCategory)
    : services;

  return (
    <div className="services-page-container container section">
      <div className="page-header">
        <h1>Professional <span className="text-gradient">Services</span></h1>
        <p>Expert diagnostic and repair solutions for display, battery, software, and other common smartphone issues.</p>
      </div>

      {/* Category selector */}
      <div className="services-categories-bar">
        <button
          className={`category-pill-btn ${selectedCategory === null ? 'active' : ''}`}
          onClick={() => handleCategorySelect(null)}
        >
          All Problems
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            className={`category-pill-btn ${selectedCategory === cat.id ? 'active' : ''}`}
            onClick={() => handleCategorySelect(cat.id)}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Services listing grid */}
      {loading ? (
        <div className="grid-3 services-grid">
          <div className="skeleton skeleton-card"></div>
          <div className="skeleton skeleton-card"></div>
          <div className="skeleton skeleton-card"></div>
        </div>
      ) : filteredServices.length === 0 ? (
        <EmptyState
          icon={FiSmartphone}
          title="No services found"
          message={selectedCategory ? "There are no active services under this category." : "There are currently no repair services available."}
        />
      ) : (
        <div className="grid-3 services-grid">
          {filteredServices.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              onEnquire={handleEnquireClick}
              isEnquired={enquiredIds.includes(service.id)}
            />
          ))}
        </div>
      )}

      {/* Enquiry popup */}
      <EnquiryModal
        isOpen={isEnquiryModalOpen}
        onClose={() => setIsEnquiryModalOpen(false)}
        item={enquiryItem}
        onSuccess={handleEnquirySuccess}
      />
    </div>
  );
}
