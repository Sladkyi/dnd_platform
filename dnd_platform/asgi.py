import os
from channels.routing import ProtocolTypeRouter, URLRouter
from django.core.asgi import get_asgi_application
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'dnd_platform.settings')
django.setup()

from dnd_platform.middleware.jwt_auth import JWTAuthMiddleware

import dnd_platform.routing

application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": JWTAuthMiddleware(
        URLRouter(dnd_platform.routing.websocket_urlpatterns)
    ),
})