import React from 'react';
import { formatPrice } from '../../utils/formatters';
import './ServiceCard.css';

export default function ServiceCard({ service, onEnquire, isEnquired }) {
  const imageUrl = service.image_url || 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=500&q=80';

  return (
    <div className="service-card card glass-card">
      <img src={imageUrl} alt={service.name} className="service-card-image" loading="lazy" />
      <div className="service-card-body card-body">
        <h4 className="service-card-name card-title">{service.name}</h4>
        <span className="service-card-category">{service.service_categories?.name}</span>
        <p className="service-card-description card-description">{service.description}</p>
        
        <div className="service-card-footer">
          <div className="service-card-price-container">
            <span className="price-label">Estimated Price</span>
            <span className="service-card-price">{formatPrice(service.price)}</span>
          </div>

          {isEnquired ? (
            <button className="btn btn-success btn-sm" disabled>
              ENQUIRED
            </button>
          ) : (
            <button className="btn btn-primary btn-sm" onClick={() => onEnquire(service)}>
              Enquire
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
