#!/usr/bin/env python
import os
import django
import json
from django.core.management import execute_from_command_line

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'moto_spares_manager.settings')
django.setup()

from core.models import Category, Product, Sale, Expense, AuditLog
from django.contrib.auth.models import User

def export_data():
    print("Exporting data from local database...")
    
    # Export all data to JSON
    data = {
        'users': [],
        'categories': [],
        'products': [],
        'sales': [],
        'expenses': [],
        'audit_logs': []
    }
    
    # Export users (except superuser)
    for user in User.objects.all():
        if not user.is_superuser:
            data['users'].append({
                'username': user.username,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'is_staff': user.is_staff,
                'is_active': user.is_active,
                'date_joined': user.date_joined.isoformat(),
            })
    
    # Export categories
    for category in Category.objects.all():
        data['categories'].append({
            'name': category.name,
            'description': category.description,
        })
    
    # Export products
    for product in Product.objects.all():
        product_data = {
            'name': product.name,
            'buying_price': float(product.buying_price),
            'selling_price': float(product.selling_price),
            'stock_qty': product.stock_qty,
            'is_bulk_product': product.is_bulk_product,
            'units_per_box': product.units_per_box,
        }
        if product.image:
            product_data['image_url'] = product.image.url
        data['products'].append(product_data)
    
    # Export sales
    for sale in Sale.objects.all():
        data['sales'].append({
            'product': sale.product.id,
            'quantity': sale.quantity,
            'price': float(sale.price),
            'discount': float(sale.discount),
            'payment_type': sale.payment_type,
            'date': sale.date.isoformat(),
        })
    
    # Export expenses
    for expense in Expense.objects.all():
        data['expenses'].append({
            'description': expense.description,
            'amount': float(expense.amount),
            'category': expense.category,
            'date': expense.date.isoformat(),
        })
    
    # Export audit logs
    for log in AuditLog.objects.all():
        data['audit_logs'].append({
            'action': log.action,
            'model': log.model,
            'object_id': log.object_id,
            'details': log.details,
            'timestamp': log.timestamp.isoformat(),
        })
    
    # Save to file
    with open('data_export.json', 'w') as f:
        json.dump(data, f, indent=2)
    
    print(f"Exported {len(data['users'])} users")
    print(f"Exported {len(data['categories'])} categories")
    print(f"Exported {len(data['products'])} products")
    print(f"Exported {len(data['sales'])} sales")
    print(f"Exported {len(data['expenses'])} expenses")
    print(f"Exported {len(data['audit_logs'])} audit logs")
    print("Data exported to data_export.json")

if __name__ == '__main__':
    export_data()
