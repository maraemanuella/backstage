from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser

class CustomUserAdmin(UserAdmin):
    model = CustomUser
    list_display = ('username', 'email', 'is_staff', 'is_active', 'documento_verificado', 'score')
    list_filter = ('is_staff', 'is_active', 'documento_verificado', 'sexo')
    fieldsets = (
        (None, {'fields': ('username', 'email', 'password')}),
        ('Informações Pessoais', {
            'fields': ('first_name', 'last_name', 'telefone', 'cpf', 'cnpj', 'data_nascimento', 'sexo', 'profile_photo')
        }),
        ('Documentação', {
            'fields': ('tipo_documento', 'numero_documento', 'documento_foto', 'documento_verificado')
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
    search_fields = ('email', 'username', 'cpf', 'cnpj')
    ordering = ('email',)
    readonly_fields = ('last_login', 'date_joined')

admin.site.register(CustomUser, CustomUserAdmin)

