from django.urls import path, include

urlpatterns = [
    # Autenticação
    path('', include('api.auth.urls')),

    # Usuários
    path('user/', include('api.users.urls')),

    # Eventos
    path('', include('api.events.urls')),

    # Transferências
    path('transfer-requests/', include('api.transfers.urls')),

    # Lista de Espera
    path('waitlist/', include('api.waitlist.urls')),

    # Analytics
    path('', include('api.analytics.urls')),

    # Favoritos
    path('favorites/', include('api.favorites.urls')),

    # Check-in
    path('checkin/', include('api.checkin.urls')),

    # Dashboard
    path('dashboard/', include('api.dashboard.urls')),
]
