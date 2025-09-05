import React from 'react';

const RecentSalesTable = ({ sales, products }) => {
  // Map sales directly into rows: [{product, quantity, price, date}]
  const rows = sales.slice(0, 5).map(sale => {
    const prod = products.find(p => p.id === sale.product);
    return {
      product: prod ? prod.name : sale.product,
      quantity: sale.quantity,
      price: sale.price,
      date: sale.date ? sale.date.slice(0, 16).replace('T', ' ') : '',
    };
  });
  return (
    <table style={{ width: '100%', fontSize: '0.98rem' }}>
      <thead>
        <tr style={{ color: '#bfa14a', textAlign: 'left' }}>
          <th>Product</th>
          <th>Quantity</th>
          <th>Price</th>
          <th>Date</th>
        </tr>
      </thead>
      <tbody>
        {rows.length === 0 ? (
          <tr><td colSpan={4} style={{ textAlign: 'center', color: '#aaa' }}>No sales yet</td></tr>
        ) : rows.map((row, i) => (
          <tr key={i}>
            <td>{row.product}</td>
            <td>{row.quantity}</td>
            <td>{row.price}</td>
            <td>{row.date}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default RecentSalesTable; 