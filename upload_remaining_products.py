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

# Get existing products to avoid duplicates
print("Getting existing products...")
existing_response = requests.get(f"{BACKEND_URL}/api/products/", headers=headers)
if existing_response.status_code == 200:
    existing_products = existing_response.json()
    existing_names = {p['name'] for p in existing_products}
    print(f"Found {len(existing_products)} existing products")
else:
    existing_names = set()
    print("Could not get existing products, will upload all")

print("Uploading remaining products...")
print("=" * 50)

# Upload products without images, skipping existing ones
successful_products = 0
failed_products = 0

for i, product_data in enumerate(all_data.get('Product', [])):
    fields = product_data['fields']
    product_name = fields['name']
    
    # Skip if already exists
    if product_name in existing_names:
        print(f"⏭️  Skipping existing product: {product_name}")
        continue
    
    # Remove image field completely to avoid file upload issues
    if 'image' in fields:
        del fields['image']
    
    # Create product data without image
    product_payload = {
        'name': fields['name'],
        'buying_price': fields['buying_price'],
        'selling_price': fields['selling_price'],
        'stock_qty': fields['stock_qty'],
        'is_bulk_product': fields['is_bulk_product'],
        'units_per_box': fields['units_per_box'],
    }
    
    try:
        response = requests.post(f"{BACKEND_URL}/api/products/", json=product_payload, headers=headers, timeout=30)
        if response.status_code in [200, 201]:
            successful_products += 1
            print(f"✓ Created product {successful_products}: {product_name}")
        else:
            failed_products += 1
            print(f"✗ Failed to create product {product_name}: {response.text[:100]}...")
    except requests.exceptions.RequestException as e:
        failed_products += 1
        print(f"✗ Network error for product {product_name}: {str(e)[:100]}...")
        # Wait a bit before retrying
        time.sleep(2)
    
    # Small delay to avoid overwhelming the server
    time.sleep(0.1)

print(f"\n✓ Successfully created {successful_products} products!")
print(f"✗ Failed to create {failed_products} products")

# Final verification
print("\nVerifying final count...")
try:
    final_response = requests.get(f"{BACKEND_URL}/api/products/", headers=headers, timeout=30)
    if final_response.status_code == 200:
        final_products = final_response.json()
        print(f"✓ Total products in production: {len(final_products)}")
        
        # Show first few products as sample
        print("\nSample products:")
        for i, product in enumerate(final_products[:5]):
            print(f"  {i+1}. {product['name']} - Stock: {product['stock_qty']}")
        
        if len(final_products) > 5:
            print(f"  ... and {len(final_products) - 5} more products")
            
except Exception as e:
    print(f"Warning: Error verifying final count: {e}")

print("\n🎉 Product upload completed!")
