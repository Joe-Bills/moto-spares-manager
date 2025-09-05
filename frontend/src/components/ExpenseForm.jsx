import React, { useState, useEffect } from 'react';

const categories = [
  'Rent', 'Electricity', 'Staff', 'Supplies', 'Transport', 'Other'
];

const ExpenseForm = ({ expense, onSave, onCancel }) => {
  const [form, setForm] = useState({
    date: '',
    description: '',
    category: '',
    amount: '',
  });

  useEffect(() => {
    if (expense) {
      setForm({
        date: expense.date || '',
        description: expense.description || '',
        category: expense.category || '',
        amount: expense.amount || '',
      });
    }
  }, [expense]);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleSubmit = e => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20, minWidth: 350, fontSize: '1.08rem' }}>
      <input name="date" type="date" value={form.date} onChange={handleChange} required style={{ fontSize: '1.08rem', padding: '12px 14px', borderRadius: 8, border: '1.5px solid #ccc', background: '#f7f7fa', color: '#232b3e', marginBottom: 10 }} />
      <input name="description" value={form.description} onChange={handleChange} placeholder="Description" required style={{ fontSize: '1.08rem', padding: '12px 14px', borderRadius: 8, border: '1.5px solid #ccc', background: '#f7f7fa', color: '#232b3e', marginBottom: 10 }} />
      <select name="category" value={form.category} onChange={handleChange} required style={{ fontSize: '1.08rem', padding: '12px 14px', borderRadius: 8, border: '1.5px solid #ccc', background: '#f7f7fa', color: '#232b3e', marginBottom: 10 }}>
        <option value="">Select Category</option>
        {categories.map(cat => (
          <option key={cat} value={cat}>{cat}</option>
        ))}
      </select>
      <input name="amount" type="number" value={form.amount} onChange={handleChange} placeholder="Amount" required style={{ fontSize: '1.08rem', padding: '12px 14px', borderRadius: 8, border: '1.5px solid #ccc', background: '#f7f7fa', color: '#232b3e', marginBottom: 10 }} />
      <div style={{ display: 'flex', gap: 16, marginTop: 10 }}>
        <button type="submit" style={{ background: '#bfa14a', color: '#fff', border: 'none', borderRadius: 6, padding: '10px 0', fontWeight: 'bold', fontSize: '1.08rem', flex: 1, cursor: 'pointer', transition: 'background 0.2s' }}>Save</button>
        <button type="button" style={{ background: '#eee', color: '#232b3e', border: 'none', borderRadius: 6, padding: '10px 0', fontWeight: 'bold', fontSize: '1.08rem', flex: 1, cursor: 'pointer', transition: 'background 0.2s' }} onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
};

export default ExpenseForm; 