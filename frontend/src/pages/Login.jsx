import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { login, fetchUserInfo } from '../api';
import { useBusinessName } from '../AuthContext';

const Login = ({ onLogin }) => {
  const { businessName } = useBusinessName();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { access } = await login(username, password);
      const user = await fetchUserInfo(access);
      onLogin(access, user);
    } catch (err) {
      setError('Invalid username or password');
    }
    setLoading(false);
  };

  return (
    <div className="auth-container">
      <div className="auth-logo-wrapper">
        <div className="auth-logo">{businessName}</div>
        <form className="auth-card" onSubmit={handleSubmit}>
          <h2>Login</h2>
          <input value={username} onChange={e => setUsername(e.target.value)} placeholder="Username" required autoFocus />
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" required />
          {error && <div style={{ color: 'red', marginBottom: 12 }}>{error}</div>}
          <button type="submit" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
          <div className="auth-links">
            <Link to="/register">Register</Link>
            <Link to="/reset-password">Forgot Password?</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login; 