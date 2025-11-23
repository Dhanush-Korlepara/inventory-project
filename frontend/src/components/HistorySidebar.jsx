// src/components/HistorySidebar.jsx
import React, { useEffect, useState } from 'react';
import { getHistory } from '../api/api';

export default function HistorySidebar({ productId }){
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!productId) return;
    const load = async () => {
      setLoading(true);
      try {
        const res = await getHistory(productId);
        setLogs(res.data || []);
      } catch (err) {
        console.error(err);
      } finally { setLoading(false); }
    };
    load();
  }, [productId]);

  return (
    <aside style={{ borderLeft: '1px solid #eee', paddingLeft: 12 }}>
      <h3>Inventory History</h3>
      {loading && <div>Loading...</div>}
      {!loading && logs.length===0 && <div style={{ color:'#666' }}>No history found</div>}
      <div>
        {logs.map((l, idx) => (
          <div key={idx} style={{ padding: 8, borderBottom: '1px dashed #eee' }}>
            <div style={{ fontSize: 14, fontWeight: 600 }}>{l.changedBy || 'admin'}</div>
            <div style={{ color: '#666' }}>{new Date(l.timestamp).toLocaleString()}</div>
            <div style={{ marginTop: 6 }}>Stock: <strong>{l.oldStock}</strong> → <strong>{l.newStock}</strong></div>
          </div>
        ))}
      </div>
    </aside>
  );
}
