import React from 'react';
import { FiInbox } from 'react-icons/fi';
import './EmptyState.css';

export default function EmptyState({ 
  icon: Icon = FiInbox, 
  title = 'No items found', 
  message = 'There are no items to display at this time.' 
}) {
  return (
    <div className="empty-state-container glass-card">
      <div className="empty-state-icon">
        <Icon size={48} />
      </div>
      <h3 className="empty-state-title">{title}</h3>
      <p className="empty-state-message">{message}</p>
    </div>
  );
}
