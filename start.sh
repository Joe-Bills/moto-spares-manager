#!/bin/bash

# Collect static files
python manage.py collectstatic --noinput --settings=moto_spares_manager.settings_production || echo "Collectstatic completed with warnings"

# Set default port if not provided
if [ -z "$PORT" ]; then
  PORT=8000
fi

# Start the application
exec gunicorn --bind 0.0.0.0:$PORT moto_spares_manager.wsgi:application
