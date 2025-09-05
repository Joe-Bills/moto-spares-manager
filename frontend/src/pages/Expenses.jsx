import React, { useEffect, useState } from 'react';
import ExpenseTable from '../components/ExpenseTable';
import ExpenseForm from '../components/ExpenseForm';
import { getExpenses, addExpense, updateExpense, deleteExpense } from '../api';
import { useAuth } from '../AuthContext';

const Expenses = () => {
  const { user, token } = useAuth();
  const isAdmin = user?.is_superuser || (user?.groups || []).includes('Admin');
  const [expenses, setExpenses] = useState([]);
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editExpense, setEditExpense] = useState(null);

  useEffect(() => {
    refresh();
  }, [token]);

  const refresh = () => getExpenses(token).then(setExpenses);

  const handleAdd = () => {
    setEditExpense(null);
    setShowForm(true);
  };
  const handleEdit = (e) => {
    setEditExpense(e);
    setShowForm(true);
  };
  const handleDelete = async (e) => {
    if (window.confirm('Delete this expense?')) {
      await deleteExpense(e.id, token);
      refresh();
    }
  };
  const handleSave = async (form) => {
    if (editExpense) {
      await updateExpense(editExpense.id, form, token);
    } else {
      await addExpense(form, token);
    }
    setShowForm(false);
    refresh();
  };

  const filtered = expenses.filter(e =>
    (!search || e.description.toLowerCase().includes(search.toLowerCase())) &&
    (!filterCat || e.category === filterCat) &&
    (!filterDate || e.date === filterDate)
  );

  const categories = Array.from(new Set(expenses.map(e => e.category))).filter(Boolean);
  const totalExpenses = filtered.reduce((sum, e) => sum + Number(e.amount || 0), 0);

  return (
    <div style={{ width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
        <h2>Expenses</h2>
        {isAdmin && (
          <button
            style={{ background: '#bfa14a', color: '#fff', border: 'none', borderRadius: 4, padding: '8px 18px', cursor: 'pointer', fontWeight: 'bold' }}
            onClick={handleAdd}
          >
            Add Expense
          </button>
        )}
      </div>
      <div style={{ display: 'flex', gap: 18, marginBottom: 18 }}>
        <input 
          placeholder="Search by description..." 
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
          }} 
        />
        <select 
          value={filterCat} 
          onChange={e => setFilterCat(e.target.value)} 
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
        >
          <option value="">All Categories</option>
          {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
        </select>
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
            minWidth: 160,
            outline: 'none',
            transition: 'border 0.2s',
          }}
        />
      </div>
      <ExpenseTable expenses={filtered} onEdit={handleEdit} onDelete={handleDelete} isAdmin={isAdmin} />
      <div style={{ marginTop: 18, textAlign: 'left', fontWeight: 'bold', fontSize: '1.15rem', color: '#bfa14a' }}>
        Total Expenses: <span style={{ color: '#232b3e' }}>TZS {totalExpenses.toLocaleString()}</span>
      </div>
      {showForm && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: '#fff', borderRadius: 12, padding: '36px 36px', minWidth: 380, maxWidth: 540, width: 'auto', boxShadow: '0 4px 32px rgba(0,0,0,0.12)', textAlign: 'left' }}>
            <h3 style={{marginBottom: 24}}>{editExpense ? 'Edit Expense' : 'Add Expense'}</h3>
            <ExpenseForm expense={editExpense} onSave={handleSave} onCancel={() => setShowForm(false)} />
          </div>
        </div>
      )}
    </div>
  );
};

export default Expenses; 