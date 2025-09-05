#!/bin/bash
export DJANGO_SETTINGS_MODULE=moto_spares_manager.settings_railway
python manage.py collectstatic --noinput
gunicorn moto_spares_manager.wsgi:application --bind 0.0.0.0:$PORT