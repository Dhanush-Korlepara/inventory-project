// src/components/ProductTable.jsx
import React from 'react';
import ProductRow from './ProductRow';

export default function ProductTable({ products = [], refresh, setSelectedProductId, setProducts }){
  return (
    <div>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead style={{ textAlign: 'left', borderBottom: '1px solid #ddd' }}>
          <tr>
            <th style={{ padding: 8 }}>Image</th>
            <th>Name</th>
            <th>Unit</th>
            <th>Category</th>
            <th>Brand</th>
            <th>Stock</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map(p => (
            <ProductRow
              key={p.id}
              product={p}
              refresh={refresh}
              setSelectedProductId={setSelectedProductId}
              setProducts={setProducts}
            />
          ))}
          {products.length===0 && <tr><td colSpan="8" style={{ padding: 12 }}>No products found</td></tr>}
        </tbody>
      </table>
    </div>
  );
}
