from django.urls import path
from .views import (
    TransferRequestCreateView,
    TransferRequestListView,
    TransferRequestDetailView,
)

urlpatterns = [
    path('', TransferRequestListView.as_view(), name='transfer-request-list'),
    path('create/', TransferRequestCreateView.as_view(), name='transfer-request-create'),
    path('<int:pk>/', TransferRequestDetailView.as_view(), name='transfer-request-detail'),
]
"""
Módulo de Transferências de Inscrições
"""

