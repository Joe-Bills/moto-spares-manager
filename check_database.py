#!/usr/bin/env python
import requests
import json

# Backend URL
BACKEND_URL = "https://web-production-3b1a6.up.railway.app"

# Login to get token
login_data = {
    "username": "admin",
    "password": "admin123"
}

print("🔍 CHECKING YOUR DATABASE")
print("=" * 50)

# Get token
login_response = requests.post(f"{BACKEND_URL}/api/token/", json=login_data)
if login_response.status_code != 200:
    print(f"❌ Login failed: {login_response.text}")
    exit(1)

token = login_response.json()['access']
headers = {'Authorization': f'Bearer {token}'}

print("✅ Successfully logged in!")

# Check Products
print("\n📦 PRODUCTS:")
products_response = requests.get(f"{BACKEND_URL}/api/products/", headers=headers)
if products_response.status_code == 200:
    products = products_response.json()
    print(f"   Total Products: {len(products)}")
    
    # Show first 10 products
    print("   Sample Products:")
    for i, product in enumerate(products[:10]):
        print(f"   {i+1:2d}. {product['name']:<30} | Stock: {product['stock_qty']:3d} | Price: {product['selling_price']}")
    
    if len(products) > 10:
        print(f"   ... and {len(products) - 10} more products")
else:
    print(f"   ❌ Error: {products_response.status_code}")

# Check Sales
print("\n💰 SALES:")
sales_response = requests.get(f"{BACKEND_URL}/api/sales/", headers=headers)
if sales_response.status_code == 200:
    sales = sales_response.json()
    print(f"   Total Sales: {len(sales)}")
    
    if sales:
        print("   Recent Sales:")
        for i, sale in enumerate(sales):
            print(f"   {i+1}. {sale['quantity']} units at {sale['price']} ({sale['payment_type']})")
else:
    print(f"   ❌ Error: {sales_response.status_code}")

# Check Categories
print("\n📂 CATEGORIES:")
categories_response = requests.get(f"{BACKEND_URL}/api/categories/", headers=headers)
if categories_response.status_code == 200:
    categories = categories_response.json()
    print(f"   Total Categories: {len(categories)}")
    
    if categories:
        for i, category in enumerate(categories):
            print(f"   {i+1}. {category['name']}")
    else:
        print("   No categories found")
else:
    print(f"   ❌ Error: {categories_response.status_code}")

# Check Expenses
print("\n💸 EXPENSES:")
expenses_response = requests.get(f"{BACKEND_URL}/api/expenses/", headers=headers)
if expenses_response.status_code == 200:
    expenses = expenses_response.json()
    print(f"   Total Expenses: {len(expenses)}")
    
    if expenses:
        for i, expense in enumerate(expenses):
            print(f"   {i+1}. {expense['description']} - {expense['amount']}")
    else:
        print("   No expenses found")
else:
    print(f"   ❌ Error: {expenses_response.status_code}")

# Check Business Settings
print("\n⚙️  BUSINESS SETTINGS:")
settings_response = requests.get(f"{BACKEND_URL}/api/business-settings/", headers=headers)
if settings_response.status_code == 200:
    settings = settings_response.json()
    print(f"   Business Name: {settings['business_name']}")
    print(f"   Currency: {settings['currency']}")
    print(f"   Created: {settings['created_at']}")
    print(f"   Updated: {settings['updated_at']}")
else:
    print(f"   ❌ Error: {settings_response.status_code}")

# Summary
print("\n📊 DATABASE SUMMARY:")
print("=" * 50)
print(f"✅ Products: {len(products) if 'products' in locals() else 0}")
print(f"✅ Sales: {len(sales) if 'sales' in locals() else 0}")
print(f"✅ Categories: {len(categories) if 'categories' in locals() else 0}")
print(f"✅ Expenses: {len(expenses) if 'expenses' in locals() else 0}")
print(f"✅ Business Settings: {'Yes' if 'settings' in locals() else 'No'}")

print("\n🎉 Database check complete!")
print("\n💡 TIP: You can also check your data at:")
print("   Django Admin: https://web-production-3b1a6.up.railway.app/admin/")
print("   Frontend App: https://web-production-22b33.up.railway.app/")
