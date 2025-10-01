# Imports do Django
from django.contrib import admin

# Imports locais
from .models import Avaliacao


@admin.register(Avaliacao)
class AvaliacaoAdmin(admin.ModelAdmin):
    """Admin para o modelo Avaliacao"""
    list_display = ['evento', 'usuario', 'nota', 'criado_em']
    list_filter = ['nota', 'criado_em']
    search_fields = ['evento__titulo', 'usuario__username', 'comentario']
    readonly_fields = ['criado_em']
    ordering = ['-criado_em']
