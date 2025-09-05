import React from 'react';

const rowColors = ['#fff', '#f7f7fa'];
const formatTZS = n => `TZS ${Number(n).toLocaleString()}`;

const SalesTable = ({ saleRows, isAdmin, onView, onEdit, onDelete }) => {
  const getProductDisplayInfo = (row) => {
    if (!row.productObj) return { name: row.product, isBulk: false };
    
    const product = row.productObj;
    if (product.is_bulk_product && product.units_per_box > 1) {
      return {
        name: `${product.name} (${product.units_per_box} units/box)`,
        isBulk: true,
        unitsPerBox: product.units_per_box,
        unitPrice: product.unit_selling_price,
        boxPrice: product.selling_price
      };
    } else {
      return {
        name: product.name,
        isBulk: false
      };
    }
  };

  return (
    <div style={{ overflowX: 'auto', borderRadius: 10, boxShadow: '0 2px 8px rgba(34,34,34,0.06)', background: '#fff' }}>
      <table style={{ width: '100%', fontSize: '0.98rem', borderCollapse: 'collapse' }}>
        <thead style={{ position: 'sticky', top: 0, background: '#fffbe7', zIndex: 1 }}>
          <tr style={{ color: '#bfa14a', textAlign: 'left' }}>
            <th style={{ padding: '12px 8px' }}>Product</th>
            <th style={{ padding: '12px 8px' }}>Quantity</th>
            <th style={{ padding: '12px 8px' }}>Price</th>
            <th style={{ padding: '12px 8px' }}>Discount</th>
            <th style={{ padding: '12px 8px' }}>Total</th>
            <th style={{ padding: '12px 8px' }}>Payment</th>
            <th style={{ padding: '12px 8px' }}>Date</th>
            {isAdmin && <th style={{ padding: '12px 8px' }}>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {saleRows.length === 0 ? (
            <tr><td colSpan={isAdmin ? 8 : 7} style={{ textAlign: 'center', color: '#aaa', padding: 24 }}>No sales yet</td></tr>
          ) : saleRows.map((row, i) => {
            const productInfo = getProductDisplayInfo(row);
            return (
              <tr key={i} style={{ background: rowColors[i % rowColors.length] }}>
                <td style={{ padding: '10px 8px' }}>
                  <div style={{ fontWeight: 'bold' }}>{productInfo.name}</div>
                  {productInfo.isBulk && (
                    <div style={{ fontSize: '0.8rem', color: '#666' }}>
                      📦 Sold as units (Box: {formatTZS(productInfo.boxPrice)})
                    </div>
                  )}
                </td>
                <td style={{ padding: '10px 8px' }}>
                  <div style={{ fontWeight: 'bold' }}>{row.quantity}</div>
                  {productInfo.isBulk && (
                    <div style={{ fontSize: '0.8rem', color: '#666' }}>
                      {Math.floor(row.quantity / productInfo.unitsPerBox)} boxes + {row.quantity % productInfo.unitsPerBox} loose
                    </div>
                  )}
                </td>
                <td style={{ padding: '10px 8px' }}>
                  {productInfo.isBulk ? (
                    <div>
                      <div style={{ fontWeight: 'bold' }}>{formatTZS(row.price)}</div>
                      <div style={{ fontSize: '0.8rem', color: '#666' }}>
                        Unit price
                      </div>
                    </div>
                  ) : (
                    formatTZS(row.price)
                  )}
                </td>
                <td style={{ padding: '10px 8px' }}>{formatTZS(row.discount)}</td>
                <td style={{ padding: '10px 8px' }}>{formatTZS(row.price * row.quantity - row.discount)}</td>
                <td style={{ padding: '10px 8px' }}>{row.payment_type}</td>
                <td style={{ padding: '10px 8px' }}>{row.date}</td>
                {isAdmin && (
                  <td style={{ padding: '10px 8px', display: 'flex', gap: 8 }}>
                    <button style={{ background: '#bfa14a', color: '#fff', border: 'none', borderRadius: 4, padding: '4px 10px', cursor: 'pointer', fontWeight: 'bold' }} onClick={() => onView && onView(row)}>View</button>
                    <button style={{ background: '#1976d2', color: '#fff', border: 'none', borderRadius: 4, padding: '4px 10px', cursor: 'pointer', fontWeight: 'bold' }} onClick={() => onEdit && onEdit(row)}>Edit</button>
                    <button style={{ background: '#e76f51', color: '#fff', border: 'none', borderRadius: 4, padding: '4px 10px', cursor: 'pointer', fontWeight: 'bold' }} onClick={() => onDelete && onDelete(row)}>Delete</button>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default SalesTable; 