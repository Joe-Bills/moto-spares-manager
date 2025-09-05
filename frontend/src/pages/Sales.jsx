import React, { useEffect, useState } from 'react';
import SalesTable from '../components/SalesTable';
import SaleForm from '../components/SaleForm';
import { getProducts, getSales, addSale, updateSale, deleteSale } from '../api';
import { useAuth } from '../AuthContext';
import ProductViewModal from '../components/ProductViewModal';

const Sales = () => {
  const { user, token } = useAuth();
  const isAdmin = user?.is_superuser || (user?.groups || []).includes('Admin');
  const [products, setProducts] = useState([]);
  const [sales, setSales] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editSale, setEditSale] = useState(null);
  const [viewSale, setViewSale] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterDate, setFilterDate] = useState('');
  const [filterMonth, setFilterMonth] = useState('');
  const [filterYear, setFilterYear] = useState('');

  useEffect(() => {
    setLoading(true);
    Promise.all([
      getProducts(token),
      getSales(token)
    ]).then(([prods, salesData]) => {
      setProducts(prods);
      setSales(salesData);
      setLoading(false);
    });
  }, [token]);

  const refresh = () => {
    setLoading(true);
    Promise.all([
      getProducts(token),
      getSales(token)
    ]).then(([prods, salesData]) => {
      setProducts(prods);
      setSales(salesData);
      setLoading(false);
    });
  };

  const handleAdd = () => { setEditSale(null); setShowForm(true); };
  const handleSave = async (form) => {
    if (editSale) {
      await updateSale(editSale.saleId, form, token);
    } else {
      await addSale(form, token);
    }
    setShowForm(false);
    setEditSale(null);
    refresh();
  };
  const handleEdit = (row) => {
    setEditSale(row);
    setShowForm(true);
  };
  const handleView = (row) => {
    setViewSale(row);
  };
  const handleDelete = async (row) => {
    if (window.confirm('Are you sure you want to delete this sale?')) {
      await deleteSale(row.saleId, token);
      refresh();
    }
  };

  // Map sales directly for table display with enhanced product information
  const saleRows = sales.map(sale => {
    const prod = products.find(p => p.id === sale.product);
    const formatTZS = n => `TZS ${Number(n).toLocaleString()}`;
    return {
      saleId: sale.id,
      product: prod ? prod.name : sale.product,
      productObj: prod, // Include full product object for bulk product handling
      quantity: sale.quantity,
      price: sale.price,
      discount: sale.discount,
      payment_type: sale.payment_type,
      date: sale.date ? sale.date.slice(0, 16).replace('T', ' ') : '',
      rawDate: sale.date || '',
      // Add additional display information
      displayInfo: prod ? {
        isBulk: prod.is_bulk_product && prod.units_per_box > 1,
        unitsPerBox: prod.units_per_box,
        unitPrice: prod.unit_selling_price,
        boxPrice: prod.selling_price,
        totalUnits: prod.stock_qty,
        totalBoxes: prod.total_boxes,
        remainingUnits: prod.remaining_units
      } : null
    };
  });

  // Filtering logic
  const filteredRows = saleRows.filter(row => {
    const dateObj = row.rawDate ? new Date(row.rawDate) : null;
    let match = true;
    if (filterDate) {
      match = match && row.rawDate && row.rawDate.slice(0, 10) === filterDate;
    }
    if (filterMonth) {
      match = match && row.rawDate && row.rawDate.slice(0, 7) === filterMonth;
    }
    if (filterYear) {
      match = match && row.rawDate && row.rawDate.slice(0, 4) === filterYear;
    }
    return match;
  });

  const totalSales = filteredRows.reduce((sum, row) => sum + (row.price * row.quantity - row.discount), 0);

  // Prepare initial values for editing
  const editInitial = editSale ? {
    product: products.find(p => p.name === editSale.product)?.id || '',
    quantity: editSale.quantity,
    price: editSale.price,
    discount: editSale.discount,
    payment_type: editSale.payment_type,
  } : null;

  // Get unique years and months for filter dropdowns
  const allYears = Array.from(new Set(saleRows.map(r => r.rawDate && r.rawDate.slice(0, 4)).filter(Boolean)));
  const allMonths = Array.from(new Set(saleRows.map(r => r.rawDate && r.rawDate.slice(0, 7)).filter(Boolean)));

  return (
    <div style={{ width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2>Sales</h2>
        {isAdmin && <button style={{ background: '#bfa14a', color: '#fff', border: 'none', borderRadius: 4, padding: '8px 18px', cursor: 'pointer', fontWeight: 'bold' }} onClick={handleAdd}>Record Sale</button>}
      </div>
      <div style={{ display: 'flex', gap: 18, marginBottom: 18 }}>
        <input
          type="date"
          value={filterDate}
          onChange={e => setFilterDate(e.target.value)}
          style={{
            padding: '12px 14px',
            borderRadius: 8,
            border: '1.5px solid #ccc',
            background: '#f7f7fa',
            color: '#232b3e',
            fontSize: '1.08rem',
            minWidth: 180,
            outline: 'none',
            transition: 'border 0.2s',
          }}
        />
        <select
          value={filterMonth}
          onChange={e => setFilterMonth(e.target.value)}
          style={{
            padding: '12px 14px',
            borderRadius: 8,
            border: '1.5px solid #ccc',
            background: '#f7f7fa',
            color: '#232b3e',
            fontSize: '1.08rem',
            minWidth: 140,
            outline: 'none',
            transition: 'border 0.2s',
          }}
        >
          <option value="">All Months</option>
          {allMonths.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
        <select
          value={filterYear}
          onChange={e => setFilterYear(e.target.value)}
          style={{
            padding: '12px 14px',
            borderRadius: 8,
            border: '1.5px solid #ccc',
            background: '#f7f7fa',
            color: '#232b3e',
            fontSize: '1.08rem',
            minWidth: 120,
            outline: 'none',
            transition: 'border 0.2s',
          }}
        >
          <option value="">All Years</option>
          {allYears.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>
      {loading ? (
        <div style={{ textAlign: 'center', color: '#888', marginTop: 40 }}>Loading sales...</div>
      ) : filteredRows.length === 0 ? (
        <div style={{ textAlign: 'center', color: '#aaa', marginTop: 40 }}>No sales have been recorded yet.</div>
      ) : (
        <SalesTable saleRows={filteredRows} isAdmin={isAdmin} onView={handleView} onEdit={handleEdit} onDelete={handleDelete} />
      )}
      <div style={{ marginTop: 18, textAlign: 'left', fontWeight: 'bold', color: '#bfa14a', fontSize: '1.15rem' }}>
        Total Sales: <span style={{ color: '#232b3e' }}>TZS {totalSales.toLocaleString()}</span>
      </div>
      {showForm && isAdmin && (
        <div style={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          width: '100vw', 
          height: '100vh', 
          background: 'rgba(0,0,0,0.25)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          zIndex: 100,
          padding: '20px'
        }}>
          <div style={{ 
            background: '#fff', 
            borderRadius: 12, 
            padding: '24px', 
            width: '100%', 
            maxWidth: 600, 
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: '0 4px 32px rgba(0,0,0,0.12)', 
            textAlign: 'left',
            position: 'relative'
          }}>
            <div style={{ 
              position: 'sticky', 
              top: 0, 
              background: '#fff', 
              paddingBottom: '16px', 
              borderBottom: '1px solid #eee',
              marginBottom: '20px',
              zIndex: 1
            }}>
              <h3 style={{ margin: 0, color: '#232b3e' }}>
                {editSale ? 'Edit Sale' : 'Record New Sale'}
              </h3>
            </div>
            <div style={{ paddingBottom: '20px' }}>
              <SaleForm 
                products={products} 
                onSave={handleSave} 
                onCancel={() => { setShowForm(false); setEditSale(null); }} 
                initial={editInitial} 
              />
            </div>
          </div>
        </div>
      )}
      {viewSale && (
        <ProductViewModal product={viewSale.productObj} onClose={() => setViewSale(null)} />
      )}
    </div>
  );
};

export default Sales; 