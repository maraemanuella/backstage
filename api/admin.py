import os
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.contrib.auth.forms import UserCreationForm, UserChangeForm
from django.utils.html import format_html
from apps.user.models import CustomUser

ADMIN_DEBUG = os.getenv('ADMIN_DEBUG', 'False').lower() == 'true'


class CustomUserCreationForm(UserCreationForm):
    class Meta:
        model = CustomUser
        fields = '__all__'


class CustomUserChangeForm(UserChangeForm):
    class Meta:
        model = CustomUser
        fields = '__all__'


class CustomUserAdmin(UserAdmin):
    model = CustomUser
    form = CustomUserChangeForm
    add_form = CustomUserCreationForm

    def senha_oculta(self, obj):
        return format_html("<i>(Senha oculta — use 'Alterar senha' para redefinir)</i>")
    senha_oculta.short_description = "Senha"

    def get_queryset(self, request):
        qs = super().get_queryset(request)
        if not request.user.is_superuser:
            return qs.exclude(is_superuser=True)
        return qs

    def get_readonly_fields(self, request, obj=None):
        if request.user.is_superuser:
            return super().get_readonly_fields(request, obj) + ('senha_oculta',)

        if obj:
            if obj.is_staff and obj != request.user:
                return [f.name for f in self.model._meta.get_fields() if f.name != 'email']
            if not obj.is_staff:
                return [f.name for f in self.model._meta.get_fields() if f.name != 'score'] + ['senha_oculta']
            if obj == request.user:
                return [f.name for f in self.model._meta.get_fields() if f.name in ('is_staff', 'is_superuser', 'groups', 'user_permissions', 'password')] + ['senha_oculta']
        return ('senha_oculta',)

    def get_fieldsets(self, request, obj=None):
        if request.user.is_superuser:
            return super().get_fieldsets(request, obj)

        if obj:
            if obj.is_staff and obj != request.user:
                return (
                    (None, {'fields': ('email',)}),
                )
            if obj == request.user:
                return (
                    (None, {'fields': ('username', 'email', 'telefone', 'cpf', 'cnpj', 'data_nascimento', 'sexo', 'profile_photo')}),
                )
            return (
                (None, {'fields': ('username', 'email', 'telefone', 'cpf', 'cnpj', 'data_nascimento', 'sexo', 'score', 'profile_photo')}),
            )

        return (
            (None, {
                'classes': ('wide',),
                'fields': ('username', 'email', 'password1', 'password2'),
            }),
            ('Informações pessoais', {
                'fields': (
                    'telefone',
                    'cpf',
                    'cnpj',
                    'data_nascimento',
                    'sexo',
                    'score',
                    'profile_photo',
                )
            }),
            ('Documentos', {
                'fields': (
                    'tipo_documento',
                    'numero_documento',
                    'documento_foto',
                    'documento_verificado',
                )
            }),
        )

    def get_add_fieldsets(self, request):
        if request.user.is_superuser:
            return self.add_fieldsets

        return (
            (None, {
                'classes': ('wide',),
                'fields': ('username', 'email', 'password1', 'password2'),
            }),
            ('Informações pessoais', {
                'fields': (
                    'telefone',
                    'cpf',
                    'cnpj',
                    'data_nascimento',
                    'sexo',
                    'score',
                    'profile_photo',
                )
            }),
            ('Documentos', {
                'fields': (
                    'tipo_documento',
                    'numero_documento',
                    'documento_foto',
                    'documento_verificado',
                )
            }),
        )

    def save_model(self, request, obj, form, change):
        if not request.user.is_superuser and obj != request.user:
            obj.is_staff = False
            obj.is_superuser = False
        super().save_model(request, obj, form, change)

    def has_view_permission(self, request, obj=None):
        if obj and obj.is_superuser and not request.user.is_superuser:
            return False
        return super().has_view_permission(request, obj)

    def has_change_permission(self, request, obj=None):
        if request.user.is_superuser:
            return True
        if obj:
            if obj.is_superuser:
                return False
            if obj.is_staff and obj != request.user:
                return False
            return True
        return True

    def has_delete_permission(self, request, obj=None):
        if not request.user.is_superuser:
            if obj and obj == request.user:
                return False
            return False
        return super().has_delete_permission(request, obj)

    def has_add_permission(self, request):
        return True

    list_display = ('username', 'email', 'is_staff', 'is_active')
    list_filter = ('is_staff', 'is_active')

    fieldsets = (
        (None, {'fields': ('username', 'email', 'senha_oculta')}),
        ('Informações pessoais', {
            'fields': (
                'nome_completo',
                'data_nascimento',
                'cpf',
                'cnpj',
                'telefone',
                'sexo',
                'score',
                'profile_photo',
            )
        }),
        ('Documentos', {
            'fields': (
                'tipo_documento',
                'numero_documento',
                'documento_foto',
                'documento_verificado',
            )
        }),
        ('Permissões', {
            'fields': (
                'is_staff',
                'is_active',
                'is_superuser',
                'groups',
                'user_permissions',
            )
        }),
    )

    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('username', 'email', 'password1', 'password2'),
        }),
        ('Informações pessoais', {
            'fields': (
                'telefone',
                'cpf',
                'cnpj',
                'data_nascimento',
                'sexo',
                'score',
                'profile_photo',
            )
        }),
        ('Documentos', {
            'fields': (
                'tipo_documento',
                'numero_documento',
                'documento_foto',
                'documento_verificado',
            )
        }),
        ('Permissões', {
            'fields': ('is_staff', 'is_active', 'is_superuser'),
        }),
    )

    search_fields = ('email', 'username')
    ordering = ('email',)
    filter_horizontal = ('groups', 'user_permissions')


admin.site.register(CustomUser, CustomUserAdmin)
