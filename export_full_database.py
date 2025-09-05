#!/usr/bin/env python
import os
import django
import json
from django.core.management import execute_from_command_line
from django.core import serializers

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'moto_spares_manager.settings')
django.setup()

from django.contrib.auth.models import User
from django.contrib.contenttypes.models import ContentType
from django.contrib.sessions.models import Session
from core.models import Category, Product, Sale, Expense, AuditLog

def export_full_database():
    print("Exporting complete database schema and data...")
    
    # Export all Django models with their data
    models_to_export = [
        User,
        ContentType,
        Category,
        Product,
        Sale,
        Expense,
        AuditLog,
    ]
    
    all_data = {}
    
    for model in models_to_export:
        model_name = model.__name__
        print(f"Exporting {model_name}...")
        
        # Get all objects for this model
        objects = model.objects.all()
        
        # Serialize to JSON
        serialized_data = serializers.serialize('json', objects, indent=2)
        parsed_data = json.loads(serialized_data)
        
        all_data[model_name] = parsed_data
        print(f"  - Exported {len(parsed_data)} {model_name} records")
    
    # Also export sessions if they exist
    try:
        sessions = Session.objects.all()
        if sessions.exists():
            serialized_sessions = serializers.serialize('json', sessions, indent=2)
            all_data['Session'] = json.loads(serialized_sessions)
            print(f"  - Exported {len(sessions)} Session records")
    except:
        print("  - No sessions to export")
    
    # Save complete database export
    with open('full_database_export.json', 'w', encoding='utf-8') as f:
        json.dump(all_data, f, indent=2, ensure_ascii=False)
    
    print(f"\nComplete database exported to 'full_database_export.json'")
    print("=" * 50)
    
    # Print summary
    total_records = sum(len(records) for records in all_data.values())
    print(f"TOTAL RECORDS EXPORTED: {total_records}")
    for model_name, records in all_data.items():
        print(f"  {model_name}: {len(records)} records")

if __name__ == '__main__':
    export_full_database()
