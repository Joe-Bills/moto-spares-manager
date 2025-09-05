import React, { useEffect, useState } from 'react';
import { useAuth } from '../AuthContext';

const AuditLog = () => {
  const { token } = useAuth();
  const [logs, setLogs] = useState([]);
  const [action, setAction] = useState('');
  const [model, setModel] = useState('');

  useEffect(() => {
    fetch('/api/audit-logs/', {
      headers: { Authorization: 'Bearer ' + token },
    })
      .then(res => res.json())
      .then(setLogs)
      .catch(() => setLogs([]));
  }, [token]);

  const filtered = logs.filter(l =>
    (!action || l.action === action) &&
    (!model || l.model === model)
  );

  const actions = Array.from(new Set(logs.map(l => l.action))).filter(Boolean);
  const models = Array.from(new Set(logs.map(l => l.model))).filter(Boolean);

  return (
    <div>
      <h2>Audit Log</h2>
      <div style={{ display: 'flex', gap: 18, marginBottom: 18 }}>
        <select value={action} onChange={e => setAction(e.target.value)} style={{ padding: '12px 14px', borderRadius: 8, border: '1.5px solid #ccc', background: '#f7f7fa', color: '#232b3e', fontSize: '1.08rem', minWidth: 160, outline: 'none', transition: 'border 0.2s' }}>
          <option value="">All Actions</option>
          {actions.map(a => <option key={a} value={a}>{a}</option>)}
        </select>
        <select value={model} onChange={e => setModel(e.target.value)} style={{ padding: '12px 14px', borderRadius: 8, border: '1.5px solid #ccc', background: '#f7f7fa', color: '#232b3e', fontSize: '1.08rem', minWidth: 160, outline: 'none', transition: 'border 0.2s' }}>
          <option value="">All Models</option>
          {models.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
      </div>
      <div style={{ overflowX: 'auto', background: '#fff', borderRadius: 12, padding: 24 }}>
        <table style={{ width: '100%', fontSize: '0.98rem' }}>
          <thead>
            <tr style={{ color: '#bfa14a', textAlign: 'left' }}>
              <th>User</th>
              <th>Action</th>
              <th>Model</th>
              <th>Object ID</th>
              <th>Details</th>
              <th>Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={6} style={{ textAlign: 'center', color: '#aaa' }}>No logs found</td></tr>
            ) : filtered.map((l, i) => (
              <tr key={l.id || i}>
                <td>{l.user}</td>
                <td>{l.action}</td>
                <td>{l.model}</td>
                <td>{l.object_id}</td>
                <td>{l.details}</td>
                <td>{l.timestamp && l.timestamp.replace('T', ' ').slice(0, 19)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AuditLog; 