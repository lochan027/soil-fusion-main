import React from 'react';
import { Link } from 'react-router-dom';
import { IconLeaf } from '@tabler/icons-react';

export const Sidebar = ({ children }) => {
  return (
    <div className="sidebar">
      <div className="logo">
        <Link to="/dashboard" className="logo-link">
          <IconLeaf size={24} className="logo-icon" />
          <span>Soil Fusion</span>
        </Link>
      </div>
      {children}
    </div>
  );
};

export const SidebarItem = ({ icon, text, to, onClick, active }) => {
  if (onClick) {
    return (
      <button 
        onClick={onClick}
        className={`sidebar-item ${active ? 'active' : ''}`}
      >
        <div className="icon-container">
          {icon}
        </div>
        <span className="sidebar-text">{text}</span>
      </button>
    );
  }

  return (
    <Link 
      to={to} 
      className={`sidebar-item ${active ? 'active' : ''}`}
    >
      <div className="icon-container">
        {icon}
      </div>
      <span className="sidebar-text">{text}</span>
    </Link>
  );
}; 