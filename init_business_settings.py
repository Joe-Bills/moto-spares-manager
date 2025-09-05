#!/usr/bin/env python
import os
import django
from django.core.management import execute_from_command_line

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'moto_spares_manager.settings_railway')
django.setup()

from core.models import BusinessSettings

def init_business_settings():
    print("Initializing business settings...")
    
    # Get or create the business settings
    settings = BusinessSettings.get_settings()
    
    print(f"Business settings initialized:")
    print(f"  - Business Name: {settings.business_name}")
    print(f"  - Currency: {settings.currency}")
    print(f"  - Created: {settings.created_at}")
    print(f"  - Updated: {settings.updated_at}")

if __name__ == '__main__':
    init_business_settings()
