from django.urls import path
from .views import (
    AvaliacaoListView,
    AvaliacaoCreateView,
)

urlpatterns = [
    path('eventos/<uuid:evento_id>/avaliacoes/', AvaliacaoListView.as_view(), name='avaliacao-list'),
    path('eventos/<uuid:evento_id>/avaliacoes/criar/', AvaliacaoCreateView.as_view(), name='avaliacao-create'),
]

