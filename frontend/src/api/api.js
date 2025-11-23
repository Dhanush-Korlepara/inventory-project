// src/api/api.js
import axios from 'axios';
const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:4000';
export const api = axios.create({ baseURL: API_BASE + '/api' });

export const exportCSV = () => api.get('/products/export', { responseType: 'blob' });
export const importCSV = (file) => { const fd = new FormData(); fd.append('file', file); return api.post('/products/import', fd, { headers: { 'Content-Type': 'multipart/form-data' }}); };
export const getProducts = () => api.get('/products');
export const searchProducts = (name) => api.get(`/products/search?name=${encodeURIComponent(name)}`);
export const updateProduct = (id, payload) => api.put(`/products/${id}`, payload);
export const getHistory = (id) => api.get(`/products/${id}/history`);
export const deleteProduct = (id) => api.delete(`/products/${id}`);
