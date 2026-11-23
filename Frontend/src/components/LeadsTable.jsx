import React from 'react';
import { Search, ChevronDown, Edit2, Trash2, ArrowUpDown } from 'lucide-react';

export const LeadsTable = ({
  leads = [],
  totalItems = 0,
  currentPage = 1,
  limit = 8,
  search = '',
  statusFilter = '',
  sortBy = 'createdAt',
  order = 'DESC',
  isLoading = false,
  onSearchChange,
  onStatusFilterChange,
  onSortChange,
  onPageChange,
  onLimitChange,
  onEditLead,
  onDeleteLead,
  onOpenAddModal
}) => {
  const totalPages = Math.ceil(totalItems / limit) || 1;
  const startIndex = totalItems === 0 ? 0 : (currentPage - 1) * limit + 1;
  const endIndex = Math.min(currentPage * limit, totalItems);

  const getStatusBadgeClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'new':
        return 'badge-new';
      case 'contacted':
        return 'badge-contacted';
      case 'qualified':
        return 'badge-qualified';
      case 'lost':
        return 'badge-lost';
      default:
        return 'badge-new';
    }
  };

  return (
    <div className="table-card">
      {/* Table Header Bar */}
      <div className="table-header-bar">
        <div className="table-title-group">
          <h2 className="table-title">All leads</h2>
          <span className="table-count-badge">{totalItems}</span>
        </div>

        <div className="table-filters-group">
          {/* Search Input */}
          <div className="search-input-wrapper">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              placeholder="Search by name, company, email..."
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="search-input"
            />
          </div>

          {/* Status Filter Dropdown */}
          <div className="select-wrapper">
            <select
              value={statusFilter}
              onChange={(e) => onStatusFilterChange(e.target.value)}
              className="filter-select"
            >
              <option value="">All statuses</option>
              <option value="New">New</option>
              <option value="Contacted">Contacted</option>
              <option value="Qualified">Qualified</option>
              <option value="Lost">Lost</option>
            </select>
            <ChevronDown size={14} className="select-chevron" />
          </div>
        </div>
      </div>

      {/* Leads Table */}
      <div className="table-responsive">
        <table className="leads-table">
          <thead>
            <tr>
              <th
                className="th-sortable"
                onClick={() => onSortChange('name')}
              >
                <div className="th-content">
                  <span>NAME</span>
                  <ArrowUpDown size={12} className={sortBy === 'name' ? 'text-primary' : 'text-muted'} />
                </div>
              </th>
              <th>COMPANY</th>
              <th>EMAIL</th>
              <th>PHONE</th>
              <th>SOURCE</th>
              <th>STATUS</th>
              <th className="th-actions">ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan="7" className="text-center py-8">
                  <div className="loading-spinner-wrapper">
                    <div className="spinner"></div>
                    <span className="text-muted ml-2">Loading leads...</span>
                  </div>
                </td>
              </tr>
            ) : leads.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center py-8">
                  <div className="empty-state">
                    <button className="btn-primary" onClick={onOpenAddModal}>
                      + Add lead
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              leads.map((lead) => (
                <tr key={lead.id} className="table-row">
                  <td className="td-name font-medium">{lead.name}</td>
                  <td className="td-company text-muted">{lead.company || '—'}</td>
                  <td className="td-email">{lead.email}</td>
                  <td className="td-phone text-muted">{lead.phone || '—'}</td>
                  <td className="td-source text-muted">{lead.source || 'Other'}</td>
                  <td className="td-status">
                    <span className={`status-pill ${getStatusBadgeClass(lead.status)}`}>
                      {lead.status}
                      <ChevronDown size={12} className="status-chevron" />
                    </span>
                  </td>
                  <td className="td-actions">
                    <div className="actions-wrapper">
                      <button
                        className="btn-action btn-edit"
                        title="Edit lead"
                        onClick={() => onEditLead(lead)}
                      >
                        <Edit2 size={15} />
                        <span>Edit</span>
                      </button>
                      <button
                        className="btn-action btn-delete"
                        title="Delete lead"
                        onClick={() => onDeleteLead(lead)}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="table-footer">
        <div className="footer-range-info">
          Showing {startIndex}-{endIndex} of {totalItems} leads
        </div>

        <div className="footer-pagination-controls">
          <div className="select-wrapper limit-select-wrapper">
            <select
              value={limit}
              onChange={(e) => onLimitChange(Number(e.target.value))}
              className="limit-select"
            >
              <option value={5}>5 per page</option>
              <option value={8}>8 per page</option>
              <option value={10}>10 per page</option>
              <option value={20}>20 per page</option>
            </select>
            <ChevronDown size={12} className="select-chevron" />
          </div>

          <div className="pagination-buttons">
            <button
              className="page-btn"
              disabled={currentPage <= 1 || isLoading}
              onClick={() => onPageChange(currentPage - 1)}
            >
              &lt;
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((page) => {
                // Show first, last, and pages close to current
                return (
                  page === 1 ||
                  page === totalPages ||
                  Math.abs(page - currentPage) <= 1
                );
              })
              .map((page, index, arr) => {
                const prev = arr[index - 1];
                return (
                  <React.Fragment key={page}>
                    {prev && page - prev > 1 && (
                      <span className="pagination-ellipsis">...</span>
                    )}
                    <button
                      className={`page-btn ${currentPage === page ? 'active' : ''}`}
                      onClick={() => onPageChange(page)}
                    >
                      {page}
                    </button>
                  </React.Fragment>
                );
              })}

            <button
              className="page-btn"
              disabled={currentPage >= totalPages || isLoading}
              onClick={() => onPageChange(currentPage + 1)}
            >
              &gt;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

