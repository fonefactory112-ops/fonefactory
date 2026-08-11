import React, { useState } from 'react';
import { FiX, FiPhone, FiLock, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import { api } from '../../services/api';
import LoadingSpinner from './LoadingSpinner';
import './OTPModal.css';

export default function OTPModal({ isOpen, onClose, item, onSuccess }) {
  const [step, setStep] = useState(1); // 1: Phone input, 2: OTP input, 3: Success
  const [phone, setPhone] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleSendOTP = async (e) => {
    e.preventDefault();
    if (!phone || phone.trim().length < 10) {
      setError('Please enter a valid phone number.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await api.sendOTP(phone);
      setStep(2);
    } catch (err) {
      setError(err.message || 'Failed to send OTP. Please check the number and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (!otpCode || otpCode.trim().length < 6) {
      setError('Please enter the 6-digit OTP code.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 1. Verify OTP
      const verifyRes = await api.verifyOTP(phone, otpCode);
      
      // 2. Submit enquiry
      const verifiedPhone = verifyRes.phone;
      await api.createEnquiry({
        type: item.type,
        reference_id: item.id,
        reference_name: item.name,
        category_name: item.category_name,
        customer_phone: verifiedPhone,
      });

      // 3. Mark success
      setStep(3);
      if (onSuccess) {
        onSuccess(item.id);
      }
    } catch (err) {
      setError(err.message || 'OTP verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    // Reset state
    setStep(1);
    setPhone('');
    setOtpCode('');
    setError(null);
    onClose();
  };

  return (
    <div className="modal-backdrop">
      <div className="otp-modal-content glass-card shadow-xl" id="otp-verification-modal">
        <div className="otp-modal-header">
          <h3>Verify Your Number</h3>
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
            <form onSubmit={handleSendOTP} className="otp-step-form">
              <p className="otp-instruction">
                Enter your mobile number to receive a one-time password (OTP) via SMS.
              </p>
              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <div className="otp-input-wrapper">
                  <FiPhone className="otp-input-icon" />
                  <input
                    type="tel"
                    className="form-input otp-tel-input"
                    placeholder="Enter 10-digit number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                    disabled={loading}
                    maxLength={15}
                    required
                  />
                </div>
              </div>
              <button type="submit" className="btn btn-primary w-full" disabled={loading}>
                {loading ? <LoadingSpinner size="small" /> : 'Send Verification OTP'}
              </button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleVerifyOTP} className="otp-step-form">
              <p className="otp-instruction">
                We sent a 6-digit OTP code to <strong>{phone}</strong>. Enter it below to verify.
              </p>
              <div className="form-group">
                <label className="form-label">Enter OTP Code</label>
                <div className="otp-input-wrapper">
                  <FiLock className="otp-input-icon" />
                  <input
                    type="text"
                    className="form-input otp-code-input"
                    placeholder="Enter 6-digit code"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                    disabled={loading}
                    maxLength={6}
                    required
                  />
                </div>
              </div>
              <div className="otp-action-buttons">
                <button
                  type="button"
                  className="btn btn-secondary w-full"
                  onClick={() => setStep(1)}
                  disabled={loading}
                >
                  Change Number
                </button>
                <button type="submit" className="btn btn-primary w-full" disabled={loading}>
                  {loading ? <LoadingSpinner size="small" /> : 'Verify & Submit'}
                </button>
              </div>
            </form>
          )}

          {step === 3 && (
            <div className="otp-success-state">
              <div className="otp-success-icon">
                <FiCheckCircle size={60} />
              </div>
              <h4>Enquiry Submitted!</h4>
              <p>
                Your phone number was verified successfully, and your enquiry is recorded.
                We will get in touch with you shortly.
              </p>
              <button onClick={handleClose} className="btn btn-primary w-full">
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
