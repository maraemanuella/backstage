from django.urls import path, include
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
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
    path('user/register/', CreateUserView.as_view(), name='register'),
    path('user/', ListUsersView.as_view(), name='usuario-listar'),
    path('user/<int:pk>/', RetrieveUpdateUserView.as_view(), name='usuario-detalhe'),
    path('user/<int:pk>/delete/', DeleteUserView.as_view(), name='usuario-deletar'),
    path("user/me/", MeView.as_view(), name="me"),
    path('user/profile/', update_user_profile, name='update-user-profile'),
    path('token/', CustomTokenObtainView.as_view(), name='get_token'),
    path('token/refresh/', TokenRefreshView.as_view(), name='refresh'),
    path('api-auth/', include('rest_framework.urls')),
    path('verificar-documento/', verificar_documento, name='verificar-documento'),
    path('status-documento/', status_documento, name='status-documento'),
    path('user-management/', include('apps.user_management.urls')),
]

