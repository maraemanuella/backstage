from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    re_path(r'ws/checkin/(?P<inscricao_id>[0-9a-f-]+)/$', consumers.CheckinConsumer.as_asgi()),
]

