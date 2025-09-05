import React from 'react';
import { Line } from 'react-chartjs-2';
import { Chart, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import styles from './SalesGrowthChart.module.css';
Chart.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const theme = {
  gold: '#bfa14a',
  dark: '#232b3e',
  light: '#fff',
  grid: '#e5e5e5',
};

function getGrowth(data) {
  if (!data || data.length < 2) return 0;
  const first = data[0].total;
  const last = data[data.length - 1].total;
  if (first === 0) return 0;
  return (((last - first) / first) * 100).toFixed(1);
}

const SalesGrowthChart = ({ data }) => {
  const totalSales = data.reduce((sum, d) => sum + d.total, 0);
  const growth = getGrowth(data);
  const chartData = {
    labels: data.map(d => d.date),
    datasets: [
      {
        label: 'Sales (TZS)',
        data: data.map(d => d.total),
        borderColor: theme.gold,
        backgroundColor: ctx => {
          const chart = ctx.chart;
          const {ctx: canvas, chartArea} = chart;
          if (!chartArea) return 'rgba(191,161,74,0.13)';
          const gradient = canvas.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
          gradient.addColorStop(0, 'rgba(191,161,74,0.35)');
          gradient.addColorStop(1, 'rgba(191,161,74,0.02)');
          return gradient;
        },
        pointBackgroundColor: theme.gold,
        pointBorderColor: theme.light,
        pointRadius: 5,
        pointHoverRadius: 8,
        borderWidth: 3,
        tension: 0.4,
        fill: true,
        cubicInterpolationMode: 'monotone',
      },
    ],
  };
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 1200,
      easing: 'easeInOutQuart',
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: theme.dark,
        titleColor: theme.gold,
        bodyColor: theme.light,
        borderColor: theme.gold,
        borderWidth: 1,
        padding: 14,
        displayColors: false,
        callbacks: {
          title: ctx => ctx[0].label,
          label: ctx => `Sales: TZS ${ctx.parsed.y.toLocaleString()}`,
        },
      },
      title: { display: false },
    },
    layout: { padding: { left: 0, right: 0, top: 0, bottom: 0 } },
    scales: {
      x: {
        grid: { display: false },
        ticks: {
          color: theme.dark,
          font: { size: 13, family: 'Segoe UI, Roboto, Arial, sans-serif' },
          maxRotation: 0,
          autoSkip: true,
        },
      },
      y: {
        grid: { color: theme.grid },
        ticks: {
          color: theme.dark,
          font: { size: 13, family: 'Segoe UI, Roboto, Arial, sans-serif' },
          callback: value => `TZS ${value.toLocaleString()}`,
        },
      },
    },
    elements: {
      line: { borderCapStyle: 'round' },
      point: { pointStyle: 'circle', hoverBorderWidth: 3 },
    },
  };
  return (
    <section className={styles.card} aria-label="Sales Growth Chart">
      <header className={styles.header}>
        <div className={styles.title}>Sales Growth <span className={styles.subtitle}>(Last 14 Days)</span></div>
      </header>
      <div className={styles.chartArea}>
        <Line data={chartData} options={options} />
      </div>
      <footer className={styles.summary}>
        <div>Total Sales: <span className={styles.value}>TZS {totalSales.toLocaleString()}</span></div>
        <div>Growth: <span className={growth >= 0 ? styles.positive : styles.negative}>{growth}%</span></div>
      </footer>
    </section>
  );
};

export default SalesGrowthChart; 