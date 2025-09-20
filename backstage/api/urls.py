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

]
