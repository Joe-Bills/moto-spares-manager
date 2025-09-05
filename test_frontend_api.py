#!/usr/bin/env python
import requests
import json

# Test the frontend API calls
BACKEND_URL = "https://web-production-3b1a6.up.railway.app"

# Login to get token
login_data = {
    "username": "admin",
    "password": "admin123"
}

print("Testing frontend API calls...")
print("=" * 50)

# Get token
login_response = requests.post(f"{BACKEND_URL}/api/token/", json=login_data)
if login_response.status_code != 200:
    print(f"❌ Login failed: {login_response.text}")
    exit(1)

token = login_response.json()['access']
headers = {'Authorization': f'Bearer {token}'}

print(f"✅ Login successful, token: {token[:20]}...")

# Test products API
print("\n1. Testing Products API...")
products_response = requests.get(f"{BACKEND_URL}/api/products/", headers=headers)
if products_response.status_code == 200:
    products = products_response.json()
    print(f"✅ Products API working: {len(products)} products found")
    if products:
        print(f"   Sample: {products[0]['name']} - Stock: {products[0]['stock_qty']}")
else:
    print(f"❌ Products API failed: {products_response.status_code} - {products_response.text}")

# Test sales API
print("\n2. Testing Sales API...")
sales_response = requests.get(f"{BACKEND_URL}/api/sales/", headers=headers)
if sales_response.status_code == 200:
    sales = sales_response.json()
    print(f"✅ Sales API working: {len(sales)} sales found")
    if sales:
        print(f"   Sample: {sales[0]['quantity']} units at {sales[0]['price']}")
else:
    print(f"❌ Sales API failed: {sales_response.status_code} - {sales_response.text}")

# Test categories API
print("\n3. Testing Categories API...")
categories_response = requests.get(f"{BACKEND_URL}/api/categories/", headers=headers)
if categories_response.status_code == 200:
    categories = categories_response.json()
    print(f"✅ Categories API working: {len(categories)} categories found")
else:
    print(f"❌ Categories API failed: {categories_response.status_code} - {categories_response.text}")

# Test business settings API
print("\n4. Testing Business Settings API...")
settings_response = requests.get(f"{BACKEND_URL}/api/business-settings/", headers=headers)
if settings_response.status_code == 200:
    settings = settings_response.json()
    print(f"✅ Business Settings API working: {settings['business_name']} - {settings['currency']}")
else:
    print(f"❌ Business Settings API failed: {settings_response.status_code} - {settings_response.text}")

# Test CORS
print("\n5. Testing CORS...")
cors_response = requests.options(f"{BACKEND_URL}/api/products/", headers={
    'Origin': 'https://web-production-22b33.up.railway.app',
    'Access-Control-Request-Method': 'GET',
    'Access-Control-Request-Headers': 'Authorization'
})
print(f"CORS preflight response: {cors_response.status_code}")
if cors_response.status_code in [200, 204]:
    print("✅ CORS appears to be working")
else:
    print("❌ CORS might be an issue")

print("\n" + "=" * 50)
print("API Test Complete!")
print("If all tests pass, the issue might be in the frontend code.")
print("Check browser console for JavaScript errors.")
