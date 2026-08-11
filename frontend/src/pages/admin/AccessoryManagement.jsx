import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { FiPlus, FiEdit2, FiTrash2, FiUploadCloud, FiSearch, FiCheck, FiX, FiImage } from 'react-icons/fi';
import { formatPrice } from '../../utils/formatters';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

export default function AccessoryManagement() {
  const [accessories, setAccessories] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form Modal States
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAccessory, setEditingAccessory] = useState(null); // null if adding new
  const [imageUrl, setImageUrl] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);

  // Search Filter
  const [search, setSearch] = useState('');

  // Form Fields
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [availability, setAvailability] = useState(true); // In stock vs Out of stock
  const [isActive, setIsActive] = useState(true);

  // Delete Dialog States
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [accessoryToDelete, setAccessoryToDelete] = useState(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [accessoriesData, categoriesData] = await Promise.all([
        api.getAllAccessoriesAdmin(),
        api.getAccessoryCategories(false),
      ]);
      setAccessories(accessoriesData || []);
      setCategories(categoriesData || []);
    } catch (err) {
      toast.error('Failed to load accessories data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openAddModal = () => {
    setEditingAccessory(null);
    setName('');
    setCategoryId(categories[0]?.id || '');
    setDescription('');
    setPrice('');
    setAvailability(true);
    setIsActive(true);
    setImageUrl('');
    setModalOpen(true);
  };

  const openEditModal = (acc) => {
    setEditingAccessory(acc);
    setName(acc.name || '');
    setCategoryId(acc.category_id || '');
    setDescription(acc.description || '');
    setPrice(acc.price || '');
    setAvailability(acc.availability);
    setIsActive(acc.is_active);
    setImageUrl(acc.image_url || '');
    setModalOpen(true);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingImage(true);
    try {
      const res = await api.uploadAccessoryImage(file);
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
      toast.error('Please select an accessory category');
      return;
    }

    const payload = {
      name,
      category_id: categoryId,
      description,
      price: parseFloat(price) || 0,
      image_url: imageUrl,
      availability,
      is_active: isActive,
    };

    try {
      if (editingAccessory) {
        await api.updateAccessory(editingAccessory.id, payload);
        toast.success('Accessory updated successfully');
      } else {
        await api.createAccessory(payload);
        toast.success('Accessory created successfully');
      }
      setModalOpen(false);
      loadData();
    } catch (err) {
      toast.error(err.message || 'Operation failed');
    }
  };

  const openDeleteDialog = (acc) => {
    setAccessoryToDelete(acc);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!accessoryToDelete) return;
    try {
      await api.deleteAccessory(accessoryToDelete.id);
      toast.success('Accessory deactivated successfully');
      setDeleteDialogOpen(false);
      setAccessoryToDelete(null);
      loadData();
    } catch (err) {
      toast.error('Deactivation failed');
    }
  };

  const filteredAccessories = accessories.filter((a) =>
    a.name.toLowerCase().includes(search.toLowerCase()) ||
    a.accessory_categories?.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="service-mgmt-container">
      <div className="mgmt-header">
        <div>
          <h2>Manage Accessories & Gadgets</h2>
          <p>Add, edit, toggle availability/visibility, and update shop accessory inventory</p>
        </div>
        <button className="btn btn-primary" onClick={openAddModal}>
          <FiPlus /> Add Accessory Product
        </button>
      </div>

      <div className="mgmt-actions-bar glass-card">
        <div className="search-input-wrapper">
          <FiSearch className="search-icon" />
          <input
            type="text"
            className="form-input search-input"
            placeholder="Search accessories by name or category..."
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
                <th>Stock Availability</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAccessories.length === 0 ? (
                <tr>
                  <td colSpan="7" className="no-data-td">
                    No accessories matching search found.
                  </td>
                </tr>
              ) : (
                filteredAccessories.map((acc) => (
                  <tr key={acc.id}>
                    <td>
                      <img
                        src={acc.image_url || 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=80&q=80'}
                        alt={acc.name}
                        className="table-img"
                      />
                    </td>
                    <td>
                      <div className="table-bold-text">{acc.name}</div>
                      <div className="table-sub-text">{acc.description?.substring(0, 50)}...</div>
                    </td>
                    <td>{acc.accessory_categories?.name}</td>
                    <td>{formatPrice(acc.price)}</td>
                    <td>
                      <span className={`badge ${acc.availability ? 'badge-success' : 'badge-error'}`}>
                        {acc.availability ? 'In Stock' : 'Out of Stock'}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${acc.is_active ? 'badge-success' : 'badge-error'}`}>
                        {acc.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <div className="table-action-btns">
                        <button className="btn btn-secondary btn-sm" onClick={() => openEditModal(acc)} title="Edit">
                          <FiEdit2 />
                        </button>
                        <button className="btn btn-danger btn-sm" onClick={() => openDeleteDialog(acc)} title="Delete (Deactivate)">
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

      {/* Add/Edit Accessory Modal */}
      {modalOpen && (
        <div className="modal-backdrop">
          <div className="modal-content glass-card shadow-xl">
            <div className="modal-header">
              <h3>{editingAccessory ? 'Edit Accessory Product' : 'Add New Accessory'}</h3>
              <button className="modal-close" onClick={() => setModalOpen(false)}><FiX size={20} /></button>
            </div>
            
            <form onSubmit={handleFormSubmit} className="modal-body">
              <div className="form-group">
                <label className="form-label">Product Name</label>
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
                  <label className="form-label">Category</label>
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
                  <label className="form-label">Price (₹)</label>
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
                    <img src={imageUrl} alt="Accessory Preview" />
                  ) : (
                    <div className="upload-placeholder"><FiImage size={32} /></div>
                  )}
                  {uploadingImage && <div className="uploader-loader"><LoadingSpinner size="small" /></div>}
                </div>
                <div className="upload-actions">
                  <label className="btn btn-secondary btn-sm file-upload-btn">
                    <FiUploadCloud /> {uploadingImage ? 'Uploading...' : 'Upload Image'}
                    <input type="file" onChange={handleImageUpload} accept="image/*" disabled={uploadingImage} hidden />
                  </label>
                  <p className="upload-tip">Upload square JPEG/PNG images for better display ratios.</p>
                </div>
              </div>

              <div className="form-row-2">
                <div className="form-group checkbox-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={availability}
                      onChange={(e) => setAvailability(e.target.checked)}
                    />
                    <span>Available In Stock</span>
                  </label>
                </div>

                <div className="form-group checkbox-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                    />
                    <span>Active & Visible</span>
                  </label>
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={uploadingImage}>
                  {editingAccessory ? 'Save Changes' : 'Create Accessory'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteDialogOpen}
        title="Confirm Product Deactivation"
        message={`Are you sure you want to deactivate "${accessoryToDelete?.name}"? It will hide this product from customers, but past enquiries will still link to it.`}
        confirmText="Deactivate"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteDialogOpen(false)}
      />
    </div>
  );
}
