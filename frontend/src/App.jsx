import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Sales from './pages/Sales';
import Expenses from './pages/Expenses';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import Login from './pages/Login';
import Register from './pages/Register';
import PasswordResetRequest from './pages/PasswordResetRequest';
import PasswordResetConfirm from './pages/PasswordResetConfirm';
import AuditLog from './pages/AuditLog';
import { useAuth } from './AuthContext';
import './App.css';

function App() {
  const { user, login, logout, loading } = useAuth();
  const isAdmin = user?.is_superuser || (user?.groups || []).includes('Admin');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const toggleSidebar = () => setSidebarCollapsed((prev) => !prev);

  if (loading) return <div style={{ color: '#bfa14a', textAlign: 'center', marginTop: 80 }}>Loading...</div>;

  return (
    <Router>
      {!user ? (
        <Routes>
          <Route path="/login" element={<Login onLogin={login} />} />
          <Route path="/register" element={<Register />} />
          <Route path="/reset-password" element={<PasswordResetRequest />} />
          <Route path="/reset-password-confirm" element={<PasswordResetConfirm />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      ) : (
        <div className="app-layout">
          <Sidebar user={user} isAdmin={isAdmin} collapsed={sidebarCollapsed} onToggleSidebar={toggleSidebar} />
          <div className="main-content" style={{ marginLeft: sidebarCollapsed ? 60 : 220, width: sidebarCollapsed ? `calc(100vw - 60px)` : `calc(100vw - 220px)` }}>
            <Navbar onLogout={logout} user={user} />
            <div className="content-area">
              <Routes>
                <Route path="/" element={<Navigate to="/dashboard" />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/products" element={<Products />} />
                <Route path="/sales" element={<Sales />} />
                <Route path="/expenses" element={<Expenses />} />
                <Route path="/reports" element={<Reports />} />
                {isAdmin && <Route path="/settings" element={<Settings />} />}
                {isAdmin && <Route path="/audit-log" element={<AuditLog />} />}
                {!isAdmin && <Route path="/settings" element={<Navigate to="/dashboard" />} />}
                <Route path="*" element={<Navigate to="/dashboard" />} />
              </Routes>
            </div>
          </div>
        </div>
      )}
    </Router>
  );
}

export default App;
