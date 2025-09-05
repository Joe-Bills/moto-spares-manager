#!/usr/bin/env python
import requests
import json

# Backend URL
BACKEND_URL = "https://web-production-3b1a6.up.railway.app"

print("🔍 TESTING AUDIT LOGGING FUNCTIONALITY")
print("=" * 60)

# Test 1: Login (should create audit log)
print("\n1️⃣ TESTING LOGIN AUDIT LOGGING...")
login_data = {
    "username": "admin",
    "password": "admin123"
}

login_response = requests.post(f"{BACKEND_URL}/api/token/", json=login_data)
if login_response.status_code == 200:
    print("✅ Login successful!")
    token = login_response.json()['access']
    headers = {'Authorization': f'Bearer {token}'}
else:
    print(f"❌ Login failed: {login_response.text}")
    exit(1)

# Test 2: Check audit logs after login
print("\n2️⃣ CHECKING AUDIT LOGS AFTER LOGIN...")
audit_response = requests.get(f"{BACKEND_URL}/api/audit-logs/", headers=headers)
if audit_response.status_code == 200:
    audit_logs = audit_response.json()
    print(f"✅ Found {len(audit_logs)} audit logs")
    
    # Show recent logs
    print("\n📋 Recent Audit Logs:")
    for i, log in enumerate(audit_logs[:5]):
        print(f"   {i+1}. {log['timestamp']} | {log['action']} | {log['model']} | {log['details']}")
    
    # Check if login was logged
    login_logs = [log for log in audit_logs if log['action'] == 'login']
    if login_logs:
        print(f"✅ Login audit log found: {len(login_logs)} login(s) recorded")
    else:
        print("❌ No login audit logs found")
else:
    print(f"❌ Failed to fetch audit logs: {audit_response.status_code}")

# Test 3: Create a product (should create audit log)
print("\n3️⃣ TESTING PRODUCT CREATION AUDIT LOGGING...")
product_data = {
    "name": "TEST AUDIT PRODUCT",
    "description": "Testing audit logging",
    "buying_price": 1000,
    "selling_price": 1500,
    "stock_qty": 10,
    "category": None,
    "is_bulk_product": False,
    "units_per_box": 1
}

product_response = requests.post(f"{BACKEND_URL}/api/products/", json=product_data, headers=headers)
if product_response.status_code == 201:
    print("✅ Product created successfully!")
    product_id = product_response.json()['id']
    
    # Check audit logs after product creation
    audit_response = requests.get(f"{BACKEND_URL}/api/audit-logs/", headers=headers)
    if audit_response.status_code == 200:
        audit_logs = audit_response.json()
        product_logs = [log for log in audit_logs if log['model'] == 'Product' and log['action'] == 'create']
        if product_logs:
            print(f"✅ Product creation audit log found: {len(product_logs)} product creation(s) recorded")
        else:
            print("❌ No product creation audit logs found")
else:
    print(f"❌ Product creation failed: {product_response.text}")

# Test 4: Update business settings (should create audit log)
print("\n4️⃣ TESTING BUSINESS SETTINGS UPDATE AUDIT LOGGING...")
settings_data = {
    "business_name": "TEST AUDIT BUSINESS",
    "currency": "USD"
}

settings_response = requests.put(f"{BACKEND_URL}/api/business-settings/", json=settings_data, headers=headers)
if settings_response.status_code == 200:
    print("✅ Business settings updated successfully!")
    
    # Check audit logs after settings update
    audit_response = requests.get(f"{BACKEND_URL}/api/audit-logs/", headers=headers)
    if audit_response.status_code == 200:
        audit_logs = audit_response.json()
        settings_logs = [log for log in audit_logs if log['model'] == 'BusinessSettings' and log['action'] == 'update']
        if settings_logs:
            print(f"✅ Business settings update audit log found: {len(settings_logs)} settings update(s) recorded")
        else:
            print("❌ No business settings update audit logs found")
else:
    print(f"❌ Business settings update failed: {settings_response.text}")

# Test 5: Create a category (should create audit log)
print("\n5️⃣ TESTING CATEGORY CREATION AUDIT LOGGING...")
category_data = {
    "name": "TEST AUDIT CATEGORY",
    "description": "Testing category audit logging"
}

category_response = requests.post(f"{BACKEND_URL}/api/categories/", json=category_data, headers=headers)
if category_response.status_code == 201:
    print("✅ Category created successfully!")
    
    # Check audit logs after category creation
    audit_response = requests.get(f"{BACKEND_URL}/api/audit-logs/", headers=headers)
    if audit_response.status_code == 200:
        audit_logs = audit_response.json()
        category_logs = [log for log in audit_logs if log['model'] == 'Category' and log['action'] == 'create']
        if category_logs:
            print(f"✅ Category creation audit log found: {len(category_logs)} category creation(s) recorded")
        else:
            print("❌ No category creation audit logs found")
else:
    print(f"❌ Category creation failed: {category_response.text}")

# Test 6: Final audit log summary
print("\n6️⃣ FINAL AUDIT LOG SUMMARY...")
audit_response = requests.get(f"{BACKEND_URL}/api/audit-logs/", headers=headers)
if audit_response.status_code == 200:
    audit_logs = audit_response.json()
    
    # Count by action type
    action_counts = {}
    for log in audit_logs:
        action = log['action']
        action_counts[action] = action_counts.get(action, 0) + 1
    
    print(f"\n📊 Audit Log Summary:")
    print(f"   Total Logs: {len(audit_logs)}")
    for action, count in action_counts.items():
        print(f"   {action.title()}: {count}")
    
    # Show all recent logs
    print(f"\n📋 All Recent Audit Logs:")
    for i, log in enumerate(audit_logs[:10]):
        print(f"   {i+1:2d}. {log['timestamp'][:19]} | {log['action']:8s} | {log['model']:15s} | {log['details']}")
    
    if len(audit_logs) > 10:
        print(f"   ... and {len(audit_logs) - 10} more logs")

print("\n🎉 AUDIT LOGGING TEST COMPLETED!")
print("=" * 60)
