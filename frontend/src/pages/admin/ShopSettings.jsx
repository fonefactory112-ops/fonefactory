import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { FiSave, FiUploadCloud, FiImage } from 'react-icons/fi';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';
import './ShopSettings.css';

export default function ShopSettings({ settings: initialSettings, onUpdate }) {
  const [formData, setFormData] = useState({
    shop_name: '',
    about_description: '',
    phone_number: '',
    email: '',
    address: '',
    working_hours: '',
    footer_text: '',
    founder_name: '',
    founder_description: '',
  });

  const [logoUrl, setLogoUrl] = useState('');
  const [founderPhotoUrl, setFounderPhotoUrl] = useState('');

  const [loading, setLoading] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  useEffect(() => {
    if (initialSettings) {
      setFormData({
        shop_name: initialSettings.shop_name || '',
        about_description: initialSettings.about_description || '',
        phone_number: initialSettings.phone_number || '',
        email: initialSettings.email || '',
        address: initialSettings.address || '',
        working_hours: initialSettings.working_hours || '',
        footer_text: initialSettings.footer_text || '',
        founder_name: initialSettings.founder_name || '',
        founder_description: initialSettings.founder_description || '',
      });
      setLogoUrl(initialSettings.logo_url || '');
      setFounderPhotoUrl(initialSettings.founder_photo_url || '');
    }
  }, [initialSettings]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingLogo(true);
    try {
      const res = await api.uploadLogo(file);
      setLogoUrl(res.url);
      toast.success('Logo uploaded successfully');
      if (onUpdate) onUpdate();
    } catch (err) {
      toast.error(err.message || 'Failed to upload logo');
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleFounderPhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingPhoto(true);
    try {
      const res = await api.uploadFounderPhoto(file);
      setFounderPhotoUrl(res.url);
      toast.success('Founder photo uploaded successfully');
      if (onUpdate) onUpdate();
    } catch (err) {
      toast.error(err.message || 'Failed to upload founder photo');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.updateSettings(formData);
      toast.success('Shop settings updated successfully');
      if (onUpdate) onUpdate();
    } catch (err) {
      toast.error(err.message || 'Failed to update settings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="shop-settings-container">
      <div className="admin-page-header">
        <h2>Shop Settings</h2>
        <p>Edit company descriptions, contact details, owner bio, logos, and footer information</p>
      </div>

      <form onSubmit={handleSubmit} className="settings-form">
        <div className="settings-grid-layout">
          {/* Main Info Card */}
          <div className="settings-main-card glass-card">
            <h3>General Information</h3>
            
            <div className="form-group">
              <label className="form-label">Shop Name</label>
              <input
                type="text"
                name="shop_name"
                className="form-input"
                value={formData.shop_name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">About the Shop</label>
              <textarea
                name="about_description"
                className="form-input form-textarea"
                value={formData.about_description}
                onChange={handleChange}
                rows={5}
                required
              />
            </div>

            <div className="form-row-2">
              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input
                  type="text"
                  name="phone_number"
                  className="form-input"
                  value={formData.phone_number}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email Address (Gmail)</label>
                <input
                  type="email"
                  name="email"
                  className="form-input"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Shop Address</label>
              <input
                type="text"
                name="address"
                className="form-input"
                value={formData.address}
                onChange={handleChange}
              />
            </div>

            <div className="form-row-2">
              <div className="form-group">
                <label className="form-label">Working Hours</label>
                <input
                  type="text"
                  name="working_hours"
                  className="form-input"
                  value={formData.working_hours}
                  onChange={handleChange}
                  placeholder="e.g. Mon - Sat: 10AM - 8PM"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Footer Copyright / Presenter Text</label>
                <input
                  type="text"
                  name="footer_text"
                  className="form-input"
                  value={formData.footer_text}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          {/* Right Column: Assets & Logo / Founder */}
          <div className="settings-sidebar-col">
            {/* Logo Upload Card */}
            <div className="asset-upload-card glass-card">
              <h3>Shop Logo</h3>
              <div className="asset-preview-box">
                {logoUrl ? (
                  <img src={logoUrl} alt="Shop Logo" className="logo-preview-img" />
                ) : (
                  <div className="asset-icon-placeholder"><FiImage size={32} /></div>
                )}
                {uploadingLogo && <div className="uploader-loader"><LoadingSpinner size="small" /></div>}
              </div>
              <label className="btn btn-secondary btn-sm file-upload-btn">
                <FiUploadCloud /> {uploadingLogo ? 'Uploading...' : 'Upload Logo'}
                <input type="file" onChange={handleLogoUpload} accept="image/*" disabled={uploadingLogo} hidden />
              </label>
            </div>

            {/* Founder Info Card */}
            <div className="asset-upload-card glass-card">
              <h3>Founder Profile</h3>
              <div className="asset-preview-box circle">
                {founderPhotoUrl ? (
                  <img src={founderPhotoUrl} alt="Founder" className="logo-preview-img" />
                ) : (
                  <div className="asset-icon-placeholder"><FiImage size={32} /></div>
                )}
                {uploadingPhoto && <div className="uploader-loader"><LoadingSpinner size="small" /></div>}
              </div>
              
              <label className="btn btn-secondary btn-sm file-upload-btn mb-4">
                <FiUploadCloud /> {uploadingPhoto ? 'Uploading...' : 'Upload Photo'}
                <input type="file" onChange={handleFounderPhotoUpload} accept="image/*" disabled={uploadingPhoto} hidden />
              </label>

              <div className="form-group">
                <label className="form-label">Founder Name</label>
                <input
                  type="text"
                  name="founder_name"
                  className="form-input"
                  value={formData.founder_name}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Founder Description</label>
                <textarea
                  name="founder_description"
                  className="form-input form-textarea"
                  value={formData.founder_description}
                  onChange={handleChange}
                  rows={3}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="settings-action-bar">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            <FiSave /> {loading ? 'Saving Settings...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  );
}
