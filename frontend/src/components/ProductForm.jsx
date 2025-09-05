import React, { useState, useEffect } from 'react';

const ProductForm = ({ product, onSave, onCancel }) => {
  const [form, setForm] = useState({
    name: '',
    buying_price: '',
    selling_price: '',
    stock_qty: '',
    image: null,
    is_bulk_product: false,
    units_per_box: 1,
  });
  const [currentImage, setCurrentImage] = useState(null);
  const [removeImage, setRemoveImage] = useState(false);

  useEffect(() => {
    if (product) {
      setForm({
        name: product.name || '',
        buying_price: product.buying_price || '',
        selling_price: product.selling_price || '',
        stock_qty: product.stock_qty || '',
        image: null,
        is_bulk_product: product.is_bulk_product || false,
        units_per_box: product.units_per_box || 1,
      });
      // Set current image if editing
      if (product.image) {
        setCurrentImage(product.image);
      }
    }
  }, [product]);

  const handleChange = e => {
    const { name, value, files, type, checked } = e.target;
    setForm(f => ({ 
      ...f, 
      [name]: type === 'checkbox' ? checked : (files ? files[0] : value) 
    }));
    // Reset remove image flag when a new image is selected
    if (files && files[0]) {
      setRemoveImage(false);
    }
  };

  const handleRemoveImage = () => {
    setCurrentImage(null);
    setForm(f => ({ ...f, image: null }));
    setRemoveImage(true);
  };

  const handleSubmit = e => {
    e.preventDefault();
    // If removing image, set image to null and add remove flag
    if (removeImage) {
      form.image = null;
      form.removeImage = true;
    }
    onSave(form);
  };

  const formatTZS = n => `TZS ${Number(n).toLocaleString()}`;

  // Calculate unit prices for display
  const unitBuyingPrice = form.buying_price && form.units_per_box > 1 
    ? Number(form.buying_price) / Number(form.units_per_box) 
    : Number(form.buying_price) || 0;
  
  const unitSellingPrice = form.selling_price && form.units_per_box > 1 
    ? Number(form.selling_price) / Number(form.units_per_box) 
    : Number(form.selling_price) || 0;

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
          Product Name
        </label>
        <input 
          name="name" 
          value={form.name} 
          onChange={handleChange} 
          placeholder="Product Name" 
          required 
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

      <div style={{ 
        background: '#f8f9fa', 
        padding: 16, 
        borderRadius: 8, 
        border: '1px solid #e9ecef',
        marginBottom: 8
      }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 8, 
          marginBottom: 12 
        }}>
          <input 
            type="checkbox" 
            name="is_bulk_product" 
            checked={form.is_bulk_product} 
            onChange={handleChange}
            style={{ width: 18, height: 18 }}
          />
          <label style={{ fontWeight: 'bold', color: '#232b3e' }}>
            This product is sold in boxes/cases
          </label>
        </div>
        
        {form.is_bulk_product && (
          <>
            <div style={{ 
              background: '#fff3cd', 
              border: '1px solid #ffeaa7', 
              borderRadius: 6, 
              padding: 12, 
              marginBottom: 12,
              fontSize: '0.9rem'
            }}>
              <div style={{ fontWeight: 'bold', color: '#856404', marginBottom: 4 }}>
                💡 How to set up bulk products:
              </div>
              <div style={{ color: '#856404' }}>
                • <strong>Units per Box:</strong> How many individual units are in one box/case
              </div>
              <div style={{ color: '#856404' }}>
                • <strong>Box Price:</strong> Total price for one complete box/case
              </div>
              <div style={{ color: '#856404' }}>
                • <strong>Total Units:</strong> Total individual units you have (e.g., 10 units = 1 complete box)
              </div>
            </div>
            
            <div>
              <label style={{ fontWeight: 500, marginBottom: 6, textAlign: 'left', display: 'block' }}>
                Units per Box/Case
      </label>
              <input 
                name="units_per_box" 
                type="number" 
                min="1" 
                value={form.units_per_box} 
                onChange={handleChange} 
                placeholder="e.g., 10 for 10 units per box" 
                required 
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
          </>
        )}
      </div>

      <div>
        <label style={{ fontWeight: 500, marginBottom: 6, textAlign: 'left', display: 'block' }}>
          {form.is_bulk_product ? 'Box/Case Buying Price' : 'Buying Price'}
      </label>
        <input 
          name="buying_price" 
          type="number" 
          value={form.buying_price} 
          onChange={handleChange} 
          placeholder={form.is_bulk_product ? "Price per box/case" : "Buying Price"} 
          required 
          style={{ 
            fontSize: '1rem', 
            padding: '12px 14px', 
            borderRadius: 8, 
            border: '1.5px solid #ddd', 
            width: '100%',
            boxSizing: 'border-box'
          }} 
        />
        {form.is_bulk_product && form.buying_price && form.units_per_box > 1 && (
          <div style={{ fontSize: '0.9rem', color: '#666', marginTop: 4 }}>
            Unit buying price: {formatTZS(unitBuyingPrice)}
          </div>
        )}
      </div>

      <div>
        <label style={{ fontWeight: 500, marginBottom: 6, textAlign: 'left', display: 'block' }}>
          {form.is_bulk_product ? 'Box/Case Selling Price' : 'Selling Price'}
      </label>
        <input 
          name="selling_price" 
          type="number" 
          value={form.selling_price} 
          onChange={handleChange} 
          placeholder={form.is_bulk_product ? "Price per box/case" : "Selling Price"} 
          required 
          style={{ 
            fontSize: '1rem', 
            padding: '12px 14px', 
            borderRadius: 8, 
            border: '1.5px solid #ddd', 
            width: '100%',
            boxSizing: 'border-box'
          }} 
        />
        {form.is_bulk_product && form.selling_price && form.units_per_box > 1 && (
          <div style={{ fontSize: '0.9rem', color: '#666', marginTop: 4 }}>
            Unit selling price: {formatTZS(unitSellingPrice)}
          </div>
        )}
      </div>

      <div>
        <label style={{ fontWeight: 500, marginBottom: 6, textAlign: 'left', display: 'block' }}>
          {form.is_bulk_product ? 'Total Units in Stock' : 'Stock Quantity'}
      </label>
        <input 
          name="stock_qty" 
          type="number" 
          value={form.stock_qty} 
          onChange={handleChange} 
          placeholder={form.is_bulk_product ? "Total individual units (e.g., 10 for 1 box of 10 units)" : "Stock Quantity"} 
          required 
          style={{ 
            fontSize: '1rem', 
            padding: '12px 14px', 
            borderRadius: 8, 
            border: '1.5px solid #ddd', 
            width: '100%',
            boxSizing: 'border-box'
          }} 
        />
        {form.is_bulk_product && form.stock_qty && form.units_per_box > 1 && (
          <div style={{ fontSize: '0.9rem', color: '#666', marginTop: 4 }}>
            <div style={{ fontWeight: 'bold', color: '#bfa14a' }}>
              Stock Breakdown:
            </div>
            <div>
              Complete boxes: {Math.floor(Number(form.stock_qty) / Number(form.units_per_box))} | 
              Remaining units: {Number(form.stock_qty) % Number(form.units_per_box)}
            </div>
            <div style={{ fontSize: '0.8rem', color: '#888', marginTop: 2 }}>
              💡 Enter total individual units (e.g., 10 units = 1 complete box of 10)
            </div>
          </div>
        )}
      </div>

      <div>
        <label style={{ fontWeight: 500, marginBottom: 6, textAlign: 'left', display: 'block' }}>
          Product Image
        </label>
        
        {/* Show current image if editing */}
        {currentImage && !removeImage && (
          <div style={{ marginBottom: 12 }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 12, 
              padding: 12, 
              background: '#f8f9fa', 
              borderRadius: 8, 
              border: '1px solid #e9ecef' 
            }}>
              <img 
                src={currentImage} 
                alt="Current product" 
                style={{ 
                  width: 60, 
                  height: 60, 
                  objectFit: 'cover', 
                  borderRadius: 4 
                }} 
              />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 'bold', marginBottom: 4 }}>Current Image</div>
                <button 
                  type="button" 
                  onClick={handleRemoveImage}
                  style={{ 
                    background: '#dc3545', 
                    color: '#fff', 
                    border: 'none', 
                    borderRadius: 4, 
                    padding: '6px 12px', 
                    fontSize: '0.9rem', 
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}
                >
                  Remove Image
                </button>
              </div>
            </div>
          </div>
        )}

        {/* File input for new image */}
        <input 
          name="image" 
          type="file" 
          accept="image/*" 
          onChange={handleChange} 
          style={{ 
            fontSize: '1rem', 
            width: '100%',
            boxSizing: 'border-box'
          }} 
        />
        
        {/* Show preview of selected new image */}
        {form.image && !removeImage && (
          <div style={{ marginTop: 8 }}>
            <img 
              src={URL.createObjectURL(form.image)} 
              alt="Preview" 
              style={{ 
                maxWidth: '100%', 
                maxHeight: 120, 
                objectFit: 'cover', 
                borderRadius: 4,
                border: '1px solid #ddd'
              }} 
            />
          </div>
        )}
      </div>

      <div style={{ 
        display: 'flex', 
        gap: 12, 
        marginTop: 8 
      }}>
        <button 
          type="submit" 
          style={{ 
            background: '#bfa14a', 
            color: '#fff', 
            border: 'none', 
            borderRadius: 8, 
            padding: '12px', 
            fontWeight: 'bold', 
            fontSize: '1rem', 
            flex: 1, 
            cursor: 'pointer' 
          }}
        >
          Save Product
        </button>
        <button 
          type="button" 
          onClick={onCancel} 
          style={{ 
            background: '#6c757d', 
            color: '#fff', 
            border: 'none', 
            borderRadius: 8, 
            padding: '12px', 
            fontSize: '1rem', 
            flex: 1, 
            cursor: 'pointer' 
          }}
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default ProductForm; 