from django.urls import path
from api.events.views import (
    EventoCreateView,
    EventoListView,
    EventoDetailView,
    ManageEventosView,
    EventoRetrieveUpdateView,
    AvaliacaoListView,
    AvaliacaoCreateView,
    evento_resumo_inscricao,
    dashboard_metricas,
)

urlpatterns = [
    path('', EventoListView.as_view(), name='evento-list'),
    path('<uuid:id>/', EventoDetailView.as_view(), name='evento-detail'),
    path('criar/', EventoCreateView.as_view(), name='criar-evento'),
    path('<uuid:evento_id>/resumo-inscricao/', evento_resumo_inscricao, name='evento-resumo-inscricao'),
    path('<uuid:evento_id>/avaliacoes/', AvaliacaoListView.as_view(), name='avaliacao-list'),
    path('<uuid:evento_id>/avaliacoes/criar/', AvaliacaoCreateView.as_view(), name='avaliacao-create'),
    path('manage/', ManageEventosView.as_view(), name='manage-eventos'),
    path('manage/<uuid:id>/', EventoRetrieveUpdateView.as_view(), name='manage-evento-detail'),
    path('dashboard/metricas/', dashboard_metricas, name='dashboard-metricas'),
]
