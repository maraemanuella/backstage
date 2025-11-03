from django.contrib import admin
from django.urls import path
from django.conf import settings
from api.models import (
    CustomUser, Evento, Avaliacao, Inscricao,
    EventoAnalytics, InteracaoSimulador, VisualizacaoEvento,
    WaitlistEntry, TransferRequest, Favorite
)


# Manter o admin padrão do Django
admin.site.site_header = 'Backstage Admin'
admin.site.site_title = 'Backstage'
admin.site.index_title = 'Painel de Administração'


# Preserve original get_urls to avoid recursion
_original_admin_get_urls = admin.site.get_urls

# Registrar URL customizada ao admin padrão
def get_urls_original():
    urls = _original_admin_get_urls()
    custom_urls = [
        path('generate-test-data/', admin.site.admin_view(generate_test_data_view_wrapper), name='generate_test_data'),
    ]
    return custom_urls + urls

admin.site.get_urls = get_urls_original


def generate_test_data_view_wrapper(request):
    """Wrapper para a view de geração de dados"""
    from api.admin_views import generate_test_data_view
    return generate_test_data_view(request)


# Overriding admin index view to inject context flag in development
original_index = admin.site.index

def index_with_flag(request, extra_context=None):
    extra_context = extra_context or {}
    # Mostrar o botão apenas em ambiente de desenvolvimento
    show = getattr(settings, 'DEBUG', False)
    extra_context['show_test_data_button'] = show
    return original_index(request, extra_context=extra_context)

admin.site.index = index_with_flag


@admin.register(CustomUser)
class CustomUserAdmin(admin.ModelAdmin):
    list_display = ['username', 'email', 'get_full_name', 'score', 'documento_verificado', 'is_staff', 'is_active']
    list_filter = ['is_staff', 'is_superuser', 'is_active', 'documento_verificado', 'sexo', 'tipo_documento']
    search_fields = ['username', 'email', 'cpf', 'cnpj', 'first_name', 'last_name']
    readonly_fields = ['last_login', 'date_joined']

    # Organizar campos em grupos lógicos
    fieldsets = (
        ('Credenciais de Acesso', {
            'fields': ('username', 'email'),
            'description': 'Informações de login do usuário'
        }),
        ('Informações Pessoais', {
            'fields': ('first_name', 'last_name', 'telefone', 'data_nascimento', 'sexo'),
            'description': 'Dados pessoais do usuário'
        }),
        ('Documentos e Verificação', {
            'fields': ('tipo_documento', 'numero_documento', 'cpf', 'cnpj', 'documento_foto', 'documento_verificado'),
            'description': 'Documentos de identificação e status de verificação'
        }),
        ('Reputação', {
            'fields': ('score',),
            'description': 'Score de avaliação do usuário (0-5)'
        }),
        ('Foto de Perfil', {
            'fields': ('profile_photo',),
            'classes': ('collapse',),
        }),
        ('Permissões e Status', {
            'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions'),
            'classes': ('collapse',),
            'description': 'Permissões de acesso e grupos do usuário'
        }),
        ('Informações do Sistema', {
            'fields': ('last_login', 'date_joined'),
            'classes': ('collapse',),
            'description': 'Datas e registros automáticos do sistema'
        }),
    )

    def changelist_view(self, request, extra_context=None):
        extra_context = extra_context or {}
        extra_context['title'] = 'Usuários - Clique aqui para Gerar Dados de Teste'
        return super().changelist_view(request, extra_context=extra_context)

    class Media:
        css = {
            'all': []
        }
        js = []

    def get_urls(self):
        urls = super().get_urls()
        return urls


