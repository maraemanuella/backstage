from django.contrib import admin
from .models import Avaliacao

@admin.register(Avaliacao)
class AvaliacaoAdmin(admin.ModelAdmin):
    list_display = ('evento', 'usuario', 'nota', 'criado_em')
    list_filter = ('nota', 'criado_em', 'evento')
    search_fields = ('evento__titulo', 'usuario__username', 'comentario')
    date_hierarchy = 'criado_em'

