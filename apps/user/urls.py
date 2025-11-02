from django.urls import path, include
from django.contrib import admin
from rest_framework.permissions import IsAuthenticated, IsAdminUser, AllowAny
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView


from .views import (
    CreateUserView,
    ListUsersView,
    RetrieveUpdateUserView,
    DeleteUserView,
    MeView,
    update_user_profile

)

urlpatterns = [
    path('user/register/', CreateUserView.as_view(), name='register'),
    path('user/', ListUsersView.as_view(), name='usuario-listar'),
    path('user/<int:pk>/', RetrieveUpdateUserView.as_view(), name='usuario-detalhe'),
    path('user/<int:pk>/delete/', DeleteUserView.as_view(), name='usuario-deletar'),
    path("user/me/", MeView.as_view(), name="me"),
    path('user/profile/', update_user_profile, name='update-user-profile'),
]










