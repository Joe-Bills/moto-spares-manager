import React, { useState } from 'react';
import { useBusinessName } from '../AuthContext';

const Settings = () => {
  const { businessName, updateBusinessName } = useBusinessName();
  const [name, setName] = useState(businessName);
  const [currency, setCurrency] = useState('TZS');

  const handleSave = e => {
    e.preventDefault();
    updateBusinessName(name);
    alert('Business info saved!');
  };

  return (
    <div>
      <h2>Settings</h2>
      <form onSubmit={handleSave} style={{ background: '#fff', borderRadius: 12, padding: 24, maxWidth: 400, marginBottom: 32 }}>
        <h3>Business Info</h3>
        <div style={{ marginBottom: 18 }}>
          <label>Business Name:<br />
            <input value={name} onChange={e => setName(e.target.value)} style={{ width: '100%', padding: '12px 14px', borderRadius: 8, border: '1.5px solid #ccc', background: '#f7f7fa', color: '#232b3e', fontSize: '1.08rem', marginTop: 6, boxSizing: 'border-box', outline: 'none', transition: 'border 0.2s' }} />
          </label>
        </div>
        <div style={{ marginBottom: 18 }}>
          <label>Currency:<br />
            <select value={currency} onChange={e => setCurrency(e.target.value)} style={{ width: '100%', padding: '12px 14px', borderRadius: 8, border: '1.5px solid #ccc', background: '#f7f7fa', color: '#232b3e', fontSize: '1.08rem', boxSizing: 'border-box', outline: 'none', transition: 'border 0.2s' }}>
              <option value="TZS">TZS (Tanzanian Shilling)</option>
              <option value="USD">USD (US Dollar)</option>
              <option value="KES">KES (Kenyan Shilling)</option>
            </select>
          </label>
        </div>
        <button type="submit" style={{ background: '#bfa14a', color: '#fff', border: 'none', borderRadius: 4, padding: '10px 0', fontWeight: 'bold', fontSize: '1.08rem', cursor: 'pointer', width: '100%' }}>Save</button>
      </form>
    </div>
  );
};

export default Settings; 