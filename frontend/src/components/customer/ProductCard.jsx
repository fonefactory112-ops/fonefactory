import React from 'react';
import { formatPrice } from '../../utils/formatters';
import './ProductCard.css';

export default function ProductCard({ product, onEnquire, isEnquired }) {
  const imageUrl = product.image_url || 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=500&q=80';
  const isAvailable = product.availability;

  return (
    <div className="product-card card glass-card">
      <div className="product-card-img-wrapper">
        <img src={imageUrl} alt={product.name} className="product-card-image" loading="lazy" />
        <span className={`product-availability-badge badge ${isAvailable ? 'badge-success' : 'badge-error'}`}>
          {isAvailable ? 'In Stock' : 'Out of Stock'}
        </span>
      </div>
      <div className="product-card-body card-body">
        <h4 className="product-card-name card-title">{product.name}</h4>
        <span className="product-card-category">{product.accessory_categories?.name}</span>
        <p className="product-card-description card-description">{product.description}</p>
        
        <div className="product-card-footer">
          <div className="product-card-price-container">
            <span className="price-label">Price</span>
            <span className="product-card-price">{formatPrice(product.price)}</span>
          </div>

          {isEnquired ? (
            <button className="btn btn-success btn-sm" disabled>
              ENQUIRED
            </button>
          ) : (
            <button 
              className="btn btn-primary btn-sm" 
              onClick={() => onEnquire(product)}
              disabled={!isAvailable}
            >
              {isAvailable ? 'Enquire' : 'Out of Stock'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
