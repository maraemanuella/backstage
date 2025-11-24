from django.urls import path, include
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    CreateUserView,
    CustomTokenObtainView,
    GoogleLoginView,
    ListUsersView,
    RetrieveUpdateUserView,
    DeleteUserView,
    MeView,
    update_user_profile,
    verificar_documento,
    status_documento,
    listar_verificacoes_pendentes,
    aprovar_verificacao,
    rejeitar_verificacao,
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
    path('auth/google/', GoogleLoginView.as_view(), name='google_login'),
    path('verificar-documento/', verificar_documento, name='verificar-documento'),
    path('status-documento/', status_documento, name='status-documento'),
    path('user-management/', include('apps.user_management.urls')),
    
    # Admin verification endpoints
    path('admin/verificacoes/pendentes/', listar_verificacoes_pendentes, name='listar-verificacoes-pendentes'),
    path('admin/verificacoes/<int:user_id>/aprovar/', aprovar_verificacao, name='aprovar-verificacao'),
    path('admin/verificacoes/<int:user_id>/rejeitar/', rejeitar_verificacao, name='rejeitar-verificacao'),
]

