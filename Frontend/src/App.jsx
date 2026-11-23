import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar } from './components/Sidebar';
import { Topbar } from './components/Topbar';
import { MetricCards } from './components/MetricCards';
import { AnalyticsSection } from './components/AnalyticsSection';
import { LeadsTable } from './components/LeadsTable';
import { AddLeadModal } from './components/AddLeadModal';
import { EditLeadModal } from './components/EditLeadModal';
import { DeleteLeadModal } from './components/DeleteLeadModal';
import { AuthModal } from './components/AuthModal';
import { OnboardingFlow } from './components/OnboardingFlow';
import { LandingPage } from './components/LandingPage';
import {
  apiRequest,
  getStoredToken,
  setStoredToken,
  getStoredUser,
  setStoredUser,
  getEffectiveDisplayName,
  formatNameFromEmail
} from './api/client';
import { Calendar, Plus } from 'lucide-react';
import './App.css';

// Realistic sample leads directly from the assignment screenshots (32 total)
const SAMPLE_LEADS = [
  // ── New Leads (12) ──
  { name: 'Emma Wilson', company: 'Northstar', email: 'emma@northstar.io', phone: '+1 415 555 0101', source: 'Website', status: 'New' },
  { name: 'Noah Williams', company: 'Spherule', email: 'noah@spherule.com', phone: '+1 415 555 0104', source: 'Website', status: 'New' },
  { name: 'Ethan Davis', company: 'Luminous', email: 'ethan@luminous.co', phone: '+1 415 555 0108', source: 'LinkedIn', status: 'New' },
  { name: 'Maya Patel', company: 'Brightside', email: 'maya@brightside.com', phone: '+1 415 555 0109', source: 'Referral', status: 'New' },
  { name: 'Lucas Martin', company: 'Acme Corp', email: 'lucas@acmecorp.com', phone: '+1 415 555 0110', source: 'Website', status: 'New' },
  { name: 'Isabella Rossi', company: 'Starlight', email: 'isabella@starlight.io', phone: '+1 415 555 0113', source: 'Website', status: 'New' },
  { name: 'William Vance', company: 'Strata Labs', email: 'william@strata.ai', phone: '+1 415 555 0115', source: 'LinkedIn', status: 'New' },
  { name: 'Mia Tanaka', company: 'Sakura Tech', email: 'mia@sakuratech.jp', phone: '+1 415 555 0117', source: 'Website', status: 'New' },
  { name: 'Henry Zhang', company: 'Horizon AI', email: 'henry@horizon.ai', phone: '+1 415 555 0119', source: 'Referral', status: 'New' },
  { name: 'Evelyn Scott', company: 'Catalyst Co', email: 'evelyn@catalyst.co', phone: '+1 415 555 0121', source: 'Website', status: 'New' },
  { name: 'Oliver Green', company: 'Pinecone Inc', email: 'oliver@pinecone.io', phone: '+1 415 555 0123', source: 'Other', status: 'New' },
  { name: 'Harper Bell', company: 'Echo Systems', email: 'harper@echosys.net', phone: '+1 415 555 0125', source: 'Website', status: 'New' },

  // ── Contacted Leads (10) ──
  { name: 'James Chen', company: 'Layers', email: 'james@layers.co', phone: '+1 415 555 0102', source: 'Referral', status: 'Contacted' },
  { name: 'Ava Thompson', company: 'Capsule', email: 'ava@capsule.co', phone: '+1 415 555 0105', source: 'Referral', status: 'Contacted' },
  { name: 'Daniel Foster', company: 'Novus Media', email: 'daniel@novus.com', phone: '+1 415 555 0114', source: 'Website', status: 'Contacted' },
  { name: 'Emily Clark', company: 'Peak Ventures', email: 'emily@peakventures.vc', phone: '+1 415 555 0118', source: 'LinkedIn', status: 'Contacted' },
  { name: 'Jacob Wright', company: 'Streamline', email: 'jacob@streamline.app', phone: '+1 415 555 0120', source: 'Referral', status: 'Contacted' },
  { name: 'Chloe Adams', company: 'Luminary', email: 'chloe@luminary.design', phone: '+1 415 555 0122', source: 'Website', status: 'Contacted' },
  { name: 'Alexander White', company: 'Vanguard', email: 'alex@vanguard.io', phone: '+1 415 555 0124', source: 'Website', status: 'Contacted' },
  { name: 'Grace Hall', company: 'Beacon Software', email: 'grace@beacon.dev', phone: '+1 415 555 0126', source: 'Other', status: 'Contacted' },
  { name: 'Samuel King', company: 'Nexus Health', email: 'samuel@nexushealth.org', phone: '+1 415 555 0127', source: 'Referral', status: 'Contacted' },
  { name: 'Lily Evans', company: 'BlueSky Labs', email: 'lily@blueskylabs.com', phone: '+1 415 555 0128', source: 'Website', status: 'Contacted' },

  // ── Qualified Leads (8) ──
  { name: 'Olivia Patel', company: 'Orbit', email: 'olivia@orbit.so', phone: '+1 415 555 0103', source: 'LinkedIn', status: 'Qualified' },
  { name: 'Sophia Lee', company: 'Quotient', email: 'sophia@quotient.io', phone: '+1 415 555 0107', source: 'Website', status: 'Qualified' },
  { name: 'Charlotte Brown', company: 'Veritas', email: 'charlotte@veritas.org', phone: '+1 415 555 0111', source: 'LinkedIn', status: 'Qualified' },
  { name: 'Liam O\'Connor', company: 'Emerald City', email: 'liam@emerald.io', phone: '+1 415 555 0116', source: 'Referral', status: 'Qualified' },
  { name: 'Zachary Miller', company: 'Kinetic', email: 'zach@kinetic.sh', phone: '+1 415 555 0129', source: 'Website', status: 'Qualified' },
  { name: 'Zoe Campbell', company: 'Atlas Logic', email: 'zoe@atlaslogic.com', phone: '+1 415 555 0130', source: 'Website', status: 'Qualified' },
  { name: 'Mason Rivera', company: 'Solstice', email: 'mason@solstice.cloud', phone: '+1 415 555 0131', source: 'LinkedIn', status: 'Qualified' },
  { name: 'Ella Ward', company: 'Prism Studio', email: 'ella@prismstudio.co', phone: '+1 415 555 0132', source: 'Other', status: 'Qualified' },

  // ── Lost Leads (2) ──
  { name: 'Liam Garcia', company: 'CloudWatch', email: 'liam@cloudwatch.io', phone: '+1 415 555 0106', source: 'Other', status: 'Lost' },
  { name: 'Benjamin Taylor', company: 'Apex Global', email: 'benjamin@apex.io', phone: '+1 415 555 0112', source: 'Referral', status: 'Lost' }
];

