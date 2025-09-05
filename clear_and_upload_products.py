#!/usr/bin/env python
import os
import json
import requests
from requests.exceptions import RequestException

# --- Configuration ---
BASE_URL = "https://web-production-3b1a6.up.railway.app/api/"
USERNAME = "admin"
PASSWORD = "admin123"
EXPORT_FILE = "full_database_export.json"

def get_auth_token(username, password):
    print("Logging in to get authentication token...")
    login_url = f"{BASE_URL}token/"
    try:
        response = requests.post(login_url, json={"username": username, "password": password})
        response.raise_for_status()
        return response.json()["access"]
    except RequestException as e:
        print(f"Error logging in: {e}")
        if hasattr(e, 'response') and e.response is not None:
            print(f"Response content: {e.response.text}")
        return None

def clear_all_products(token):
    print("Clearing all existing products...")
    headers = {"Authorization": f"Bearer {token}"}
    
    # Get all products
    try:
        response = requests.get(f"{BASE_URL}products/", headers=headers)
        response.raise_for_status()
        products = response.json()
        print(f"Found {len(products)} products to delete")
        
        # Delete each product
        deleted_count = 0
        for product in products:
            try:
                delete_response = requests.delete(f"{BASE_URL}products/{product['id']}/", headers=headers)
                delete_response.raise_for_status()
                deleted_count += 1
                if deleted_count % 50 == 0:
                    print(f"Deleted {deleted_count} products so far...")
            except RequestException as e:
                print(f"Failed to delete product {product.get('name', 'Unknown')}: {e}")
        
        print(f"✓ Deleted {deleted_count} products")
        return deleted_count
        
    except RequestException as e:
        print(f"Error getting products list: {e}")
        return 0

def upload_products_once(token, products_data):
    headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
    success_count = 0
    
    print(f"Uploading {len(products_data)} products (once only)...")
    
    for product_data in products_data:
        try:
            # Extract data from the 'fields' structure
            fields = product_data.get('fields', {})
            
            # Create clean product data
            clean_product = {
                'name': fields.get('name', ''),
                'buying_price': fields.get('buying_price', '0.00'),
                'selling_price': fields.get('selling_price', '0.00'),
                'stock_qty': fields.get('stock_qty', 0),
                'is_bulk_product': fields.get('is_bulk_product', False),
                'units_per_box': fields.get('units_per_box', 1),
            }
            
            response = requests.post(f"{BASE_URL}products/", headers=headers, json=clean_product)
            response.raise_for_status()
            success_count += 1
            
            if success_count % 20 == 0:
                print(f"✓ Created {success_count} products so far...")
                
        except RequestException as e:
            product_name = fields.get('name', 'Unknown')
            print(f"✗ Failed to create product {product_name}: {e}")
    
    print(f"\n✓ Successfully created {success_count} products!")
    return success_count

def main():
    print("=== CLEARING AND UPLOADING PRODUCTS (NO DUPLICATES) ===")
    
    # Get authentication token
    token = get_auth_token(USERNAME, PASSWORD)
    if not token:
        print("Failed to get authentication token. Aborting.")
        return
    
    # Load exported data
    try:
        with open(EXPORT_FILE, 'r') as f:
            exported_data = json.load(f)
    except FileNotFoundError:
        print(f"Export file {EXPORT_FILE} not found!")
        return
    
    # Get products data
    products_data = exported_data.get('Product', [])
    if not products_data:
        print("No products found in export file!")
        return
    
    print(f"Found {len(products_data)} products to upload")
    
    # Clear all existing products
    deleted_count = clear_all_products(token)
    
    # Upload products once
    success_count = upload_products_once(token, products_data)
    
    # Verify final count
    print("\nVerifying final upload...")
    headers = {"Authorization": f"Bearer {token}"}
    try:
        response = requests.get(f"{BASE_URL}products/", headers=headers)
        response.raise_for_status()
        products = response.json()
        print(f"✓ Final product count: {len(products)}")
        
        if len(products) > 0:
            print(f"✓ First product: {products[0]['name']}")
            print(f"✓ Last product: {products[-1]['name']}")
            
    except RequestException as e:
        print(f"Error verifying upload: {e}")
    
    print(f"\n🎉 Upload complete! {success_count} products uploaded (no duplicates)!")

if __name__ == '__main__':
    main()
