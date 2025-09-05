import React from 'react';

const ExpenseTable = ({ expenses, onEdit, onDelete, isAdmin }) => (
  <table style={{ width: '100%', fontSize: '0.98rem' }}>
    <thead>
      <tr style={{ color: '#bfa14a', textAlign: 'left' }}>
        <th>Date</th>
        <th>Description</th>
        <th>Category</th>
        <th>Amount</th>
        {isAdmin && <th>Actions</th>}
      </tr>
    </thead>
    <tbody>
      {expenses.length === 0 ? (
        <tr><td colSpan={isAdmin ? 5 : 4} style={{ textAlign: 'center', color: '#aaa' }}>No expenses found</td></tr>
      ) : expenses.map((e, i) => (
        <tr key={e.id || i}>
          <td>{e.date}</td>
          <td>{e.description}</td>
          <td>{e.category}</td>
          <td>{e.amount}</td>
          {isAdmin && (
            <td>
              <button style={{ marginRight: 8, background: '#232b3e', color: '#fff', border: 'none', borderRadius: 4, padding: '4px 10px', cursor: 'pointer' }} onClick={() => onEdit(e)}>Edit</button>
              <button style={{ background: '#e76f51', color: '#fff', border: 'none', borderRadius: 4, padding: '4px 10px', cursor: 'pointer' }} onClick={() => onDelete(e)}>Delete</button>
            </td>
          )}
        </tr>
      ))}
    </tbody>
  </table>
);

export default ExpenseTable; 