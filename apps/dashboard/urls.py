from django.urls import path
from .views import dashboard_metricas

urlpatterns = [
    path('dashboard/metricas/', dashboard_metricas, name='dashboard-metricas'),
]