export function App() {
  // ── Authentication & View State ───────────
  // Default to 'landing' so user always first interacts with the landing page
  const [currentUser, setCurrentUser] = useState(() => getStoredUser());
  const [currentView, setCurrentView] = useState('landing');
  const [isOnboarding, setIsOnboarding] = useState(false);
  const [authModalConfig, setAuthModalConfig] = useState({
    isOpen: false,
    isLogin: true,
    initialEmail: ''
  });

  // ── Leads & Data State ────────────────────
  const [leads, setLeads] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [stats, setStats] = useState({
    total: 0,
    byStatus: { New: 0, Contacted: 0, Qualified: 0, Lost: 0 }
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);

  // ── Filter & Pagination State ─────────────
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(8);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [order, setOrder] = useState('DESC');

  // ── Modal State ───────────────────────────
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState(null);
  const [deletingLead, setDeletingLead] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState(null);

  const showToast = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // ── URL Path Synchronizer & Router ───────
  const navigateTo = useCallback((path, replace = false) => {
    if (replace) {
      window.history.replaceState({}, '', path);
    } else {
      window.history.pushState({}, '', path);
    }

    if (path === '/workspace' || path === '/dashboard') {
      setCurrentView('dashboard');
      setIsOnboarding(false);
    } else if (path === '/onboarding') {
      setCurrentView('dashboard');
      setIsOnboarding(true);
    } else {
      setCurrentView('landing');
      setIsOnboarding(false);
    }
  }, []);

  // ── Sync URL Path with App View & Browser History ──
  useEffect(() => {
    const handleRoute = (isInitialMount = false) => {
      const path = window.location.pathname;
      const token = getStoredToken();

      if (isInitialMount) {
        const urlParams = new URLSearchParams(window.location.search);
        const tokenParam = urlParams.get('token');
        const authError = urlParams.get('error');

        if (authError) {
          showToast(`Google Sign-In failed: ${authError}`, 'error');
          window.history.replaceState({}, '', '/');
          setCurrentView('landing');
          return;
        }

        if (tokenParam) {
          setStoredToken(tokenParam);
          apiRequest('/auth/me')
            .then((res) => {
              if (res.data) {
                setStoredUser(res.data);
                setCurrentUser(res.data);
                if (res.data.onboardingCompleted === false) {
                  navigateTo('/onboarding', true);
                } else {
                  navigateTo('/workspace', true);
                }
                showToast(`Welcome back, ${res.data.name}!`);
              }
            })
            .catch(() => {
              navigateTo('/', true);
            });
          return;
        }
      }

      if (!token) {
        if (path !== '/' && path !== '/landing') {
          window.history.replaceState({}, '', '/');
        }
        setCurrentView('landing');
        setIsOnboarding(false);
        return;
      }

      if (path === '/workspace' || path === '/dashboard') {
        setCurrentView('dashboard');
        setIsOnboarding(false);
      } else if (path === '/onboarding') {
        setCurrentView('dashboard');
        setIsOnboarding(true);
      } else {
        setCurrentView('landing');
        setIsOnboarding(false);
      }
    };

    handleRoute(true);

    const onPopState = () => handleRoute(false);
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, [navigateTo]);

  // ── Auto login / ensure demo user session ──
  const ensureAuthenticated = useCallback(async () => {
    const token = getStoredToken();
    if (token) return true;

    // Use a lightweight demo session for guest browsing without overriding user identity
    try {
      const loginRes = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: 'demo@leadmanager.io',
          password: 'Password123!'
        })
      });
      setStoredToken(loginRes.data.token);
      if (!getStoredUser()) {
        setStoredUser(loginRes.data.user);
        setCurrentUser(loginRes.data.user);
      }
      return true;
    } catch {
      try {
        const regRes = await apiRequest('/auth/register', {
          method: 'POST',
          body: JSON.stringify({
            name: 'Demo User',
            email: 'demo@leadmanager.io',
            password: 'Password123!'
          })
        });
        setStoredToken(regRes.data.token);
        if (!getStoredUser()) {
          setStoredUser(regRes.data.user);
          setCurrentUser(regRes.data.user);
        }
        return true;
      } catch {
        return false;
      }
    }
  }, []);

  // ── Fetch Leads & Stats ───────────────────
  const fetchLeads = useCallback(async () => {
    const token = getStoredToken();
    if (!token) return;
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage,
        limit,
        sortBy,
        order
      });
      if (search.trim()) params.append('search', search.trim());
      if (statusFilter) params.append('status', statusFilter);

      const [leadsRes, statsRes] = await Promise.all([
        apiRequest(`/leads?${params.toString()}`),
        apiRequest('/leads/dashboard/stats').catch(() => null)
      ]);

      setLeads(leadsRes.data || []);
      setTotalItems(leadsRes.pagination?.totalItems || 0);

      if (statsRes?.data) {
        setStats(statsRes.data);
      }
    } catch (err) {
      console.error('Failed to fetch leads:', err);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, limit, search, statusFilter, sortBy, order]);

  useEffect(() => {
    if (getStoredToken() && currentView === 'dashboard') {
      fetchLeads();
    }
  }, [fetchLeads, currentView]);

  // ── Seed Sample Data Handler ──────────────
  const handleSeedSampleData = async () => {
    setIsSeeding(true);
    try {
      await ensureAuthenticated();
      let created = 0;
      for (const sample of SAMPLE_LEADS) {
        try {
          await apiRequest('/leads', {
            method: 'POST',
            body: JSON.stringify(sample)
          });
          created++;
        } catch {
          // Continue if already exists or duplicate
        }
      }
      showToast(`Added ${created} demo leads successfully!`);
      await fetchLeads();
    } catch (err) {
      showToast(`Sample data seeding failed: ${err.message}`, 'error');
    } finally {
      setIsSeeding(false);
    }
  };

  // ── Create Lead ───────────────────────────
  const handleCreateLead = async (formData) => {
    setIsSubmitting(true);
    try {
      await apiRequest('/leads', {
        method: 'POST',
        body: JSON.stringify(formData)
      });
      showToast('Lead created successfully');
      setIsAddModalOpen(false);
      fetchLeads();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Update Lead ───────────────────────────
  const handleUpdateLead = async (id, formData) => {
    setIsSubmitting(true);
    try {
      await apiRequest(`/leads/${id}`, {
        method: 'PUT',
        body: JSON.stringify(formData)
      });
      showToast('Lead updated successfully');
      setEditingLead(null);
      fetchLeads();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Delete Lead ───────────────────────────
  const handleDeleteLead = async (id) => {
    setIsSubmitting(true);
    try {
      await apiRequest(`/leads/${id}`, { method: 'DELETE' });
      showToast('Lead deleted successfully');
      setDeletingLead(null);
      fetchLeads();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Logout ────────────────────────────────
  const handleLogout = async () => {
    try {
      await apiRequest('/auth/logout', { method: 'POST' }).catch(() => {});
    } finally {
      setStoredToken(null);
      setStoredUser(null);
      setCurrentUser(null);
      navigateTo('/', true);
      setLeads([]);
      setTotalItems(0);
      showToast('Logged out');
    }
  };

  // ── Auth Success Handler ──────────────────
  const handleAuthSuccess = (user, isNewRegistration) => {
    setCurrentUser(user);
    setAuthModalConfig((prev) => ({ ...prev, isOpen: false }));
    if (isNewRegistration || user?.onboardingCompleted === false) {
      navigateTo('/onboarding');
    } else {
      navigateTo('/workspace');
      showToast(`Welcome back, ${getEffectiveDisplayName(user)}!`);
      fetchLeads();
    }
  };

  // ── Complete Onboarding ───────────────────
  const handleOnboardingComplete = async (profileData) => {
    setIsSubmitting(true);
    try {
      const res = await apiRequest('/auth/profile', {
        method: 'PUT',
        body: JSON.stringify(profileData)
      });
      const updatedUser = res.data || {
        ...currentUser,
        ...profileData,
        onboardingCompleted: true
      };
      setStoredUser(updatedUser);
      setCurrentUser(updatedUser);
      navigateTo('/workspace');
      showToast(`Welcome to Workspace, ${updatedUser.name}!`);
      fetchLeads();
    } catch (err) {
      showToast(`Failed to update profile: ${err.message}`, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── 1. Render Onboarding Flow for Email Sign-ups ──
  if (isOnboarding && currentUser) {
    const suggestedName = getEffectiveDisplayName(currentUser);
    return (
      <div className="app-container">
        {notification && (
          <div className={`toast-notification toast-${notification.type}`}>
            <span>{notification.message}</span>
          </div>
        )}
        <OnboardingFlow
          initialName={
            suggestedName && suggestedName !== 'Guest' && suggestedName !== 'User' && suggestedName !== 'Alex Morgan'
              ? suggestedName
              : (currentUser?.email ? formatNameFromEmail(currentUser.email) : '')
          }
          onComplete={handleOnboardingComplete}
          isSubmitting={isSubmitting}
        />
      </div>
    );
  }

  // ── 2. Render Datadog-Style Modern Landing Page (Unauthenticated / Landing View) ──
  if (currentView === 'landing' || !getStoredToken()) {
    return (
      <div className="app-container">
        {notification && (
          <div className={`toast-notification toast-${notification.type}`}>
            <span>{notification.message}</span>
          </div>
        )}
        <LandingPage
          onGetStarted={(email) =>
            setAuthModalConfig({
              isOpen: true,
              isLogin: false,
              initialEmail: email || ''
            })
          }
          onLogin={() =>
            setAuthModalConfig({
              isOpen: true,
              isLogin: true,
              initialEmail: ''
            })
          }
          currentUser={currentUser}
          onGoToDashboard={() => {
            navigateTo('/workspace');
            fetchLeads();
          }}
        />
        <AuthModal
          isOpen={authModalConfig.isOpen}
          defaultIsLogin={authModalConfig.isLogin}
          initialEmail={authModalConfig.initialEmail}
          onClose={() => setAuthModalConfig((prev) => ({ ...prev, isOpen: false }))}
          onAuthSuccess={handleAuthSuccess}
        />
      </div>
    );
  }

  return (
    <div className="workspace-full-page">
      {/* Toast Notification */}
      {notification && (
        <div className={`toast-notification toast-${notification.type}`}>
          <span>{notification.message}</span>
        </div>
      )}

      {/* Main Workspace Row: Sidebar + Main Content (Sidebar stops above the footer) */}
      <div className="workspace-main-row">
        {/* Dark Sidebar */}
        <Sidebar leadsCount={totalItems} />

        {/* Main Content Area */}
        <div className="main-content">
        <Topbar
          user={currentUser}
          onOpenAuth={() =>
            setAuthModalConfig({
              isOpen: true,
              isLogin: true,
              initialEmail: ''
            })
          }
          onLogout={handleLogout}
          onSeedSampleData={handleSeedSampleData}
          isSeeding={isSeeding}
          onNavigateToLanding={() => navigateTo('/')}
        />

        <main className="dashboard-body">
          {/* Dashboard Header */}
          <div className="dashboard-header-row">
            <div>
              <div className="dashboard-title-group">
                <h1 className="dashboard-title">Lead monitoring</h1>
                <span className="leads-pill-badge">{totalItems} leads</span>
              </div>
              <p className="dashboard-subtitle">
                Capture every opportunity. Keep every lead moving.
              </p>
            </div>

            <div className="header-actions">
              <button className="btn-secondary">
                <Calendar size={16} />
                <span>All time</span>
              </button>
              <button
                className="btn-primary"
                onClick={() => setIsAddModalOpen(true)}
              >
                <Plus size={16} />
                <span>Add lead</span>
              </button>
            </div>
          </div>

          {/* 4 Status Metric Cards */}
          <MetricCards stats={stats} totalLeads={totalItems} />

          {/* Pipeline Snapshot & Lead Sources */}
          <AnalyticsSection stats={stats} leads={leads} />

          {/* All Leads Table Section */}
          <LeadsTable
            leads={leads}
            totalItems={totalItems}
            currentPage={currentPage}
            limit={limit}
            search={search}
            statusFilter={statusFilter}
            sortBy={sortBy}
            order={order}
            isLoading={isLoading}
            onSearchChange={(val) => {
              setSearch(val);
              setCurrentPage(1);
            }}
            onStatusFilterChange={(val) => {
              setStatusFilter(val);
              setCurrentPage(1);
            }}
            onSortChange={(field) => {
              if (sortBy === field) {
                setOrder(order === 'ASC' ? 'DESC' : 'ASC');
              } else {
                setSortBy(field);
                setOrder('DESC');
              }
            }}
            onPageChange={(p) => setCurrentPage(p)}
            onLimitChange={(l) => {
              setLimit(l);
              setCurrentPage(1);
            }}
            onEditLead={(lead) => setEditingLead(lead)}
            onDeleteLead={(lead) => setDeletingLead(lead)}
            onOpenAddModal={() => setIsAddModalOpen(true)}
          />

          {/* Footer note matching screenshot */}
          <div className="dashboard-subfooter">
            <span>Showing sample leads for this design</span>
            <span>Lead Manager · Personal workspace</span>
          </div>
        </main>
      </div>
    </div>

    {/* ── 100% Full-Width Screen Footer (Spans below Sidebar and Workspace) ── */}
    <footer className="landing-footer workspace-screen-footer">
      <div className="footer-container">
        <div className="footer-brand">
          <span className="footer-logo">LEAD MANAGER</span>
          <span className="footer-copyright">
            Screening Assignment Implementation • Meru Technosoft Pvt. Ltd.
          </span>
        </div>
        <div className="footer-links">
          <a
            href="#features"
            onClick={(e) => {
              e.preventDefault();
              navigateTo('/');
            }}
          >
            Core Features
          </a>
          <a
            href="#bonus"
            onClick={(e) => {
              e.preventDefault();
              navigateTo('/');
            }}
          >
            Bonus Capabilities
          </a>
          <a
            href="#techstack"
            onClick={(e) => {
              e.preventDefault();
              navigateTo('/');
            }}
          >
            Tech Stack
          </a>
          <button
            type="button"
            onClick={() => navigateTo('/')}
            className="footer-login-link"
          >
            Landing Page
          </button>
        </div>
      </div>
    </footer>

      {/* Modal Dialogs */}
      <AddLeadModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleCreateLead}
        isSubmitting={isSubmitting}
      />

      <EditLeadModal
        isOpen={Boolean(editingLead)}
        lead={editingLead}
        onClose={() => setEditingLead(null)}
        onSubmit={handleUpdateLead}
        isSubmitting={isSubmitting}
      />

      <DeleteLeadModal
        isOpen={Boolean(deletingLead)}
        lead={deletingLead}
        onClose={() => setDeletingLead(null)}
        onConfirm={handleDeleteLead}
        isDeleting={isSubmitting}
      />

      <AuthModal
        isOpen={authModalConfig.isOpen}
        defaultIsLogin={authModalConfig.isLogin}
        initialEmail={authModalConfig.initialEmail}
        onClose={() => setAuthModalConfig((prev) => ({ ...prev, isOpen: false }))}
        onAuthSuccess={handleAuthSuccess}
      />
    </div>
  );
}

export default App;
