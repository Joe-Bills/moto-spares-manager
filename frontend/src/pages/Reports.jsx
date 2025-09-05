import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { getReportsData } from '../api';
import { Bar, Line, Pie, Doughnut } from 'react-chartjs-2';
import { Chart, CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler } from 'chart.js';

Chart.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler);

const tabs = [
  { key: 'sales', label: 'Sales Report' },
  { key: 'profit', label: 'Profit & Loss Report' },
  { key: 'stock', label: 'Stock Report' },
];

const Reports = () => {
  const { user, token } = useAuth();
  const isAdmin = user?.is_superuser || (user?.groups || []).includes('Admin');
  const [tab, setTab] = useState('sales');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [loading, setLoading] = useState(true);
  const [reportsData, setReportsData] = useState(null);

  useEffect(() => {
    if (token) {
      loadReportsData();
    }
  }, [token, from, to]);

  const loadReportsData = async () => {
    setLoading(true);
    try {
      const data = await getReportsData(token, from, to);
      setReportsData(data);
    } catch (error) {
      console.error('Error loading reports data:', error);
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = async (type) => {
    try {
      // Build URL with date parameters
      let url = type === 'pdf' ? '/api/reports/sales/pdf/' : '/api/reports/sales/excel/';
      const params = new URLSearchParams();
      if (from) params.append('from', from);
      if (to) params.append('to', to);
      if (params.toString()) {
        url += '?' + params.toString();
      }
      
      const res = await fetch(url, {
        headers: { Authorization: 'Bearer ' + token },
      });
      
      if (!res.ok) {
        throw new Error(`Download failed: ${res.status}`);
      }
      
      const blob = await res.blob();
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = type === 'pdf' ? 'sales_report.pdf' : 'sales_report.xlsx';
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Download error:', error);
      alert('Download failed. Please try again.');
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', color: '#bfa14a' }}>
        Loading reports...
      </div>
    );
  }

  if (!reportsData) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', color: '#e76f51' }}>
        Failed to load reports data. Please try again.
      </div>
    );
  }

  // Chart configurations
  const monthlyRevenueChart = {
    labels: Object.keys(reportsData.monthly_revenue || {}).sort(),
    datasets: [{
      label: 'Monthly Revenue (TZS)',
      data: Object.keys(reportsData.monthly_revenue || {}).sort().map(month => reportsData.monthly_revenue[month]),
      backgroundColor: '#bfa14a',
      borderColor: '#bfa14a',
      borderWidth: 2,
      borderRadius: 4,
    }]
  };

  const topProductsChart = {
    labels: Object.keys(reportsData.top_products || {}),
    datasets: [{
      label: 'Quantity Sold',
      data: Object.values(reportsData.top_products || {}),
      backgroundColor: [
        '#bfa14a', '#2a9d8f', '#e76f51', '#f7931e', '#1976d2',
        '#6c757d', '#28a745', '#dc3545', '#ffc107', '#17a2b8'
      ],
    }]
  };

  const paymentTypeChart = {
    labels: Object.keys(reportsData.payment_methods || {}).map(type => 
      type === 'cash' ? 'Cash' : 
      type === 'mobile' ? 'Mobile Money' : 
      type === 'bank' ? 'Bank' : type
    ),
    datasets: [{
      data: Object.values(reportsData.payment_methods || {}),
      backgroundColor: ['#bfa14a', '#2a9d8f', '#e76f51'],
      borderWidth: 2,
      borderColor: '#fff',
    }]
  };

  const stockAnalysisChart = {
    labels: ['In Stock', 'Out of Stock', 'Low Stock'],
    datasets: [{
      data: [
        (reportsData.stock_analysis?.total_products || 0) - (reportsData.stock_analysis?.out_of_stock || 0) - (reportsData.stock_analysis?.low_stock || 0),
        reportsData.stock_analysis?.out_of_stock || 0,
        reportsData.stock_analysis?.low_stock || 0
      ],
      backgroundColor: ['#2a9d8f', '#e76f51', '#f7931e'],
      borderWidth: 2,
      borderColor: '#fff',
    }]
  };

  const profitAnalysisChart = {
    labels: ['Revenue', 'COGS', 'Expenses', 'Profit'],
    datasets: [{
      label: 'Amount (TZS)',
      data: [
        reportsData.profit_analysis?.total_revenue || 0,
        (reportsData.profit_analysis?.total_cost - reportsData.profit_analysis?.total_expenses) || 0,
        reportsData.profit_analysis?.total_expenses || 0,
        reportsData.profit_analysis?.total_profit || 0
      ],
      backgroundColor: ['#2a9d8f', '#f7931e', '#e76f51', '#bfa14a'],
      borderColor: ['#2a9d8f', '#f7931e', '#e76f51', '#bfa14a'],
      borderWidth: 2,
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: { color: '#232b3e', font: { size: 12 } }
      },
      tooltip: {
        backgroundColor: '#232b3e',
        titleColor: '#bfa14a',
        bodyColor: '#fff',
        borderColor: '#bfa14a',
        borderWidth: 1,
      }
    }
  };

  const barChartOptions = {
    ...chartOptions,
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          color: '#232b3e',
          callback: value => `TZS ${value.toLocaleString()}`
        }
      },
      x: {
        ticks: { color: '#232b3e' }
      }
    }
  };

  return (
    <div>
      <h2>Reports</h2>
      <div style={{ display: 'flex', gap: 18, marginBottom: 18 }}>
        <label style={{ fontSize: '1.08rem' }}>
          From: 
          <input 
            type="date" 
            value={from} 
            onChange={e => setFrom(e.target.value)} 
            style={{ 
              padding: '12px 14px', 
              borderRadius: 8, 
              border: '1.5px solid #ccc', 
              background: '#f7f7fa', 
              color: '#232b3e', 
              fontSize: '1.08rem', 
              minWidth: 160, 
              outline: 'none', 
              transition: 'border 0.2s',
              marginLeft: 8
            }} 
          />
        </label>
        <label style={{ fontSize: '1.08rem' }}>
          To: 
          <input 
            type="date" 
            value={to} 
            onChange={e => setTo(e.target.value)} 
            style={{ 
              padding: '12px 14px', 
              borderRadius: 8, 
              border: '1.5px solid #ccc', 
              background: '#f7f7fa', 
              color: '#232b3e', 
              fontSize: '1.08rem', 
              minWidth: 160, 
              outline: 'none', 
              transition: 'border 0.2s',
              marginLeft: 8
            }} 
          />
        </label>
      </div>
      
      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{
              background: tab === t.key ? '#bfa14a' : '#eee',
              color: tab === t.key ? '#fff' : '#232b3e',
              border: 'none',
              borderRadius: 4,
              padding: '8px 18px',
              fontWeight: 'bold',
              cursor: 'pointer',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'sales' && (
        <div>
          <div style={{ marginBottom: 16 }}>
            {isAdmin && (
              <>
                <button 
                  onClick={() => downloadReport('pdf')} 
                  style={{ 
                    background: '#232b3e', 
                    color: '#fff', 
                    border: 'none', 
                    borderRadius: 4, 
                    padding: '8px 18px', 
                    marginRight: 8,
                    cursor: 'pointer'
                  }}
                >
                  Download PDF
                </button>
                <button 
                  onClick={() => downloadReport('excel')} 
                  style={{ 
                    background: '#bfa14a', 
                    color: '#fff', 
                    border: 'none', 
                    borderRadius: 4, 
                    padding: '8px 18px',
                    cursor: 'pointer'
                  }}
                >
                  Download Excel
                </button>
              </>
            )}
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px' }}>
            <div style={{ background: '#fff', borderRadius: 12, padding: 24 }}>
              <h3 style={{ marginBottom: 16, color: '#232b3e' }}>Monthly Revenue</h3>
              <div style={{ height: 300 }}>
                <Bar data={monthlyRevenueChart} options={barChartOptions} />
              </div>
            </div>
            
            <div style={{ background: '#fff', borderRadius: 12, padding: 24 }}>
              <h3 style={{ marginBottom: 16, color: '#232b3e' }}>Payment Methods</h3>
              <div style={{ height: 300 }}>
                <Doughnut data={paymentTypeChart} options={chartOptions} />
              </div>
            </div>
          </div>
          
          <div style={{ background: '#fff', borderRadius: 12, padding: 24 }}>
            <h3 style={{ marginBottom: 16, color: '#232b3e' }}>Top Products Sold</h3>
            <div style={{ height: 400 }}>
              <Bar 
                data={topProductsChart} 
                options={{
                  ...barChartOptions,
                  indexAxis: 'y',
                  scales: {
                    x: {
                      beginAtZero: true,
                      ticks: { color: '#232b3e' }
                    },
                    y: {
                      ticks: { color: '#232b3e' }
                    }
                  }
                }} 
              />
            </div>
          </div>
        </div>
      )}

      {tab === 'profit' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px' }}>
            <div style={{ background: '#fff', borderRadius: 12, padding: 24 }}>
              <h3 style={{ marginBottom: 16, color: '#232b3e' }}>Revenue vs Cost vs Profit</h3>
              <div style={{ height: 300 }}>
                <Bar data={profitAnalysisChart} options={barChartOptions} />
              </div>
            </div>
            
            <div style={{ background: '#fff', borderRadius: 12, padding: 24 }}>
              <h3 style={{ marginBottom: 16, color: '#232b3e' }}>Profit Analysis</h3>
              <div style={{ padding: '16px', background: '#f8f9fa', borderRadius: 8 }}>
                <div style={{ marginBottom: 12 }}>
                  <strong>Total Revenue:</strong> TZS {reportsData.profit_analysis?.total_revenue?.toLocaleString() || 0}
                </div>
                <div style={{ marginBottom: 12 }}>
                  <strong>Cost of Goods Sold:</strong> TZS {(reportsData.profit_analysis?.total_cost - reportsData.profit_analysis?.total_expenses)?.toLocaleString() || 0}
                </div>
                <div style={{ marginBottom: 12 }}>
                  <strong>Total Expenses:</strong> TZS {reportsData.profit_analysis?.total_expenses?.toLocaleString() || 0}
                </div>
                <div style={{ marginBottom: 12 }}>
                  <strong>Total Cost:</strong> TZS {reportsData.profit_analysis?.total_cost?.toLocaleString() || 0}
                </div>
                <div style={{ marginBottom: 12, paddingTop: 8, borderTop: '1px solid #dee2e6' }}>
                  <strong style={{ color: reportsData.profit_analysis?.total_profit >= 0 ? '#2a9d8f' : '#e76f51' }}>
                    Total Profit:
                  </strong> TZS {reportsData.profit_analysis?.total_profit?.toLocaleString() || 0}
                </div>
                <div>
                  <strong>Profit Margin:</strong> {reportsData.profit_analysis?.profit_margin?.toFixed(2) || 0}%
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === 'stock' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px' }}>
            <div style={{ background: '#fff', borderRadius: 12, padding: 24 }}>
              <h3 style={{ marginBottom: 16, color: '#232b3e' }}>Stock Status</h3>
              <div style={{ height: 300 }}>
                <Doughnut data={stockAnalysisChart} options={chartOptions} />
              </div>
            </div>
            
            <div style={{ background: '#fff', borderRadius: 12, padding: 24 }}>
              <h3 style={{ marginBottom: 16, color: '#232b3e' }}>Stock Summary</h3>
              <div style={{ padding: '16px', background: '#f8f9fa', borderRadius: 8 }}>
                <div style={{ marginBottom: 12 }}>
                  <strong>Total Products:</strong> {reportsData.stock_analysis?.total_products || 0}
                </div>
                <div style={{ marginBottom: 12 }}>
                  <strong>Out of Stock:</strong> {reportsData.stock_analysis?.out_of_stock || 0}
                </div>
                <div style={{ marginBottom: 12 }}>
                  <strong>Low Stock:</strong> {reportsData.stock_analysis?.low_stock || 0}
                </div>
                <div style={{ marginBottom: 12 }}>
                  <strong>Total Stock Value:</strong> TZS {reportsData.stock_analysis?.total_stock_value?.toLocaleString() || 0}
                </div>
                <div>
                  <strong>Total Stock Quantity:</strong> {reportsData.stock_analysis?.total_stock_quantity?.toLocaleString() || 0}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports; 