import React, { useState, useEffect } from 'react';
import { X, AlertCircle } from 'lucide-react';

export const EditLeadModal = ({ isOpen, lead, onClose, onSubmit, isSubmitting }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    source: 'Website',
    status: 'New'
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (lead) {
      setFormData({
        name: lead.name || '',
        email: lead.email || '',
        phone: lead.phone || '',
        company: lead.company || '',
        source: lead.source || 'Website',
        status: lead.status || 'New'
      });
      setErrors({});
    }
  }, [lead]);

  if (!isOpen || !lead) return null;

  const validateForm = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = 'Name is required';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      errs.email = 'Email is required';
    } else if (!emailRegex.test(formData.email.trim())) {
      errs.email = 'Enter a valid email address';
    }
    return errs;
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    onSubmit(lead.id, formData);
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-card">
        {/* Header */}
        <div className="modal-header">
          <div>
            <h3 className="modal-title">Edit lead</h3>
            <p className="modal-subtitle">Update contact details and keep the status current.</p>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Informational Editing Banner */}
        <div className="modal-info-pill">
          <span>Editing {lead.name} · {lead.company || 'Direct'}</span>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label className="form-label" htmlFor="edit-lead-name">
              Name <span className="text-danger">*</span>
            </label>
            <input
              id="edit-lead-name"
              name="name"
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className={`form-input ${errors.name ? 'input-error' : ''}`}
            />
            {errors.name && <span className="field-error-text">{errors.name}</span>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="edit-lead-email">
              Email <span className="text-danger">*</span>
            </label>
            <input
              id="edit-lead-email"
              name="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              className={`form-input ${errors.email ? 'input-error' : ''}`}
            />
            {errors.email && <span className="field-error-text">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="edit-lead-phone">Phone</label>
            <input
              id="edit-lead-phone"
              name="phone"
              type="text"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="edit-lead-company">Company</label>
            <input
              id="edit-lead-company"
              name="company"
              type="text"
              value={formData.company}
              onChange={(e) => handleChange('company', e.target.value)}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="edit-lead-source">Source</label>
            <select
              id="edit-lead-source"
              name="source"
              value={formData.source}
              onChange={(e) => handleChange('source', e.target.value)}
              className="form-select"
            >
              <option value="Website">Website</option>
              <option value="Referral">Referral</option>
              <option value="LinkedIn">LinkedIn</option>
              <option value="Cold Call">Cold Call</option>
              <option value="Advertisement">Advertisement</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="edit-lead-status">Status</label>
            <select
              id="edit-lead-status"
              name="status"
              value={formData.status}
              onChange={(e) => handleChange('status', e.target.value)}
              className="form-select"
            >
              <option value="New">New</option>
              <option value="Contacted">Contacted</option>
              <option value="Qualified">Qualified</option>
              <option value="Lost">Lost</option>
            </select>
            <span className="form-helper-text">
              Previously {lead.status} · Change applies when you save.
            </span>
          </div>

          {/* Modal Footer */}
          <div className="modal-footer">
            <span className="modal-footer-note">* Name and email are required.</span>
            <div className="modal-button-group">
              <button
                type="button"
                className="btn-modal-cancel"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-modal-primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Saving...' : 'Save changes'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

