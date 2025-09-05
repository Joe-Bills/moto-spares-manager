import React from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart, ArcElement, Tooltip, Legend } from 'chart.js';
Chart.register(ArcElement, Tooltip, Legend);

const paymentTypeColors = {
  'Cash': '#bfa14a',         // gold
  'Mobile Money': '#2a9d8f', // green
  'Bank': '#1976d2',         // blue
  'Other': '#e76f51',        // fallback red
};

const CategoryPieChart = ({ data }) => {
  // data: array of { category, total }
  const chartData = {
    labels: data.map(d => d.category),
    datasets: [
      {
        data: data.map(d => d.total),
        backgroundColor: data.map(d => paymentTypeColors[d.category] || '#6c757d'),
      },
    ],
  };
  const options = {
    plugins: {
      legend: { position: 'bottom', labels: { color: '#232b3e' } },
    },
  };
  return <Pie data={chartData} options={options} height={220} />;
};

export default CategoryPieChart; 