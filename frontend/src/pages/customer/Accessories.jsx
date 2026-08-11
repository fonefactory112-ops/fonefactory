import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import ProductCard from '../../components/customer/ProductCard';
import OTPModal from '../../components/common/OTPModal';
import EmptyState from '../../components/common/EmptyState';
import { FiShoppingBag } from 'react-icons/fi';
import './Accessories.css';

export default function Accessories() {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enquiryItem, setEnquiryItem] = useState(null);
  const [isOTPModalOpen, setIsOTPModalOpen] = useState(false);
  const [enquiredIds, setEnquiredIds] = useState([]);

  // Load enquired IDs from sessionStorage
  useEffect(() => {
    const stored = sessionStorage.getItem('enquired_accessory_ids');
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
        const [catsRes, productsRes] = await Promise.all([
          api.getAccessoryCategories(true),
          api.getAccessories(null, true)
        ]);

        setCategories(catsRes || []);
        setProducts(productsRes || []);
      } catch (err) {
        console.error('Failed to load accessories:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleCategorySelect = (categoryId) => {
    setSelectedCategory(categoryId);
  };

  const handleEnquireClick = (product) => {
    setEnquiryItem({
      id: product.id,
      name: product.name,
      category_name: product.accessory_categories?.name || 'Accessory',
      type: 'accessory',
    });
    setIsOTPModalOpen(true);
  };

  const handleEnquirySuccess = (productId) => {
    const updated = [...enquiredIds, productId];
    setEnquiredIds(updated);
    sessionStorage.setItem('enquired_accessory_ids', JSON.stringify(updated));
  };

  const filteredProducts = selectedCategory
    ? products.filter(p => p.category_id === selectedCategory)
    : products;

  return (
    <div className="accessories-page-container container section">
      <div className="page-header">
        <h1>Premium <span className="text-gradient">Accessories & Gadgets</span></h1>
        <p>Enhance and protect your smartphone with premium pouches, fast charging cables, high-speed power adapters, and more.</p>
      </div>

      {/* Category boxes filtering */}
      <div className="accessories-categories-bar">
        <button
          className={`category-pill-btn ${selectedCategory === null ? 'active' : ''}`}
          onClick={() => handleCategorySelect(null)}
        >
          All Accessories
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

      {/* Products list layout */}
      {loading ? (
        <div className="grid-4 products-grid">
          <div className="skeleton skeleton-card"></div>
          <div className="skeleton skeleton-card"></div>
          <div className="skeleton skeleton-card"></div>
          <div className="skeleton skeleton-card"></div>
        </div>
      ) : filteredProducts.length === 0 ? (
        <EmptyState
          icon={FiShoppingBag}
          title="No products available"
          message={selectedCategory ? "There are no active products in this category at this time." : "There are currently no gadgets or accessories listed."}
        />
      ) : (
        <div className="grid-4 products-grid">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onEnquire={handleEnquireClick}
              isEnquired={enquiredIds.includes(product.id)}
            />
          ))}
        </div>
      )}

      {/* OTP validation modal */}
      <OTPModal
        isOpen={isOTPModalOpen}
        onClose={() => setIsOTPModalOpen(false)}
        item={enquiryItem}
        onSuccess={handleEnquirySuccess}
      />
    </div>
  );
}
