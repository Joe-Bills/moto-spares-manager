import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const PasswordResetRequest = () => {
  const [email, setEmail] = useState('');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/users/reset_password/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error('Failed to send reset email');
      setSuccess(true);
    } catch (err) {
      setError('Failed to send reset email. Try again.');
    }
    setLoading(false);
  };

  if (success) return <div className="auth-container"><div className="auth-card" style={{ color: '#2a9d8f', textAlign: 'center' }}>Password reset email sent! Check your inbox.</div></div>;

  return (
    <div className="auth-container">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h2>Reset Password</h2>
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" required autoFocus />
        {error && <div style={{ color: 'red', marginBottom: 12 }}>{error}</div>}
        <button type="submit" disabled={loading}>
          {loading ? 'Sending...' : 'Send Reset Email'}
        </button>
        <div className="auth-links">
          <Link to="/login">Login</Link>
          <Link to="/register">Register</Link>
        </div>
      </form>
    </div>
  );
};

export default PasswordResetRequest; 