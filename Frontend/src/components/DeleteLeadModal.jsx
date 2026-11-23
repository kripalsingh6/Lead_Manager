import React from 'react';
import { Trash2, X } from 'lucide-react';

export const DeleteLeadModal = ({ isOpen, lead, onClose, onConfirm, isDeleting }) => {
  if (!isOpen || !lead) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-card modal-delete-card">
        {/* Close Button */}
        <button className="modal-close-corner-btn" onClick={onClose}>
          <X size={18} />
        </button>

        {/* Delete Icon Badge */}
        <div className="delete-icon-wrapper">
          <Trash2 size={24} className="delete-icon-red" />
        </div>

        {/* Title & Description */}
        <h3 className="delete-modal-title">Delete this lead?</h3>
        <p className="delete-modal-description">
          This will permanently remove <span className="font-semibold">{lead.name}</span> from your leads. This action cannot be undone.
        </p>

        {/* Lead Preview Box */}
        <div className="delete-lead-preview-box">
          <div className="preview-top-row">
            <span className="preview-lead-name">{lead.name}</span>
            <span className="preview-dot">·</span>
            <span className="preview-lead-company">{lead.company || 'Direct'}</span>
          </div>
          <div className="preview-bottom-row">
            <span className="preview-lead-email">{lead.email}</span>
            <span className="preview-dot">·</span>
            <span className="preview-lead-status">{lead.status}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="delete-modal-button-group">
          <button
            className="btn-modal-cancel"
            onClick={onClose}
            disabled={isDeleting}
          >
            Cancel
          </button>
          <button
            className="btn-modal-danger"
            onClick={() => onConfirm(lead.id)}
            disabled={isDeleting}
          >
            {isDeleting ? 'Deleting...' : 'Delete lead'}
          </button>
        </div>
      </div>
    </div>
  );
};
