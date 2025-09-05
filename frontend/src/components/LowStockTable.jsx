import React, { useState } from 'react';
import { restockProduct } from '../api';
import { useAuth } from '../AuthContext';

const LowStockTable = ({ products, onRestock }) => {
  const { token } = useAuth();
  const [restockModal, setRestockModal] = useState({ open: false, product: null });
  const [restockQty, setRestockQty] = useState(1);
  const [restockLoading, setRestockLoading] = useState(false);

  const getStockStatusColor = (product) => {
    if (product.is_out_of_stock) return '#e76f51';
    if (product.stock_status === 'critical') return '#ff6b35';
    if (product.stock_status === 'low') return '#f7931e';
    if (product.stock_status === 'medium') return '#f4a261';
    return '#2a9d8f';
  };

  const getStockStatusText = (product) => {
    if (product.is_out_of_stock) return 'Out of Stock';
    if (product.stock_status === 'critical') return 'Critical';
    if (product.stock_status === 'low') return 'Low';
    if (product.stock_status === 'medium') return 'Medium';
    return 'Normal';
  };

  const getStockStatusIcon = (product) => {
    if (product.is_out_of_stock) return '🚫';
    if (product.stock_status === 'critical') return '⚠️';
    if (product.stock_status === 'low') return '⚠️';
    if (product.stock_status === 'medium') return 'ℹ️';
    return '✅';
  };

  // Filter products that need attention (out of stock, critical, low, medium)
  const alertProducts = products.filter(p => 
    p.stock_status === 'out_of_stock' || 
    p.stock_status === 'critical' || 
    p.stock_status === 'low' || 
    p.stock_status === 'medium'
  );

  // Sort by priority: out of stock first, then critical, low, medium
  const sortedProducts = alertProducts.sort((a, b) => {
    const priority = { 'out_of_stock': 0, 'critical': 1, 'low': 2, 'medium': 3 };
    return priority[a.stock_status] - priority[b.stock_status];
  });

  async function handleRestockSubmit() {
    if (!restockModal.product || !restockQty || restockQty < 1) return;
    setRestockLoading(true);
    await restockProduct(restockModal.product.id, token, restockQty);
    setRestockLoading(false);
    setRestockModal({ open: false, product: null });
    setRestockQty(1);
    if (onRestock) onRestock();
  }

  return (
    <>
      <table style={{ width: '100%', fontSize: '0.98rem' }}>
        <thead>
          <tr style={{ color: '#bfa14a', textAlign: 'left' }}>
            <th>Status</th>
            <th>Product Name</th>
            <th>Current Qty</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {sortedProducts.length === 0 ? (
            <tr>
              <td colSpan={4} style={{ textAlign: 'center', color: '#aaa' }}>
                All products have sufficient stock
              </td>
            </tr>
          ) : sortedProducts.map((p, i) => (
            <tr key={i} style={{ 
              background: p.is_out_of_stock ? '#fff5f5' : '#fff',
              borderLeft: p.is_out_of_stock ? '4px solid #e76f51' : 'none'
            }}>
              <td>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 6,
                  color: getStockStatusColor(p),
                  fontWeight: 'bold',
                  fontSize: '0.9rem'
                }}>
                  <span>{getStockStatusIcon(p)}</span>
                  {getStockStatusText(p)}
                </div>
              </td>
              <td>
                <div style={{ fontWeight: 'bold' }}>{p.name}</div>
                {p.is_out_of_stock && (
                  <div style={{ fontSize: '0.8rem', color: '#e76f51', fontWeight: 'bold' }}>
                    URGENT: Restock needed
                  </div>
                )}
              </td>
              <td>
                <span style={{ 
                  fontWeight: 'bold', 
                  color: getStockStatusColor(p),
                  fontSize: '1.1rem'
                }}>
                  {p.stock_qty}
                </span>
              </td>
              <td>
                <button
                  style={{
                    background: p.is_out_of_stock ? '#e76f51' : '#bfa14a',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 4,
                    fontWeight: 'bold',
                    padding: '8px 18px',
                    cursor: 'pointer',
                    fontSize: '1rem'
                  }}
                  onClick={() => setRestockModal({ open: true, product: p })}
                >
                  {p.is_out_of_stock ? 'URGENT: Restock' : 'Reorder'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {restockModal.open && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          background: 'rgba(0,0,0,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100
        }}>
          <div style={{
            background: '#fff', borderRadius: 12, padding: 32, minWidth: 320, maxWidth: 360,
            boxShadow: '0 4px 32px rgba(0,0,0,0.12)', textAlign: 'left', position: 'relative'
          }}>
            <h3 style={{ margin: 0, color: '#232b3e', marginBottom: 16 }}>Restock Product</h3>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontWeight: 'bold', marginBottom: 6 }}>{restockModal.product?.name}</div>
              <label style={{ fontWeight: 500, marginBottom: 6, display: 'block' }}>Quantity to Add</label>
              <input
                type="number"
                min={1}
                value={restockQty || ''}
                onChange={e => {
                  const value = e.target.value;
                  if (value === '' || value === '0') {
                    setRestockQty('');
                  } else {
                    const numValue = Number(value);
                    if (!isNaN(numValue) && numValue > 0) {
                      setRestockQty(numValue);
                    }
                  }
                }}
                onFocus={e => {
                  if (e.target.value === '0') {
                    e.target.value = '';
                    setRestockQty('');
                  }
                }}
                style={{
                  fontSize: '1rem',
                  padding: '12px 14px',
                  borderRadius: 8,
                  border: '1.5px solid #ddd',
                  width: '100%',
                  boxSizing: 'border-box',
                  marginBottom: 12
                }}
                autoFocus
              />
            </div>
            <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
              <button
                onClick={handleRestockSubmit}
                disabled={restockLoading || !restockQty || restockQty < 1}
                style={{
                  background: '#bfa14a', color: '#fff', border: 'none', borderRadius: 8, padding: '12px', fontWeight: 'bold', fontSize: '1rem', flex: 1, cursor: restockLoading ? 'not-allowed' : 'pointer'
                }}
              >
                {restockLoading ? 'Restocking...' : 'Restock'}
              </button>
              <button
                onClick={() => { setRestockModal({ open: false, product: null }); setRestockQty(1); }}
                style={{
                  background: '#6c757d', color: '#fff', border: 'none', borderRadius: 8, padding: '12px', fontSize: '1rem', flex: 1, cursor: 'pointer'
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default LowStockTable; 