@admin.register(Evento)
class EventoAdmin(admin.ModelAdmin):
    list_display = ['titulo', 'categoria', 'data_evento', 'organizador', 'status', 'inscritos_count', 'vagas_disponiveis', 'created_at']
    list_filter = ['status', 'categoria', 'permite_transferencia', 'created_at']
    search_fields = ['titulo', 'descricao', 'organizador__username', 'endereco']
    date_hierarchy = 'data_evento'
    readonly_fields = ['id', 'created_at', 'updated_at', 'inscritos_count', 'vagas_disponiveis', 'esta_lotado']

    fieldsets = (
        ('Informações Básicas', {
            'fields': ('titulo', 'descricao', 'categoria', 'status'),
        }),
        ('Organizador', {
            'fields': ('organizador',),
        }),
        ('Data e Localização', {
            'fields': ('data_evento', 'endereco', 'local_especifico', 'latitude', 'longitude'),
            'description': 'Informações de quando e onde o evento acontecerá'
        }),
        ('Capacidade e Valores', {
            'fields': ('capacidade_maxima', 'valor_deposito'),
            'description': 'Inscritos e vagas são calculados automaticamente'
        }),
        ('Itens Incluídos', {
            'fields': ('itens_incluidos',),
            'classes': ('collapse',),
            'description': 'Digite um item por linha'
        }),
        ('Políticas', {
            'fields': ('permite_transferencia', 'politica_cancelamento'),
            'classes': ('collapse',),
        }),
        ('Mídia', {
            'fields': ('foto_capa',),
            'classes': ('collapse',),
        }),
        ('Informações do Sistema', {
            'fields': ('id', 'created_at', 'updated_at'),
            'classes': ('collapse',),
        }),
    )


@admin.register(Inscricao)
class InscricaoAdmin(admin.ModelAdmin):
    list_display = ['get_usuario_nome', 'get_evento_titulo', 'status', 'status_pagamento', 'valor_final', 'checkin_realizado', 'created_at']
    list_filter = ['status', 'status_pagamento', 'checkin_realizado', 'metodo_pagamento', 'created_at']
    search_fields = ['usuario__username', 'usuario__email', 'evento__titulo', 'qr_code', 'cpf_inscricao', 'email_inscricao']
    date_hierarchy = 'created_at'
    readonly_fields = ['id', 'qr_code', 'created_at', 'updated_at', 'data_checkin']

    fieldsets = (
        ('Participante e Evento', {
            'fields': ('usuario', 'evento', 'status'),
        }),
        ('Dados do Inscrito', {
            'fields': ('nome_completo_inscricao', 'cpf_inscricao', 'telefone_inscricao', 'email_inscricao'),
            'description': 'Informações da pessoa inscrita'
        }),
        ('Valores', {
            'fields': ('valor_original', 'desconto_aplicado', 'valor_final'),
        }),
        ('Pagamento', {
            'fields': ('metodo_pagamento', 'status_pagamento'),
        }),
        ('Check-in', {
            'fields': ('checkin_realizado', 'data_checkin', 'qr_code'),
        }),
        ('Termos', {
            'fields': ('aceita_termos',),
            'classes': ('collapse',),
        }),
        ('Informações do Sistema', {
            'fields': ('id', 'created_at', 'updated_at'),
            'classes': ('collapse',),
        }),
    )

    def get_usuario_nome(self, obj):
        return obj.usuario.get_full_name() or obj.usuario.username
    get_usuario_nome.short_description = 'Usuário'
    get_usuario_nome.admin_order_field = 'usuario__username'

    def get_evento_titulo(self, obj):
        return obj.evento.titulo
    get_evento_titulo.short_description = 'Evento'
    get_evento_titulo.admin_order_field = 'evento__titulo'


@admin.register(Avaliacao)
class AvaliacaoAdmin(admin.ModelAdmin):
    list_display = ['get_usuario_nome', 'get_evento_titulo', 'nota', 'criado_em']
    list_filter = ['nota', 'criado_em']
    search_fields = ['usuario__username', 'evento__titulo', 'comentario']
    date_hierarchy = 'criado_em'
    readonly_fields = ['criado_em']

    fieldsets = (
        ('Usuário e Evento', {
            'fields': ('usuario', 'evento'),
        }),
        ('Avaliação', {
            'fields': ('nota', 'comentario'),
        }),
        ('Data', {
            'fields': ('criado_em',),
        }),
    )

    def get_usuario_nome(self, obj):
        return obj.usuario.get_full_name() or obj.usuario.username
    get_usuario_nome.short_description = 'Usuário'
    get_usuario_nome.admin_order_field = 'usuario__username'

    def get_evento_titulo(self, obj):
        return obj.evento.titulo
    get_evento_titulo.short_description = 'Evento'
    get_evento_titulo.admin_order_field = 'evento__titulo'


