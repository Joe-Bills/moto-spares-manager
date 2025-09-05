import React, { useState, useEffect } from 'react';
import { validateStock } from '../api';
import { useAuth } from '../AuthContext';

const paymentTypes = [
  { value: 'cash', label: 'Cash' },
  { value: 'mobile', label: 'Mobile Money' },
  { value: 'bank', label: 'Bank' },
];

const formatTZS = n => `TZS ${Number(n).toLocaleString()}`;

const SaleForm = ({ products, onSave, onCancel, initial }) => {
  const { token } = useAuth();
  const [selected, setSelected] = useState(null);
  const [quantity, setQuantity] = useState('');
  const [discount, setDiscount] = useState('');
  const [paymentType, setPaymentType] = useState('cash');
  const [search, setSearch] = useState('');
  const [stockError, setStockError] = useState('');
  const [isValidating, setIsValidating] = useState(false);

  useEffect(() => {
    if (initial) {
      const prod = products.find(p => p.id === initial.product);
      setSelected(prod || null);
      setQuantity(initial.quantity || '');
      setDiscount(initial.discount !== undefined ? initial.discount : '');
      setPaymentType(initial.payment_type || 'cash');
    }
  }, [initial, products]);

  const filtered = products.filter(p => !search || p.name.toLowerCase().includes(search.toLowerCase()));
  const price = selected ? Number(selected.unit_selling_price || selected.selling_price) : 0;
  const quantityNum = quantity ? Number(quantity) : 0;
  const discountNum = discount ? Number(discount) : 0;
  const total = selected ? (price * quantityNum - discountNum) : 0;

  // Validate stock when product or quantity changes
  useEffect(() => {
    if (selected && quantityNum > 0) {
      validateStockAvailability();
    } else {
      setStockError('');
    }
  }, [selected, quantityNum]);

  const validateStockAvailability = async () => {
    if (!selected || quantityNum <= 0) return;
    
    setIsValidating(true);
    setStockError('');
    
    try {
      const result = await validateStock(selected.id, quantityNum, token);
      if (!result.can_sell) {
        setStockError(result.message);
      }
    } catch (error) {
      setStockError('Error validating stock availability');
    } finally {
      setIsValidating(false);
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!selected) return;
    
    // Final validation before submission
    if (stockError) {
      alert('Cannot proceed with sale: ' + stockError);
      return;
    }
    
    onSave({ product: selected.id, quantity: quantityNum, price, discount: discountNum, payment_type: paymentType });
  };

  const getStockStatusColor = (product) => {
    if (!product) return '#666';
    if (product.is_out_of_stock) return '#e76f51';
    if (product.stock_status === 'critical') return '#ff6b35';
    if (product.stock_status === 'low') return '#f7931e';
    if (product.stock_status === 'medium') return '#f4a261';
    return '#2a9d8f';
  };

  const getStockStatusText = (product) => {
    if (!product) return '';
    if (product.is_out_of_stock) return 'Out of Stock';
    if (product.stock_status === 'critical') return 'Critical Stock';
    if (product.stock_status === 'low') return 'Low Stock';
    if (product.stock_status === 'medium') return 'Medium Stock';
    return 'In Stock';
  };

  const getProductDisplayInfo = (product) => {
    if (!product) return { name: '', price: 0, stock: 0 };
    
    if (product.is_bulk_product && product.units_per_box > 1) {
      return {
        name: `${product.name} (${product.units_per_box} units/box)`,
        boxPrice: product.selling_price,
        unitPrice: product.unit_selling_price,
        totalUnits: product.stock_qty,
        completeBoxes: product.total_boxes,
        remainingUnits: product.remaining_units
      };
    } else {
      return {
        name: product.name,
        unitPrice: product.selling_price,
        totalUnits: product.stock_qty
      };
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      gap: 16, 
      width: '100%', 
      fontSize: '1rem'
    }}>
      <div>
        <label style={{ fontWeight: 500, marginBottom: 6, textAlign: 'left', display: 'block' }}>
          Search Product
        </label>
        <input 
          type="text" 
          value={search} 
          onChange={e => setSearch(e.target.value)} 
          placeholder="Type product name..." 
          style={{ 
            fontSize: '1rem', 
            padding: '12px 14px', 
            borderRadius: 8, 
            border: '1.5px solid #ddd', 
            width: '100%',
            boxSizing: 'border-box'
          }} 
        />
      </div>
      
      {filtered.length > 0 && (
        <div style={{ 
          maxHeight: 180, 
          overflowY: 'auto', 
          border: '1px solid #ddd', 
          borderRadius: 8,
          backgroundColor: '#fff'
        }}>
          {filtered.map(p => {
            const displayInfo = getProductDisplayInfo(p);
            return (
              <div 
                key={p.id} 
                onClick={() => setSelected(p)} 
                style={{ 
                  padding: '12px', 
                  cursor: 'pointer', 
                  borderBottom: '1px solid #eee', 
                  background: selected?.id === p.id ? '#f0f8ff' : '#fff',
                  transition: 'background-color 0.2s'
                }}
              >
                <div style={{ fontWeight: 'bold', marginBottom: 4 }}>{displayInfo.name}</div>
                <div style={{ fontSize: '0.9rem', color: '#666' }}>
                  {p.is_bulk_product && p.units_per_box > 1 ? (
                    <>
                      <div style={{ fontWeight: 'bold', color: '#bfa14a' }}>
                        Unit Price: {formatTZS(displayInfo.unitPrice)}
                      </div>
                      <div style={{ fontSize: '0.8rem' }}>
                        Box: {formatTZS(displayInfo.boxPrice)} | 
                        Stock: {displayInfo.totalUnits} units ({displayInfo.completeBoxes} boxes + {displayInfo.remainingUnits} loose)
                      </div>
                    </>
                  ) : (
                    <>
                      <div style={{ fontWeight: 'bold', color: '#bfa14a' }}>
                        Price: {formatTZS(displayInfo.unitPrice)}
                      </div>
                      <div style={{ fontSize: '0.8rem' }}>
                        Stock: 
                        <span style={{ color: getStockStatusColor(p), fontWeight: 'bold', marginLeft: 4 }}>
                          {displayInfo.totalUnits} ({getStockStatusText(p)})
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
      
      {selected && (
        <div style={{ 
          background: '#f8f9fa', 
          padding: 16, 
          borderRadius: 8, 
          border: '1px solid #e9ecef' 
        }}>
          <div style={{ fontWeight: 'bold', marginBottom: 8 }}>
            Selected Product: {selected.name}
            {selected.is_bulk_product && selected.units_per_box > 1 && (
              <span style={{ fontSize: '0.9rem', color: '#666', fontWeight: 'normal' }}>
                {' '}({selected.units_per_box} units/box)
              </span>
            )}
          </div>
          <div style={{ fontSize: '0.9rem', color: '#666' }}>
            {selected.is_bulk_product && selected.units_per_box > 1 ? (
              <>
                <div>Box Price: {formatTZS(selected.selling_price)}</div>
                <div>Unit Price: {formatTZS(selected.unit_selling_price)}</div>
                <div style={{ color: getStockStatusColor(selected), fontWeight: 'bold' }}>
                  Stock: {selected.stock_qty} units ({selected.total_boxes} boxes + {selected.remaining_units} loose)
                </div>
              </>
            ) : (
              <>
                <div>Price: {formatTZS(selected.selling_price)}</div>
                <div style={{ color: getStockStatusColor(selected), fontWeight: 'bold' }}>
                  Stock: {selected.stock_qty} ({getStockStatusText(selected)})
                </div>
              </>
            )}
          </div>
        </div>
      )}
      
      <div>
        <label style={{ fontWeight: 500, marginBottom: 6, textAlign: 'left', display: 'block' }}>
          {selected?.is_bulk_product && selected?.units_per_box > 1 ? 'Quantity (Units)' : 'Quantity'}
        </label>
        <input 
          type="number" 
          min={1} 
          max={selected?.stock_qty || 1000} 
          value={quantity || ''} 
          onChange={e => {
            const value = e.target.value;
            if (value === '' || value === '0') {
              setQuantity('');
            } else {
              const numValue = Number(value);
              if (!isNaN(numValue) && numValue > 0) {
                setQuantity(numValue);
              }
            }
          }} 
          onFocus={e => {
            if (e.target.value === '0') {
              e.target.value = '';
              setQuantity('');
            }
          }}
          placeholder={selected?.is_bulk_product && selected?.units_per_box > 1 ? "Enter number of units" : "Enter quantity"} 
          required 
          style={{ 
            fontSize: '1rem', 
            padding: '12px 14px', 
            borderRadius: 8, 
            border: stockError ? '1.5px solid #e76f51' : '1.5px solid #ddd',
            width: '100%',
            boxSizing: 'border-box'
          }} 
        />
        {selected?.is_bulk_product && selected?.units_per_box > 1 && quantityNum > 0 && (
          <div style={{ fontSize: '0.9rem', color: '#666', marginTop: 4 }}>
            {Math.floor(quantityNum / selected.units_per_box)} complete boxes + {quantityNum % selected.units_per_box} loose units
          </div>
        )}
        {stockError && (
          <div style={{ color: '#e76f51', fontSize: '0.9rem', marginTop: 4 }}>
            ⚠️ {stockError}
          </div>
        )}
        {isValidating && (
          <div style={{ color: '#bfa14a', fontSize: '0.9rem', marginTop: 4 }}>
            🔄 Validating stock...
          </div>
        )}
      </div>
      
      <div>
        <label style={{ fontWeight: 500, marginBottom: 6, textAlign: 'left', display: 'block' }}>
          Price per Unit
          {selected?.is_bulk_product && selected?.units_per_box > 1 && (
            <span style={{ fontSize: '0.8rem', color: '#666', fontWeight: 'normal' }}>
              {' '}(from {selected.units_per_box} units/box)
            </span>
          )}
        </label>
        <input 
          type="number" 
          value={price} 
          readOnly 
          style={{ 
            fontSize: '1rem', 
            padding: '12px 14px', 
            borderRadius: 8, 
            border: '1.5px solid #ddd', 
            width: '100%', 
            background: '#f8f9fa',
            boxSizing: 'border-box'
          }} 
        />
        {selected?.is_bulk_product && selected?.units_per_box > 1 && (
          <div style={{ fontSize: '0.9rem', color: '#666', marginTop: 4 }}>
            Box Price: {formatTZS(selected.selling_price)} ÷ {selected.units_per_box} units = {formatTZS(price)} per unit
          </div>
        )}
      </div>
      
      <div>
        <label style={{ fontWeight: 500, marginBottom: 6, textAlign: 'left', display: 'block' }}>
          Discount
        </label>
        <input 
          type="number" 
          value={discount || ''} 
          min={0}
          onChange={e => {
            const value = e.target.value;
            if (value === '' || value === '0') {
              setDiscount('');
            } else {
              const numValue = Number(value);
              if (!isNaN(numValue) && numValue >= 0) {
                setDiscount(numValue);
              }
            }
          }} 
          onFocus={e => {
            if (e.target.value === '0') {
              e.target.value = '';
              setDiscount('');
            }
          }}
          placeholder="Discount amount" 
          style={{ 
            fontSize: '1rem', 
            padding: '12px 14px', 
            borderRadius: 8, 
            border: '1.5px solid #ddd', 
            width: '100%',
            boxSizing: 'border-box'
          }} 
        />
      </div>
      
      <div>
        <label style={{ fontWeight: 500, marginBottom: 6, textAlign: 'left', display: 'block' }}>
          Payment Type
      </label>
        <select 
          value={paymentType} 
          onChange={e => setPaymentType(e.target.value)} 
          style={{ 
            fontSize: '1rem', 
            padding: '12px 14px', 
            borderRadius: 8, 
            border: '1.5px solid #ddd', 
            width: '100%',
            boxSizing: 'border-box'
          }}
        >
          {paymentTypes.map(pt => (
            <option key={pt.value} value={pt.value}>{pt.label}</option>
          ))}
        </select>
      </div>
      
      <div style={{ 
        background: '#f8f9fa', 
        padding: 16, 
        borderRadius: 8, 
        border: '1px solid #e9ecef',
        marginTop: 8
      }}>
        <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>Total: {formatTZS(total)}</div>
        {selected?.is_bulk_product && selected?.units_per_box > 1 && quantityNum > 0 && (
          <div style={{ fontSize: '0.9rem', color: '#666', marginTop: 4 }}>
            ({quantityNum} units × {formatTZS(price)} per unit)
          </div>
        )}
      </div>
      
      <div style={{ 
        display: 'flex', 
        gap: 12, 
        marginTop: 8,
        position: 'sticky',
        bottom: 0,
        background: '#fff',
        paddingTop: '16px',
        borderTop: '1px solid #eee'
      }}>
        <button 
          type="submit" 
          disabled={!selected || !quantityNum || stockError || isValidating} 
          style={{ 
            flex: 1, 
            background: stockError || !selected || !quantityNum ? '#ccc' : '#bfa14a', 
            color: '#fff', 
            border: 'none', 
            borderRadius: 8, 
            padding: '12px', 
            fontSize: '1rem', 
            cursor: stockError || !selected || !quantityNum ? 'not-allowed' : 'pointer',
            fontWeight: 'bold'
          }}
        >
          {isValidating ? 'Validating...' : 'Save Sale'}
        </button>
        <button 
          type="button" 
          onClick={onCancel} 
          style={{ 
            flex: 1, 
            background: '#6c757d', 
            color: '#fff', 
            border: 'none', 
            borderRadius: 8, 
            padding: '12px', 
            fontSize: '1rem', 
            cursor: 'pointer' 
          }}
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default SaleForm; 