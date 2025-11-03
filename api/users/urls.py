from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from api.users.views import (
    CreateUserView,
    CustomTokenObtainView,
    ListUsersView,
    RetrieveUpdateUserView,
    DeleteUserView,
    MeView,
    update_user_profile,
    verificar_documento,
    status_documento,
)

urlpatterns = [
    path('register/', CreateUserView.as_view(), name='register'),
    path('', ListUsersView.as_view(), name='usuario-listar'),
    path('<int:pk>/', RetrieveUpdateUserView.as_view(), name='usuario-detalhe'),
    path('<int:pk>/delete/', DeleteUserView.as_view(), name='usuario-deletar'),
    path('me/', MeView.as_view(), name='me'),
    path('profile/', update_user_profile, name='update-user-profile'),
    path('token/', CustomTokenObtainView.as_view(), name='get_token'),
    path('token/refresh/', TokenRefreshView.as_view(), name='refresh'),
    path('verificar-documento/', verificar_documento, name='verificar-documento'),
    path('status-documento/', status_documento, name='status-documento'),
]
