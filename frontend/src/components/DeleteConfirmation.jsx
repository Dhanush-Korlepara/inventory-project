// DeleteConfirmation.jsx
import React from 'react';

export default function DeleteConfirmation({ open, onClose, onConfirm, name }) {
  if (!open) return null;
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e=>e.stopPropagation()}>
        <h3>Delete product</h3>
        <p>Are you sure you want to delete <strong>{name}</strong> ? This action cannot be undone.</p>
        <div style={{ display:'flex', justifyContent:'flex-end', gap:8 }}>
          <button className="btn secondary" onClick={onClose}>Cancel</button>
          <button className="btn" onClick={() => { onConfirm(); onClose(); }}>Delete</button>
        </div>
      </div>
    </div>
  );
}
