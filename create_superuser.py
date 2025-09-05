#!/usr/bin/env python
import os
import django
from django.core.management import execute_from_command_line

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'moto_spares_manager.settings_railway')
django.setup()

from django.contrib.auth import get_user_model

User = get_user_model()

# Check if superuser exists
if not User.objects.filter(is_superuser=True).exists():
    print("Creating superuser...")
    User.objects.create_superuser(
        username='admin',
        email='admin@example.com',
        password='admin123'
    )
    print("Superuser created: username=admin, password=admin123")
else:
    print("Superuser already exists")
