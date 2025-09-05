#!/usr/bin/env python
"""
Data Persistence Script
Automatically backs up and restores data during deployments
"""
import os
import json
import requests
from datetime import datetime

# Configuration
BACKEND_URL = "https://web-production-3b1a6.up.railway.app"
DATA_BACKUP_FILE = "data_backup.json"

def backup_data():
    """Backup all data to a local file"""
    print("🔄 BACKING UP DATA...")
    
    # Login to get token
    login_data = {"username": "admin", "password": "admin123"}
    login_response = requests.post(f"{BACKEND_URL}/api/token/", json=login_data)
    
    if login_response.status_code != 200:
        print(f"❌ Login failed: {login_response.text}")
        return False
    
    token = login_response.json()['access']
    headers = {'Authorization': f'Bearer {token}'}
    
    # Backup all data
    backup_data = {
        "timestamp": datetime.now().isoformat(),
        "products": [],
        "sales": [],
        "expenses": [],
        "categories": [],
        "business_settings": {}
    }
    
    # Backup Products
    products_response = requests.get(f"{BACKEND_URL}/api/products/", headers=headers)
    if products_response.status_code == 200:
        backup_data["products"] = products_response.json()
        print(f"✅ Backed up {len(backup_data['products'])} products")
    
    # Backup Sales
    sales_response = requests.get(f"{BACKEND_URL}/api/sales/", headers=headers)
    if sales_response.status_code == 200:
        backup_data["sales"] = sales_response.json()
        print(f"✅ Backed up {len(backup_data['sales'])} sales")
    
    # Backup Expenses
    expenses_response = requests.get(f"{BACKEND_URL}/api/expenses/", headers=headers)
    if expenses_response.status_code == 200:
        backup_data["expenses"] = expenses_response.json()
        print(f"✅ Backed up {len(backup_data['expenses'])} expenses")
    
    # Backup Categories
    categories_response = requests.get(f"{BACKEND_URL}/api/categories/", headers=headers)
    if categories_response.status_code == 200:
        backup_data["categories"] = categories_response.json()
        print(f"✅ Backed up {len(backup_data['categories'])} categories")
    
    # Backup Business Settings
    settings_response = requests.get(f"{BACKEND_URL}/api/business-settings/", headers=headers)
    if settings_response.status_code == 200:
        backup_data["business_settings"] = settings_response.json()
        print(f"✅ Backed up business settings")
    
    # Save to file
    with open(DATA_BACKUP_FILE, 'w') as f:
        json.dump(backup_data, f, indent=2)
    
    print(f"✅ Data backed up to {DATA_BACKUP_FILE}")
    return True

def restore_data():
    """Restore data from backup file"""
    print("🔄 RESTORING DATA...")
    
    if not os.path.exists(DATA_BACKUP_FILE):
        print(f"❌ No backup file found: {DATA_BACKUP_FILE}")
        return False
    
    # Load backup data
    with open(DATA_BACKUP_FILE, 'r') as f:
        backup_data = json.load(f)
    
    print(f"📅 Backup from: {backup_data['timestamp']}")
    
    # Login to get token
    login_data = {"username": "admin", "password": "admin123"}
    login_response = requests.post(f"{BACKEND_URL}/api/token/", json=login_data)
    
    if login_response.status_code != 200:
        print(f"❌ Login failed: {login_response.text}")
        return False
    
    token = login_response.json()['access']
    headers = {'Authorization': f'Bearer {token}'}
    
    # Restore Products
    if backup_data.get("products"):
        print(f"📦 Restoring {len(backup_data['products'])} products...")
        for product in backup_data["products"]:
            # Remove ID to create new product
            product_data = {k: v for k, v in product.items() if k != 'id'}
            response = requests.post(f"{BACKEND_URL}/api/products/", json=product_data, headers=headers)
            if response.status_code not in [200, 201]:
                print(f"⚠️  Failed to restore product: {product.get('name', 'Unknown')}")
    
    # Restore Sales
    if backup_data.get("sales"):
        print(f"💰 Restoring {len(backup_data['sales'])} sales...")
        for sale in backup_data["sales"]:
            sale_data = {k: v for k, v in sale.items() if k != 'id'}
            response = requests.post(f"{BACKEND_URL}/api/sales/", json=sale_data, headers=headers)
            if response.status_code not in [200, 201]:
                print(f"⚠️  Failed to restore sale")
    
    # Restore Expenses
    if backup_data.get("expenses"):
        print(f"💸 Restoring {len(backup_data['expenses'])} expenses...")
        for expense in backup_data["expenses"]:
            expense_data = {k: v for k, v in expense.items() if k != 'id'}
            response = requests.post(f"{BACKEND_URL}/api/expenses/", json=expense_data, headers=headers)
            if response.status_code not in [200, 201]:
                print(f"⚠️  Failed to restore expense")
    
    # Restore Categories
    if backup_data.get("categories"):
        print(f"📂 Restoring {len(backup_data['categories'])} categories...")
        for category in backup_data["categories"]:
            category_data = {k: v for k, v in category.items() if k != 'id'}
            response = requests.post(f"{BACKEND_URL}/api/categories/", json=category_data, headers=headers)
            if response.status_code not in [200, 201]:
                print(f"⚠️  Failed to restore category")
    
    # Restore Business Settings
    if backup_data.get("business_settings"):
        print(f"⚙️  Restoring business settings...")
        settings_data = {k: v for k, v in backup_data["business_settings"].items() if k != 'id'}
        response = requests.put(f"{BACKEND_URL}/api/business-settings/", json=settings_data, headers=headers)
        if response.status_code not in [200, 201]:
            print(f"⚠️  Failed to restore business settings")
    
    print("✅ Data restoration completed!")
    return True

