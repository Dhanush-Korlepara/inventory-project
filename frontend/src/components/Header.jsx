// src/components/Header.jsx
import React, { useState, useEffect } from 'react';
import ImportExport from './ImportExport';
import AddProductModal from './AddProductModal';

// local image path (you can replace this with a hosted URL later)
const HERO_IMAGE_PATH = '/mnt/data/08e8c58e-c5bd-46ac-a887-535751eb8f7a.png';

export default function Header({
  query,
  setQuery,
  categories = [],
  categoryFilter,
  setCategoryFilter,
  onImported
}) {
  const [isAddOpen, setIsAddOpen] = useState(false);

  // theme (light / dark) persisted in localStorage
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme === 'dark' ? 'dark' : 'light');
    localStorage.setItem('theme', theme);
  }, [theme]);

  const openAdd = () => setIsAddOpen(true);

  return (
    <>
      <header style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16
      }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <button onClick={() => window.history.back()} style={{ padding: 8 }}>◀</button>

          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <img
              src={HERO_IMAGE_PATH}
              alt="brand"
              style={{ width: 48, height: 48, borderRadius: 8, objectFit: 'cover', boxShadow: '0 6px 18px rgba(15,23,42,0.06)' }}
            />
          </div>

          <input
            placeholder="Search products..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{ padding: 8, minWidth: 300 }}
          />

          <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} style={{ padding: 8 }}>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          <button onClick={openAdd} style={{ padding: '8px 12px' }}>+ Add New Product</button>
        </div>

        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <button
            className="theme-toggle"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            title="Toggle theme"
            style={{ padding: 8, borderRadius: 8, border: '1px solid rgba(0,0,0,0.08)', background: 'transparent', cursor: 'pointer' }}
          >
            {theme === 'dark' ? 'Light' : 'Dark'}
          </button>

          <ImportExport onImported={onImported} />
        </div>
      </header>

      <AddProductModal
        open={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onAdded={() => { setIsAddOpen(false); if (onImported) onImported(); }}
      />
    </>
  );
}
