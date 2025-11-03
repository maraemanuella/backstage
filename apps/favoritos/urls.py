from django.urls import path
from .views import list_favorites, toggle_favorite

urlpatterns = [
    path('favorites/', list_favorites, name='list_favorites'),
    path('favorites/toggle/<uuid:evento_id>/', toggle_favorite, name='toggle_favorite'),
]

