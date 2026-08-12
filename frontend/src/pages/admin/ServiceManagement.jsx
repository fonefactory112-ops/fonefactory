import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { FiPlus, FiEdit2, FiTrash2, FiUploadCloud, FiSearch, FiCheck, FiX, FiImage } from 'react-icons/fi';
import { formatPrice } from '../../utils/formatters';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';
import './ServiceManagement.css';

export default function ServiceManagement() {
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form Modal States
  const [modalOpen, setModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null); // null if adding new
  const [imageFile, setImageFile] = useState(null);
  const [imageUrl, setImageUrl] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);

  // Search Filter
  const [search, setSearch] = useState('');

  // Form Fields
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [isActive, setIsActive] = useState(true);

  // Delete Dialog States
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [servicesData, categoriesData] = await Promise.all([
        api.getAllServicesAdmin(),
        api.getServiceCategories(false),
      ]);
      setServices(servicesData || []);
      setCategories(categoriesData || []);
    } catch (err) {
      toast.error('Failed to load services data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openAddModal = () => {
    setEditingService(null);
    setName('');
    setCategoryId(categories[0]?.id || '');
    setDescription('');
    setPrice('');
    setIsActive(true);
    setImageUrl('');
    setImageFile(null);
    setModalOpen(true);
  };

  const openEditModal = (service) => {
    setEditingService(service);
    setName(service.name || '');
    setCategoryId(service.category_id || '');
    setDescription(service.description || '');
    setPrice(service.price || '');
    setIsActive(service.is_active);
    setImageUrl(service.image_url || '');
    setImageFile(null);
    setModalOpen(true);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingImage(true);
    try {
      const res = await api.uploadServiceImage(file);
      setImageUrl(res.url);
      toast.success('Image uploaded successfully');
    } catch (err) {
      toast.error('Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!categoryId) {
      toast.error('Please select a service category');
      return;
    }

    const payload = {
      name,
      category_id: categoryId,
      description,
      price: parseFloat(price) || 0,
      image_url: imageUrl,
      is_active: isActive,
    };

    try {
      if (editingService) {
        await api.updateService(editingService.id, payload);
        toast.success('Service updated successfully');
      } else {
        await api.createService(payload);
        toast.success('Service created successfully');
      }
      setModalOpen(false);
      loadData();
    } catch (err) {
      toast.error(err.message || 'Operation failed');
    }
  };

  const openDeleteDialog = (service) => {
    setServiceToDelete(service);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!serviceToDelete) return;
    try {
      await api.deleteService(serviceToDelete.id);
      toast.success('Service deactivated successfully');
      setDeleteDialogOpen(false);
      setServiceToDelete(null);
      loadData();
    } catch (err) {
      toast.error('Deactivation failed');
    }
  };

  const filteredServices = services.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.service_categories?.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="service-mgmt-container">
      <div className="mgmt-header">
        <div>
          <h2>Manage Services</h2>
          <p>Add, edit, toggle visibility, and update phone repair services</p>
        </div>
        <button className="btn btn-primary" onClick={openAddModal}>
          <FiPlus /> Add Repair Service
        </button>
      </div>

      <div className="mgmt-actions-bar glass-card">
        <div className="search-input-wrapper">
          <FiSearch className="search-icon" />
          <input
            type="text"
            className="form-input search-input"
            placeholder="Search services by name or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <LoadingSpinner size="large" />
      ) : (
        <div className="table-responsive glass-card">
          <table className="mgmt-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredServices.length === 0 ? (
                <tr>
                  <td colSpan="6" className="no-data-td">
                    No services matching search found.
                  </td>
                </tr>
              ) : (
                filteredServices.map((service) => (
                  <tr key={service.id}>
                    <td>
                      <img
                        src={service.image_url || 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=80&q=80'}
                        alt={service.name}
                        className="table-img"
                      />
                    </td>
                    <td>
                      <div className="table-bold-text">{service.name}</div>
                      <div className="table-sub-text">{service.description?.substring(0, 50)}...</div>
                    </td>
                    <td>{service.service_categories?.name}</td>
                    <td>{formatPrice(service.price)}</td>
                    <td>
                      <span className={`badge ${service.is_active ? 'badge-success' : 'badge-error'}`}>
                        {service.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <div className="table-action-btns">
                        <button className="btn btn-secondary btn-sm" onClick={() => openEditModal(service)} title="Edit">
                          <FiEdit2 />
                        </button>
                        <button className="btn btn-danger btn-sm" onClick={() => openDeleteDialog(service)} title="Delete (Deactivate)">
                          <FiTrash2 />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Add/Edit Service Modal */}
      {modalOpen && (
        <div className="modal-backdrop">
          <div className="modal-content glass-card shadow-xl">
            <div className="modal-header">
              <h3>{editingService ? 'Edit Repair Service' : 'Add New Service'}</h3>
              <button className="modal-close" onClick={() => setModalOpen(false)}><FiX size={20} /></button>
            </div>
            
            <form onSubmit={handleFormSubmit} className="modal-body">
              <div className="form-group">
                <label className="form-label">Service Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label className="form-label">Service Category</label>
                  <select
                    className="form-select"
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    required
                  >
                    <option value="" disabled>Select category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Estimated Price (₹)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="0"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  className="form-input form-textarea"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="image-uploader-section">
                <div className="upload-preview">
                  {imageUrl ? (
                    <img src={imageUrl} alt="Service Preview" />
                  ) : (
                    <div className="upload-placeholder"><FiImage size={32} /></div>
                  )}
                  {uploadingImage && <div className="uploader-loader"><LoadingSpinner size="small" /></div>}
                </div>
                <div className="upload-actions">
                  <label className="btn btn-secondary btn-sm file-upload-btn">
                    <FiUploadCloud /> {uploadingImage ? 'Uploading...' : 'Upload Service Image'}
                    <input type="file" onChange={handleImageUpload} accept="image/*" disabled={uploadingImage} hidden />
                  </label>
                  <p className="upload-tip">Upload square JPEG/PNG images for better display ratios.</p>
                </div>
              </div>

              <div className="form-group checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                  />
                  <span>Active & Visible on Customer Website</span>
                </label>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={uploadingImage}>
                  {editingService ? 'Save Changes' : 'Create Service'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete/Deactivate Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteDialogOpen}
        title="Confirm Service Deactivation"
        message={`Are you sure you want to deactivate "${serviceToDelete?.name}"? It will hide this service from customers, but past enquiries will still link to it.`}
        confirmText="Deactivate"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteDialogOpen(false)}
      />
    </div>
  );
}
