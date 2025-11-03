from django.contrib import admin
from api.models import (
    CustomUser, Evento, Avaliacao, Inscricao,
    EventoAnalytics, InteracaoSimulador, VisualizacaoEvento,
    WaitlistEntry, TransferRequest, Favorite
)


@admin.register(CustomUser)
class CustomUserAdmin(admin.ModelAdmin):
    list_display = ['username', 'email', 'score', 'is_staff', 'documento_verificado']
    list_filter = ['is_staff', 'is_superuser', 'documento_verificado']
    search_fields = ['username', 'email', 'cpf']


@admin.register(Evento)
class EventoAdmin(admin.ModelAdmin):
    list_display = ['titulo', 'categoria', 'data_evento', 'organizador', 'status', 'inscritos_count']
    list_filter = ['status', 'categoria']
    search_fields = ['titulo', 'descricao']
    date_hierarchy = 'data_evento'


@admin.register(Inscricao)
class InscricaoAdmin(admin.ModelAdmin):
    list_display = ['usuario', 'evento', 'status', 'valor_final', 'checkin_realizado', 'created_at']
    list_filter = ['status', 'status_pagamento', 'checkin_realizado']
    search_fields = ['usuario__username', 'evento__titulo', 'qr_code']
    date_hierarchy = 'created_at'


@admin.register(Avaliacao)
class AvaliacaoAdmin(admin.ModelAdmin):
    list_display = ['usuario', 'evento', 'nota', 'criado_em']
    list_filter = ['nota']
    search_fields = ['usuario__username', 'evento__titulo']


@admin.register(EventoAnalytics)
class EventoAnalyticsAdmin(admin.ModelAdmin):
    list_display = ['evento', 'receita_total', 'custo_total', 'roi', 'total_visualizacoes']
    search_fields = ['evento__titulo']


@admin.register(TransferRequest)
class TransferRequestAdmin(admin.ModelAdmin):
    list_display = ['from_user', 'to_user', 'inscricao', 'status', 'created_at']
    list_filter = ['status']


@admin.register(Favorite)
class FavoriteAdmin(admin.ModelAdmin):
    list_display = ['user', 'evento', 'created_at']


@admin.register(WaitlistEntry)
class WaitlistEntryAdmin(admin.ModelAdmin):
    list_display = ['usuario', 'evento', 'status', 'created_at']
    list_filter = ['status']


@admin.register(InteracaoSimulador)
class InteracaoSimuladorAdmin(admin.ModelAdmin):
    list_display = ['usuario', 'evento', 'tipo_simulador', 'concluiu', 'created_at']
    list_filter = ['tipo_simulador', 'concluiu']


@admin.register(VisualizacaoEvento)
class VisualizacaoEventoAdmin(admin.ModelAdmin):
    list_display = ['evento', 'usuario', 'ip_address', 'created_at']
    list_filter = ['evento']
from django.apps import AppConfig


class ApiConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'api'
    verbose_name = 'API Backstage'

