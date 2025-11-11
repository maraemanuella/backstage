from django.contrib import admin
from .models import EventoAnalytics, InteracaoSimulador, VisualizacaoEvento

@admin.register(EventoAnalytics)
class EventoAnalyticsAdmin(admin.ModelAdmin):
    list_display = ('evento', 'receita_total', 'custo_total', 'roi', 'total_visualizacoes', 'updated_at')
    list_filter = ('updated_at',)
    search_fields = ('evento__titulo',)
    readonly_fields = ('updated_at',)
    fieldsets = (
        ('Evento', {
            'fields': ('evento',)
        }),
        ('Financeiro', {
            'fields': ('receita_total', 'custo_total', 'roi')
        }),
        ('Engajamento', {
            'fields': ('total_visualizacoes', 'visualizacoes_unicas', 'total_interacoes_simulador', 'tempo_medio_simulador')
        }),
        ('Metadados', {
            'fields': ('updated_at',)
        }),
    )


@admin.register(InteracaoSimulador)
class InteracaoSimuladorAdmin(admin.ModelAdmin):
    list_display = ('usuario', 'evento', 'tipo_simulador', 'duracao_segundos', 'concluiu', 'created_at')
    list_filter = ('tipo_simulador', 'concluiu', 'created_at')
    search_fields = ('usuario__username', 'evento__titulo', 'tipo_simulador')
    date_hierarchy = 'created_at'
    readonly_fields = ('created_at',)


@admin.register(VisualizacaoEvento)
class VisualizacaoEventoAdmin(admin.ModelAdmin):
    list_display = ('usuario', 'evento', 'ip_address', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('usuario__username', 'evento__titulo', 'ip_address')
    date_hierarchy = 'created_at'
    readonly_fields = ('created_at', 'user_agent')

