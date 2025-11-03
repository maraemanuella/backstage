from django.urls import path
from api.registrations.views import (
    InscricaoCreateView,
    MinhasInscricoesView,
    inscricao_detalhes,
    realizar_checkin,
    historico_checkin,
)

urlpatterns = [
    path('', InscricaoCreateView.as_view(), name='inscricao-create'),
    path('minhas/', MinhasInscricoesView.as_view(), name='minhas-inscricoes'),
    path('<uuid:inscricao_id>/', inscricao_detalhes, name='inscricao-detail'),
    path('checkin/<uuid:inscricao_id>/', realizar_checkin, name='realizar-checkin'),
    path('historico-checkin/', historico_checkin, name='historico-checkin'),
]
