import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Link } from 'react-router-dom';

const PasswordResetConfirm = () => {
  const [searchParams] = useSearchParams();
  const uid = searchParams.get('uid');
  const token = searchParams.get('token');
  const [newPassword, setNewPassword] = useState('');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/users/reset_password_confirm/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid, token, new_password: newPassword }),
      });
      if (!res.ok) throw new Error('Failed to reset password');
      setSuccess(true);
    } catch (err) {
      setError('Failed to reset password. Try again.');
    }
    setLoading(false);
  };

  if (success) return <div className="auth-container"><div className="auth-card" style={{ color: '#2a9d8f', textAlign: 'center' }}>Password reset successful! You can now log in.</div></div>;

  return (
    <div className="auth-container">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h2>Set New Password</h2>
        <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="New Password" required autoFocus />
        {error && <div style={{ color: 'red', marginBottom: 12 }}>{error}</div>}
        <button type="submit" disabled={loading}>
          {loading ? 'Resetting...' : 'Set Password'}
        </button>
        <div className="auth-links">
          <Link to="/login">Login</Link>
        </div>
      </form>
    </div>
  );
};

export default PasswordResetConfirm; 