from django.urls import path
from . import views

urlpatterns = [
    path('users/', views.UsersListView.as_view(), name='user_management_list'),
    path('users/<int:pk>/', views.UserDetailView.as_view(), name='user_management_detail'),
    path('users/<int:pk>/ban/', views.user_ban_toggle, name='user_management_ban'),
    path('users/<int:pk>/revert-organizer/', views.revert_organizer_status, name='user_management_revert_organizer'),
]
