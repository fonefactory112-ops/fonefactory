import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { FiUser, FiMail, FiCheckCircle, FiSave } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function Profile() {
  const { adminProfile, refreshProfile } = useAuth();
  const [fullName, setFullName] = useState(adminProfile?.full_name || '');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!fullName.trim()) {
      toast.error('Name cannot be empty');
      return;
    }

    setSaving(true);
    try {
      await api.updateProfile({ full_name: fullName });
      toast.success('Profile updated successfully');
      refreshProfile();
    } catch (err) {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="profile-container">
      <div className="admin-page-header">
        <h2>Admin Profile</h2>
        <p>Manage your account settings, personal details, and verify authorization status</p>
      </div>

      <div className="settings-grid-layout">
        {/* Personal Details form */}
        <div className="settings-main-card glass-card">
          <h3>Account Information</h3>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div className="login-input-wrapper" style={{ opacity: 0.6 }}>
                <FiMail className="login-input-icon" />
                <input
                  type="email"
                  className="form-input"
                  value={adminProfile?.email || ''}
                  disabled
                />
              </div>
              <span className="upload-tip" style={{ marginTop: '4px', display: 'block' }}>Email logins are managed in Supabase Auth.</span>
            </div>

            <div className="form-group">
              <label className="form-label">Full Name</label>
              <div className="login-input-wrapper">
                <FiUser className="login-input-icon" />
                <input
                  type="text"
                  className="form-input"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  disabled={saving}
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start' }} disabled={saving}>
              <FiSave /> {saving ? 'Saving...' : 'Update Name'}
            </button>
          </form>
        </div>

        {/* Authorization summary status */}
        <div className="settings-sidebar-col">
          <div className="asset-upload-card glass-card">
            <h3>Authorization Status</h3>
            <div className="otp-success-state" style={{ padding: '8px 0' }}>
              <div className="otp-success-icon" style={{ width: '70px', height: '70px' }}>
                <FiCheckCircle size={40} />
              </div>
              <h4 style={{ margin: '8px 0 4px' }}>Approved Admin</h4>
              <p style={{ fontSize: '12px', margin: '0' }}>
                Your account is active and verified by the system.
              </p>
            </div>
            
            <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '8px' }}>
                <span>Authorization Role</span>
                <span className="badge badge-success">Admin</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--color-text-secondary)' }}>
                <span>Access Level</span>
                <span className="badge badge-info">Full Read/Write</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
