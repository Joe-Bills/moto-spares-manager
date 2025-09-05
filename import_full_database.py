#!/usr/bin/env python
import os
import django
import json
from django.core.management import execute_from_command_line
from django.core import serializers
from django.db import transaction

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'moto_spares_manager.settings_railway')
django.setup()

from django.contrib.auth.models import User
from django.contrib.contenttypes.models import ContentType
from django.contrib.sessions.models import Session
from core.models import Category, Product, Sale, Expense, AuditLog

def import_full_database():
    print("Importing complete database to production...")
    
    # Load the complete database export
    with open('full_database_export.json', 'r', encoding='utf-8') as f:
        all_data = json.load(f)
    
    # Clear existing data (except superuser)
    print("Clearing existing data...")
    with transaction.atomic():
        # Keep the admin superuser, delete others
        User.objects.exclude(is_superuser=True).delete()
        Category.objects.all().delete()
        Product.objects.all().delete()
        Sale.objects.all().delete()
        Expense.objects.all().delete()
        AuditLog.objects.all().delete()
        Session.objects.all().delete()
        
        # Don't delete ContentType as it's system data
        print("  - Cleared user data (kept superuser)")
        print("  - Cleared all business data")
    
    # Import data in correct order to maintain foreign key relationships
    import_order = [
        'ContentType',  # System data first
        'User',         # Users before business data
        'Category',     # Categories before products
        'Product',      # Products before sales
        'Sale',         # Sales depend on products
        'Expense',      # Independent
        'AuditLog',     # Audit logs last
        'Session',      # Sessions last
    ]
    
    with transaction.atomic():
        for model_name in import_order:
            if model_name in all_data and all_data[model_name]:
                print(f"\nImporting {model_name}...")
                
                # Deserialize and save objects
                serialized_data = json.dumps(all_data[model_name])
                objects = serializers.deserialize('json', serialized_data)
                
                imported_count = 0
                for obj in objects:
                    try:
                        obj.save()
                        imported_count += 1
                    except Exception as e:
                        print(f"  Warning: Failed to import {model_name} record: {e}")
                        continue
                
                print(f"  - Imported {imported_count} {model_name} records")
    
    print("\n" + "=" * 50)
    print("COMPLETE DATABASE IMPORT FINISHED!")
    print("=" * 50)
    
    # Print final summary
    print("\nFinal database state:")
    print(f"  Users: {User.objects.count()}")
    print(f"  Categories: {Category.objects.count()}")
    print(f"  Products: {Product.objects.count()}")
    print(f"  Sales: {Sale.objects.count()}")
    print(f"  Expenses: {Expense.objects.count()}")
    print(f"  Audit Logs: {AuditLog.objects.count()}")
    print(f"  Sessions: {Session.objects.count()}")

if __name__ == '__main__':
    import_full_database()
