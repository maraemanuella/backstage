from django.contrib import admin
from .models import Evento

@admin.register(Evento)
class EventoAdmin(admin.ModelAdmin):
    list_display = ('titulo', 'get_categorias_display', 'organizador', 'data_evento', 'capacidade_maxima', 'valor_deposito', 'status')
    list_filter = ('status', 'data_evento', 'permite_transferencia')
    search_fields = ('titulo', 'organizador__username', 'endereco')
    date_hierarchy = 'data_evento'
    
    def get_categorias_display(self, obj):
        """Display categorias as comma-separated string"""
        if obj.categorias:
            cats = ', '.join(obj.categorias)
            if obj.categorias_customizadas:
                custom = ', '.join(obj.categorias_customizadas)
                cats += f' ({custom})'
            return cats
        return '-'
    get_categorias_display.short_description = 'Categorias'

    fieldsets = (
        ('Informações Básicas', {
            'fields': ('titulo', 'descricao', 'categorias', 'categorias_customizadas', 'organizador')
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

