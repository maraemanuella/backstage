from django.urls import path
from .views import (
    EventoCreateView,
    EventoListView,
    EventoDetailView,
    ManageEventosView,
    EventoRetrieveUpdateView,
    InscricaoCreateView,
    MinhasInscricoesView,
    evento_resumo_inscricao,
    inscricao_detalhes,
    AvaliacaoListView,
    AvaliacaoCreateView,
)

urlpatterns = [
    # Eventos
    path('eventos/', EventoListView.as_view(), name='evento-list'),
    path('eventos/<uuid:id>/', EventoDetailView.as_view(), name='evento-detail'),
    path('eventos/criar/', EventoCreateView.as_view(), name='criar-evento'),
    path('eventos/<uuid:evento_id>/resumo-inscricao/', evento_resumo_inscricao, name='evento-resumo-inscricao'),

    # Inscrições
    path('inscricoes/', InscricaoCreateView.as_view(), name='inscricao-create'),
    path('inscricoes/minhas/', MinhasInscricoesView.as_view(), name='minhas-inscricoes'),
    path('inscricoes/<uuid:inscricao_id>/', inscricao_detalhes, name='inscricao-detail'),
    # Rotas compatíveis em inglês (frontend utiliza /api/registrations/)
    path('registrations/<uuid:inscricao_id>/', inscricao_detalhes, name='registration-detail'),

    # Avaliações
    path('eventos/<uuid:evento_id>/avaliacoes/', AvaliacaoListView.as_view(), name='avaliacao-list'),
    path('eventos/<uuid:evento_id>/avaliacoes/criar/', AvaliacaoCreateView.as_view(), name='avaliacao-create'),

    # Gerenciar eventos (Organizador)
    path('manage/', ManageEventosView.as_view(), name='manage-eventos'),
    path('manage/eventos/<uuid:id>/', EventoRetrieveUpdateView.as_view(), name='manage-evento-detail'),
]

