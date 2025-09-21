from django.contrib import admin
from django.urls import path, include
from api.views import CreateUserView, CustomTokenObtainView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView


urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('api.urls')),
]