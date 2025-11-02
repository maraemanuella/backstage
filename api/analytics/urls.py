"""
URLs para Analytics do Evento
"""
from django.urls import path
from .views import (
    evento_analytics_geral,
    evento_analytics_demograficos,
    evento_analytics_interacoes,
    evento_analytics_roi,
    evento_analytics_atualizar_custo,
    evento_analytics_exportar_pdf,
)

urlpatterns = [
    # Métricas gerais do evento
    path(
        'eventos/<uuid:evento_id>/analytics/geral/',
        evento_analytics_geral,
        name='evento-analytics-geral'
    ),

    # Dados demográficos
    path(
        'eventos/<uuid:evento_id>/analytics/demograficos/',
        evento_analytics_demograficos,
        name='evento-analytics-demograficos'
    ),

    # Interações ao longo do tempo
    path(
        'eventos/<uuid:evento_id>/analytics/interacoes/',
        evento_analytics_interacoes,
        name='evento-analytics-interacoes'
    ),

    # ROI do evento
    path(
        'eventos/<uuid:evento_id>/analytics/roi/',
        evento_analytics_roi,
        name='evento-analytics-roi'
    ),

    # Atualizar custo do evento
    path(
        'eventos/<uuid:evento_id>/analytics/atualizar-custo/',
        evento_analytics_atualizar_custo,
        name='evento-analytics-atualizar-custo'
    ),

    # Exportar relatório em PDF
    path(
        'eventos/<uuid:evento_id>/analytics/exportar-pdf/',
        evento_analytics_exportar_pdf,
        name='evento-analytics-exportar-pdf'
    ),
]

