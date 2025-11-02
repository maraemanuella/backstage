from django.urls import path
from .views import dashboard_metricas

urlpatterns = [
    path('metricas/', dashboard_metricas, name='dashboard-metricas'),
]
"""
Módulo de Dashboard do Organizador
"""

