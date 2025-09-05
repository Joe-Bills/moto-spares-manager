#!/usr/bin/env python
import os
import django
import json
from django.core.management import execute_from_command_line

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'moto_spares_manager.settings_railway')
django.setup()

from core.models import Category, Product, Sale, Expense, AuditLog
from django.contrib.auth.models import User
from django.db import transaction

def import_data():
    print("Importing data to production database...")
    
    # Load data from file
    with open('data_export.json', 'r') as f:
        data = json.load(f)
    
    with transaction.atomic():
        # Import users
        for user_data in data['users']:
            user, created = User.objects.get_or_create(
                username=user_data['username'],
                defaults={
                    'email': user_data['email'],
                    'first_name': user_data['first_name'],
                    'last_name': user_data['last_name'],
                    'is_staff': user_data['is_staff'],
                    'is_active': user_data['is_active'],
                }
            )
            if created:
                print(f"Created user: {user.username}")
        
        # Import categories
        category_map = {}
        for cat_data in data['categories']:
            category, created = Category.objects.get_or_create(
                name=cat_data['name'],
                defaults={'description': cat_data['description']}
            )
            category_map[cat_data['name']] = category
            if created:
                print(f"Created category: {category.name}")
        
        # Import products
        product_map = {}
        for prod_data in data['products']:
            product, created = Product.objects.get_or_create(
                name=prod_data['name'],
                defaults={
                    'buying_price': prod_data['buying_price'],
                    'selling_price': prod_data['selling_price'],
                    'stock_qty': prod_data['stock_qty'],
                    'is_bulk_product': prod_data['is_bulk_product'],
                    'units_per_box': prod_data['units_per_box'],
                }
            )
            product_map[prod_data['name']] = product
            if created:
                print(f"Created product: {product.name}")
        
        # Import sales
        for sale_data in data['sales']:
            # Find product by name
            product = None
            for prod_name, prod_obj in product_map.items():
                if prod_obj.id == sale_data['product']:
                    product = prod_obj
                    break
            
            if product:
                sale, created = Sale.objects.get_or_create(
                    product=product,
                    quantity=sale_data['quantity'],
                    price=sale_data['price'],
                    defaults={
                        'discount': sale_data['discount'],
                        'payment_type': sale_data['payment_type'],
                    }
                )
                if created:
                    print(f"Created sale for product: {product.name}")
        
        # Import expenses
        for exp_data in data['expenses']:
            expense, created = Expense.objects.get_or_create(
                description=exp_data['description'],
                amount=exp_data['amount'],
                category=exp_data['category'],
                date=exp_data['date'],
            )
            if created:
                print(f"Created expense: {expense.description}")
        
        # Import audit logs
        for log_data in data['audit_logs']:
            log, created = AuditLog.objects.get_or_create(
                action=log_data['action'],
                model=log_data['model'],
                object_id=log_data['object_id'],
                timestamp=log_data['timestamp'],
                defaults={'details': log_data['details']}
            )
            if created:
                print(f"Created audit log: {log.action}")
    
    print("Data import completed successfully!")

if __name__ == '__main__':
    import_data()
