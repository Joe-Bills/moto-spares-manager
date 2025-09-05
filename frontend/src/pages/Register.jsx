import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useBusinessName } from '../AuthContext';

const Register = () => {
  const { businessName } = useBusinessName();
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/users/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('Registration failed');
      navigate('/login');
    } catch (err) {
      setError('Registration failed. Try a different username/email.');
    }
    setLoading(false);
  };

  return (
    <div className="auth-container">
      <div className="auth-logo-wrapper">
        <div className="auth-logo">{businessName}</div>
        <form className="auth-card" onSubmit={handleSubmit}>
          <h2>Register</h2>
          <input name="username" value={form.username} onChange={handleChange} placeholder="Username" required autoFocus />
          <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="Email" required />
          <input name="password" type="password" value={form.password} onChange={handleChange} placeholder="Password" required />
          {error && <div style={{ color: 'red', marginBottom: 12 }}>{error}</div>}
          <button type="submit" disabled={loading}>
            {loading ? 'Registering...' : 'Register'}
          </button>
          <div className="auth-links">
            <Link to="/login">Login</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register; 