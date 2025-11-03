"""
URLs principais da API - Estrutura Modular
Cada módulo tem seu próprio arquivo de URLs
"""
from django.urls import path, include
from rest_framework_simplejwt.views import TokenRefreshView
from api.users.views import CustomTokenObtainView

urlpatterns = [
    # Rotas de autenticação (compatibilidade com frontend)
    path('token/', CustomTokenObtainView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # Módulo de Usuários
    path('user/', include('api.users.urls')),

    # Módulo de Eventos
    path('eventos/', include('api.events.urls')),

    # Módulo de Inscrições
    path('inscricoes/', include('api.registrations.urls')),
    # Rotas compatíveis em inglês (frontend utiliza /api/registrations/)
    path('registrations/', include('api.registrations.urls')),

    # Módulo de Analytics
    path('analytics/', include('api.analytics.urls')),

    # Módulo de Waitlist
    path('waitlist/', include('api.waitlist.urls')),

    # Módulo de Transferências
    path('transfer-requests/', include('api.transfers.urls')),

    # Módulo de Favoritos
    path('favorites/', include('api.favorites.urls')),
]



