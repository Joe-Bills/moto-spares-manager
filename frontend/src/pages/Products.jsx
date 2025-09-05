import React, { useEffect, useState } from 'react';
import ProductTable from '../components/ProductTable';
import ProductForm from '../components/ProductForm';
import ProductViewModal from '../components/ProductViewModal';
import { getProducts, getCategories, addProduct, updateProduct, deleteProduct } from '../api';
import { useAuth } from '../AuthContext';

// Custom scrollbar styles
const scrollbarStyles = `
  .custom-scrollbar::-webkit-scrollbar {
    width: 6px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 3px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 3px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: #a8a8a8;
  }
  
  .sortable-header:hover {
    background-color: #f0f0f0 !important;
    transition: background-color 0.2s ease;
  }
  
  .sort-controls button:hover {
    background-color: #f8f9fa !important;
    border-color: #bfa14a !important;
    transition: all 0.2s ease;
  }
  
  .sort-controls select:hover {
    border-color: #bfa14a !important;
    transition: border-color 0.2s ease;
  }
`;

const Products = () => {
  const { user, token } = useAuth();
  const isAdmin = user?.is_superuser || (user?.groups || []).includes('Admin');
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [viewProduct, setViewProduct] = useState(null);
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');

  useEffect(() => {
    refresh();
  }, [token]);

  const refresh = () => getProducts(token).then(setProducts);

  const handleAdd = () => {
    setEditProduct(null);
    setShowForm(true);
  };
  const handleEdit = (p) => {
    setEditProduct(p);
    setShowForm(true);
  };
  const handleDelete = async (p) => {
    if (window.confirm('Delete this product?')) {
      await deleteProduct(p.id, token);
      refresh();
    }
  };
  const handleSave = async (form) => {
    if (editProduct) {
      await updateProduct(editProduct.id, form, token);
    } else {
      await addProduct(form, token);
    }
    setShowForm(false);
    refresh();
  };
  const handleView = (product) => {
    setViewProduct(product);
  };
  const handleCloseView = () => {
    setViewProduct(null);
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field) => {
    if (sortField !== field) return '↕️';
    return sortDirection === 'asc' ? '↑' : '↓';
  };

  const filtered = products
    .filter(p => !search || p.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      let aValue, bValue;
      
      switch (sortField) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'buying_price':
          aValue = parseFloat(a.buying_price) || 0;
          bValue = parseFloat(b.buying_price) || 0;
          break;
        case 'selling_price':
          aValue = parseFloat(a.selling_price) || 0;
          bValue = parseFloat(b.selling_price) || 0;
          break;
        case 'stock_qty':
          aValue = parseInt(a.stock_qty) || 0;
          bValue = parseInt(b.stock_qty) || 0;
          break;
        case 'stock_status':
          // Custom order for stock status
          const statusOrder = { 'out_of_stock': 0, 'critical': 1, 'low': 2, 'medium': 3, 'normal': 4 };
          aValue = statusOrder[a.stock_status] || 5;
          bValue = statusOrder[b.stock_status] || 5;
          break;
        default:
          aValue = a[sortField] || '';
          bValue = b[sortField] || '';
      }
      
      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

  // Calculate total available stock cost and value
  const totalStockCost = filtered.reduce((total, product) => {
    let stockCost = 0;
    
    if (product.is_bulk_product && product.units_per_box > 1) {
      // For bulk products: use unit buying price × stock quantity
      const unitBuyingPrice = (product.buying_price || 0) / (product.units_per_box || 1);
      stockCost = (product.stock_qty || 0) * unitBuyingPrice;
    } else {
      // For regular products: use buying price × stock quantity
      stockCost = (product.stock_qty || 0) * (product.buying_price || 0);
    }
    
    return total + stockCost;
  }, 0);

  const totalStockValue = filtered.reduce((total, product) => {
    let stockValue = 0;
    
    if (product.is_bulk_product && product.units_per_box > 1) {
      // For bulk products: use unit selling price × stock quantity
      const unitSellingPrice = (product.selling_price || 0) / (product.units_per_box || 1);
      stockValue = (product.stock_qty || 0) * unitSellingPrice;
    } else {
      // For regular products: use selling price × stock quantity
      stockValue = (product.stock_qty || 0) * (product.selling_price || 0);
    }
    
    return total + stockValue;
  }, 0);

  const totalStockQuantity = filtered.reduce((total, product) => {
    return total + (product.stock_qty || 0);
  }, 0);

  // Calculate potential profit
  const potentialProfit = totalStockValue - totalStockCost;

  // Determine if stock value is healthy (more than 1M TZS)
  const isStockValueHealthy = totalStockValue > 1000000;

  return (
    <div style={{ width: '100%' }}>
      <style>{scrollbarStyles}</style>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2>Products</h2>
        {isAdmin && <button style={{ background: '#bfa14a', color: '#fff', border: 'none', borderRadius: 4, padding: '8px 18px', cursor: 'pointer', fontWeight: 'bold' }} onClick={handleAdd}>Add Product</button>}
      </div>
      <div style={{ display: 'flex', gap: 18, marginBottom: 18, alignItems: 'center', flexWrap: 'wrap' }}>
        <input 
          placeholder="Search by name..." 
          value={search} 
          onChange={e => setSearch(e.target.value)} 
          style={{ 
            padding: '12px 14px', 
            borderRadius: 8, 
            border: '1.5px solid #ccc', 
            background: '#f7f7fa', 
            color: '#232b3e', 
            fontSize: '1.08rem',
            minWidth: 220,
            outline: 'none',
            transition: 'border 0.2s',
            flex: 1,
          }} 
        />
        
        {/* Sorting Controls */}
        <div className="sort-controls" style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{ fontSize: '0.9rem', color: '#666', fontWeight: 'bold' }}>Sort by:</span>
          <select 
            value={sortField} 
            onChange={e => setSortField(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: 6,
              border: '1.5px solid #ccc',
              background: '#fff',
              color: '#232b3e',
              fontSize: '0.9rem',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="name">Name</option>
            <option value="buying_price">Buying Price</option>
            <option value="selling_price">Selling Price</option>
            <option value="stock_qty">Stock Quantity</option>
            <option value="stock_status">Stock Status</option>
          </select>
          <button
            onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
            style={{
              padding: '8px 12px',
              borderRadius: 6,
              border: '1.5px solid #ccc',
              background: '#fff',
              color: '#232b3e',
              fontSize: '0.9rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              fontWeight: 'bold'
            }}
          >
            {getSortIcon(sortField)} {sortDirection === 'asc' ? 'Ascending' : 'Descending'}
          </button>
        </div>
        <div style={{
          background: '#f8f9fa',
          border: '1px solid #e9ecef',
          borderRadius: 8,
          padding: '12px 16px',
          minWidth: 200,
          textAlign: 'center',
          position: 'relative',
        }}>
          <div style={{
            position: 'absolute',
            top: 8,
            right: 8,
            fontSize: '0.8rem',
            color: isStockValueHealthy ? '#2a9d8f' : '#f7931e',
          }}>
            {isStockValueHealthy ? '💰' : '⚠️'}
          </div>
          <div style={{ fontSize: '0.9rem', color: '#6c757d', marginBottom: 4 }}>
            {search ? 'Filtered' : 'Total'} Stock Cost
          </div>
          <div style={{ 
            fontSize: '1.2rem', 
            fontWeight: 'bold', 
            color: '#e76f51', 
            marginBottom: 2 
          }}>
            TZS {totalStockCost.toLocaleString()}
          </div>
          <div style={{ fontSize: '0.8rem', color: '#6c757d' }}>
            {filtered.length} products • {totalStockQuantity.toLocaleString()} units
          </div>
        </div>
        <div style={{
          background: '#f8f9fa',
          border: '1px solid #e9ecef',
          borderRadius: 8,
          padding: '12px 16px',
          minWidth: 200,
          textAlign: 'center',
          position: 'relative',
        }}>
          <div style={{
            position: 'absolute',
            top: 8,
            right: 8,
            fontSize: '0.8rem',
            color: isStockValueHealthy ? '#2a9d8f' : '#f7931e',
          }}>
            {isStockValueHealthy ? '💰' : '⚠️'}
          </div>
          <div style={{ fontSize: '0.9rem', color: '#6c757d', marginBottom: 4 }}>
            {search ? 'Filtered' : 'Total'} Stock Value
          </div>
          <div style={{ 
            fontSize: '1.2rem', 
            fontWeight: 'bold', 
            color: isStockValueHealthy ? '#2a9d8f' : '#f7931e', 
            marginBottom: 2 
          }}>
            TZS {totalStockValue.toLocaleString()}
          </div>
          <div style={{ fontSize: '0.8rem', color: '#6c757d' }}>
            Profit: TZS {potentialProfit.toLocaleString()}
          </div>
        </div>
      </div>
      <ProductTable 
        products={filtered} 
        onEdit={handleEdit} 
        onDelete={handleDelete} 
        isAdmin={isAdmin} 
        onView={handleView}
        sortField={sortField}
        sortDirection={sortDirection}
        onSort={handleSort}
        getSortIcon={getSortIcon}
      />
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
            padding: '36px 36px', 
            minWidth: 480, 
            boxShadow: '0 4px 32px rgba(0,0,0,0.12)', 
            textAlign: 'left',
            maxHeight: '90vh',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            maxWidth: '600px'
          }}>
            <h3 style={{marginBottom: 24, flexShrink: 0}}>{editProduct ? 'Edit Product' : 'Add Product'}</h3>
            <div 
              className="custom-scrollbar"
              style={{ 
                overflowY: 'auto', 
                flex: 1,
                paddingRight: '8px',
                marginRight: '-8px'
              }}
            >
              <ProductForm product={editProduct} onSave={handleSave} onCancel={() => setShowForm(false)} />
            </div>
          </div>
        </div>
      )}
      {viewProduct && (
        <ProductViewModal product={viewProduct} onClose={handleCloseView} />
      )}
    </div>
  );
};

export default Products; 