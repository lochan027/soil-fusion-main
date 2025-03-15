import React from 'react';
import { useNavigate } from 'react-router-dom';
import { IconLayoutDashboard, IconUser, IconSettings, IconLogout, IconDevices } from '@tabler/icons-react';
import { Sidebar, SidebarItem } from './components/ui/Sidebar';
import './Dashboard.css';

const Profile = () => {
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
            active
          />
          <SidebarItem
            icon={<IconSettings size={24} />}
            text="Settings"
            to="/settings"
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
              <h3>Profile Information</h3>
              <div className="card-content">
                <p>Name: John Doe</p>
                <p>Email: john.doe@example.com</p>
                <p>Role: Farm Manager</p>
                <p>Location: California, USA</p>
              </div>
            </div>
            <div className="card">
              <h3>Farm Details</h3>
              <div className="card-content">
                <p>Farm Size: 500 acres</p>
                <p>Crop Types: Corn, Wheat, Soybeans</p>
                <p>Soil Types: Clay Loam, Sandy Loam</p>
              </div>
            </div>
            <div className="card">
              <div className="activity-content">
                <div>
                  <h4>Account Settings</h4>
                  <p>Update your profile information and preferences</p>
                </div>
                <button className="view-report-btn">Edit Profile</button>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default Profile; 