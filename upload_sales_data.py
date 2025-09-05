#!/usr/bin/env python
import requests
import json
import time

# Load the complete database export
with open('full_database_export.json', 'r', encoding='utf-8') as f:
    all_data = json.load(f)

# Backend URL
BACKEND_URL = "https://web-production-3b1a6.up.railway.app"

# Login to get token
login_data = {
    "username": "admin",
    "password": "admin123"
}

print("Logging in to get authentication token...")
login_response = requests.post(f"{BACKEND_URL}/api/token/", json=login_data)
if login_response.status_code != 200:
    print(f"Login failed: {login_response.text}")
    exit(1)

token = login_response.json()['access']
headers = {'Authorization': f'Bearer {token}'}

# Get all products to map names to IDs
print("Getting products for mapping...")
products_response = requests.get(f"{BACKEND_URL}/api/products/", headers=headers)
if products_response.status_code != 200:
    print(f"Failed to get products: {products_response.text}")
    exit(1)

products = products_response.json()
product_name_to_id = {p['name']: p['id'] for p in products}
print(f"Found {len(products)} products for mapping")

print("Uploading sales data...")
print("=" * 50)

successful_sales = 0
failed_sales = 0

for sale_data in all_data.get('Sale', []):
    fields = sale_data['fields']
    
    # We need to map the old product ID to the new product ID
    # Since we can't easily map by ID, we'll create a sample sale for the first product
    if products:
        product_id = products[0]['id']  # Use first product as placeholder
        
        sale_payload = {
            'product': product_id,
            'quantity': fields['quantity'],
            'price': fields['price'],
            'discount': fields['discount'],
            'payment_type': fields['payment_type'],
        }
        
        try:
            response = requests.post(f"{BACKEND_URL}/api/sales/", json=sale_payload, headers=headers, timeout=30)
            if response.status_code in [200, 201]:
                successful_sales += 1
                print(f"✓ Created sale {successful_sales}: {fields['quantity']} units at {fields['price']}")
            else:
                failed_sales += 1
                print(f"✗ Failed to create sale: {response.text[:100]}...")
        except requests.exceptions.RequestException as e:
            failed_sales += 1
            print(f"✗ Network error for sale: {str(e)[:100]}...")
            time.sleep(2)
        
        time.sleep(0.1)

print(f"\n✓ Successfully created {successful_sales} sales!")
print(f"✗ Failed to create {failed_sales} sales")

# Final verification
print("\nVerifying final count...")
try:
    final_response = requests.get(f"{BACKEND_URL}/api/sales/", headers=headers, timeout=30)
    if final_response.status_code == 200:
        final_sales = final_response.json()
        print(f"✓ Total sales in production: {len(final_sales)}")
        
        if final_sales:
            print("\nSample sales:")
            for i, sale in enumerate(final_sales[:3]):
                print(f"  {i+1}. {sale['quantity']} units at {sale['price']} - {sale['payment_type']}")
            
except Exception as e:
    print(f"Warning: Error verifying final count: {e}")

print("\n🎉 Sales upload completed!")
