import React, { useState } from 'react';
import { FiX, FiPhone, FiUser, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import { api } from '../../services/api';
import LoadingSpinner from './LoadingSpinner';
import './EnquiryModal.css';

export default function EnquiryModal({ isOpen, onClose, item, onSuccess }) {
  const [step, setStep] = useState(1); // 1: Form input, 2: Success
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const sanitizePhone = (value) => value.replace(/\D/g, '').slice(0, 10);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prevent double submission
    if (loading) return;

    const trimmedName = customerName.trim();
    if (!trimmedName) {
      setError('Please enter your full name.');
      return;
    }

    const cleanPhone = sanitizePhone(phone);
    if (!cleanPhone || cleanPhone.length < 10) {
      setError('Please enter a valid 10-digit Indian mobile number.');
      return;
    }
    if (cleanPhone.length !== 10) {
      setError('Phone number must be exactly 10 digits.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await api.createEnquiry({
        type: item.type,
        reference_id: item.id,
        reference_name: item.name,
        category_name: item.category_name,
        customer_name: trimmedName,
        customer_phone: cleanPhone,
      });

      setStep(2);
      if (onSuccess) {
        onSuccess(item.id);
      }
    } catch (err) {
      setError(err.message || 'Failed to submit enquiry. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    // Reset state
    setStep(1);
    setCustomerName('');
    setPhone('');
    setError(null);
    onClose();
  };

  return (
    <div className="modal-backdrop">
      <div className="enquiry-modal-content glass-card shadow-xl" id="enquiry-modal">
        <div className="enquiry-modal-header">
          <h3>Submit Enquiry</h3>
          <button className="enquiry-modal-close" onClick={handleClose}>
            <FiX size={20} />
          </button>
        </div>

        <div className="enquiry-modal-body">
          <p className="enquiry-item-context">
            Enquiring about: <strong>{item?.name}</strong> ({item?.category_name})
          </p>

          {error && (
            <div className="enquiry-error-alert">
              <FiAlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          {step === 1 && (
            <form onSubmit={handleSubmit} className="enquiry-step-form">
              <p className="enquiry-instruction">
                Please provide your contact details. Our team will reach out to you.
              </p>
              
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <div className="enquiry-input-wrapper">
                  <FiUser className="enquiry-input-icon" />
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Enter your name"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    disabled={loading}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <div className="enquiry-input-wrapper" style={{ display: 'flex', alignItems: 'center' }}>
                  <FiPhone className="enquiry-input-icon" />
                  <span style={{ paddingLeft: '35px', paddingRight: '8px', color: '#666', fontWeight: '500' }}>+91</span>
                  <input
                    type="tel"
                    className="form-input enquiry-tel-input"
                    placeholder="Enter 10-digit number"
                    value={phone}
                    onChange={(e) => setPhone(sanitizePhone(e.target.value))}
                    disabled={loading}
                    maxLength={10}
                    style={{ paddingLeft: '8px' }}
                    required
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-primary w-full" disabled={loading} style={{ marginTop: '1rem' }}>
                {loading ? <><LoadingSpinner size="small" /> Submitting...</> : 'Submit Enquiry'}
              </button>
            </form>
          )}

          {step === 2 && (
            <div className="enquiry-success-state">
              <div className="enquiry-success-icon">
                <FiCheckCircle size={60} />
              </div>
              <h4>Thank You!</h4>
              <p>
                Thank you for your enquiry.
              </p>
              <p>
                Please wait a little while.<br />
                Our shop will contact you shortly.
              </p>
              <button onClick={handleClose} className="btn btn-primary w-full" style={{ marginTop: '1rem' }}>
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
