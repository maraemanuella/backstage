from django.contrib import admin
from .models import Evento

@admin.register(Evento)
class EventoAdmin(admin.ModelAdmin):
    list_display = ('titulo', 'categoria', 'organizador', 'data_evento', 'capacidade_maxima', 'valor_deposito', 'status')
    list_filter = ('categoria', 'status', 'data_evento', 'permite_transferencia')
    search_fields = ('titulo', 'organizador__username', 'endereco')
    date_hierarchy = 'data_evento'

    fieldsets = (
        ('Informações Básicas', {
            'fields': ('titulo', 'descricao', 'categoria', 'organizador')
        }),
        ('Data e Local', {
                'fields': ('data_evento', 'endereco', 'local_especifico', 'latitude', 'longitude')
        }),
        ('Capacidade e Financeiro', {
            'fields': ('capacidade_maxima', 'valor_deposito')
        }),
        ('Políticas', {
            'fields': ('permite_transferencia', 'politica_cancelamento')
        }),
        ('Mídia e Status', {
            'fields': ('foto_capa', 'status')
        }),
        ('Benefícios', {
            'fields': ('itens_incluidos',)
        }),
    )

