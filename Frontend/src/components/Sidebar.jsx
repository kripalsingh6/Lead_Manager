import React from 'react';
import {
  Activity,
  Layers,
  Server,
  Cpu,
  AlertTriangle,
  History,
  Settings,
  HelpCircle,
  ChevronDown,
  ExternalLink,
  X
} from 'lucide-react';

export const Sidebar = ({
  activeTab = 'overview',
  onTabChange,
  leadsCount = 0,
  onProcessingAction,
  isOpen = false,
  onClose
}) => {
  const handleNavClick = (tabName, actionLabel) => {
    if (onClose) onClose();
    if (tabName && onTabChange) onTabChange(tabName);
    if (actionLabel && onProcessingAction) onProcessingAction(actionLabel);
  };

  return (
    <aside className={`sidebar ${isOpen ? 'mobile-open' : ''}`}>
      {/* Brand Header */}
      <div className="sidebar-brand-wrapper">
        <div
          className="sidebar-brand"
          style={{ cursor: 'pointer' }}
          onClick={() => {
            if (onClose) onClose();
            onProcessingAction && onProcessingAction('Dashboard Navigation');
          }}
        >
          <div className="brand-logo">
            <svg
              className="pulse-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
            <span className="brand-name">LEAD</span>
          </div>
        </div>

        {/* Mobile close button */}
        <button
          type="button"
          className="sidebar-mobile-close-btn"
          onClick={onClose}
          aria-label="Close menu"
        >
          <X size={20} />
        </button>
      </div>

      {/* Workspace / Dashboard Selector */}
      <div
        className="workspace-selector"
        style={{ cursor: 'pointer' }}
        onClick={() => onProcessingAction && onProcessingAction('Dashboard Switcher')}
      >
        <div className="workspace-info">
          <span className="workspace-name">Lead Dashboard</span>
          <span className="workspace-plan">Pro plan</span>
        </div>
        <ChevronDown size={16} className="text-muted" />
      </div>

      {/* Main Navigation */}
      <div className="sidebar-section">
        <span className="section-label">DASHBOARD</span>
        <nav className="nav-menu">
          <button
            className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => handleNavClick('overview')}
          >
            <Layers size={18} />
            <span>Overview</span>
          </button>

          <button
            className={`nav-item ${activeTab === 'monitors' ? 'active' : ''}`}
            onClick={() => handleNavClick('monitors', 'Monitors')}
          >
            <Activity size={18} />
            <span>Monitors</span>
            <span className="nav-badge">24</span>
          </button>

          <button
            className={`nav-item ${activeTab === 'infrastructure' ? 'active' : ''}`}
            onClick={() => handleNavClick('infrastructure', 'Infrastructure')}
          >
            <Cpu size={18} />
            <span>Infrastructure</span>
          </button>

          <button
            className={`nav-item ${activeTab === 'services' ? 'active' : ''}`}
            onClick={() => handleNavClick('services', 'Services')}
          >
            <Server size={18} />
            <span>Services</span>
          </button>

          <button
            className={`nav-item ${activeTab === 'incidents' ? 'active' : ''}`}
            onClick={() => handleNavClick('incidents', 'Incidents')}
          >
            <AlertTriangle size={18} />
            <span>Incidents</span>
            <span className="nav-badge badge-warning">2</span>
          </button>

          <button
            className={`nav-item ${activeTab === 'activity' ? 'active' : ''}`}
            onClick={() => handleNavClick('activity', 'Activity Log')}
          >
            <History size={18} />
            <span>Activity log</span>
          </button>
        </nav>
      </div>

      {/* Usage Widget & Footer */}
      <div className="sidebar-footer">
        <div className="usage-card">
          <div className="usage-header">
            <span>Monitors used</span>
            <span className="usage-count">24 / 50</span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: '48%' }}></div>
          </div>
          <a
            href="#plan"
            className="usage-link"
            onClick={(e) => {
              e.preventDefault();
              handleNavClick(null, 'Manage Plan');
            }}
          >
            Manage your plan <ExternalLink size={12} />
          </a>
        </div>

        <nav className="footer-nav">
          <button
            className="footer-nav-item"
            onClick={() => handleNavClick(null, 'Settings')}
          >
            <Settings size={16} />
            <span>Settings</span>
          </button>
          <button
            className="footer-nav-item"
            onClick={() => handleNavClick(null, 'Help & Documentation')}
          >
            <HelpCircle size={16} />
            <span>Help & documentation</span>
          </button>
        </nav>

        <div
          className="system-status"
          style={{ cursor: 'pointer' }}
          onClick={() => handleNavClick(null, 'System Status')}
        >
          <span className="status-indicator online"></span>
          <span>All systems operational</span>
        </div>
      </div>
    </aside>
  );
};

