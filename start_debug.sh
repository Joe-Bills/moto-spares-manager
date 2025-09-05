#!/bin/bash
set -e

echo "Starting Django app with debug information..."

echo "Current directory: $(pwd)"
echo "Python version: $(python --version)"
echo "Environment variables:"
env | grep -E "(DEBUG|SECRET_KEY|ALLOWED_HOSTS|DATABASE_URL|CORS_ALLOWED_ORIGINS|FRONTEND_URL)" || echo "No relevant env vars found"

echo "Running migrations..."
python manage.py migrate --settings=moto_spares_manager.settings_railway

echo "Collecting static files..."
python manage.py collectstatic --noinput --settings=moto_spares_manager.settings_railway

echo "Starting Gunicorn..."
export DJANGO_SETTINGS_MODULE=moto_spares_manager.settings_railway
exec gunicorn moto_spares_manager.wsgi:application --bind 0.0.0.0:$PORT --log-level debug
