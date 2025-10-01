from django.urls import path, include
from django.contrib import admin
from rest_framework.permissions import IsAuthenticated, IsAdminUser, AllowAny
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from .views import (
    CreateUserView,
    CustomTokenObtainView,
    ListUsersView,
    RetrieveUpdateUserView,
    DeleteUserView,
    MeView,
    EventoListView,
    EventoDetailView,
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

    # Registro de usuário
    path('user/register/', CreateUserView.as_view(), name='register'),
    path('user/', ListUsersView.as_view(), name='usuario-listar'),
    path('user/<int:pk>/', RetrieveUpdateUserView.as_view(), name='usuario-detalhe'),
    path('user/<int:pk>/delete/', DeleteUserView.as_view(), name='usuario-deletar'),
    path("user/me/", MeView.as_view(), name="me"),

    # JWT
    path('token/', CustomTokenObtainView.as_view(), name='get_token'),
    path('token/refresh/', TokenRefreshView.as_view(), name='refresh'),
    path('api-auth/', include('rest_framework.urls')),

    # Inscrições
    path('eventos/<uuid:evento_id>/resumo-inscricao/', evento_resumo_inscricao, name='evento-resumo-inscricao'),
    path('inscricoes/', InscricaoCreateView.as_view(), name='inscricao-create'),
    path('inscricoes/minhas/', MinhasInscricoesView.as_view(), name='minhas-inscricoes'),
    path('inscricoes/<uuid:inscricao_id>/', inscricao_detalhes, name='inscricao-detail'),

    # Avaliações
    path('eventos/<uuid:evento_id>/avaliacoes/', AvaliacaoListView.as_view(), name='avaliacao-list'),
    path('eventos/<uuid:evento_id>/avaliacoes/criar/', AvaliacaoCreateView.as_view(), name='avaliacao-create'),
]
