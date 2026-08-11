import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { FiBriefcase, FiShoppingBag, FiLayers, FiMail, FiInbox, FiTrendingUp } from 'react-icons/fi';
import './Dashboard.jsx.css';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const data = await api.getDashboardStats();
        setStats(data);
      } catch (err) {
        console.error('Failed to load dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  if (loading) {
    return <LoadingSpinner fullPage={false} />;
  }

  const statCards = [
    { title: 'Total Services', value: stats?.total_services || 0, icon: FiBriefcase, color: 'info' },
    { title: 'Total Accessories', value: stats?.total_accessories || 0, icon: FiShoppingBag, color: 'success' },
    { title: 'Total Categories', value: stats?.total_categories || 0, icon: FiLayers, color: 'warning' },
    { title: 'Total Enquiries', value: stats?.total_enquiries || 0, icon: FiMail, color: 'primary' },
    { title: 'New Enquiries', value: stats?.new_enquiries || 0, icon: FiInbox, color: 'error' },
    { title: 'Verified Enquiries', value: stats?.verified_enquiries || 0, icon: FiTrendingUp, color: 'success' },
  ];

  return (
    <div className="admin-dashboard-container">
      <div className="admin-page-header">
        <h2>Dashboard Overview</h2>
        <p>Live metrics and performance summaries for Fone Factory</p>
      </div>

      <div className="stats-grid">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div key={idx} className="stat-card glass-card shadow-md">
              <div className="stat-card-body">
                <div className="stat-text-col">
                  <span className="stat-card-title">{card.title}</span>
                  <span className="stat-card-value">{card.value}</span>
                </div>
                <div className={`stat-icon-wrapper color-${card.color}`}>
                  <Icon size={24} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="dashboard-shortcuts glass-card mt-8">
        <h3>Quick Operations</h3>
        <p>Select a common management task below to navigate quickly.</p>
        <div className="shortcut-buttons">
          <a href="/admin/settings" className="btn btn-secondary btn-sm">Edit Shop About Info</a>
          <a href="/admin/services" className="btn btn-secondary btn-sm">Add New Service</a>
          <a href="/admin/accessories" className="btn btn-secondary btn-sm">Add New Accessory</a>
          <a href="/admin/enquiries" className="btn btn-primary btn-sm">Manage Enquiries</a>
        </div>
      </div>
    </div>
  );
}
