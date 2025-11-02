"""
Admin do módulo de Usuários
"""
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from api.models import CustomUser


class CustomUserAdmin(UserAdmin):
    """Admin customizado para CustomUser"""
    model = CustomUser
    list_display = ('username', 'email', 'is_staff', 'is_active')
    list_filter = ('is_staff', 'is_active')
    fieldsets = (
        (None, {'fields': ('username', 'email', 'password')}),
        ('Informações pessoais', {'fields': ('telefone', 'cpf', 'cnpj', 'data_nascimento', 'sexo', 'score', 'profile_photo')}),
        ('Permissões', {'fields': ('is_staff', 'is_active', 'is_superuser', 'groups', 'user_permissions')}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('username', 'email', 'password1', 'password2', 'is_staff', 'is_active')}
        ),
    )
    search_fields = ('email', 'username')
    ordering = ('email',)


admin.site.register(CustomUser, CustomUserAdmin)
