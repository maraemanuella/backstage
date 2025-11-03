from django.contrib import admin
from .models import TransferRequest

@admin.register(TransferRequest)
class TransferRequestAdmin(admin.ModelAdmin):
    list_display = ('inscricao', 'from_user', 'to_user', 'status', 'created_at')
    list_filter = ('status',)

