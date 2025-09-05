const API_BASE = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL + '/api/' : 'https://web-production-3b1a6.up.railway.app/api/';

export async function fetchMetrics(token) {
  const [productsRes, salesRes] = await Promise.all([
    fetch(API_BASE + 'products/', { headers: { Authorization: 'Bearer ' + token } }),
    fetch(API_BASE + 'sales/', { headers: { Authorization: 'Bearer ' + token } })
  ]);
  const products = await productsRes.json();
  const sales = await salesRes.json();
  return { products, sales };
}

export async function getProducts(token) {
  const res = await fetch(API_BASE + 'products/', { headers: { Authorization: 'Bearer ' + token } });
  return res.json();
}

export async function getCategories(token) {
  const res = await fetch(API_BASE + 'categories/', { headers: { Authorization: 'Bearer ' + token } });
  return res.json();
}

export async function addProduct(product, token) {
  const formData = new FormData();
  formData.append('name', product.name);
  formData.append('buying_price', product.buying_price);
  formData.append('selling_price', product.selling_price);
  formData.append('stock_qty', product.stock_qty);
  formData.append('is_bulk_product', product.is_bulk_product ? 'true' : 'false');
  formData.append('units_per_box', product.units_per_box);
  if (product.image) {
    formData.append('image', product.image);
  }
  const res = await fetch(API_BASE + 'products/', {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + token },
    body: formData,
  });
  return res.json();
}

export async function updateProduct(id, product, token) {
  const formData = new FormData();
  formData.append('name', product.name);
  formData.append('buying_price', product.buying_price);
  formData.append('selling_price', product.selling_price);
  formData.append('stock_qty', product.stock_qty);
  formData.append('is_bulk_product', product.is_bulk_product ? 'true' : 'false');
  formData.append('units_per_box', product.units_per_box);
  if (product.image) {
    formData.append('image', product.image);
  }
  // Add flag to indicate image removal
  if (product.removeImage) {
    formData.append('remove_image', 'true');
  }
  const res = await fetch(API_BASE + 'products/' + id + '/', {
    method: 'PUT',
    headers: { Authorization: 'Bearer ' + token },
    body: formData,
  });
  return res.json();
}

export async function deleteProduct(id, token) {
  const res = await fetch(API_BASE + 'products/' + id + '/', {
    method: 'DELETE',
    headers: { Authorization: 'Bearer ' + token },
  });
  return res;
}

export async function getSales(token) {
  const res = await fetch(API_BASE + 'sales/', { headers: { Authorization: 'Bearer ' + token } });
  return res.json();
}

export async function addSale(sale, token) {
  const payload = {
    product: sale.product,
    quantity: sale.quantity,
    price: sale.price,
    discount: sale.discount || 0,
    payment_type: sale.payment_type,
  };
  const res = await fetch(API_BASE + 'sales/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
    body: JSON.stringify(payload),
  });
  return res.json();
}

export async function updateSale(id, sale, token) {
  const payload = {
    product: sale.product,
    quantity: sale.quantity,
    price: sale.price,
    discount: sale.discount || 0,
    payment_type: sale.payment_type,
  };
  const res = await fetch(API_BASE + 'sales/' + id + '/', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
    body: JSON.stringify(payload),
  });
  return res.json();
}

export async function deleteSale(id, token) {
  const res = await fetch(API_BASE + 'sales/' + id + '/', {
    method: 'DELETE',
    headers: { Authorization: 'Bearer ' + token },
  });
  return res;
}

export async function getExpenses(token) {
  const res = await fetch(API_BASE + 'expenses/', { headers: { Authorization: 'Bearer ' + token } });
  return res.json();
}

export async function addExpense(expense, token) {
  const res = await fetch(API_BASE + 'expenses/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
    body: JSON.stringify(expense),
  });
  return res.json();
}

export async function updateExpense(id, expense, token) {
  const res = await fetch(API_BASE + 'expenses/' + id + '/', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
    body: JSON.stringify(expense),
  });
  return res.json();
}

export async function deleteExpense(id, token) {
  const res = await fetch(API_BASE + 'expenses/' + id + '/', {
    method: 'DELETE',
    headers: { Authorization: 'Bearer ' + token },
  });
  return res;
}

export async function getAuditLogs(token) {
  const res = await fetch(API_BASE + 'audit-logs/', { headers: { Authorization: 'Bearer ' + token } });
  return res.json();
}

export async function getLowStockProducts(token) {
  const res = await fetch(API_BASE + 'low-stock/', { headers: { Authorization: 'Bearer ' + token } });
  return res.json();
}

export async function validateStock(productId, quantity, token) {
  const res = await fetch(API_BASE + 'stock-validation/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
    body: JSON.stringify({ product_id: productId, quantity: quantity }),
  });
  return res.json();
}

export async function login(username, password) {
  const res = await fetch(API_BASE + 'token/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) {
    throw new Error('Login failed');
  }
  const data = await res.json();
  return data;
}

export async function fetchUserInfo(token) {
  const res = await fetch(API_BASE + 'user-info/', {
    headers: { Authorization: 'Bearer ' + token },
  });
  if (!res.ok) {
    throw new Error('Failed to fetch user info');
  }
  return res.json();
}

export async function restockProduct(productId, token, quantity = 10) {
  const res = await fetch(`${API_BASE}products/${productId}/restock/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + token,
    },
    body: JSON.stringify({ quantity }),
  });
  return res.json();
}

export async function getReportsData(token, fromDate = '', toDate = '') {
  let url = API_BASE + 'reports/data/';
  const params = new URLSearchParams();
  if (fromDate) params.append('from', fromDate);
  if (toDate) params.append('to', toDate);
  if (params.toString()) url += '?' + params.toString();
  
  const res = await fetch(url, { 
    headers: { Authorization: 'Bearer ' + token } 
  });
  return res.json();
}

export async function getBusinessSettings(token) {
  const res = await fetch(API_BASE + 'business-settings/', {
    headers: { Authorization: 'Bearer ' + token }
  });
  if (!res.ok) {
    throw new Error('Failed to fetch business settings');
  }
  return res.json();
}

export async function updateBusinessSettings(token, settings) {
  const res = await fetch(API_BASE + 'business-settings/', {
    method: 'PUT',
    headers: { 
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + token 
    },
    body: JSON.stringify(settings)
  });
  if (!res.ok) {
    throw new Error('Failed to update business settings');
  }
  return res.json();
} 