def check_data_status():
    """Check if data exists in the database"""
    print("🔍 CHECKING DATA STATUS...")
    
    # Login to get token
    login_data = {"username": "admin", "password": "admin123"}
    login_response = requests.post(f"{BACKEND_URL}/api/token/", json=login_data)
    
    if login_response.status_code != 200:
        print(f"❌ Login failed: {login_response.text}")
        return False
    
    token = login_response.json()['access']
    headers = {'Authorization': f'Bearer {token}'}
    
    # Check each data type
    data_status = {}
    
    # Check Products
    products_response = requests.get(f"{BACKEND_URL}/api/products/", headers=headers)
    if products_response.status_code == 200:
        data_status["products"] = len(products_response.json())
    else:
        data_status["products"] = 0
    
    # Check Sales
    sales_response = requests.get(f"{BACKEND_URL}/api/sales/", headers=headers)
    if sales_response.status_code == 200:
        data_status["sales"] = len(sales_response.json())
    else:
        data_status["sales"] = 0
    
    # Check Expenses
    expenses_response = requests.get(f"{BACKEND_URL}/api/expenses/", headers=headers)
    if expenses_response.status_code == 200:
        data_status["expenses"] = len(expenses_response.json())
    else:
        data_status["expenses"] = 0
    
    # Check Categories
    categories_response = requests.get(f"{BACKEND_URL}/api/categories/", headers=headers)
    if categories_response.status_code == 200:
        data_status["categories"] = len(categories_response.json())
    else:
        data_status["categories"] = 0
    
    # Check Business Settings
    settings_response = requests.get(f"{BACKEND_URL}/api/business-settings/", headers=headers)
    if settings_response.status_code == 200:
        data_status["business_settings"] = 1
    else:
        data_status["business_settings"] = 0
    
    # Print status
    print("\n📊 CURRENT DATA STATUS:")
    print("=" * 40)
    print(f"Products: {data_status['products']}")
    print(f"Sales: {data_status['sales']}")
    print(f"Expenses: {data_status['expenses']}")
    print(f"Categories: {data_status['categories']}")
    print(f"Business Settings: {data_status['business_settings']}")
    
    # Check if data is missing
    total_data = sum(data_status.values())
    if total_data == 0:
        print("\n❌ NO DATA FOUND! Database is empty.")
        return False
    elif data_status['products'] == 0:
        print("\n⚠️  PRODUCTS MISSING! This will cause frontend issues.")
        return False
    else:
        print(f"\n✅ Data looks good! Total records: {total_data}")
        return True

if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1:
        command = sys.argv[1]
        
        if command == "backup":
            backup_data()
        elif command == "restore":
            restore_data()
        elif command == "check":
            check_data_status()
        elif command == "auto":
            # Auto mode: check data, restore if needed
            if not check_data_status():
                print("\n🔄 Auto-restoring data...")
                restore_data()
        else:
            print("Usage: python persist_data.py [backup|restore|check|auto]")
    else:
        print("🔄 DATA PERSISTENCE MANAGER")
        print("=" * 40)
        print("Commands:")
        print("  backup  - Backup current data")
        print("  restore - Restore from backup")
        print("  check   - Check data status")
        print("  auto    - Auto-check and restore if needed")
        print("\nExample: python persist_data.py auto")
