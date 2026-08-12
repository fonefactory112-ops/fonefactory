import React, { useState } from 'react';
import { FiX, FiPhone, FiUser, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import { api } from '../../services/api';
import LoadingSpinner from './LoadingSpinner';
import './OTPModal.css'; // We'll keep the same CSS file name for now to maintain styles

export default function EnquiryModal({ isOpen, onClose, item, onSuccess }) {
  const [step, setStep] = useState(1); // 1: Form input, 2: Success
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!customerName.trim()) {
      setError('Please enter your name.');
      return;
    }
    if (!phone || phone.trim().length < 10) {
      setError('Please enter a valid 10-digit phone number.');
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
        customer_name: customerName.trim(),
        customer_phone: phone,
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
      <div className="otp-modal-content glass-card shadow-xl" id="enquiry-modal">
        <div className="otp-modal-header">
          <h3>Submit Enquiry</h3>
          <button className="otp-modal-close" onClick={handleClose}>
            <FiX size={20} />
          </button>
        </div>

        <div className="otp-modal-body">
          <p className="otp-item-context">
            Enquiring about: <strong>{item?.name}</strong> ({item?.category_name})
          </p>

          {error && (
            <div className="otp-error-alert">
              <FiAlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          {step === 1 && (
            <form onSubmit={handleSubmit} className="otp-step-form">
              <p className="otp-instruction">
                Please provide your contact details. Our team will reach out to you.
              </p>
              
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <div className="otp-input-wrapper">
                  <FiUser className="otp-input-icon" />
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
                <div className="otp-input-wrapper" style={{ display: 'flex', alignItems: 'center' }}>
                  <FiPhone className="otp-input-icon" />
                  <span style={{ paddingLeft: '35px', paddingRight: '8px', color: '#666', fontWeight: '500' }}>+91</span>
                  <input
                    type="tel"
                    className="form-input otp-tel-input"
                    placeholder="Enter 10-digit number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/[^\d]/g, ''))}
                    disabled={loading}
                    maxLength={10}
                    style={{ paddingLeft: '8px' }}
                    required
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-primary w-full" disabled={loading} style={{ marginTop: '1rem' }}>
                {loading ? <LoadingSpinner size="small" /> : 'Submit Enquiry'}
              </button>
            </form>
          )}

          {step === 2 && (
            <div className="otp-success-state">
              <div className="otp-success-icon">
                <FiCheckCircle size={60} />
              </div>
              <h4>Thank You!</h4>
              <p>
                Thank you for your enquiry. Please wait a little while. Our shop will contact you shortly.
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
