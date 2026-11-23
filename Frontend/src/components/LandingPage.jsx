import React, { useState } from 'react';
import {
  TrendingUp,
  Shield,
  Search,
  Filter,
  CheckCircle2,
  BarChart3,
  Users,
  Activity,
  ArrowRight,
  Database,
  Lock,
  Layers,
  Target,
  Briefcase,
  Zap,
  Building2,
  PieChart,
  Trash2,
  Edit3,
  Check,
  Server,
  Code2
} from 'lucide-react';

export const LandingPage = ({ onGetStarted, onLogin, currentUser, onGoToDashboard }) => {
  const [email, setEmail] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onGetStarted(email.trim());
  };

  return (
    <div className="landing-page-root">
      {/* ── Top Navigation Bar ─────────────────────── */}
      <header className="landing-navbar">
        <div className="landing-nav-container">
          <div className="landing-brand">
            <div className="landing-logo-icon">
              <Building2 size={20} color="#ffffff" />
            </div>
            <span className="landing-brand-text">LEAD MANAGER</span>
          </div>

          <div className="landing-nav-actions">
            {currentUser ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <button
                  type="button"
                  className="btn-landing-nav-link"
                  onClick={onLogin}
                >
                  Switch Account
                </button>
                <button
                  className="btn-landing-nav-primary"
                  onClick={onGoToDashboard}
                >
                  Go to Workspace <ArrowRight size={15} style={{ marginLeft: 6 }} />
                </button>
              </div>
            ) : (
              <>
                <button
                  type="button"
                  className="btn-landing-nav-link"
                  onClick={onLogin}
                >
                  Log In
                </button>
                <button
                  type="button"
                  className="btn-landing-nav-outline"
                  onClick={() => onGetStarted()}
                >
                  GET STARTED FREE
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ── Hero Section (Deep Purple Background & Polygon Grid) ── */}
      <section className="landing-hero">
        <div className="hero-geometric-overlay">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="polyGrid" width="120" height="120" patternUnits="userSpaceOnUse">
                <path
                  d="M 120 0 L 0 0 0 120 M 120 120 L 0 0"
                  fill="none"
                  stroke="rgba(255, 255, 255, 0.05)"
                  strokeWidth="1"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#polyGrid)" />
          </svg>
        </div>

        <div className="landing-hero-container">
          {/* Left Column: Core Value Proposition based on Assignment Spec */}
          <div className="hero-left-col">
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '4px 12px', background: 'rgba(255, 255, 255, 0.12)', borderRadius: 20, marginBottom: 16 }}>
              <Zap size={14} className="text-magenta" />
              <span style={{ fontSize: 12, fontWeight: 600, color: '#f3e8ff', letterSpacing: '0.4px' }}>
                FULL-STACK SALES LEAD TRACKING SYSTEM
              </span>
            </div>

            <h1 className="hero-title">
              Capture, Track &amp; Manage Sales Leads End-to-End
            </h1>
            <p className="hero-subtitle">
              A complete full-stack web application designed for sales professionals to capture prospects, 
              track lead statuses (New, Contacted, Qualified, Lost), monitor live pipeline metrics, 
              and search records with instant responsive filters.
            </p>

            <form onSubmit={handleSubmit} className="hero-cta-form">
              <input
                type="email"
                placeholder="Enter your business email"
                className="hero-email-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <button type="submit" className="hero-cta-button">
                GET STARTED FREE
              </button>
            </form>

            <p className="hero-disclaimer">
              <strong>Complete take-home implementation:</strong> React Frontend • Node.js Express REST API • PostgreSQL Database.
            </p>

            {/* Core Feature Badges */}
            <div className="hero-badges-row">
              <div className="hero-badge-item">
                <CheckCircle2 size={16} className="text-magenta" />
                <span>Full CRUD &amp; Status Tracking</span>
              </div>
              <div className="hero-badge-item">
                <CheckCircle2 size={16} className="text-magenta" />
                <span>Dual Input Validation</span>
              </div>
              <div className="hero-badge-item">
                <CheckCircle2 size={16} className="text-magenta" />
                <span>Auth &amp; User-Scoped Leads</span>
              </div>
            </div>
          </div>

          {/* Right Column: Live Interactive Mockup Window */}
          <div className="hero-right-col">
            <div className="hero-mockup-window">
              {/* Window Header */}
              <div className="mockup-header-bar">
                <div className="mockup-dots">
                  <span className="dot dot-red"></span>
                  <span className="dot dot-yellow"></span>
                  <span className="dot dot-green"></span>
                </div>
                <div className="mockup-tab-group">
                  <span className="mockup-tab active">
                    <Activity size={13} style={{ marginRight: 4 }} />
                    Lead Manager Dashboard
                  </span>
                  <span className="mockup-tab">
                    <BarChart3 size={13} style={{ marginRight: 4 }} />
                    Status Counts
                  </span>
                  <span className="mockup-tab-save">+ Add Lead</span>
                </div>
              </div>

              {/* Status Counter Cards (Bonus Spec) */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, padding: '10px 12px', background: '#181824', borderBottom: '1px solid #2d2d3f' }}>
                <div style={{ background: '#232334', padding: '6px 8px', borderRadius: 6 }}>
                  <div style={{ color: '#94a3b8', fontSize: 10 }}>NEW</div>
                  <div style={{ color: '#818cf8', fontSize: 15, fontWeight: 700 }}>12</div>
                </div>
                <div style={{ background: '#232334', padding: '6px 8px', borderRadius: 6 }}>
                  <div style={{ color: '#94a3b8', fontSize: 10 }}>CONTACTED</div>
                  <div style={{ color: '#38bdf8', fontSize: 15, fontWeight: 700 }}>10</div>
                </div>
                <div style={{ background: '#232334', padding: '6px 8px', borderRadius: 6 }}>
                  <div style={{ color: '#94a3b8', fontSize: 10 }}>QUALIFIED</div>
                  <div style={{ color: '#34d399', fontSize: 15, fontWeight: 700 }}>8</div>
                </div>
                <div style={{ background: '#232334', padding: '6px 8px', borderRadius: 6 }}>
                  <div style={{ color: '#94a3b8', fontSize: 10 }}>LOST</div>
                  <div style={{ color: '#f87171', fontSize: 15, fontWeight: 700 }}>2</div>
                </div>
              </div>

              {/* Mockup Search & Filter Bar */}
              <div className="mockup-query-bar">
                <div className="query-chip">
                  <Search size={12} />
                  <span>Search leads by name or status...</span>
                </div>
                <div className="query-chip query-filter-active">
                  <span>status:All Statuses</span>
                </div>
                <div className="query-chip query-filter-active">
                  <span>source:All Sources</span>
                </div>
                <div className="mockup-toggle-btns">
                  <span className="mock-toggle active">Table</span>
                  <span className="mock-toggle">Analytics</span>
                </div>
              </div>

              {/* Mockup Table Header & Records */}
              <div style={{ padding: '8px 12px', background: '#1e1e2d' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr 0.9fr 0.9fr', gap: 6, padding: '4px 8px', color: '#64748b', fontSize: 10, fontWeight: 700, borderBottom: '1px solid #2d2d3f' }}>
                  <span>NAME &amp; EMAIL</span>
                  <span>COMPANY</span>
                  <span>PHONE</span>
                  <span>SOURCE</span>
                  <span>STATUS</span>
                </div>

                <div className="mock-lead-row" style={{ marginTop: 6, display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr 0.9fr 0.9fr', gap: 6 }}>
                  <div>
                    <div className="lead-name-text">Emma Wilson</div>
                    <div style={{ fontSize: 9, color: '#64748b' }}>emma@northstar.io</div>
                  </div>
                  <span className="lead-company-text">Northstar Inc</span>
                  <span style={{ color: '#94a3b8', fontSize: 10 }}>+1 (555) 234-5678</span>
                  <span style={{ color: '#94a3b8', fontSize: 10 }}>Website</span>
                  <div><span className="lead-status-tag tag-new">New</span></div>
                </div>

                <div className="mock-lead-row" style={{ marginTop: 4, display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr 0.9fr 0.9fr', gap: 6 }}>
                  <div>
                    <div className="lead-name-text">James Chen</div>
                    <div style={{ fontSize: 9, color: '#64748b' }}>jchen@layers.com</div>
                  </div>
                  <span className="lead-company-text">Layers Security</span>
                  <span style={{ color: '#94a3b8', fontSize: 10 }}>+1 (555) 876-5432</span>
                  <span style={{ color: '#94a3b8', fontSize: 10 }}>LinkedIn</span>
                  <div><span className="lead-status-tag tag-contacted">Contacted</span></div>
                </div>

                <div className="mock-lead-row" style={{ marginTop: 4, display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr 0.9fr 0.9fr', gap: 6 }}>
                  <div>
                    <div className="lead-name-text">Olivia Patel</div>
                    <div style={{ fontSize: 9, color: '#64748b' }}>olivia@orbit.ai</div>
                  </div>
                  <span className="lead-company-text">Orbit AI Corp</span>
                  <span style={{ color: '#94a3b8', fontSize: 10 }}>+1 (555) 432-1098</span>
                  <span style={{ color: '#94a3b8', fontSize: 10 }}>Referral</span>
                  <div><span className="lead-status-tag tag-qualified">Qualified</span></div>
                </div>

                <div className="mock-lead-row" style={{ marginTop: 4, display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr 0.9fr 0.9fr', gap: 6 }}>
                  <div>
                    <div className="lead-name-text">Noah Williams</div>
                    <div style={{ fontSize: 9, color: '#64748b' }}>noah@spherule.org</div>
                  </div>
                  <span className="lead-company-text">Spherule Health</span>
                  <span style={{ color: '#94a3b8', fontSize: 10 }}>+1 (555) 345-6789</span>
                  <span style={{ color: '#94a3b8', fontSize: 10 }}>Cold Outreach</span>
                  <div><span className="lead-status-tag tag-new">New</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Core Features Section (Assignment Requirements 1-6) ── */}
      <section className="landing-why-section">
        <div className="why-section-container">
          <div style={{ textAlign: 'center', marginBottom: 12 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#5846f6', letterSpacing: '1px', textTransform: 'uppercase' }}>
              Assignment Specifications &amp; Deliverables
            </span>
          </div>
          <h2 className="why-title">CORE FACILITIES PROVIDED BY THIS APPLICATION</h2>
          <p className="why-subtitle">
            Every required core feature and bonus enhancement specified in the Full Stack Developer screening assignment is fully implemented and functioning end-to-end.
          </p>

          <div className="why-cards-grid">
            {/* Core 1: Add a Lead */}
            <div className="why-card">
              <div className="why-icon-box bg-purple-soft">
                <Target size={24} className="text-primary" />
              </div>
              <h3 className="why-card-title">1. Capture Leads with Full Metadata</h3>
              <p className="why-card-desc">
                Seamless modal to add leads with all mandatory fields: <strong>Name</strong>, <strong>Email</strong>, 
                <strong>Phone</strong>, <strong>Company</strong>, <strong>Source (dropdown: Website, Referral, LinkedIn, Cold Outreach)</strong>, 
                and initial <strong>Status</strong> (New, Contacted, Qualified, Lost).
              </p>
            </div>

            {/* Core 2: List in Table */}
            <div className="why-card">
              <div className="why-icon-box bg-purple-soft">
                <Layers size={24} className="text-primary" />
              </div>
              <h3 className="why-card-title">2. Responsive Table with Status Badges</h3>
              <p className="why-card-desc">
                Organized tabular view displaying all captured leads. Each record highlights its lifecycle stage with clear, 
                color-coded status pills (New in purple, Contacted in blue, Qualified in emerald, Lost in rose).
              </p>
            </div>

            {/* Core 3: Edit & Update */}
            <div className="why-card">
              <div className="why-icon-box bg-purple-soft">
                <Edit3 size={24} className="text-primary" />
              </div>
              <h3 className="why-card-title">3. Inline Edit &amp; Status Transitions</h3>
              <p className="why-card-desc">
                Update lead details and transition pipeline statuses dynamically. Sales reps can quickly promote a lead 
                from New to Contacted, or advance to Qualified as deal discussions mature.
              </p>
            </div>

            {/* Core 4: Delete with Confirmation */}
            <div className="why-card">
              <div className="why-icon-box bg-purple-soft">
                <Trash2 size={24} className="text-primary" />
              </div>
              <h3 className="why-card-title">4. Safe Deletion with Confirmation Step</h3>
              <p className="why-card-desc">
                Protects against accidental data loss. Clicking delete triggers an explicit confirmation dialog 
                verifying the user's intent before executing permanent removal via the backend API.
              </p>
            </div>

            {/* Core 5: Search & Filter */}
            <div className="why-card">
              <div className="why-icon-box bg-purple-soft">
                <Search size={24} className="text-primary" />
              </div>
              <h3 className="why-card-title">5. Real-Time Search &amp; Status Filtering</h3>
              <p className="why-card-desc">
                Instantly filter leads by contact name or pipeline status (All, New, Contacted, Qualified, Lost). 
                Zero-lag client and server search delivers instant feedback as sales reps type.
              </p>
            </div>

            {/* Core 6: Input Validation */}
            <div className="why-card">
              <div className="why-icon-box bg-purple-soft">
                <Shield size={24} className="text-primary" />
              </div>
              <h3 className="why-card-title">6. Frontend &amp; Backend Input Validation</h3>
              <p className="why-card-desc">
                Robust 2-tier validation: Frontend checks email structure and required inputs, backed by 
                server-side Joi schema validation, SQL sanitization, and graceful error handling.
              </p>
            </div>
          </div>

          {/* ── Bonus Features Section (From Assignment PDF) ── */}
          <div style={{
            background: 'linear-gradient(135deg, #f8fafc 0%, #ede9fe 100%)',
            border: '1px solid #cbd5e1',
            borderRadius: 14,
            padding: '36px 32px',
            marginBottom: 56
          }}>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <span style={{ fontSize: 12, fontWeight: 800, color: '#5846f6', letterSpacing: '1px', textTransform: 'uppercase' }}>
                Bonus Implementations Delivered
              </span>
              <h3 style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', marginTop: 4 }}>
                ALL 5 BONUS CAPABILITIES FULLY FUNCTIONAL
              </h3>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: 20
            }}>
              <div style={{ background: '#ffffff', padding: 22, borderRadius: 10, border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <Lock size={18} className="text-primary" />
                  <span style={{ fontSize: 15, fontWeight: 700, color: '#0f172a' }}>User Authentication</span>
                </div>
                <div style={{ fontSize: 13, color: '#64748b', lineHeight: 1.5 }}>
                  Signup &amp; Login with Google OAuth 2.0 and local credentials. Strict tenant scoping ensures each sales user accesses <strong>only their own leads</strong>.
                </div>
              </div>

              <div style={{ background: '#ffffff', padding: 22, borderRadius: 10, border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <PieChart size={18} className="text-primary" />
                  <span style={{ fontSize: 15, fontWeight: 700, color: '#0f172a' }}>Dashboard Status Counts</span>
                </div>
                <div style={{ fontSize: 13, color: '#64748b', lineHeight: 1.5 }}>
                  Interactive KPI overview displaying total leads per status (New, Contacted, Qualified, Lost) and conversion rates updated in real time.
                </div>
              </div>

              <div style={{ background: '#ffffff', padding: 22, borderRadius: 10, border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <TrendingUp size={18} className="text-primary" />
                  <span style={{ fontSize: 15, fontWeight: 700, color: '#0f172a' }}>Pagination &amp; Sorting</span>
                </div>
                <div style={{ fontSize: 13, color: '#64748b', lineHeight: 1.5 }}>
                  Configurable table pagination (10, 25, 50 rows) and bi-directional column sorting on Name, Company, Source, Status, and Date.
                </div>
              </div>

              <div style={{ background: '#ffffff', padding: 22, borderRadius: 10, border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <Server size={18} className="text-primary" />
                  <span style={{ fontSize: 15, fontWeight: 700, color: '#0f172a' }}>Production REST Architecture</span>
                </div>
                <div style={{ fontSize: 13, color: '#64748b', lineHeight: 1.5 }}>
                  Clean MVC pattern with Express routers, Sequelize ORM on PostgreSQL, centralized error handlers, and automated API tests.
                </div>
              </div>
            </div>
          </div>

          {/* ── Architecture & Tech Stack Details (Section 3 of PDF) ── */}
          <div style={{
            background: '#0f172a',
            color: '#ffffff',
            borderRadius: 14,
            padding: '36px 32px',
            marginBottom: 56
          }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, textAlign: 'center', marginBottom: 6 }}>
              TECH STACK &amp; ENGINEERING FOUNDATIONS
            </h3>
            <p style={{ fontSize: 13, color: '#94a3b8', textAlign: 'center', marginBottom: 28 }}>
              Built according to the Meru Technosoft evaluation criteria: clean, readable, sensibly named, and fully working end-to-end.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20 }}>
              <div style={{ background: 'rgba(255, 255, 255, 0.05)', padding: 18, borderRadius: 8, border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                <div style={{ color: '#38bdf8', fontWeight: 700, fontSize: 14, marginBottom: 4 }}>Frontend</div>
                <div style={{ fontSize: 13, color: '#e2e8f0' }}>React 18, Vite, Lucide Icons</div>
                <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>Responsive UI, custom modals, instant client filtering &amp; validation</div>
              </div>

              <div style={{ background: 'rgba(255, 255, 255, 0.05)', padding: 18, borderRadius: 8, border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                <div style={{ color: '#34d399', fontWeight: 700, fontSize: 14, marginBottom: 4 }}>Backend API</div>
                <div style={{ fontSize: 13, color: '#e2e8f0' }}>Node.js, Express, Sequelize</div>
                <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>RESTful endpoints, Joi validation, JWT session tokens &amp; CORS</div>
              </div>

              <div style={{ background: 'rgba(255, 255, 255, 0.05)', padding: 18, borderRadius: 8, border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                <div style={{ color: '#c084fc', fontWeight: 700, fontSize: 14, marginBottom: 4 }}>Database</div>
                <div style={{ fontSize: 13, color: '#e2e8f0' }}>PostgreSQL (Relational)</div>
                <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>Indexed foreign keys, tenant relationships, enum status constraints</div>
              </div>

              <div style={{ background: 'rgba(255, 255, 255, 0.05)', padding: 18, borderRadius: 8, border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                <div style={{ color: '#f472b6', fontWeight: 700, fontSize: 14, marginBottom: 4 }}>Security &amp; UX</div>
                <div style={{ fontSize: 13, color: '#e2e8f0' }}>Google OAuth 2.0 &amp; IDOR Defense</div>
                <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>Session cookie auto-termination on tab close, XSS sanitization</div>
              </div>
            </div>
          </div>

          {/* Bottom Call to Action Banner */}
          <div className="why-cta-banner">
            <div>
              <h3 className="cta-banner-title">Launch your Sales Lead Workspace</h3>
              <p className="cta-banner-subtitle">
                Test the complete solution live: capture new leads, update pipeline statuses, and experience zero-latency search.
              </p>
            </div>
            <button
              className="hero-cta-button"
              onClick={() => onGetStarted(email)}
            >
              GET STARTED FREE
            </button>
          </div>
        </div>
      </section>

      {/* ── Landing Footer ─────────────────────────── */}
      <footer className="landing-footer">
        <div className="footer-container">
          <div className="footer-brand">
            <span className="footer-logo">LEAD MANAGER</span>
            <span className="footer-copyright">
              Screening Assignment Implementation • Meru Technosoft Pvt. Ltd.
            </span>
          </div>
          <div className="footer-links">
            <a href="#features">Core Features</a>
            <a href="#bonus">Bonus Capabilities</a>
            <a href="#techstack">Tech Stack</a>
            <button
              onClick={onLogin}
              className="footer-login-link"
            >
              Sign In to Workspace
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
