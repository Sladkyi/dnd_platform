from django.urls import re_path
from maps.consumers import MapConsumer

websocket_urlpatterns = [
    re_path(r'ws/global/$', MapConsumer.as_asgi()),  # ✅ Глобальный маршрут
]