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
    EventListView,
    EventCreateView,
    EventDetailView,
    RegisterForEventView,
    RegistrationDetailView,
    UserRegistrationsView,
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
    
    # Eventos
    path('events/', EventListView.as_view(), name='event-list'),
    path('events/create/', EventCreateView.as_view(), name='event-create'),
    path('events/<int:pk>/', EventDetailView.as_view(), name='event-detail'),
    
    # Inscrições
    path('events/<int:event_id>/register/', RegisterForEventView.as_view(), name='register-event'),
    path('registrations/<int:registration_id>/', RegistrationDetailView.as_view(), name='registration-detail'),
    path('user/registrations/', UserRegistrationsView.as_view(), name='user-registrations'),
]