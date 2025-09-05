import React from 'react';

const totalsRow = { background: '#fffbe7', fontWeight: 'bold' };
const profitRow = { background: '#e7fbe7', fontWeight: 'bold' };
const capitalRow = { background: '#e7e9fb', fontWeight: 'bold' };
const rowColors = ['#fff', '#f7f7fa'];

const formatTZS = n => `TZS ${Number(n).toLocaleString()}`;

const ProductTable = ({ products, onEdit, onDelete, isAdmin, onView, sortField, sortDirection, onSort, getSortIcon }) => {
  // Calculate overall totals
  let totalCapital = 0;
  let totalExpectedSells = 0;

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

  const getProductDisplayInfo = (product) => {
    if (product.is_bulk_product && product.units_per_box > 1) {
      return {
        name: `${product.name} (${product.units_per_box} units/box)`,
        buyingPrice: product.buying_price,
        sellingPrice: product.selling_price,
        unitBuyingPrice: product.unit_buying_price,
        unitSellingPrice: product.unit_selling_price,
        stockQty: product.stock_qty,
        totalBoxes: product.total_boxes,
        remainingUnits: product.remaining_units
      };
    } else {
      return {
        name: product.name,
        buyingPrice: product.buying_price,
        sellingPrice: product.selling_price,
        stockQty: product.stock_qty
      };
    }
  };

  const rows = products.map((p, i) => {
    const displayInfo = getProductDisplayInfo(p);
    const buying = Number(displayInfo.buyingPrice) || 0;
    const selling = Number(displayInfo.sellingPrice) || 0;
    const qty = Number(displayInfo.stockQty) || 0;
    const totalBuying = buying * qty;
    const totalSelling = selling * qty;
    totalCapital += totalBuying;
    totalExpectedSells += totalSelling;
    const rowStyle = { background: rowColors[i % rowColors.length] };
    
    // Highlight out-of-stock products
    if (p.is_out_of_stock) {
      rowStyle.background = '#fff5f5';
      rowStyle.borderLeft = '4px solid #e76f51';
    }
    
    return (
      <tr key={p.id || i} style={rowStyle}>
        <td style={{ boxSizing: 'border-box', width: 60, padding: '10px 8px', textAlign: 'center', maxWidth: 60, overflow: 'hidden' }}>{p.image ? <img src={p.image} alt={p.name} style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 4 }} /> : '-'}</td>
        <td style={{ boxSizing: 'border-box', width: 260, padding: '10px 8px', fontWeight: 'bold', maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textAlign: 'left' }}>
          <div style={{ fontWeight: 'bold' }}>{displayInfo.name}</div>
          {p.is_out_of_stock && (
            <div style={{ fontSize: '0.8rem', color: '#e76f51', fontWeight: 'bold' }}>
              ⚠️ OUT OF STOCK
            </div>
          )}
          {p.is_bulk_product && p.units_per_box > 1 && (
            <div style={{ fontSize: '0.8rem', color: '#666' }}>
              📦 Bulk Product
            </div>
          )}
        </td>
        <td style={{ boxSizing: 'border-box', width: 110, padding: '10px 8px', textAlign: 'right', whiteSpace: 'nowrap' }}>
          {p.is_bulk_product && p.units_per_box > 1 ? (
            <div>
              <div style={{ fontWeight: 'bold' }}>{formatTZS(buying)}</div>
              <div style={{ fontSize: '0.8rem', color: '#666' }}>
                Unit: {formatTZS(displayInfo.unitBuyingPrice)}
              </div>
            </div>
          ) : (
            buying
          )}
        </td>
        <td style={{ boxSizing: 'border-box', width: 110, padding: '10px 8px', textAlign: 'right', whiteSpace: 'nowrap' }}>
          {p.is_bulk_product && p.units_per_box > 1 ? (
            <div>
              <div style={{ fontWeight: 'bold' }}>{formatTZS(selling)}</div>
              <div style={{ fontSize: '0.8rem', color: '#666' }}>
                Unit: {formatTZS(displayInfo.unitSellingPrice)}
              </div>
            </div>
          ) : (
            selling
          )}
        </td>
        <td style={{ boxSizing: 'border-box', width: 110, padding: '10px 8px', textAlign: 'center', fontWeight: 'bold', color: getStockStatusColor(p) }}>
          {qty}
          <span style={{ color: getStockStatusColor(p), fontSize: '0.9em', marginLeft: 4 }}>
            ({getStockStatusText(p)})
          </span>
          {p.is_bulk_product && p.units_per_box > 1 && (
            <div style={{ fontSize: '0.8rem', color: '#666' }}>
              {displayInfo.totalBoxes} boxes + {displayInfo.remainingUnits} loose
            </div>
          )}
        </td>
        <td style={{ boxSizing: 'border-box', width: 140, padding: '10px 8px', textAlign: 'center', minWidth: 120 }}>
          {isAdmin ? (
            <>
              <button style={{ background: '#1976d2', color: '#fff', border: 'none', borderRadius: 4, padding: '4px 10px', cursor: 'pointer', fontWeight: 'bold', marginRight: 4 }} onClick={() => onView(p)}>View</button>
              <button style={{ background: '#232b3e', color: '#fff', border: 'none', borderRadius: 4, padding: '4px 10px', cursor: 'pointer', fontWeight: 'bold', marginRight: 4 }} onClick={() => onEdit(p)}>Edit</button>
              <button style={{ background: '#e76f51', color: '#fff', border: 'none', borderRadius: 4, padding: '4px 10px', cursor: 'pointer', fontWeight: 'bold' }} onClick={() => onDelete(p)}>Delete</button>
            </>
          ) : (
            <button style={{ background: '#1976d2', color: '#fff', border: 'none', borderRadius: 4, padding: '4px 10px', cursor: 'pointer', fontWeight: 'bold' }} onClick={() => onView(p)}>View</button>
          )}
        </td>
      </tr>
    );
  });

  const totalProfit = totalExpectedSells - totalCapital;

  return (
    <div style={{
      width: '100%',
      overflowX: 'auto',
      borderRadius: 10,
      boxShadow: '0 2px 8px rgba(34,34,34,0.06)',
      background: '#fff',
    }}>
      <table style={{
        width: '100%',
        minWidth: 900,
        tableLayout: 'fixed',
        borderCollapse: 'collapse',
        fontSize: '0.98rem',
      }}>
        <colgroup>
          <col style={{ width: 60 }} />
          <col style={{ width: 260 }} />
          <col style={{ width: 110 }} />
          <col style={{ width: 110 }} />
          <col style={{ width: 110 }} />
          <col style={{ width: 140 }} />
        </colgroup>
        <thead style={{ position: 'sticky', top: 0, background: '#fffbe7', zIndex: 1 }}>
          <tr style={{ color: '#bfa14a', textAlign: 'left' }}>
            <th style={{ boxSizing: 'border-box', width: 60, padding: '12px 8px', textAlign: 'center' }}>Image</th>
            <th 
              className="sortable-header"
              style={{ 
                boxSizing: 'border-box', 
                width: 260, 
                padding: '12px 8px', 
                textAlign: 'left',
                cursor: 'pointer',
                userSelect: 'none',
                position: 'relative'
              }}
              onClick={() => onSort('name')}
            >
              Product Name {getSortIcon('name')}
            </th>
            <th 
              className="sortable-header"
              style={{ 
                boxSizing: 'border-box', 
                width: 110, 
                padding: '12px 8px', 
                textAlign: 'right',
                cursor: 'pointer',
                userSelect: 'none'
              }}
              onClick={() => onSort('buying_price')}
            >
              Buying Price {getSortIcon('buying_price')}
            </th>
            <th 
              className="sortable-header"
              style={{ 
                boxSizing: 'border-box', 
                width: 110, 
                padding: '12px 8px', 
                textAlign: 'right',
                cursor: 'pointer',
                userSelect: 'none'
              }}
              onClick={() => onSort('selling_price')}
            >
              Selling Price {getSortIcon('selling_price')}
            </th>
            <th 
              className="sortable-header"
              style={{ 
                boxSizing: 'border-box', 
                width: 110, 
                padding: '12px 8px', 
                textAlign: 'center',
                cursor: 'pointer',
                userSelect: 'none'
              }}
              onClick={() => onSort('stock_qty')}
            >
              Stock Qty {getSortIcon('stock_qty')}
            </th>
            <th style={{ boxSizing: 'border-box', width: 140, padding: '12px 8px', textAlign: 'center' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr><td colSpan={6} style={{ textAlign: 'center', color: '#aaa', padding: 24 }}>No products yet</td></tr>
          ) : (
            rows
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ProductTable; 