from django.urls import path
from .views import (
    CreateUserView,
    ListUsersView,
    RetrieveUpdateUserView,
    DeleteUserView,
    MeView,
    update_user_profile,
    verificar_documento,
    status_documento,
)

urlpatterns = [
    # Registro e listagem
    path('register/', CreateUserView.as_view(), name='register'),
    path('', ListUsersView.as_view(), name='usuario-listar'),
    path('<int:pk>/', RetrieveUpdateUserView.as_view(), name='usuario-detalhe'),
    path('<int:pk>/delete/', DeleteUserView.as_view(), name='usuario-deletar'),
    path('me/', MeView.as_view(), name='me'),
    path('profile/', update_user_profile, name='update-user-profile'),

    # Verificação de documento
    path('verificar-documento/', verificar_documento, name='verificar-documento'),
    path('status-documento/', status_documento, name='status-documento'),
]

