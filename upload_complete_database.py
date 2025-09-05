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

print("Uploading complete database to production...")
print("=" * 50)

# First, let's clear existing data (except superuser)
print("Clearing existing data...")
try:
    # Get all products and delete them
    products_response = requests.get(f"{BACKEND_URL}/api/products/", headers=headers)
    if products_response.status_code == 200:
        products = products_response.json()
        for product in products:
            delete_response = requests.delete(f"{BACKEND_URL}/api/products/{product['id']}/", headers=headers)
            if delete_response.status_code in [200, 204]:
                print(f"✓ Deleted product: {product['name']}")
    
    # Get all sales and delete them
    sales_response = requests.get(f"{BACKEND_URL}/api/sales/", headers=headers)
    if sales_response.status_code == 200:
        sales = sales_response.json()
        for sale in sales:
            delete_response = requests.delete(f"{BACKEND_URL}/api/sales/{sale['id']}/", headers=headers)
            if delete_response.status_code in [200, 204]:
                print(f"✓ Deleted sale: {sale['id']}")
    
    # Get all expenses and delete them
    expenses_response = requests.get(f"{BACKEND_URL}/api/expenses/", headers=headers)
    if expenses_response.status_code == 200:
        expenses = expenses_response.json()
        for expense in expenses:
            delete_response = requests.delete(f"{BACKEND_URL}/api/expenses/{expense['id']}/", headers=headers)
            if delete_response.status_code in [200, 204]:
                print(f"✓ Deleted expense: {expense['description']}")
    
    print("✓ Existing data cleared")
except Exception as e:
    print(f"Warning: Error clearing data: {e}")

print("\n" + "=" * 50)
print("UPLOADING COMPLETE DATABASE...")
print("=" * 50)

# Upload categories first
print("\nUploading Categories...")
for category_data in all_data.get('Category', []):
    fields = category_data['fields']
    response = requests.post(f"{BACKEND_URL}/api/categories/", json=fields, headers=headers)
    if response.status_code in [200, 201]:
        print(f"✓ Created category: {fields['name']}")
    else:
        print(f"✗ Failed to create category {fields['name']}: {response.text}")

# Upload products
print("\nUploading Products...")
product_id_mapping = {}  # Map old IDs to new IDs
for product_data in all_data.get('Product', []):
    fields = product_data['fields']
    old_id = product_data['pk']
    
    # Remove image_url if it exists (we'll handle images separately)
    if 'image_url' in fields:
        del fields['image_url']
    
    response = requests.post(f"{BACKEND_URL}/api/products/", json=fields, headers=headers)
    if response.status_code in [200, 201]:
        new_product = response.json()
        product_id_mapping[old_id] = new_product['id']
        print(f"✓ Created product: {fields['name']} (ID: {old_id} -> {new_product['id']})")
    else:
        print(f"✗ Failed to create product {fields['name']}: {response.text}")

# Upload sales (with updated product IDs)
print("\nUploading Sales...")
for sale_data in all_data.get('Sale', []):
    fields = sale_data['fields']
    old_product_id = fields['product']
    
    if old_product_id in product_id_mapping:
        fields['product'] = product_id_mapping[old_product_id]
        
        # Convert date format
        if 'date' in fields:
            fields['date'] = fields['date'].replace('T', ' ').replace('Z', '+00:00')
        
        response = requests.post(f"{BACKEND_URL}/api/sales/", json=fields, headers=headers)
        if response.status_code in [200, 201]:
            print(f"✓ Created sale for product ID: {fields['product']}")
        else:
            print(f"✗ Failed to create sale: {response.text}")
    else:
        print(f"✗ Skipped sale - product ID {old_product_id} not found in mapping")

# Upload expenses
print("\nUploading Expenses...")
for expense_data in all_data.get('Expense', []):
    fields = expense_data['fields']
    response = requests.post(f"{BACKEND_URL}/api/expenses/", json=fields, headers=headers)
    if response.status_code in [200, 201]:
        print(f"✓ Created expense: {fields['description']}")
    else:
        print(f"✗ Failed to create expense {fields['description']}: {response.text}")

print("\n" + "=" * 50)
print("COMPLETE DATABASE UPLOAD FINISHED!")
print("=" * 50)

# Verify the upload
print("\nVerifying upload...")
try:
    products_response = requests.get(f"{BACKEND_URL}/api/products/", headers=headers)
    sales_response = requests.get(f"{BACKEND_URL}/api/sales/", headers=headers)
    expenses_response = requests.get(f"{BACKEND_URL}/api/expenses/", headers=headers)
    
    if products_response.status_code == 200:
        products = products_response.json()
        print(f"✓ Products in production: {len(products)}")
    
    if sales_response.status_code == 200:
        sales = sales_response.json()
        print(f"✓ Sales in production: {len(sales)}")
    
    if expenses_response.status_code == 200:
        expenses = expenses_response.json()
        print(f"✓ Expenses in production: {len(expenses)}")
        
except Exception as e:
    print(f"Warning: Error verifying upload: {e}")

print("\n🎉 Your complete database has been uploaded to production!")
print("All your data, relationships, and history are now available online.")
