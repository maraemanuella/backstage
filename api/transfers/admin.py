"""
Admin do módulo de Transferências
"""
from django.contrib import admin
from api.models import TransferRequest


@admin.register(TransferRequest)
class TransferRequestAdmin(admin.ModelAdmin):
    """Admin para o modelo TransferRequest"""
    list_display = ('inscricao', 'from_user', 'to_user', 'status', 'created_at')
    list_filter = ('status',)

