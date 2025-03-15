import React, { useState } from 'react';
import { NotificationService } from '../services/notificationService';
import './NotificationCenter.css';

const NotificationCenter = () => {
  const [isVisible, setIsVisible] = useState(true);
  const { notifications, clearNotification, clearAllNotifications, hasPermission } = NotificationService.useNotifications();

  if (!isVisible) return null;

  if (!hasPermission) {
    return (
      <div className="notification-permission">
        <p>Enable notifications to receive soil condition alerts.</p>
        <button 
          onClick={() => Notification.requestPermission()}
          className="enable-notifications-btn"
        >
          Enable Notifications
        </button>
        <button 
          onClick={() => setIsVisible(false)}
          className="close-btn"
          aria-label="Close"
        >
          ×
        </button>
      </div>
    );
  }

  return (
    <div className="notification-center">
      <div className="notification-header">
        <h3>Notifications</h3>
        <div className="header-buttons">
          {notifications.length > 0 && (
            <button 
              onClick={clearAllNotifications}
              className="clear-all-btn"
            >
              Clear All
            </button>
          )}
          <button 
            onClick={() => setIsVisible(false)}
            className="close-btn"
            aria-label="Close"
          >
            ×
          </button>
        </div>
      </div>
      
      <div className="notifications-list">
        {notifications.length === 0 ? (
          <p className="no-notifications">No new notifications</p>
        ) : (
          notifications.map(notification => (
            <div 
              key={notification.id} 
              className="notification-item"
            >
              <div className="notification-content">
                <h4>{notification.title}</h4>
                <p>{notification.message}</p>
                <span className="notification-time">
                  {new Date(notification.timestamp).toLocaleTimeString()}
                </span>
              </div>
              <button 
                onClick={() => clearNotification(notification.id)}
                className="clear-notification-btn"
                aria-label="Clear notification"
              >
                ×
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationCenter; 