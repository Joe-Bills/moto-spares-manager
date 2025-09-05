import React, { useState, useEffect, useRef } from 'react';
import './Navbar.css';
import { getLowStockProducts } from '../api';
import { useAuth } from '../AuthContext';
import { useBusinessName } from '../AuthContext';
import { FaBell, FaExclamationTriangle, FaExclamationCircle, FaInfoCircle, FaCog, FaSignOutAlt } from 'react-icons/fa';

const Navbar = ({ onLogout, user, onToggleSidebar, sidebarCollapsed }) => {
  const { token } = useAuth();
  const { businessName } = useBusinessName();
  const [stockAlerts, setStockAlerts] = useState({
    out_of_stock: [],
    critical: [],
    low: [],
    medium: [],
    total_alerts: 0
  });
  const [showDropdown, setShowDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const userDropdownRef = useRef(null);
  const notificationDropdownRef = useRef(null);

  useEffect(() => {
    if (token) {
      getLowStockProducts(token).then(setStockAlerts).catch(() => setStockAlerts({
        out_of_stock: [],
        critical: [],
        low: [],
        medium: [],
        total_alerts: 0
      }));
    }
  }, [token]);

  // Click outside handler for user dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
        setShowUserDropdown(false);
      }
    };

    if (showUserDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUserDropdown]);

  // Click outside handler for notification dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationDropdownRef.current && !notificationDropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

  const getAlertIcon = (type) => {
    switch (type) {
      case 'out_of_stock':
        return <FaExclamationTriangle style={{ color: '#e76f51' }} />;
      case 'critical':
        return <FaExclamationCircle style={{ color: '#ff6b35' }} />;
      case 'low':
        return <FaExclamationCircle style={{ color: '#f7931e' }} />;
      case 'medium':
        return <FaInfoCircle style={{ color: '#f4a261' }} />;
      default:
        return <FaBell />;
    }
  };

  const getAlertColor = (type) => {
    switch (type) {
      case 'out_of_stock':
        return '#e76f51';
      case 'critical':
        return '#ff6b35';
      case 'low':
        return '#f7931e';
      case 'medium':
        return '#f4a261';
      default:
        return '#bfa14a';
    }
  };

  const getAlertText = (type) => {
    switch (type) {
      case 'out_of_stock':
        return 'Out of Stock';
      case 'critical':
        return 'Critical Stock';
      case 'low':
        return 'Low Stock';
      case 'medium':
        return 'Medium Stock';
      default:
        return 'Stock Alert';
    }
  };

  const totalAlerts = stockAlerts.out_of_stock.length + stockAlerts.critical.length + 
                     stockAlerts.low.length + stockAlerts.medium.length;

  const isAdmin = user?.is_superuser || (user?.groups || []).includes('Admin');

  return (
    <div className="navbar">
      <div className="navbar-left" style={{ display: 'flex', alignItems: 'center' }}>
        <span className="navbar-logo">{businessName}</span>
      </div>
      <div className="navbar-right" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div ref={notificationDropdownRef} className="navbar-bell-container" style={{ position: 'relative' }}>
          <span className="navbar-bell" onClick={() => setShowDropdown(s => !s)}>
            <FaBell />
          </span>
          {totalAlerts > 0 && (
            <span className="notification-badge" style={{ 
              position: 'absolute', 
              top: -10, 
              right: -12, 
              background: totalAlerts > 5 ? '#e76f51' : '#f7931e', 
              color: '#fff', 
              borderRadius: '50%', 
              padding: '2px 6px', 
              fontSize: 11, 
              fontWeight: 'bold',
              minWidth: '18px',
              height: '18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1001
            }}>
              {totalAlerts > 99 ? '99+' : totalAlerts}
            </span>
          )}
        </div>
        {showDropdown && totalAlerts > 0 && (
          <div style={{ 
            position: 'absolute', 
            right: 0, 
            top: 60, 
            background: '#fff', 
            color: '#232b3e', 
            borderRadius: 8, 
            boxShadow: '0 2px 8px rgba(0,0,0,0.12)', 
            minWidth: 280, 
            zIndex: 1002,
            maxHeight: 400,
            overflowY: 'auto'
          }}>
            <div style={{ 
              padding: '12px 16px', 
              borderBottom: '1px solid #eee', 
              fontWeight: 'bold', 
              color: '#bfa14a',
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}>
              <FaBell />
              Stock Alerts ({totalAlerts})
            </div>
            
            {/* Out of Stock */}
            {stockAlerts.out_of_stock.length > 0 && (
              <div>
                <div style={{ 
                  padding: '8px 16px', 
                  background: '#fff5f5', 
                  borderBottom: '1px solid #fee',
                  fontSize: 12,
                  fontWeight: 'bold',
                  color: '#e76f51',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6
                }}>
                  {getAlertIcon('out_of_stock')}
                  Out of Stock ({stockAlerts.out_of_stock.length})
                </div>
                {stockAlerts.out_of_stock.map(p => (
                  <div key={p.id} style={{ 
                    padding: '8px 16px', 
                    borderBottom: '1px solid #f2f2f2', 
                    fontSize: 14,
                    color: '#e76f51'
                  }}>
                    {p.name} <span style={{ fontWeight: 'bold' }}>(Qty: {p.stock_qty})</span>
                  </div>
                ))}
              </div>
            )}
            
            {/* Critical Stock */}
            {stockAlerts.critical.length > 0 && (
              <div>
                <div style={{ 
                  padding: '8px 16px', 
                  background: '#fff8f0', 
                  borderBottom: '1px solid #ffe',
                  fontSize: 12,
                  fontWeight: 'bold',
                  color: '#ff6b35',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6
                }}>
                  {getAlertIcon('critical')}
                  Critical Stock ({stockAlerts.critical.length})
                </div>
                {stockAlerts.critical.map(p => (
                  <div key={p.id} style={{ 
                    padding: '8px 16px', 
                    borderBottom: '1px solid #f2f2f2', 
                    fontSize: 14,
                    color: '#ff6b35'
                  }}>
                    {p.name} <span style={{ fontWeight: 'bold' }}>(Qty: {p.stock_qty})</span>
                  </div>
                ))}
              </div>
            )}
            
            {/* Low Stock */}
            {stockAlerts.low.length > 0 && (
              <div>
                <div style={{ 
                  padding: '8px 16px', 
                  background: '#fffbf0', 
                  borderBottom: '1px solid #ffe',
                  fontSize: 12,
                  fontWeight: 'bold',
                  color: '#f7931e',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6
                }}>
                  {getAlertIcon('low')}
                  Low Stock ({stockAlerts.low.length})
                </div>
                {stockAlerts.low.map(p => (
                  <div key={p.id} style={{ 
                    padding: '8px 16px', 
                    borderBottom: '1px solid #f2f2f2', 
                    fontSize: 14,
                    color: '#f7931e'
                  }}>
                    {p.name} <span style={{ fontWeight: 'bold' }}>(Qty: {p.stock_qty})</span>
                  </div>
                ))}
              </div>
            )}
            
            {/* Medium Stock */}
            {stockAlerts.medium.length > 0 && (
              <div>
                <div style={{ 
                  padding: '8px 16px', 
                  background: '#fffaf0', 
                  borderBottom: '1px solid #ffe',
                  fontSize: 12,
                  fontWeight: 'bold',
                  color: '#f4a261',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6
                }}>
                  {getAlertIcon('medium')}
                  Medium Stock ({stockAlerts.medium.length})
                </div>
                {stockAlerts.medium.map(p => (
                  <div key={p.id} style={{ 
                    padding: '8px 16px', 
                    borderBottom: '1px solid #f2f2f2', 
                    fontSize: 14,
                    color: '#f4a261'
                  }}>
                    {p.name} <span style={{ fontWeight: 'bold' }}>(Qty: {p.stock_qty})</span>
              </div>
            ))}
              </div>
            )}
            
            <div style={{ 
              padding: '12px 16px', 
              textAlign: 'center', 
              color: '#888', 
              fontSize: 13,
              borderTop: '1px solid #eee',
              background: '#f8f9fa'
            }}>
              Manage stock in Products page
            </div>
          </div>
        )}
        {user && (
          <div ref={userDropdownRef} style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <span 
              className="navbar-user" 
              onClick={() => setShowUserDropdown(s => !s)}
            >
              {user.username} ▾
            </span>
            {showUserDropdown && (
              <div className="user-dropdown">
                <div style={{ 
                  padding: '12px 16px', 
                  borderBottom: '1px solid #eee', 
                  fontWeight: 'bold', 
                  color: '#bfa14a',
                  fontSize: 14
                }}>
                  User Menu
                </div>
                
                {isAdmin && (
                  <a 
                    href="http://127.0.0.1:8000/admin/login/?next=/admin/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="user-dropdown-item"
                  >
                    <FaCog style={{ color: '#bfa14a' }} />
                    Django Admin
                  </a>
                )}
              </div>
            )}
            <button 
              onClick={onLogout} 
              style={{ 
                marginLeft: 16, 
                background: '#e76f51', 
                color: '#fff', 
                border: 'none', 
                borderRadius: 4, 
                padding: '4px 12px', 
                cursor: 'pointer' 
              }}
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Navbar; 