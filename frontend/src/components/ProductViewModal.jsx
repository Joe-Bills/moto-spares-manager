import React, { useState, useEffect } from 'react';
import { getProducts } from '../api';
import { useAuth } from '../AuthContext';

const ProductViewModal = ({ product, onClose }) => {
  const { token } = useAuth();
  const [freshProduct, setFreshProduct] = useState(product);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (product && product.id) {
      setLoading(true);
      // Fetch fresh product data to get updated stock quantity
      getProducts(token)
        .then(products => {
          const updatedProduct = products.find(p => p.id === product.id);
          setFreshProduct(updatedProduct || product);
        })
        .catch(() => {
          // If fetch fails, use the original product data
          setFreshProduct(product);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setFreshProduct(product);
    }
  }, [product, token]);

  if (!freshProduct) return null;
  
  const formatTZS = n => `TZS ${Number(n).toLocaleString()}`;
  
  const buying = Number(freshProduct.buying_price) || 0;
  const selling = Number(freshProduct.selling_price) || 0;
  const qty = Number(freshProduct.stock_qty) || 0;

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 }}>
      <div style={{ background: '#fff', borderRadius: 14, padding: 36, minWidth: 340, maxWidth: 420, width: '100%', boxShadow: '0 4px 32px rgba(0,0,0,0.14)', textAlign: 'left', position: 'relative' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: 16, right: 16, background: '#e76f51', color: '#fff', border: 'none', borderRadius: 6, padding: '4px 14px', fontWeight: 'bold', fontSize: '1.1rem', cursor: 'pointer' }}>Close</button>
        <h2 style={{ marginBottom: 18, color: '#bfa14a' }}>{freshProduct.name}</h2>
        {loading && (
          <div style={{ textAlign: 'center', marginBottom: 18, color: '#666', fontSize: '0.9rem' }}>
            Updating stock information...
          </div>
        )}
        {freshProduct.image && (
          <div style={{ marginBottom: 18, textAlign: 'center' }}>
            <img src={freshProduct.image} alt={freshProduct.name} style={{ width: 120, height: 120, objectFit: 'cover', borderRadius: 8, border: '1.5px solid #eee' }} />
          </div>
        )}
        <div style={{ marginBottom: 10 }}><strong>Buying Price:</strong> {formatTZS(buying)}</div>
        <div style={{ marginBottom: 10 }}><strong>Selling Price:</strong> {formatTZS(selling)}</div>
        <div style={{ marginBottom: 10 }}><strong>Stock Quantity:</strong> {qty}</div>
      </div>
    </div>
  );
};

export default ProductViewModal; 