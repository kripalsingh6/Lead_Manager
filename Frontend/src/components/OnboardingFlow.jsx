import React, { useState } from 'react';
import { ArrowLeft, Check, Sparkles, Building2, User } from 'lucide-react';

const ROLES = [
  'Marketing',
  'Design',
  'Product management',
  'Student',
  'UX Writing',
  'Educator',
  'Software development',
  'Data analytics',
  'Research',
  'Other'
];

export const OnboardingFlow = ({ initialName = '', onComplete, isSubmitting = false }) => {
  const [step, setStep] = useState(1);
  const [name, setName] = useState(initialName || '');
  const [selectedRole, setSelectedRole] = useState('Product management');
  const [customRole, setCustomRole] = useState('');
  const [domain, setDomain] = useState('SaaS / Technology');
  const [subscribeUpdates, setSubscribeUpdates] = useState(true);
  const [error, setError] = useState('');

  const displayName = name.trim() || 'Your Name';
  const displayRole = selectedRole === 'Other' && customRole.trim() ? customRole.trim() : selectedRole;

  const handleNextStep = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter your name to continue.');
      return;
    }
    setError('');
    setStep(2);
  };

  const handleFinish = (e) => {
    e.preventDefault();
    const finalRole = selectedRole === 'Other' ? (customRole.trim() || 'Other') : selectedRole;
    onComplete({
      name: name.trim(),
      role: finalRole,
      domain: domain.trim() || 'General',
      onboardingCompleted: true
    });
  };

  return (
    <div className="onboarding-container">
      {/* ── Left Content Pane ──────────────────── */}
      <div className="onboarding-left">
        {/* Brand Header */}
        <div className="onboarding-brand">
          <div className="brand-logo">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M3 12h4.5l3-7 4 14 3-7h3.5"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <span className="brand-title">LEAD</span>
        </div>

        {/* Navigation back button (step 2) */}
        {step === 2 && (
          <button
            type="button"
            className="onboarding-back-btn"
            onClick={() => setStep(1)}
            aria-label="Back to previous step"
          >
            <ArrowLeft size={18} />
            <span>Back</span>
          </button>
        )}

        {/* Step 1: What's your name? */}
        {step === 1 && (
          <div className="onboarding-step-body animate-fadeIn">
            <div className="onboarding-header">
              <h1 className="onboarding-title">What's your name?</h1>
              <p className="onboarding-subtitle">
                This is what others see when you manage leads, collaborate, and share reports.
              </p>
            </div>

            <form onSubmit={handleNextStep} className="onboarding-form">
              <div className="form-group">
                <label className="form-label" htmlFor="user-name-input">
                  Your Name
                </label>
                <div className="input-with-icon">
                  <User size={18} className="input-icon" />
                  <input
                    id="user-name-input"
                    name="userName"
                    type="text"
                    className="form-input onboarding-input"
                    placeholder="e.g. Kripal Singh"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (error) setError('');
                    }}
                    autoFocus
                    required
                    autoComplete="name"
                  />
                </div>
                {error && <span className="field-error-msg">{error}</span>}
              </div>

              <label className="onboarding-checkbox-label" htmlFor="subscribe-updates-input">
                <input
                  id="subscribe-updates-input"
                  name="subscribeUpdates"
                  type="checkbox"
                  checked={subscribeUpdates}
                  onChange={(e) => setSubscribeUpdates(e.target.checked)}
                />
                <span>Subscribe to product release updates and lead best practices.</span>
              </label>

              <p className="onboarding-disclaimer">
                By continuing, you agree to our Terms of Service and Privacy Policy.
              </p>

              {/* Bottom Progress & Action */}
              <div className="onboarding-footer">
                <div className="onboarding-progress">
                  <div className="progress-bar-track">
                    <div className="progress-bar-fill" style={{ width: '50%' }}></div>
                  </div>
                  <span className="progress-step-text">Step 1 of 2</span>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary onboarding-btn"
                  disabled={!name.trim()}
                >
                  Continue
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Step 2: Which role best describes you? */}
        {step === 2 && (
          <div className="onboarding-step-body animate-fadeIn">
            <div className="onboarding-header">
              <h1 className="onboarding-title">Which role best describes you?</h1>
              <p className="onboarding-subtitle">
                If you're multi-talented, pick what you do most often so we can customize your workspace.
              </p>
            </div>

            <form onSubmit={handleFinish} className="onboarding-form">
              {/* Role Pills */}
              <div className="role-pills-grid">
                {ROLES.map((role) => {
                  const isSelected = selectedRole === role;
                  return (
                    <button
                      type="button"
                      key={role}
                      className={`role-pill ${isSelected ? 'active' : ''}`}
                      onClick={() => setSelectedRole(role)}
                    >
                      {isSelected && <Check size={14} className="pill-check-icon" />}
                      <span>{role}</span>
                    </button>
                  );
                })}
              </div>

              {selectedRole === 'Other' && (
                <div className="form-group animate-fadeIn" style={{ marginTop: '1rem' }}>
                  <label className="form-label" htmlFor="custom-role-input">Specify Your Role</label>
                  <input
                    id="custom-role-input"
                    name="customRole"
                    type="text"
                    className="form-input"
                    placeholder="e.g. Sales Director, Growth Specialist"
                    value={customRole}
                    onChange={(e) => setCustomRole(e.target.value)}
                    autoFocus
                  />
                </div>
              )}

              {/* Domain Input */}
              <div className="form-group" style={{ marginTop: '1.25rem' }}>
                <label className="form-label" htmlFor="domain-input">
                  Industry / Domain
                </label>
                <div className="input-with-icon">
                  <Building2 size={18} className="input-icon" />
                  <input
                    id="domain-input"
                    name="domain"
                    type="text"
                    className="form-input onboarding-input"
                    placeholder="e.g. SaaS, E-commerce, Fintech, Healthcare, Agency"
                    value={domain}
                    onChange={(e) => setDomain(e.target.value)}
                  />
                </div>
                <span className="field-hint">Helps tailor lead conversion stages for your pipeline.</span>
              </div>

              {/* Bottom Progress & Action */}
              <div className="onboarding-footer">
                <div className="onboarding-progress">
                  <div className="progress-bar-track">
                    <div className="progress-bar-fill" style={{ width: '100%' }}></div>
                  </div>
                  <span className="progress-step-text">Step 2 of 2</span>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary onboarding-btn"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Finalizing...' : 'Go to Dashboard'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* ── Right Canvas Preview Pane (Application Color Scheme: Light + Purple) ── */}
      <div className="onboarding-preview-pane">
        <div className="preview-canvas-card">
          <div className="preview-canvas-header">
            <div className="preview-window-dots">
              <span className="dot dot-red"></span>
              <span className="dot dot-yellow"></span>
              <span className="dot dot-green"></span>
            </div>
            <div className="preview-file-title">
              <Sparkles size={14} className="text-primary" />
              <span>{displayName}'s Workspace</span>
            </div>
            <div className="preview-avatar-badge">
              <span>{displayName.charAt(0).toUpperCase()}</span>
            </div>
          </div>

          <div className="preview-canvas-content">
            {/* Subtle grid background */}
            <div className="preview-grid-bg"></div>

            {/* Simulated Live Cursor Badge */}
            <div className="preview-cursor-wrapper animate-float">
              {/* SVG Cursor Pointer */}
              <svg
                className="preview-cursor-arrow"
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path
                  d="M4.5 3.5l14 7-6.5 2-2 6.5-5.5-15.5z"
                  fill="#ff5722"
                  stroke="#ffffff"
                  strokeWidth="1.5"
                />
              </svg>

              {/* User Label Badge */}
              <div className="preview-cursor-tag">
                <span className="cursor-tag-name">{displayName}</span>
                {step === 2 && (
                  <span className="cursor-tag-role">{displayRole}</span>
                )}
              </div>
            </div>

            {/* Simulated Workspace Mini Cards */}
            <div className="preview-workspace-overlay">
              <div className="preview-metric-pill">
                <span className="metric-pill-dot"></span>
                <span>Active Leads: <strong>32</strong></span>
              </div>
              <div className="preview-domain-tag">
                <span>Domain: <strong>{domain || 'Technology'}</strong></span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

