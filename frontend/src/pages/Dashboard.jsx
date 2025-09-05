import React, { useEffect, useState } from 'react';
import DashboardCard from '../components/DashboardCard';
import { fetchMetrics, getLowStockProducts } from '../api';
import SalesGrowthChart from '../components/SalesGrowthChart';
import CategoryPieChart from '../components/CategoryPieChart';
import RecentSalesTable from '../components/RecentSalesTable';
import LowStockTable from '../components/LowStockTable';
import { useAuth } from '../AuthContext';
import { FaMoneyBillWave, FaChartLine, FaTrophy, FaBoxOpen } from 'react-icons/fa';

const Dashboard = () => {
  const { token } = useAuth();
  const [metrics, setMetrics] = useState([
    { title: 'Daily Sales', value: 'TZS 0' },
    { title: 'Monthly Revenue', value: 'TZS 0' },
    { title: 'Best Selling Product', value: 'N/A' },
  ]);
  const [salesGrowth, setSalesGrowth] = useState([]);
  const [categorySales, setCategorySales] = useState([]);
  const [products, setProducts] = useState([]);
  const [sales, setSales] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);

  const refreshLowStock = () => {
    if (!token) return;
    getLowStockProducts(token).then(data => {
      // Flatten all alert levels into a single array
      const all = [
        ...(data.out_of_stock || []),
        ...(data.critical || []),
        ...(data.low || []),
        ...(data.medium || []),
      ];
      setLowStockProducts(all);
    });
  };

  useEffect(() => {
    if (!token) return;
    
    fetchMetrics(token)
      .then(({ products, sales }) => {
        console.log('Dashboard: Fetched data successfully', { productsCount: products.length, salesCount: sales.length });
        setProducts(products);
        setSales(sales);
        // Calculate total products in stock
        const totalStock = products.reduce((sum, p) => sum + (p.stock_qty || 0), 0);
        // Calculate daily sales (today)
        const today = new Date().toISOString().slice(0, 10);
        const dailySales = sales.filter(s => s.date && s.date.slice(0, 10) === today);
        // Calculate monthly revenue
        const month = today.slice(0, 7);
        const monthlySales = sales.filter(s => s.date && s.date.slice(0, 7) === month);
        const monthlyRevenue = monthlySales.reduce((sum, s) => sum + (s.price * s.quantity - s.discount), 0);
        // Best selling product (by quantity sold)
        const productSales = {};
        sales.forEach(sale => {
          if (!productSales[sale.product]) productSales[sale.product] = 0;
          productSales[sale.product] += sale.quantity;
        });
        let bestProduct = 'N/A';
        let bestQty = 0;
        for (const pid in productSales) {
          if (productSales[pid] > bestQty) {
            bestQty = productSales[pid];
            const prod = products.find(p => p.id === Number(pid));
            bestProduct = prod ? prod.name : pid;
          }
        }
        setMetrics([
          { title: 'Daily Sales', value: `TZS ${dailySales.reduce((sum, s) => sum + (s.price * s.quantity - s.discount), 0)}` },
          { title: 'Monthly Revenue', value: `TZS ${monthlyRevenue}` },
          { title: 'Best Selling Product', value: bestProduct },
        ]);

        // Prepare sales growth data (last 14 days)
        const salesByDay = {};
        for (let i = 13; i >= 0; i--) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          const key = d.toISOString().slice(0, 10);
          salesByDay[key] = 0;
        }
        sales.forEach(s => {
        const day = s.date && s.date.slice(0, 10);
        if (salesByDay[day] !== undefined) {
          salesByDay[day] += (s.price * s.quantity - s.discount);
        }
      });
      setSalesGrowth(Object.entries(salesByDay).map(([date, total]) => ({ date, total })));

      // Prepare payment type sales data (this month)
      const paymentTypeSales = { 'Cash': 0, 'Mobile Money': 0, 'Bank': 0 };
      monthlySales.forEach(sale => {
        let label = 'Other';
        if (sale.payment_type === 'cash') label = 'Cash';
        else if (sale.payment_type === 'mobile') label = 'Mobile Money';
        else if (sale.payment_type === 'bank') label = 'Bank';
        paymentTypeSales[label] = (paymentTypeSales[label] || 0) + sale.quantity;
      });
      setCategorySales(Object.entries(paymentTypeSales).map(([category, total]) => ({ category, total })));
      })
      .catch(error => {
        console.error('Dashboard: Error fetching data:', error);
        // Set empty data on error
        setProducts([]);
        setSales([]);
        setMetrics([
          { title: 'Daily Sales', value: 'Error loading' },
          { title: 'Monthly Revenue', value: 'Error loading' },
          { title: 'Best Selling Product', value: 'Error loading' },
        ]);
      });
    refreshLowStock();
  }, [token]);

  return (
    <div style={{ width: '100%' }}>
      <h2>Dashboard</h2>
      <div style={{ display: 'flex', gap: '12px', marginBottom: '32px', flexWrap: 'wrap' }}>
        {metrics.map((m, i) => (
          <DashboardCard key={i} title={m.title} value={m.value} />
        ))}
      </div>
      <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap' }}>
        <SalesGrowthChart data={salesGrowth} />
        <div style={{ flex: 1, minWidth: 220, background: '#fff', borderRadius: 12, padding: 24, marginBottom: 32 }}>
          <strong>Sales by Payment Type</strong>
          <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#bfa14a' }}>
            <CategoryPieChart data={categorySales} />
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap' }}>
        <div style={{ flex: 2, minWidth: 320, background: '#fff', borderRadius: 12, padding: 24 }}>
          <strong>Recent Sales</strong>
          <RecentSalesTable sales={sales} products={products} />
        </div>
        <div style={{ flex: 1, minWidth: 220, background: '#fff', borderRadius: 12, padding: 24 }}>
          <strong>Low Stock Products</strong>
          <LowStockTable products={lowStockProducts} onRestock={refreshLowStock} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 