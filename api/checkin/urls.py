from django.urls import path
from .views import realizar_checkin

urlpatterns = [
    path('<uuid:inscricao_id>/', realizar_checkin, name='realizar-checkin'),
]
"""
Módulo de Check-in
"""

