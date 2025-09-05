import React from 'react';
import './DashboardCard.css';

const DashboardCard = ({ title, value }) => (
  <div className="dashboard-card">
    <div className="dashboard-card-title">{title}</div>
    <div className="dashboard-card-value">{value}</div>
  </div>
);

export default DashboardCard; 