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
    EventoDetailView,
    InscricaoCreateView,
    MinhasInscricoesView,
    evento_resumo_inscricao,
    inscricao_detalhes,
)


urlpatterns = [
    # Registro de usuário
    path('user/register/', CreateUserView.as_view(), name='register'),

    # Listagem de usuários (IsAuthenticated)
    path('user/', ListUsersView.as_view(), name='usuario-listar'),

    # Recuperar/Atualizar usuário específico (IsAuthenticated)
    path('user/<int:pk>/', RetrieveUpdateUserView.as_view(), name='usuario-detalhe'),

    # Deletar usuário (IsAdminUser)
    path('user/<int:pk>/delete/', DeleteUserView.as_view(), name='usuario-deletar'),

    # JWT
    path('token/', CustomTokenObtainView.as_view(), name='get_token'),
    path('token/refresh/', TokenRefreshView.as_view(), name='refresh'),
    path('api-auth/', include('rest_framework.urls')),

#     Retorna o usuário logado na sessão
    path("user/me/", MeView.as_view(), name="me"),
    
    # Buscar dados de um evento específico
    path('eventos/<uuid:id>/', EventoDetailView.as_view(), name='evento-detail'),
    # Resumo do evento para tela de inscrição
    path('eventos/<uuid:evento_id>/resumo-inscricao/', evento_resumo_inscricao, name='evento-resumo-inscricao'),
    # Criar nova inscrição
    path('inscricoes/', InscricaoCreateView.as_view(), name='inscricao-create'),
    # Listar minhas inscrições
    path('inscricoes/minhas/', MinhasInscricoesView.as_view(), name='minhas-inscricoes'),
    # Detalhes de uma inscrição específica
    path('inscricoes/<uuid:inscricao_id>/', inscricao_detalhes, name='inscricao-detail'),

]