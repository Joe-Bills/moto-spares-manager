import React from 'react';
import { NavLink } from 'react-router-dom';
import { FaChevronLeft, FaChevronRight, FaHome, FaBoxOpen, FaMoneyBillWave, FaFileAlt, FaCog, FaClipboardList, FaChartBar, FaMoneyCheckAlt } from 'react-icons/fa';
import './Sidebar.css';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: <FaHome /> },
  { to: '/products', label: 'Products', icon: <FaBoxOpen /> },
  { to: '/sales', label: 'Sales', icon: <FaMoneyBillWave /> },
  { to: '/expenses', label: 'Expenses', icon: <FaMoneyCheckAlt /> },
  { to: '/reports', label: 'Reports', icon: <FaChartBar /> },
];

const adminItems = [
  { to: '/settings', label: 'Settings', icon: <FaCog /> },
  { to: '/audit-log', label: 'Audit Log', icon: <FaClipboardList /> },
];

const Sidebar = ({ user, isAdmin, collapsed, onToggleSidebar }) => {
  return (
    <div className={`sidebar${collapsed ? ' sidebar-collapsed' : ''}`}> 
      <button
        className="sidebar-toggle-fab"
        onClick={onToggleSidebar}
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        type="button"
      >
        {collapsed ? <FaChevronRight /> : <FaChevronLeft />}
        <span className="visually-hidden">{collapsed ? 'Expand sidebar' : 'Collapse sidebar'}</span>
      </button>
      <nav>
        {navItems.map(item => (
          <NavLink key={item.to} to={item.to} activeclassname="active">
            <span className="sidebar-icon">{item.icon}</span>
            {!collapsed && <span className="sidebar-label">{item.label}</span>}
          </NavLink>
        ))}
        {isAdmin && adminItems.map(item => (
          <NavLink key={item.to} to={item.to} activeclassname="active">
            <span className="sidebar-icon">{item.icon}</span>
            {!collapsed && <span className="sidebar-label">{item.label}</span>}
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar; 