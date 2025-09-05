#!/usr/bin/env python
"""
Automatic Data Restoration Script
Runs during deployment to ensure data is never lost
"""
import os
import json
import requests
import time
from datetime import datetime

# Configuration
BACKEND_URL = "https://web-production-3b1a6.up.railway.app"
DATA_BACKUP_FILE = "data_backup.json"
MAX_RETRIES = 10
RETRY_DELAY = 30

def wait_for_backend():
    """Wait for backend to be ready"""
    print("⏳ Waiting for backend to be ready...")
    
    for attempt in range(MAX_RETRIES):
        try:
            response = requests.get(f"{BACKEND_URL}/api/health/", timeout=10)
            if response.status_code == 200:
                print("✅ Backend is ready!")
                return True
        except:
            pass
        
        print(f"⏳ Attempt {attempt + 1}/{MAX_RETRIES} - Backend not ready yet...")
        time.sleep(RETRY_DELAY)
    
    print("❌ Backend failed to start after maximum retries")
    return False

def check_data_exists():
    """Check if data already exists in the database"""
    print("🔍 Checking if data already exists...")
    
    try:
        # Login to get token
        login_data = {"username": "admin", "password": "admin123"}
        login_response = requests.post(f"{BACKEND_URL}/api/token/", json=login_data, timeout=10)
        
        if login_response.status_code != 200:
            print(f"❌ Login failed: {login_response.text}")
            return False
        
        token = login_response.json()['access']
        headers = {'Authorization': f'Bearer {token}'}
        
        # Check if products exist
        products_response = requests.get(f"{BACKEND_URL}/api/products/", headers=headers, timeout=10)
        if products_response.status_code == 200:
            products = products_response.json()
            if len(products) > 0:
                print(f"✅ Data already exists! Found {len(products)} products")
                return True
        
        print("❌ No data found in database")
        return False
        
    except Exception as e:
        print(f"❌ Error checking data: {e}")
        return False

def restore_from_backup():
    """Restore data from backup file"""
    print("🔄 Restoring data from backup...")
    
    if not os.path.exists(DATA_BACKUP_FILE):
        print(f"❌ No backup file found: {DATA_BACKUP_FILE}")
        return False
    
    try:
        # Load backup data
        with open(DATA_BACKUP_FILE, 'r') as f:
            backup_data = json.load(f)
        
        print(f"📅 Restoring from backup: {backup_data['timestamp']}")
        
        # Login to get token
        login_data = {"username": "admin", "password": "admin123"}
        login_response = requests.post(f"{BACKEND_URL}/api/token/", json=login_data, timeout=10)
        
        if login_response.status_code != 200:
            print(f"❌ Login failed: {login_response.text}")
            return False
        
        token = login_response.json()['access']
        headers = {'Authorization': f'Bearer {token}'}
        
        # Restore Products
        if backup_data.get("products"):
            print(f"📦 Restoring {len(backup_data['products'])} products...")
            success_count = 0
            for product in backup_data["products"]:
                try:
                    # Remove ID to create new product
                    product_data = {k: v for k, v in product.items() if k != 'id'}
                    response = requests.post(f"{BACKEND_URL}/api/products/", json=product_data, headers=headers, timeout=10)
                    if response.status_code in [200, 201]:
                        success_count += 1
                    else:
                        print(f"⚠️  Failed to restore product: {product.get('name', 'Unknown')}")
                except Exception as e:
                    print(f"⚠️  Error restoring product: {e}")
            
            print(f"✅ Successfully restored {success_count}/{len(backup_data['products'])} products")
        
        # Restore Sales
        if backup_data.get("sales"):
            print(f"💰 Restoring {len(backup_data['sales'])} sales...")
            success_count = 0
            for sale in backup_data["sales"]:
                try:
                    sale_data = {k: v for k, v in sale.items() if k != 'id'}
                    response = requests.post(f"{BACKEND_URL}/api/sales/", json=sale_data, headers=headers, timeout=10)
                    if response.status_code in [200, 201]:
                        success_count += 1
                except Exception as e:
                    print(f"⚠️  Error restoring sale: {e}")
            
            print(f"✅ Successfully restored {success_count}/{len(backup_data['sales'])} sales")
        
        # Restore Expenses
        if backup_data.get("expenses"):
            print(f"💸 Restoring {len(backup_data['expenses'])} expenses...")
            success_count = 0
            for expense in backup_data["expenses"]:
                try:
                    expense_data = {k: v for k, v in expense.items() if k != 'id'}
                    response = requests.post(f"{BACKEND_URL}/api/expenses/", json=expense_data, headers=headers, timeout=10)
                    if response.status_code in [200, 201]:
                        success_count += 1
                except Exception as e:
                    print(f"⚠️  Error restoring expense: {e}")
            
            print(f"✅ Successfully restored {success_count}/{len(backup_data['expenses'])} expenses")
        
        # Restore Categories
        if backup_data.get("categories"):
            print(f"📂 Restoring {len(backup_data['categories'])} categories...")
            success_count = 0
            for category in backup_data["categories"]:
                try:
                    category_data = {k: v for k, v in category.items() if k != 'id'}
                    response = requests.post(f"{BACKEND_URL}/api/categories/", json=category_data, headers=headers, timeout=10)
                    if response.status_code in [200, 201]:
                        success_count += 1
                except Exception as e:
                    print(f"⚠️  Error restoring category: {e}")
            
            print(f"✅ Successfully restored {success_count}/{len(backup_data['categories'])} categories")
        
        # Restore Business Settings
        if backup_data.get("business_settings"):
            print(f"⚙️  Restoring business settings...")
            try:
                settings_data = {k: v for k, v in backup_data["business_settings"].items() if k != 'id'}
                response = requests.put(f"{BACKEND_URL}/api/business-settings/", json=settings_data, headers=headers, timeout=10)
                if response.status_code in [200, 201]:
                    print("✅ Business settings restored")
                else:
                    print(f"⚠️  Failed to restore business settings: {response.status_code}")
            except Exception as e:
                print(f"⚠️  Error restoring business settings: {e}")
        
        print("✅ Data restoration completed!")
        return True
        
    except Exception as e:
        print(f"❌ Error during restoration: {e}")
        return False

def main():
    """Main function to handle automatic data restoration"""
    print("🚀 AUTOMATIC DATA RESTORATION")
    print("=" * 50)
    print(f"Backend URL: {BACKEND_URL}")
    print(f"Backup file: {DATA_BACKUP_FILE}")
    print(f"Timestamp: {datetime.now().isoformat()}")
    print("=" * 50)
    
    # Step 1: Wait for backend to be ready
    if not wait_for_backend():
        print("❌ Failed to start backend")
        return False
    
    # Step 2: Check if data already exists
    if check_data_exists():
        print("✅ Data already exists, no restoration needed")
        return True
    
    # Step 3: Restore data from backup
    if restore_from_backup():
        print("✅ Data restoration successful!")
        return True
    else:
        print("❌ Data restoration failed!")
        return False

if __name__ == "__main__":
    success = main()
    if success:
        print("\n🎉 AUTOMATIC DATA RESTORATION COMPLETED SUCCESSFULLY!")
    else:
        print("\n💥 AUTOMATIC DATA RESTORATION FAILED!")
        exit(1)
