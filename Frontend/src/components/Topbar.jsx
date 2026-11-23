import React, { useState } from 'react';
import { Bell, ChevronDown, User, LogOut, LogIn } from 'lucide-react';

export const Topbar = ({ user, onOpenAuth, onLogout, onSeedSampleData, isSeeding }) => {
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <header className="topbar">
      {/* Breadcrumbs */}
      <div className="breadcrumbs">
        <span className="crumb-parent">Workspace</span>
        <span className="crumb-divider">/</span>
        <span className="crumb-current">Lead Manager</span>
      </div>

      {/* Right Controls */}
      <div className="topbar-actions">
        {/* Sample data button */}
        <button
          className="btn-sample-data"
          onClick={onSeedSampleData}
          disabled={isSeeding}
          title="Seed realistic demo leads matching the UI screenshot"
        >
          {isSeeding ? 'Loading sample...' : 'Sample data'}
        </button>

        {/* Notifications */}
        <button className="btn-icon" aria-label="Notifications">
          <Bell size={18} />
          <span className="notification-dot"></span>
        </button>

        {/* User Profile */}
        <div className="user-profile-wrapper">
          <button
            className="user-profile-button"
            onClick={() => setShowDropdown(!showDropdown)}
          >
            <div className="avatar">
              {user?.avatar ? (
                <img src={user.avatar} alt={user.name} />
              ) : (
                <span>{user?.name ? user.name.charAt(0).toUpperCase() : 'A'}</span>
              )}
            </div>
            <span className="user-name">{user?.name || 'Alex Morgan'}</span>
            <ChevronDown size={14} className="text-muted" />
          </button>

          {showDropdown && (
            <div className="dropdown-menu">
              <div className="dropdown-header">
                <span className="dropdown-user-name">{user?.name || 'Guest User'}</span>
                <span className="dropdown-user-email">{user?.email || 'Not logged in'}</span>
              </div>
              <div className="dropdown-divider"></div>
              {user ? (
                <button
                  className="dropdown-item text-danger"
                  onClick={() => {
                    setShowDropdown(false);
                    onLogout();
                  }}
                >
                  <LogOut size={16} />
                  <span>Log out</span>
                </button>
              ) : (
                <button
                  className="dropdown-item text-primary"
                  onClick={() => {
                    setShowDropdown(false);
                    onOpenAuth();
                  }}
                >
                  <LogIn size={16} />
                  <span>Log in / Sign up</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

