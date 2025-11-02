"""
Admin do módulo de Eventos, Inscrições e Avaliações
"""
from django.contrib import admin
from api.models import Evento, Inscricao, Avaliacao


@admin.register(Evento)
class EventoAdmin(admin.ModelAdmin):
    """Admin para o modelo Evento"""
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


@admin.register(Inscricao)
class InscricaoAdmin(admin.ModelAdmin):
    """Admin para o modelo Inscricao"""
    list_display = ('nome_completo_inscricao', 'cpf_inscricao', 'evento', 'status', 'valor_final', 'metodo_pagamento', 'checkin_realizado', 'created_at')
    list_filter = ('status', 'metodo_pagamento', 'status_pagamento', 'checkin_realizado', 'created_at')
    search_fields = ('nome_completo_inscricao', 'cpf_inscricao', 'telefone_inscricao', 'email_inscricao', 'evento__titulo')
    date_hierarchy = 'created_at'

    fieldsets = (
        ('Dados da Inscrição', {
            'fields': ('nome_completo_inscricao', 'cpf_inscricao', 'telefone_inscricao', 'email_inscricao')
        }),
        ('Relacionamentos', {
            'fields': ('usuario', 'evento')
        }),
        ('Status', {
            'fields': ('status', 'status_pagamento')
        }),
        ('Valores', {
            'fields': ('valor_original', 'desconto_aplicado', 'valor_final')
        }),
        ('Pagamento', {
            'fields': ('metodo_pagamento',)
        }),
        ('Check-in', {
            'fields': ('checkin_realizado', 'data_checkin', 'qr_code')
        }),
        ('Termos', {
            'fields': ('aceita_termos',)
        }),
    )

    readonly_fields = ('qr_code', 'created_at', 'updated_at')

    def save_model(self, request, obj, form, change):
        """Calcula valores automaticamente ao criar"""
        if not change:
            if not obj.valor_original:
                obj.valor_original = obj.evento.valor_deposito
            if not obj.valor_final:
                valor_com_desconto = obj.evento.calcular_valor_com_desconto(obj.usuario)
                obj.valor_final = valor_com_desconto
                obj.desconto_aplicado = obj.valor_original - valor_com_desconto
        super().save_model(request, obj, form, change)


@admin.register(Avaliacao)
class AvaliacaoAdmin(admin.ModelAdmin):
    """Admin para o modelo Avaliacao"""
    list_display = ('evento', 'usuario', 'nota', 'criado_em')
    list_filter = ('nota', 'criado_em', 'evento')
    search_fields = ('evento__titulo', 'usuario__username', 'comentario')
    date_hierarchy = 'criado_em'

