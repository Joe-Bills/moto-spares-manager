#!/usr/bin/env python
import requests
import json
import os

# Load the exported data
with open('data_export.json', 'r') as f:
    data = json.load(f)

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

print("Uploading data to production...")

# Upload categories
for category in data['categories']:
    response = requests.post(f"{BACKEND_URL}/api/categories/", json=category, headers=headers)
    if response.status_code in [200, 201]:
        print(f"✓ Created category: {category['name']}")
    else:
        print(f"✗ Failed to create category {category['name']}: {response.text}")

# Upload products
for product in data['products']:
    response = requests.post(f"{BACKEND_URL}/api/products/", json=product, headers=headers)
    if response.status_code in [200, 201]:
        print(f"✓ Created product: {product['name']}")
    else:
        print(f"✗ Failed to create product {product['name']}: {response.text}")

# Upload expenses
for expense in data['expenses']:
    response = requests.post(f"{BACKEND_URL}/api/expenses/", json=expense, headers=headers)
    if response.status_code in [200, 201]:
        print(f"✓ Created expense: {expense['description']}")
    else:
        print(f"✗ Failed to create expense {expense['description']}: {response.text}")

print("Data upload completed!")
