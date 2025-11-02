from django.urls import path, include
from rest_framework_simplejwt.views import TokenRefreshView
from .views import CustomTokenObtainView

urlpatterns = [
    # JWT
    path('token/', CustomTokenObtainView.as_view(), name='get_token'),
    path('token/refresh/', TokenRefreshView.as_view(), name='refresh'),
    path('api-auth/', include('rest_framework.urls')),
]

