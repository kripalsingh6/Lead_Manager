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
  ExternalLink
} from 'lucide-react';

export const Sidebar = ({ activeTab = 'overview', onTabChange, leadsCount = 0 }) => {
  return (
    <aside className="sidebar">
      {/* Brand Header */}
      <div className="sidebar-brand">
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

      {/* Workspace Selector */}
      <div className="workspace-selector">
        <div className="workspace-info">
          <span className="workspace-name">Acme workspace</span>
          <span className="workspace-plan">Pro plan</span>
        </div>
        <ChevronDown size={16} className="text-muted" />
      </div>

      {/* Main Navigation */}
      <div className="sidebar-section">
        <span className="section-label">WORKSPACE</span>
        <nav className="nav-menu">
          <button
            className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => onTabChange && onTabChange('overview')}
          >
            <Layers size={18} />
            <span>Overview</span>
          </button>

          <button
            className={`nav-item ${activeTab === 'monitors' ? 'active' : ''}`}
            onClick={() => onTabChange && onTabChange('monitors')}
          >
            <Activity size={18} />
            <span>Monitors</span>
            <span className="nav-badge">24</span>
          </button>

          <button
            className={`nav-item ${activeTab === 'infrastructure' ? 'active' : ''}`}
            onClick={() => onTabChange && onTabChange('infrastructure')}
          >
            <Cpu size={18} />
            <span>Infrastructure</span>
          </button>

          <button
            className={`nav-item ${activeTab === 'services' ? 'active' : ''}`}
            onClick={() => onTabChange && onTabChange('services')}
          >
            <Server size={18} />
            <span>Services</span>
          </button>

          <button
            className={`nav-item ${activeTab === 'incidents' ? 'active' : ''}`}
            onClick={() => onTabChange && onTabChange('incidents')}
          >
            <AlertTriangle size={18} />
            <span>Incidents</span>
            <span className="nav-badge badge-warning">2</span>
          </button>

          <button
            className={`nav-item ${activeTab === 'activity' ? 'active' : ''}`}
            onClick={() => onTabChange && onTabChange('activity')}
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
          <a href="#plan" className="usage-link" onClick={(e) => e.preventDefault()}>
            Manage your plan <ExternalLink size={12} />
          </a>
        </div>

        <nav className="footer-nav">
          <button className="footer-nav-item">
            <Settings size={16} />
            <span>Settings</span>
          </button>
          <button className="footer-nav-item">
            <HelpCircle size={16} />
            <span>Help & documentation</span>
          </button>
        </nav>

        <div className="system-status">
          <span className="status-indicator online"></span>
          <span>All systems operational</span>
        </div>
      </div>
    </aside>
  );
};

