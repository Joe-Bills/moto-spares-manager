# Use Python 3.11 slim image
FROM python:3.11-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Set work directory
WORKDIR /app

# Install system dependencies
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        postgresql-client \
        build-essential \
        libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt

# Copy project
COPY . /app/

# Expose port
EXPOSE 8000

# Create startup script
RUN echo '#!/bin/bash\npython manage.py collectstatic --noinput --settings=moto_spares_manager.settings_production || echo "Collectstatic completed with warnings"\nPORT=${PORT:-8000}\nexec gunicorn --bind 0.0.0.0:$PORT moto_spares_manager.wsgi:application' > /app/start.sh && chmod +x /app/start.sh

# Run the application
CMD ["/app/start.sh"]
