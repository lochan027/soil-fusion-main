import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IconLayoutDashboard, IconUser, IconSettings, IconLogout, IconEdit, IconDevices, IconCloud } from '@tabler/icons-react';
import { Sidebar, SidebarItem } from '../components/ui/Sidebar';
import { Modal } from '../components/ui/Modal';
import { useTheme } from '../context/ThemeContext';
import blankProfile from '../assets/blank-profile';
import '../Dashboard.css';

const Settings = () => {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [password, setPassword] = useState('');
  const [settingsData, setSettingsData] = useState({
    emailNotifications: true,
    soilAnalysisUpdates: true,
    weeklyReports: true,
    alertThresholds: 'Custom',
    dataRefreshRate: 'Every 15 minutes',
    dataRetention: '12 months',
    exportFormat: 'CSV',
    automaticBackups: true,
    twoFactorAuth: false,
    theme: theme
  });
  const [tempEditData, setTempEditData] = useState(settingsData);

  const handleLogout = () => {
    navigate('/');
  };

  const handleEdit = () => {
    setTempEditData({...settingsData, theme});
    setIsEditing(true);
  };

  const handleCancel = () => {
    setTempEditData({...settingsData, theme});
    setIsEditing(false);
  };

  const handleSave = () => {
    setShowPasswordModal(true);
  };

  const handlePasswordConfirm = () => {
    if (password === 'test123') {
      setSettingsData(tempEditData);
      setTheme(tempEditData.theme);
      setIsEditing(false);
      setShowPasswordModal(false);
      setPassword('');
    } else {
      alert('Incorrect password');
    }
  };

  const handleThemeChange = (e) => {
    const newTheme = e.target.value;
    setTempEditData({...tempEditData, theme: newTheme});
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
          <img src={blankProfile} alt="Profile" className="profile-image" />
          <span className="profile-name">John Doe</span>
        </div>
      </Sidebar>

      <main className="main-content">
        <div className="grid-container">
          <section className="overview-section">
            <div className="card">
              <div className="card-header">
                <h3>Notification Settings</h3>
                {!isEditing && (
                  <button onClick={handleEdit} className="edit-btn">
                    <IconEdit size={20} />
                    Edit
                  </button>
                )}
              </div>
              <div className="card-content">
                <div className="settings-fields">
                  {isEditing ? (
                    <>
                      <div className="settings-field">
                        <label className="settings-label">
                          <input
                            type="checkbox"
                            checked={tempEditData.emailNotifications}
                            onChange={(e) => setTempEditData({...tempEditData, emailNotifications: e.target.checked})}
                          />
                          Email Notifications
                        </label>
                      </div>
                      <div className="settings-field">
                        <label className="settings-label">
                          <input
                            type="checkbox"
                            checked={tempEditData.soilAnalysisUpdates}
                            onChange={(e) => setTempEditData({...tempEditData, soilAnalysisUpdates: e.target.checked})}
                          />
                          Soil Analysis Updates
                        </label>
                      </div>
                      <div className="settings-field">
                        <label className="settings-label">
                          <input
                            type="checkbox"
                            checked={tempEditData.weeklyReports}
                            onChange={(e) => setTempEditData({...tempEditData, weeklyReports: e.target.checked})}
                          />
                          Weekly Reports
                        </label>
                      </div>
                      <div className="settings-field">
                        <label className="settings-label">Alert Thresholds</label>
                        <select
                          value={tempEditData.alertThresholds}
                          onChange={(e) => setTempEditData({...tempEditData, alertThresholds: e.target.value})}
                          className="settings-select"
                        >
                          <option>Custom</option>
                          <option>Default</option>
                          <option>High</option>
                          <option>Low</option>
                        </select>
                      </div>
                    </>
                  ) : (
                    <>
                      <p>Email Notifications: {settingsData.emailNotifications ? 'Enabled' : 'Disabled'}</p>
                      <p>Soil Analysis Updates: {settingsData.soilAnalysisUpdates ? 'Enabled' : 'Disabled'}</p>
                      <p>Weekly Reports: {settingsData.weeklyReports ? 'Enabled' : 'Disabled'}</p>
                      <p>Alert Thresholds: {settingsData.alertThresholds}</p>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="card">
              <h3>Data Preferences</h3>
              <div className="card-content">
                <div className="settings-fields">
                  {isEditing ? (
                    <>
                      <div className="settings-field">
                        <label className="settings-label">Data Refresh Rate</label>
                        <select
                          value={tempEditData.dataRefreshRate}
                          onChange={(e) => setTempEditData({...tempEditData, dataRefreshRate: e.target.value})}
                          className="settings-select"
                        >
                          <option>Every 5 minutes</option>
                          <option>Every 15 minutes</option>
                          <option>Every 30 minutes</option>
                          <option>Every hour</option>
                        </select>
                      </div>
                      <div className="settings-field">
                        <label className="settings-label">Data Retention</label>
                        <select
                          value={tempEditData.dataRetention}
                          onChange={(e) => setTempEditData({...tempEditData, dataRetention: e.target.value})}
                          className="settings-select"
                        >
                          <option>3 months</option>
                          <option>6 months</option>
                          <option>12 months</option>
                          <option>24 months</option>
                        </select>
                      </div>
                      <div className="settings-field">
                        <label className="settings-label">Export Format</label>
                        <select
                          value={tempEditData.exportFormat}
                          onChange={(e) => setTempEditData({...tempEditData, exportFormat: e.target.value})}
                          className="settings-select"
                        >
                          <option>CSV</option>
                          <option>JSON</option>
                          <option>Excel</option>
                        </select>
                      </div>
                      <div className="settings-field">
                        <label className="settings-label">
                          <input
                            type="checkbox"
                            checked={tempEditData.automaticBackups}
                            onChange={(e) => setTempEditData({...tempEditData, automaticBackups: e.target.checked})}
                          />
                          Automatic Backups
                        </label>
                      </div>
                    </>
                  ) : (
                    <>
                      <p>Data Refresh Rate: {settingsData.dataRefreshRate}</p>
                      <p>Data Retention: {settingsData.dataRetention}</p>
                      <p>Export Format: {settingsData.exportFormat}</p>
                      <p>Automatic Backups: {settingsData.automaticBackups ? 'Enabled' : 'Disabled'}</p>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="card">
              <h3>Security & Theme</h3>
              <div className="card-content">
                <div className="settings-fields">
                  {isEditing ? (
                    <>
                      <div className="settings-field">
                        <label className="settings-label">
                          <input
                            type="checkbox"
                            checked={tempEditData.twoFactorAuth}
                            onChange={(e) => setTempEditData({...tempEditData, twoFactorAuth: e.target.checked})}
                          />
                          Two-Factor Authentication
                        </label>
                      </div>
                      <div className="settings-field">
                        <label className="settings-label">Theme</label>
                        <select
                          value={tempEditData.theme}
                          onChange={handleThemeChange}
                          className="settings-select"
                        >
                          <option>Light</option>
                          <option>Dark</option>
                          <option>System</option>
                        </select>
                      </div>
                    </>
                  ) : (
                    <>
                      <p>Two-Factor Authentication: {settingsData.twoFactorAuth ? 'Enabled' : 'Disabled'}</p>
                      <p>Theme: {settingsData.theme}</p>
                    </>
                  )}
                </div>
              </div>
            </div>
          </section>

          {isEditing && (
            <section className="action-section">
              <div className="edit-actions">
                <button onClick={handleCancel} className="cancel-btn">
                  Cancel
                </button>
                <button onClick={handleSave} className="save-btn">
                  Save Changes
                </button>
              </div>
            </section>
          )}
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

export default Settings; 