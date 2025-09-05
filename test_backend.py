#!/usr/bin/env python
import os
import sys
import django

# Add the project directory to Python path
sys.path.append('/app')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'moto_spares_manager.settings_production')

try:
    django.setup()
    print("✅ Django setup successful")
    
    from django.core.management import execute_from_command_line
    print("✅ Django management commands available")
    
    from django.conf import settings
    print(f"✅ DEBUG: {settings.DEBUG}")
    print(f"✅ ALLOWED_HOSTS: {settings.ALLOWED_HOSTS}")
    print(f"✅ DATABASE: {settings.DATABASES['default']['ENGINE']}")
    
    print("✅ All checks passed!")
    
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()
