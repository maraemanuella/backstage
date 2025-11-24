from django.urls import path
from .views import (
    # Organizer dashboard views
    dashboard_metricas,
    eventos_proximos,
    eventos_anteriores,
    notificacoes,
    graficos,
    # Admin dashboard views
    dashboard_metricas_globais,
    dashboard_organizadores,
    dashboard_verificacoes,
    dashboard_performance,
    dashboard_logs
)

urlpatterns = [
    # Organizer Dashboard
    path('dashboard/metricas/', dashboard_metricas, name='dashboard-metricas'),
    path('dashboard/eventos-proximos/', eventos_proximos, name='dashboard-eventos-proximos'),
    path('dashboard/eventos-anteriores/', eventos_anteriores, name='dashboard-eventos-anteriores'),
    path('dashboard/notificacoes/', notificacoes, name='dashboard-notificacoes'),
    path('dashboard/graficos/', graficos, name='dashboard-graficos'),
    
    # Admin Dashboard (Staff Only)
    path('admin/dashboard/metricas/', dashboard_metricas_globais, name='admin-dashboard-metricas'),
    path('admin/dashboard/organizadores/', dashboard_organizadores, name='admin-dashboard-organizadores'),
    path('admin/dashboard/verificacoes/', dashboard_verificacoes, name='admin-dashboard-verificacoes'),
    path('admin/dashboard/performance/', dashboard_performance, name='admin-dashboard-performance'),
    path('admin/dashboard/logs/', dashboard_logs, name='admin-dashboard-logs'),
]

