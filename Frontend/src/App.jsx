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
import {
  apiRequest,
  getStoredToken,
  setStoredToken,
  getStoredUser,
  setStoredUser
} from './api/client';
import { Calendar, Plus } from 'lucide-react';
import './App.css';

// Realistic sample leads directly from the assignment screenshots
const SAMPLE_LEADS = [
  { name: 'Emma Wilson', company: 'Northstar', email: 'emma@northstar.io', phone: '+1 415 555 0101', source: 'Website', status: 'New' },
  { name: 'James Chen', company: 'Layers', email: 'james@layers.co', phone: '+1 415 555 0102', source: 'Referral', status: 'Contacted' },
  { name: 'Olivia Patel', company: 'Orbit', email: 'olivia@orbit.so', phone: '+1 415 555 0103', source: 'LinkedIn', status: 'Qualified' },
  { name: 'Noah Williams', company: 'Spherule', email: 'noah@spherule.com', phone: '+1 415 555 0104', source: 'Website', status: 'New' },
  { name: 'Ava Thompson', company: 'Capsule', email: 'ava@capsule.co', phone: '+1 415 555 0105', source: 'Referral', status: 'Contacted' },
  { name: 'Liam Garcia', company: 'CloudWatch', email: 'liam@cloudwatch.io', phone: '+1 415 555 0106', source: 'Other', status: 'Lost' },
  { name: 'Sophia Lee', company: 'Quotient', email: 'sophia@quotient.io', phone: '+1 415 555 0107', source: 'Website', status: 'Qualified' },
  { name: 'Ethan Davis', company: 'Luminous', email: 'ethan@luminous.co', phone: '+1 415 555 0108', source: 'LinkedIn', status: 'New' },
  { name: 'Maya Patel', company: 'Brightside', email: 'maya@brightside.com', phone: '+1 415 555 0109', source: 'Referral', status: 'New' },
  { name: 'Lucas Martin', company: 'Acme Corp', email: 'lucas@acmecorp.com', phone: '+1 415 555 0110', source: 'Website', status: 'Contacted' },
  { name: 'Charlotte Brown', company: 'Veritas', email: 'charlotte@veritas.org', phone: '+1 415 555 0111', source: 'Cold Call', status: 'Qualified' },
  { name: 'Benjamin Taylor', company: 'Apex Global', email: 'benjamin@apex.io', phone: '+1 415 555 0112', source: 'Advertisement', status: 'Lost' }
];

export function App() {
  // ── Authentication State ──────────────────
  const [currentUser, setCurrentUser] = useState(() => getStoredUser());
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

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

  // ── Check for OAuth redirect token in URL ─
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    if (token) {
      setStoredToken(token);
      // Clean up URL query parameters
      window.history.replaceState({}, document.title, window.location.pathname);
      // Fetch authenticated user
      apiRequest('/auth/me')
        .then((res) => {
          if (res.data) {
            setStoredUser(res.data);
            setCurrentUser(res.data);
            showToast(`Welcome back, ${res.data.name}!`);
          }
        })
        .catch(() => {});
    }
  }, []);

  // ── Auto login / ensure demo user session ──
  const ensureAuthenticated = useCallback(async () => {
    const token = getStoredToken();
    if (token) return true;

    // Auto-login demo account or create it for seamless experience
    try {
      const loginRes = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: 'demo@leadmanager.io',
          password: 'Password123!'
        })
      });
      setStoredToken(loginRes.data.token);
      setStoredUser(loginRes.data.user);
      setCurrentUser(loginRes.data.user);
      return true;
    } catch {
      // If demo user does not exist yet, register demo user
      try {
        const regRes = await apiRequest('/auth/register', {
          method: 'POST',
          body: JSON.stringify({
            name: 'Alex Morgan',
            email: 'demo@leadmanager.io',
            password: 'Password123!'
          })
        });
        setStoredToken(regRes.data.token);
        setStoredUser(regRes.data.user);
        setCurrentUser(regRes.data.user);
        return true;
      } catch {
        return false;
      }
    }
  }, []);

  // ── Fetch Leads & Stats ───────────────────
  const fetchLeads = useCallback(async () => {
    setIsLoading(true);
    try {
      const isAuthed = await ensureAuthenticated();
      if (!isAuthed) {
        setIsLoading(false);
        return;
      }

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
      showToast(err.message, 'error');
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, limit, search, statusFilter, sortBy, order, ensureAuthenticated]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

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
      setLeads([]);
      setTotalItems(0);
      showToast('Logged out');
    }
  };

  return (
    <div className="app-container">
      {/* Toast Notification */}
      {notification && (
        <div className={`toast-notification toast-${notification.type}`}>
          <span>{notification.message}</span>
        </div>
      )}

      {/* Dark Sidebar */}
      <Sidebar leadsCount={totalItems} />

      {/* Main Content Area */}
      <div className="main-content">
        <Topbar
          user={currentUser}
          onOpenAuth={() => setIsAuthModalOpen(true)}
          onLogout={handleLogout}
          onSeedSampleData={handleSeedSampleData}
          isSeeding={isSeeding}
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
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={(user) => {
          setCurrentUser(user);
          fetchLeads();
        }}
      />
    </div>
  );
}

export default App;
