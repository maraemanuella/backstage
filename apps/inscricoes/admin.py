from django.contrib import admin
from .models import Inscricao

@admin.register(Inscricao)
class InscricaoAdmin(admin.ModelAdmin):
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
        if not change:
            if not obj.valor_original:
                obj.valor_original = obj.evento.valor_deposito
            if not obj.valor_final:
                valor_com_desconto = obj.evento.calcular_valor_com_desconto(obj.usuario)
                obj.valor_final = valor_com_desconto
                obj.desconto_aplicado = obj.valor_original - valor_com_desconto
        super().save_model(request, obj, form, change)

