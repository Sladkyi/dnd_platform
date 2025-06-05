from django.urls import re_path
from maps.consumers import MapConsumer

websocket_urlpatterns = [
    re_path(r'ws/map/(?P<map_id>\d+)/$', MapConsumer.as_asgi()),
]