import React from 'react';
import { useNavigate } from 'react-router-dom';
import { IconLayoutDashboard, IconUser, IconSettings, IconLogout, IconDevices } from '@tabler/icons-react';
import { Sidebar, SidebarItem } from './components/ui/Sidebar';
import './Dashboard.css';

const Settings = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate('/');
  };

  return (
    <div className="dashboard-container">
      <Sidebar>
        <div className="menu-items">
          <SidebarItem
            icon={<IconLayoutDashboard size={24} />}
            text="Dashboard"
            to="/dashboard"
          />
          <SidebarItem
            icon={<IconDevices size={24} />}
            text="Devices"
            to="/devices"
          />
          <SidebarItem
            icon={<IconUser size={24} />}
            text="Profile"
            to="/profile"
          />
          <SidebarItem
            icon={<IconSettings size={24} />}
            text="Settings"
            to="/settings"
            active
          />
          <SidebarItem
            icon={<IconLogout size={24} />}
            text="Logout"
            onClick={handleLogout}
          />
        </div>
        <div className="profile-section">
          <div className="profile-image" />
          <span className="profile-name">John Doe</span>
        </div>
      </Sidebar>

      <main className="main-content">
        <div className="grid-container">
          <section className="overview-section">
            <div className="card">
              <h3>Account Settings</h3>
              <div className="card-content">
                <p>Email Notifications: Enabled</p>
                <p>Two-Factor Authentication: Disabled</p>
                <p>Language: English</p>
                <p>Time Zone: PST</p>
              </div>
            </div>
            <div className="card">
              <h3>Privacy Settings</h3>
              <div className="card-content">
                <p>Profile Visibility: Public</p>
                <p>Data Sharing: Enabled</p>
                <p>Analytics Collection: Enabled</p>
              </div>
            </div>
            <div className="card">
              <div className="activity-content">
                <div>
                  <h4>Advanced Settings</h4>
                  <p>Configure advanced system preferences</p>
                </div>
                <button className="view-report-btn">Configure</button>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default Settings; 