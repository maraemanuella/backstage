from django.urls import path
from .views import dashboard_metricas, eventos_proximos, eventos_anteriores, notificacoes, graficos

urlpatterns = [
    path('dashboard/metricas/', dashboard_metricas, name='dashboard-metricas'),
    path('dashboard/eventos-proximos/', eventos_proximos, name='dashboard-eventos-proximos'),
    path('dashboard/eventos-anteriores/', eventos_anteriores, name='dashboard-eventos-anteriores'),
    path('dashboard/notificacoes/', notificacoes, name='dashboard-notificacoes'),
    path('dashboard/graficos/', graficos, name='dashboard-graficos'),
]

