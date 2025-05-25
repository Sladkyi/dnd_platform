# dnd_platform/asgi.py

import os
from django.core.asgi import get_asgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'dnd_platform.settings')

application = get_asgi_application()
