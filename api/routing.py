"""
WebSocket URL Configuration for API
"""
from django.urls import path
from api.registrations.consumers import CheckinConsumer

# WebSocket URL patterns
websocket_urlpatterns = [
    path('ws/checkin/<uuid:inscricao_id>/', CheckinConsumer.as_asgi()),
]

