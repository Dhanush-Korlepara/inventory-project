// src/components/ImportExport.jsx
import React, { useRef } from 'react';
import { importCSV, exportCSV } from '../api/api';

export default function ImportExport({ onImported }){
  const inputRef = useRef();

  const handleChoose = () => inputRef.current && inputRef.current.click();

  const handleFile = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    try {
      const res = await importCSV(file);
      const { added = 0, skipped = 0 } = res.data || {};
      alert(`${added} added, ${skipped} skipped`);
      if (onImported) onImported();
    } catch (err) {
      console.error(err);
      alert('Import failed');
    } finally {
      e.target.value = null;
    }
  };

  const handleExport = async () => {
    try {
      const res = await exportCSV();
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = 'products.csv';
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      console.error(err);
      alert('Export failed');
    }
  };

  return (
    <div style={{ display: 'flex', gap: 8 }}>
      <button onClick={handleChoose} style={{ padding: '8px 10px' }}>Import</button>
      <input ref={inputRef} type="file" accept=".csv" style={{ display: 'none' }} onChange={handleFile} />
      <button onClick={handleExport} style={{ padding: '8px 10px' }}>Export</button>
    </div>
  );
}
