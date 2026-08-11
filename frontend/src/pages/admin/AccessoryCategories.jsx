import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { FiPlus, FiEdit2, FiTrash2, FiX } from 'react-icons/fi';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

export default function AccessoryCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal States
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null); // null if adding new

  // Fields
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [displayOrder, setDisplayOrder] = useState('0');
  const [isActive, setIsActive] = useState(true);

  // Delete State
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [catToDelete, setCatToDelete] = useState(null);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const data = await api.getAccessoryCategories(false);
      setCategories(data || []);
    } catch (err) {
      toast.error('Failed to load accessory categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const openAddModal = () => {
    setEditingCategory(null);
    setName('');
    setDescription('');
    setDisplayOrder('0');
    setIsActive(true);
    setModalOpen(true);
  };

  const openEditModal = (cat) => {
    setEditingCategory(cat);
    setName(cat.name || '');
    setDescription(cat.description || '');
    setDisplayOrder(String(cat.display_order || 0));
    setIsActive(cat.is_active);
    setModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      name,
      description,
      display_order: parseInt(displayOrder) || 0,
      is_active: isActive,
    };

    try {
      if (editingCategory) {
        await api.updateAccessoryCategory(editingCategory.id, payload);
        toast.success('Category updated successfully');
      } else {
        await api.createAccessoryCategory(payload);
        toast.success('Category created successfully');
      }
      setModalOpen(false);
      loadCategories();
    } catch (err) {
      toast.error('Operation failed');
    }
  };

  const openDeleteDialog = (cat) => {
    setCatToDelete(cat);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!catToDelete) return;
    try {
      await api.deleteAccessoryCategory(catToDelete.id);
      toast.success('Category deactivated successfully');
      setDeleteDialogOpen(false);
      setCatToDelete(null);
      loadCategories();
    } catch (err) {
      toast.error('Deactivation failed');
    }
  };

  return (
    <div className="service-mgmt-container">
      <div className="mgmt-header">
        <div>
          <h2>Accessory Categories</h2>
          <p>Add, edit, reorder, and deactivate gadget categories (e.g. Charger, Cables, Pouch)</p>
        </div>
        <button className="btn btn-primary" onClick={openAddModal}>
          <FiPlus /> Add Category
        </button>
      </div>

      {loading ? (
        <LoadingSpinner size="large" />
      ) : (
        <div className="table-responsive glass-card">
          <table className="mgmt-table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Category Name</th>
                <th>Description</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.length === 0 ? (
                <tr>
                  <td colSpan="5" className="no-data-td">
                    No accessory categories found. Click 'Add Category' to create one.
                  </td>
                </tr>
              ) : (
                categories.map((cat) => (
                  <tr key={cat.id}>
                    <td>{cat.display_order}</td>
                    <td className="table-bold-text">{cat.name}</td>
                    <td>{cat.description || '-'}</td>
                    <td>
                      <span className={`badge ${cat.is_active ? 'badge-success' : 'badge-error'}`}>
                        {cat.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <div className="table-action-btns">
                        <button className="btn btn-secondary btn-sm" onClick={() => openEditModal(cat)} title="Edit">
                          <FiEdit2 />
                        </button>
                        <button className="btn btn-danger btn-sm" onClick={() => openDeleteDialog(cat)} title="Delete (Deactivate)">
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

      {/* Form Modal */}
      {modalOpen && (
        <div className="modal-backdrop">
          <div className="modal-content glass-card shadow-xl">
            <div className="modal-header">
              <h3>{editingCategory ? 'Edit Category' : 'Add Accessory Category'}</h3>
              <button className="modal-close" onClick={() => setModalOpen(false)}><FiX size={20} /></button>
            </div>
            
            <form onSubmit={handleFormSubmit} className="modal-body">
              <div className="form-group">
                <label className="form-label">Category Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Charger"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Display Sort Order</label>
                <input
                  type="number"
                  className="form-input"
                  value={displayOrder}
                  onChange={(e) => setDisplayOrder(e.target.value)}
                  required
                />
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

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingCategory ? 'Save Changes' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete/Deactivate Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteDialogOpen}
        title="Confirm Category Deactivation"
        message={`Are you sure you want to deactivate "${catToDelete?.name}"? Deactivating it will also automatically deactivate all active accessories linked to this category to prevent display errors.`}
        confirmText="Deactivate"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteDialogOpen(false)}
      />
    </div>
  );
}
