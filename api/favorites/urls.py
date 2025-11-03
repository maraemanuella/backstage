from django.urls import path
from api.favorites.views import (
    list_favorites,
    toggle_favorite,
)

urlpatterns = [
    path('', list_favorites, name='list_favorites'),
    path('toggle/<uuid:evento_id>/', toggle_favorite, name='toggle_favorite'),
]