@admin.register(EventoAnalytics)
class EventoAnalyticsAdmin(admin.ModelAdmin):
    list_display = ['evento', 'receita_total', 'custo_total', 'roi', 'total_visualizacoes']
    search_fields = ['evento__titulo']


@admin.register(TransferRequest)
class TransferRequestAdmin(admin.ModelAdmin):
    list_display = ['get_from_user_nome', 'get_to_user_nome', 'get_inscricao_info', 'status', 'created_at']
    list_filter = ['status', 'created_at']
    search_fields = ['from_user__username', 'to_user__username', 'inscricao__evento__titulo']
    date_hierarchy = 'created_at'
    readonly_fields = ['created_at', 'updated_at']

    fieldsets = (
        ('🔄 Transferência', {
            'fields': ('from_user', 'to_user', 'inscricao'),
        }),
        ('📊 Status', {
            'fields': ('status',),
        }),
        ('📅 Datas', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',),
        }),
    )

    def get_from_user_nome(self, obj):
        return obj.from_user.get_full_name() or obj.from_user.username
    get_from_user_nome.short_description = 'De'
    get_from_user_nome.admin_order_field = 'from_user__username'

    def get_to_user_nome(self, obj):
        return obj.to_user.get_full_name() or obj.to_user.username
    get_to_user_nome.short_description = 'Para'
    get_to_user_nome.admin_order_field = 'to_user__username'

    def get_inscricao_info(self, obj):
        return f"{obj.inscricao.evento.titulo}"
    get_inscricao_info.short_description = 'Evento'
    get_inscricao_info.admin_order_field = 'inscricao__evento__titulo'


@admin.register(Favorite)
class FavoriteAdmin(admin.ModelAdmin):
    list_display = ['get_user_nome', 'get_evento_titulo', 'created_at']
    list_filter = ['created_at']
    search_fields = ['user__username', 'evento__titulo']
    date_hierarchy = 'created_at'
    readonly_fields = ['created_at']

    fieldsets = (
        ('Favorito', {
            'fields': ('user', 'evento'),
        }),
        ('Data', {
            'fields': ('created_at',),
        }),
    )

    def get_user_nome(self, obj):
        return obj.user.get_full_name() or obj.user.username
    get_user_nome.short_description = 'Usuário'
    get_user_nome.admin_order_field = 'user__username'

    def get_evento_titulo(self, obj):
        return obj.evento.titulo
    get_evento_titulo.short_description = 'Evento'
    get_evento_titulo.admin_order_field = 'evento__titulo'


@admin.register(WaitlistEntry)
class WaitlistEntryAdmin(admin.ModelAdmin):
    list_display = ['get_usuario_nome', 'get_evento_titulo', 'status', 'created_at', 'notified_at']
    list_filter = ['status', 'created_at']
    search_fields = ['usuario__username', 'evento__titulo']
    date_hierarchy = 'created_at'
    readonly_fields = ['created_at', 'notified_at', 'expires_at']

    fieldsets = (
        ('Participante e Evento', {
            'fields': ('usuario', 'evento', 'inscricao'),
        }),
        ('Status na Lista', {
            'fields': ('status', 'notified_at', 'expires_at'),
        }),
        ('Datas', {
            'fields': ('created_at',),
            'classes': ('collapse',),
        }),
    )

    def get_usuario_nome(self, obj):
        return obj.usuario.get_full_name() or obj.usuario.username
    get_usuario_nome.short_description = 'Usuário'
    get_usuario_nome.admin_order_field = 'usuario__username'

    def get_evento_titulo(self, obj):
        return obj.evento.titulo
    get_evento_titulo.short_description = 'Evento'
    get_evento_titulo.admin_order_field = 'evento__titulo'


@admin.register(InteracaoSimulador)
class InteracaoSimuladorAdmin(admin.ModelAdmin):
    list_display = ['usuario', 'evento', 'tipo_simulador', 'concluiu', 'created_at']
    list_filter = ['tipo_simulador', 'concluiu']


@admin.register(VisualizacaoEvento)
class VisualizacaoEventoAdmin(admin.ModelAdmin):
    list_display = ['evento', 'usuario', 'ip_address', 'created_at']
    list_filter = ['evento']
