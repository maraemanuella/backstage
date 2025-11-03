from django.contrib import admin
from .models import Notificacao


@admin.register(Notificacao)
class NotificacaoAdmin(admin.ModelAdmin):
    list_display = ['id', 'usuario', 'tipo', 'titulo', 'lida', 'created_at']
    list_filter = ['tipo', 'lida', 'created_at']
    search_fields = ['usuario__username', 'usuario__email', 'titulo', 'mensagem']
    readonly_fields = ['created_at']
    list_per_page = 50
    
    fieldsets = (
        ('Informações Básicas', {
            'fields': ('usuario', 'tipo', 'titulo', 'mensagem')
        }),
        ('Status', {
            'fields': ('lida', 'link')
        }),
        ('Metadata', {
            'fields': ('created_at',)
        }),
    )
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('usuario')
