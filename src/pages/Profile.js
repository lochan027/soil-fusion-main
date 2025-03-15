import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IconLayoutDashboard, IconUser, IconSettings, IconLogout, IconEdit, IconDevices, IconCloud } from '@tabler/icons-react';
import { Sidebar, SidebarItem } from '../components/ui/Sidebar';
import { Modal } from '../components/ui/Modal';
import blankProfile from '../assets/blank-profile';
import '../Dashboard.css';

const Profile = () => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [password, setPassword] = useState('');
  const [userData, setUserData] = useState({
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+1 234 567 890',
    role: 'Farm Owner',
    profileImage: blankProfile
  });
  const [tempEditData, setTempEditData] = useState(userData);

  const handleLogout = () => {
    navigate('/');
  };

  const handleEdit = () => {
    setTempEditData(userData); // Reset temp data to current data
    setIsEditing(true);
  };

  const handleCancel = () => {
    setTempEditData(userData); // Reset temp data to current data
    setIsEditing(false);
  };

  const handleSave = () => {
    setShowPasswordModal(true);
  };

  const handlePasswordConfirm = () => {
    if (password === 'test123') { // In a real app, this would be proper authentication
      setUserData(tempEditData); // Only update the actual data after password confirmation
      setIsEditing(false);
      setShowPasswordModal(false);
      setPassword('');
      // Here you would typically update the data in your backend
    } else {
      alert('Incorrect password');
    }
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
            icon={<IconCloud size={24} />}
            text="Weather"
            to="/weather"
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
          <img 
            src={userData.profileImage} 
            alt="Profile" 
            className="profile-image"
          />
          <span className="profile-name">{userData.name}</span>
        </div>
      </Sidebar>

      <main className="main-content">
        <div className="grid-container">
          <section className="overview-section">
            <div className="card">
              <div className="card-header">
                <h3>Personal Information</h3>
                {!isEditing && (
                  <button onClick={handleEdit} className="edit-btn">
                    <IconEdit size={20} />
                    Edit
                  </button>
                )}
              </div>
              <div className="card-content">
                <div className="profile-image-section">
                  <img 
                    src={isEditing ? tempEditData.profileImage : userData.profileImage} 
                    alt="Profile" 
                    className="large-profile-image" 
                  />
                  {isEditing && (
                    <button className="change-photo-btn">Change Photo</button>
                  )}
                </div>
                <div className="profile-fields">
                  {isEditing ? (
                    <>
                      <input
                        type="text"
                        value={tempEditData.name}
                        onChange={(e) => setTempEditData({...tempEditData, name: e.target.value})}
                        className="edit-input"
                        placeholder="Name"
                      />
                      <div className="readonly-field">
                        <span className="readonly-label">Email (cannot be changed)</span>
                        <input
                          type="email"
                          value={userData.email}
                          className="edit-input readonly"
                          disabled
                        />
                      </div>
                      <input
                        type="tel"
                        value={tempEditData.phone}
                        onChange={(e) => setTempEditData({...tempEditData, phone: e.target.value})}
                        className="edit-input"
                        placeholder="Phone"
                      />
                      <input
                        type="text"
                        value={tempEditData.role}
                        onChange={(e) => setTempEditData({...tempEditData, role: e.target.value})}
                        className="edit-input"
                        placeholder="Role"
                      />
                    </>
                  ) : (
                    <>
                      <p>Name: {userData.name}</p>
                      <p>Email: {userData.email}</p>
                      <p>Phone: {userData.phone}</p>
                      <p>Role: {userData.role}</p>
                    </>
                  )}
                </div>
                {isEditing && (
                  <div className="edit-actions">
                    <button onClick={handleCancel} className="cancel-btn">
                      Cancel
                    </button>
                    <button onClick={handleSave} className="save-btn">
                      Save Changes
                    </button>
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>
      </main>

      <Modal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        onConfirm={handlePasswordConfirm}
        title="Confirm Password"
      >
        <div className="password-confirm">
          <p>Please enter your password to save changes</p>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            className="password-input"
          />
        </div>
      </Modal>
    </div>
  );
};

export default Profile; 