import React, { useEffect, useState, useMemo } from 'react';
import Header from './components/Header';
import ProductTable from './components/ProductTable';
import HistorySidebar from './components/HistorySidebar';
import { getProducts, searchProducts } from './api/api';

export default function App(){
  const [products, setProducts] = useState([]);
  const [query, setQuery] = useState('');
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const res = await getProducts();
      setProducts(res.data || []);
    } catch(e){
      console.error('Failed to fetch products', e);
    } finally { setLoading(false); }
  };

  useEffect(() => { loadProducts(); }, []);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (!query) return loadProducts();
      try {
        const res = await searchProducts(query);
        setProducts(res.data || []);
      } catch(e) {}
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const categories = useMemo(() => {
    const set = new Set(products.map(p => p.category).filter(Boolean));
    return ['All', ...Array.from(set)];
  }, [products]);

  const [categoryFilter, setCategoryFilter] = useState('All');

  const filteredProducts = products.filter(p => {
    if (categoryFilter !== 'All') {
      return p.category === categoryFilter;
    }
    return true;
  });

  return (
    <div style={{ fontFamily: 'system-ui', padding: 16 }}>
      <Header
        query={query}
        setQuery={setQuery}
        categories={categories}
        categoryFilter={categoryFilter}
        setCategoryFilter={setCategoryFilter}
        onImported={loadProducts}
      />

      <main style={{ display: 'flex', gap: 16 }}>
        <div style={{ flex: 1 }}>
          <ProductTable
            products={filteredProducts}
            refresh={loadProducts}
            setSelectedProductId={setSelectedProductId}
            setProducts={setProducts}
          />
        </div>

        <div style={{ width: 350 }}>
          {selectedProductId ? (
            <HistorySidebar productId={selectedProductId} />
          ) : (
            <div style={{ padding: 12, color: '#666' }}>
              Select a product to view inventory history
            </div>
          )}
        </div>
      </main>

      {loading && (
        <div style={{
          position: 'fixed', right: 12, bottom: 12,
          background: '#000', color:'#fff', padding: 10,
          borderRadius: 8
        }}>
          Loading...
        </div>
      )}
    </div>
  );
}
