from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser

class CustomUserAdmin(UserAdmin):
    model = CustomUser
    list_display = ('username', 'email', 'get_full_name', 'tipo_documento', 'documento_verificado', 'is_staff', 'is_active', 'score')
    list_filter = ('is_staff', 'is_active', 'documento_verificado', 'tipo_documento', 'sexo')
    list_editable = ('documento_verificado',)  # Permite editar direto na listagem
    fieldsets = (
        (None, {'fields': ('username', 'email', 'password')}),
        ('Informações Pessoais', {
            'fields': ('first_name', 'last_name', 'telefone', 'cpf', 'cnpj', 'data_nascimento', 'sexo', 'profile_photo')
        }),
        ('Documentação', {
            'fields': ('tipo_documento', 'numero_documento', 'documento_foto', 'documento_verificado'),
            'description': 'Status de verificação: pendente, verificando, aprovado, rejeitado'
        }),
        ('Gamificação', {
            'fields': ('score',)
        }),
        ('Permissões', {
            'fields': ('is_staff', 'is_active', 'is_superuser', 'groups', 'user_permissions')
        }),
        ('Datas Importantes', {
            'fields': ('last_login', 'date_joined')
        }),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('username', 'email', 'password1', 'password2', 'is_staff', 'is_active')}
        ),
    )
    search_fields = ('email', 'username', 'cpf', 'cnpj', 'first_name', 'last_name', 'numero_documento')
    ordering = ('-date_joined',)  # Mais recentes primeiro
    readonly_fields = ('last_login', 'date_joined')
    
    # Ações em massa
    actions = ['aprovar_documentos', 'rejeitar_documentos']
    
    def aprovar_documentos(self, request, queryset):
        updated = queryset.update(documento_verificado='aprovado')
        self.message_user(request, f'{updated} documento(s) aprovado(s) com sucesso.')
    aprovar_documentos.short_description = 'Aprovar documentos selecionados'
    
    def rejeitar_documentos(self, request, queryset):
        updated = queryset.update(documento_verificado='rejeitado')
        self.message_user(request, f'{updated} documento(s) rejeitado(s).')
    rejeitar_documentos.short_description = 'Rejeitar documentos selecionados'

admin.site.register(CustomUser, CustomUserAdmin)

