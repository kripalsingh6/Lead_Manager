import React, { useState } from 'react';
import { X, AlertCircle } from 'lucide-react';

export const AddLeadModal = ({ isOpen, onClose, onSubmit, isSubmitting }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    source: 'Website',
    status: 'New'
  });

  const [errors, setErrors] = useState({});
  const [hasSubmitted, setHasSubmitted] = useState(false);

  if (!isOpen) return null;

  const validateForm = () => {
    const errs = {};
    if (!formData.name.trim()) {
      errs.name = 'Name is required';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      errs.email = 'Email is required';
    } else if (!emailRegex.test(formData.email.trim())) {
      errs.email = 'Enter a valid email address, e.g. maya@company.com';
    }
    return errs;
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (hasSubmitted) {
      setErrors((prev) => {
        const updated = { ...prev };
        delete updated[field];
        return updated;
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setHasSubmitted(true);
    const validationErrors = validateForm();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    onSubmit(formData);
  };

  const hasAnyError = Object.keys(errors).length > 0;

  return (
    <div className="modal-backdrop">
      <div className="modal-card">
        {/* Header */}
        <div className="modal-header">
          <div>
            <h3 className="modal-title">Add a new lead</h3>
            <p className="modal-subtitle">Start with the details. Turn a contact into an opportunity.</p>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Validation Error Banner */}
        {hasAnyError && (
          <div className="modal-alert-banner">
            <AlertCircle size={16} className="alert-icon" />
            <span>Check the highlighted field before saving.</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label className="form-label">
              Name <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              placeholder="Maya Patel"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className={`form-input ${errors.name ? 'input-error' : ''}`}
            />
            {errors.name && <span className="field-error-text">{errors.name}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">
              Email <span className="text-danger">*</span>
            </label>
            <input
              type="email"
              placeholder="maya@company.com"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              className={`form-input ${errors.email ? 'input-error' : ''}`}
            />
            {errors.email && <span className="field-error-text">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Phone</label>
            <input
              type="text"
              placeholder="+1 415 555 0109"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Company</label>
            <input
              type="text"
              placeholder="Brightside"
              value={formData.company}
              onChange={(e) => handleChange('company', e.target.value)}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Source</label>
            <select
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
            <label className="form-label">Status</label>
            <select
              value={formData.status}
              onChange={(e) => handleChange('status', e.target.value)}
              className="form-select"
            >
              <option value="New">New</option>
              <option value="Contacted">Contacted</option>
              <option value="Qualified">Qualified</option>
              <option value="Lost">Lost</option>
            </select>
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
                {isSubmitting ? 'Creating...' : 'Create lead'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

