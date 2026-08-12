import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { FiMail, FiPhone, FiCalendar, FiClock, FiSearch } from 'react-icons/fi';
import { formatDate, formatTime } from '../../utils/formatters';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';
import './EnquiryManagement.css';

export default function EnquiryManagement() {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filtering & Sorting
  const [typeFilter, setTypeFilter] = useState(''); // 'service', 'accessory', or ''
  const [statusFilter, setStatusFilter] = useState(''); // 'new', 'contacted', etc or ''
  const [search, setSearch] = useState('');

  const loadEnquiries = async () => {
    setLoading(true);
    try {
      const data = await api.getEnquiries(typeFilter, statusFilter);
      setEnquiries(data || []);
    } catch (err) {
      toast.error('Failed to load enquiries');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEnquiries();
  }, [typeFilter, statusFilter]);

  const handleStatusChange = async (enquiryId, newStatus) => {
    try {
      await api.updateEnquiryStatus(enquiryId, newStatus);
      toast.success('Enquiry status updated');
      // Update local state instead of full reload for snappy UI
      setEnquiries(prev =>
        prev.map(e => e.id === enquiryId ? { ...e, enquiry_status: newStatus } : e)
      );
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'new': return 'badge-info';
      case 'contacted': return 'badge-warning';
      case 'completed': return 'badge-success';
      case 'cancelled': return 'badge-error';
      default: return 'badge-secondary';
    }
  };

  const filteredEnquiries = enquiries.filter(e =>
    e.customer_phone.toLowerCase().includes(search.toLowerCase()) ||
    e.customer_name?.toLowerCase().includes(search.toLowerCase()) ||
    e.reference_name.toLowerCase().includes(search.toLowerCase()) ||
    e.category_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="enquiry-mgmt-container">
      <div className="mgmt-header">
        <div>
          <h2>Customer Enquiries</h2>
          <p>View customer enquiries, check contact details, and update tracking status</p>
        </div>
      </div>

      <div className="enquiry-filters-bar glass-card">
        <div className="search-input-wrapper">
          <FiSearch className="search-icon" />
          <input
            type="text"
            className="form-input search-input"
            placeholder="Search by phone, item, or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="filter-dropdowns">
          <div className="filter-group">
            <select
              className="form-select"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="">All Types</option>
              <option value="service">Services Only</option>
              <option value="accessory">Accessories Only</option>
            </select>
          </div>

          <div className="filter-group">
            <select
              className="form-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="new">New</option>
              <option value="contacted">Contacted</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner size="large" />
      ) : filteredEnquiries.length === 0 ? (
        <div className="no-enquiries-fallback glass-card">
          <FiMail size={40} />
          <h4>No Enquiries Found</h4>
          <p>There are no customer enquiries matching the selected filter criteria.</p>
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="table-responsive glass-card desktop-enquiry-table">
            <table className="mgmt-table">
              <thead>
                <tr>
                  <th>Date & Time</th>
                  <th>Customer</th>
                  <th>Type</th>
                  <th>Item Name</th>
                  <th>Category</th>
                  <th>Enquiry Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredEnquiries.map((enquiry) => (
                  <tr key={enquiry.id}>
                    <td>
                      <div className="table-bold-text">{formatDate(enquiry.created_at)}</div>
                      <div className="table-sub-text">{formatTime(enquiry.created_at)}</div>
                    </td>
                    <td>
                      <div className="table-bold-text">{enquiry.customer_name}</div>
                      <a href={`tel:${enquiry.customer_phone}`} className="phone-tel-link font-mono table-sub-text">
                        <FiPhone size={12} style={{ marginRight: '6px' }} />
                        {enquiry.customer_phone}
                      </a>
                    </td>
                    <td>
                      <span className={`badge ${enquiry.type === 'service' ? 'badge-info' : 'badge-warning'}`}>
                        {enquiry.type}
                      </span>
                    </td>
                    <td className="table-bold-text">{enquiry.reference_name}</td>
                    <td>{enquiry.category_name}</td>
                    <td>
                      <select
                        className={`form-select status-select-dropdown ${enquiry.enquiry_status}`}
                        value={enquiry.enquiry_status}
                        onChange={(e) => handleStatusChange(enquiry.id, e.target.value)}
                      >
                        <option value="new">New</option>
                        <option value="contacted">Contacted</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card Grid View */}
          <div className="mobile-enquiry-cards">
            {filteredEnquiries.map((enquiry) => (
              <div key={enquiry.id} className="enquiry-mobile-card glass-card">
                <div className="mobile-card-row header-row">
                  <span className={`badge ${enquiry.type === 'service' ? 'badge-info' : 'badge-warning'}`}>
                    {enquiry.type}
                  </span>
                  <span className="badge badge-secondary">{formatDate(enquiry.created_at)}</span>
                </div>

                <div className="mobile-card-row body-row">
                  <h4 className="enquiry-item-title">{enquiry.reference_name}</h4>
                  <span className="enquiry-item-category">{enquiry.category_name}</span>
                </div>

                <div className="mobile-card-row">
                  <strong>{enquiry.customer_name}</strong>
                </div>

                <div className="mobile-card-row phone-row font-mono">
                  <a href={`tel:${enquiry.customer_phone}`} className="phone-tel-link mobile-phone">
                    <FiPhone size={14} /> {enquiry.customer_phone}
                  </a>
                </div>

                <div className="mobile-card-row time-row">
                  <div className="time-info"><FiCalendar size={13} /> {formatDate(enquiry.created_at)}</div>
                  <div className="time-info"><FiClock size={13} /> {formatTime(enquiry.created_at)}</div>
                </div>

                <div className="mobile-card-row actions-row">
                  <label className="form-label select-label">Update Status</label>
                  <select
                    className={`form-select status-select-dropdown ${enquiry.enquiry_status}`}
                    value={enquiry.enquiry_status}
                    onChange={(e) => handleStatusChange(enquiry.id, e.target.value)}
                  >
                    <option value="new">New</option>
                    <option value="contacted">Contacted</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
