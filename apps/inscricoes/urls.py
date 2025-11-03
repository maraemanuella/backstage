from django.urls import path
from .views import (
    InscricaoCreateView,
    MinhasInscricoesView,
    inscricao_detalhes,
)

urlpatterns = [
    path('inscricoes/', InscricaoCreateView.as_view(), name='inscricao-create'),
    path('inscricoes/minhas/', MinhasInscricoesView.as_view(), name='minhas-inscricoes'),
    path('inscricoes/<uuid:inscricao_id>/', inscricao_detalhes, name='inscricao-detail'),
    path('registrations/<uuid:inscricao_id>/', inscricao_detalhes, name='registration-detail'),
]

