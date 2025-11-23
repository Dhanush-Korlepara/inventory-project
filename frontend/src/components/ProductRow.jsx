// src/components/ProductRow.jsx
import React, { useState } from 'react';
import { updateProduct, deleteProduct } from '../api/api';

export default function ProductRow({ product, refresh, setSelectedProductId, setProducts }){
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({
    name: product.name || '',
    unit: product.unit || '',
    category: product.category || '',
    brand: product.brand || '',
    stock: product.stock ?? 0,
    status: product.status || '',
    image: product.image || ''
  });
  const [saving, setSaving] = useState(false);

  const statusLabel = (stock) => stock === 0 ? { label: 'Out of Stock', color: '#C53030' } : { label: 'In Stock', color: '#2F855A' };

  const onSave = async () => {
    // Basic validation
    if (!form.name) { alert('Name is required'); return; }
    if (isNaN(Number(form.stock)) || Number(form.stock) < 0) { alert('Stock must be >= 0'); return; }

    setSaving(true);
    try {
      const payload = {
        ...form,
        stock: Number(form.stock),
        changedBy: 'admin' // optional
      };
      const res = await updateProduct(product.id, payload);
      // optimistic update in UI
      setProducts(prev => prev.map(p => (p.id === product.id ? res.data : p)));
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      alert('Update failed: ' + (err?.response?.data?.error || err.message));
    } finally { setSaving(false); }
  };

  const onDelete = async () => {
    if (!window.confirm('Delete product?')) return;
    try {
      await deleteProduct(product.id);
      if (refresh) refresh();
    } catch (err) {
      console.error(err);
      alert('Delete failed');
    }
  };

  return (
    <tr style={{ borderBottom: '1px solid #eee' }}>
      <td style={{ padding: 8 }}>
        {product.image ? (
          // image could be a URL or local path; if local path in your machine it might not show in browser
          <img src={product.image} alt={product.name} style={{ width: 56, height: 56, objectFit: 'cover' }} onClick={() => setSelectedProductId(product.id)} />
        ) : (
          <div style={{ width:56, height:56, background:'#f2f2f2' }} />
        )}
      </td>

      <td style={{ padding: 8 }}>
        {isEditing ? <input value={form.name} onChange={(e)=>setForm({...form, name:e.target.value})} /> : <span onClick={()=>setSelectedProductId(product.id)} style={{ cursor:'pointer'}}>{product.name}</span>}
      </td>

      <td>{isEditing ? <input value={form.unit} onChange={(e)=>setForm({...form, unit:e.target.value})} /> : product.unit}</td>
      <td>{isEditing ? <input value={form.category} onChange={(e)=>setForm({...form, category:e.target.value})} /> : product.category}</td>
      <td>{isEditing ? <input value={form.brand} onChange={(e)=>setForm({...form, brand:e.target.value})} /> : product.brand}</td>

      <td>{isEditing ? <input type="number" value={form.stock} onChange={(e)=>setForm({...form, stock:e.target.value})} /> : product.stock}</td>

      <td>
        <span style={{
          display: 'inline-block',
          padding: '4px 8px',
          borderRadius: 8,
          color: '#fff',
          background: statusLabel(product.stock).color
        }}>
          {statusLabel(product.stock).label}
        </span>
      </td>

      <td style={{ display: 'flex', gap: 6, padding: 8 }}>
        {isEditing ? (
          <>
            <button onClick={onSave} disabled={saving} style={{ padding: '6px 8px' }}>Save</button>
            <button onClick={() => { setIsEditing(false); setForm({ name: product.name, unit: product.unit, category: product.category, brand: product.brand, stock: product.stock, status: product.status, image: product.image }); }}>Cancel</button>
          </>
        ) : (
          <>
            <button onClick={() => setIsEditing(true)} style={{ padding: '6px 8px' }}>Edit</button>
            <button onClick={onDelete} style={{ padding: '6px 8px' }}>Delete</button>
          </>
        )}
      </td>
    </tr>
  );
}
