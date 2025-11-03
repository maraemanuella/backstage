from django.urls import path
from api.analytics.views import (
    evento_analytics_geral,
    evento_analytics_demograficos,
    evento_analytics_interacoes,
    evento_analytics_roi,
    evento_analytics_atualizar_custo,
    evento_analytics_exportar_pdf,
)

urlpatterns = [
    path('eventos/<uuid:evento_id>/geral/', evento_analytics_geral, name='evento-analytics-geral'),
    path('eventos/<uuid:evento_id>/demograficos/', evento_analytics_demograficos, name='evento-analytics-demograficos'),
    path('eventos/<uuid:evento_id>/interacoes/', evento_analytics_interacoes, name='evento-analytics-interacoes'),
    path('eventos/<uuid:evento_id>/roi/', evento_analytics_roi, name='evento-analytics-roi'),
    path('eventos/<uuid:evento_id>/atualizar-custo/', evento_analytics_atualizar_custo, name='evento-analytics-atualizar-custo'),
    path('eventos/<uuid:evento_id>/exportar-pdf/', evento_analytics_exportar_pdf, name='evento-analytics-exportar-pdf'),
]
