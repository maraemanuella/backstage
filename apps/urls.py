from django.urls import path
from apps.eventos.views import (
    EventoCreateView,
    EventoListView,
    EventoDetailView,
    evento_resumo_inscricao,
    ManageEventosView,
    EventoRetrieveUpdateView,
)

urlpatterns = [
    path('eventos/', EventoListView.as_view(), name='evento-list'),
    path('eventos/<uuid:id>/', EventoDetailView.as_view(), name='evento-detail'),
    path('eventos/criar/', EventoCreateView.as_view(), name='criar-evento'),
    path('eventos/<uuid:evento_id>/resumo-inscricao/', evento_resumo_inscricao, name='evento-resumo-inscricao'),
    path('manage/', ManageEventosView.as_view(), name='manage-eventos'),
    path('manage/eventos/<uuid:id>/', EventoRetrieveUpdateView.as_view(), name='manage-evento-detail'),
]

