// AddProductModal.jsx
import React, { useState } from 'react';
import Modal from './Modal';

export default function AddProductModal({ open, onClose, onAdded }) {
  const [form, setForm] = useState({
    name:'', unit:'pcs', category:'', brand:'', stock:0, status:'In Stock', image:''
  });

  const handleAdd = async () => {
    if (!form.name) { alert('Name required'); return; }
    // Quick local insert (since we don't have POST endpoint)
    // We update UI by calling onAdded() which triggers full refresh
    // Option: implement POST /api/products on backend for real server add
    try {
      // If you add server POST later, call it here.
      // For now we write to local UI by calling onAdded() to refetch server data
      alert('Add operation: create POST /api/products endpoint to persist on server.');
      onClose();
      if (onAdded) onAdded();
    } catch (e) {
      console.error(e);
      alert('Add failed');
    }
  };

  return (
    <Modal open={open} title="Add New Product" onClose={onClose}>
      <div style={{ display:'grid', gap:8 }}>
        <input className="inline-input" placeholder="Name" value={form.name} onChange={(e)=>setForm({...form,name:e.target.value})} />
        <input className="inline-input" placeholder="Unit" value={form.unit} onChange={(e)=>setForm({...form,unit:e.target.value})} />
        <input className="inline-input" placeholder="Category" value={form.category} onChange={(e)=>setForm({...form,category:e.target.value})} />
        <input className="inline-input" placeholder="Brand" value={form.brand} onChange={(e)=>setForm({...form,brand:e.target.value})} />
        <input className="inline-input" type="number" placeholder="Stock" value={form.stock} onChange={(e)=>setForm({...form,stock:Number(e.target.value)})} />
        <input className="inline-input" placeholder="Image URL" value={form.image} onChange={(e)=>setForm({...form,image:e.target.value})} />
        <div style={{ display:'flex', justifyContent:'flex-end', gap:8, marginTop:8 }}>
          <button className="btn secondary" onClick={onClose}>Cancel</button>
          <button className="btn" onClick={handleAdd}>Add product</button>
        </div>
      </div>
    </Modal>
  );
}
