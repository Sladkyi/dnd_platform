# dnd_platform/routing.py

from django.urls import re_path
from dnd_platform.dnd_platform import consumers  # Импортируем потребителей, которые будут обрабатывать WebSocket соединения

websocket_urlpatterns = [
    re_path(r'ws/some_path/', consumers.MyConsumer.as_asgi()),  # Пример маршрута для WebSocket
]
