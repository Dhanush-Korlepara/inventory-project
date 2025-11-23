// Modal.jsx
import React from 'react';

export default function Modal({ open, title, children, onClose }) {
  if (!open) return null;
  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <div className="modal" onMouseDown={(e)=>e.stopPropagation()}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
          <h3 style={{ margin:0 }}>{title}</h3>
          <button onClick={onClose} style={{ border:'none', background:'transparent', fontSize:18, cursor:'pointer' }}>✕</button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
}
