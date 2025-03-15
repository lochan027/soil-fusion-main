import { useState, useEffect } from 'react';

const NOTIFICATION_HUB_ENDPOINT = process.env.REACT_APP_NOTIFICATION_HUB_ENDPOINT;
const LOGIC_APP_WEBHOOK = process.env.REACT_APP_LOGIC_APP_WEBHOOK;
const NOTIFICATION_TIMEOUT = 3000; // 3 seconds

export const NotificationService = {
  // Register device for push notifications
  async registerDevice(userId) {
    try {
      const registration = await navigator.serviceWorker.register('/service-worker.js');
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.REACT_APP_VAPID_PUBLIC_KEY
      });

      // Register with Azure Notification Hubs
      const response = await fetch(`${NOTIFICATION_HUB_ENDPOINT}/registrations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          platform: 'web',
          pushSubscription: subscription
        })
      });

      if (!response.ok) {
        throw new Error('Failed to register device');
      }

      return true;
    } catch (error) {
      console.error('Error registering device:', error);
      return false;
    }
  },

  // Subscribe to soil condition alerts
  async subscribeToAlerts(userId, thresholds) {
    try {
      const response = await fetch(`${LOGIC_APP_WEBHOOK}/triggers/soil-alerts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          thresholds: {
            moisture: {
              min: thresholds.moisture?.min || 30,
              max: thresholds.moisture?.max || 70
            },
            temperature: {
              min: thresholds.temperature?.min || 15,
              max: thresholds.temperature?.max || 30
            },
            pH: {
              min: thresholds.pH?.min || 6.0,
              max: thresholds.pH?.max || 7.5
            },
            nitrogen: {
              min: thresholds.nitrogen?.min || 20,
              max: thresholds.nitrogen?.max || 80
            },
            phosphorus: {
              min: thresholds.phosphorus?.min || 20,
              max: thresholds.phosphorus?.max || 80
            },
            potassium: {
              min: thresholds.potassium?.min || 20,
              max: thresholds.potassium?.max || 80
            },
            oxygen: {
              min: thresholds.oxygen?.min || 15,
              max: thresholds.oxygen?.max || 25
            }
          }
        })
      });

      if (!response.ok) {
        throw new Error('Failed to subscribe to alerts');
      }

      return true;
    } catch (error) {
      console.error('Error subscribing to alerts:', error);
      return false;
    }
  },

  // Hook to manage notifications
  useNotifications() {
    const [notifications, setNotifications] = useState([]);
    const [permission, setPermission] = useState(Notification.permission);

    useEffect(() => {
      // Request notification permission
      if (permission === 'default') {
        Notification.requestPermission().then(setPermission);
      }

      // Set up service worker for notifications
      if ('serviceWorker' in navigator) {
        const messageHandler = (event) => {
          if (event.data.type === 'notification') {
            const newNotification = {
              ...event.data.notification,
              id: Date.now().toString() // Ensure unique ID
            };
            
            setNotifications(prev => [...prev, newNotification]);
            
            // Auto remove notification after timeout
            setTimeout(() => {
              setNotifications(prev => 
                prev.filter(n => n.id !== newNotification.id)
              );
            }, NOTIFICATION_TIMEOUT);
          }
        };

        navigator.serviceWorker.addEventListener('message', messageHandler);
        
        // Cleanup listener on unmount
        return () => {
          navigator.serviceWorker.removeEventListener('message', messageHandler);
        };
      }
    }, [permission]);

    const clearNotification = (id) => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    };

    const clearAllNotifications = () => {
      setNotifications([]);
    };

    return {
      notifications,
      clearNotification,
      clearAllNotifications,
      hasPermission: permission === 'granted'
    };
  }
}; 