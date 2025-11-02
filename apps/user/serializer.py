from django.contrib.auth import get_user_model, authenticate
from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken

from .models import CustomUser

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    profile_photo = serializers.ImageField(use_url=True, required=False)

    class Meta:
        model = User
        fields = (
            "id",
            "username",
            "email",
            "nome_completo",
            "telefone",
            "cpf",
            "cnpj",
            "data_nascimento",
            "sexo",
            "password",
            "score",
            "profile_photo",
            'tipo_documento',
            'numero_documento',
            'documento_foto',
            'documento_verificado'
        )
        extra_kwargs = {
            "password": {"write_only": True},
        }

    def create(self, validated_data):
        password = validated_data.pop("password", None)
        user = User.objects.create_user(password=password, **validated_data)
        return user

    def validate_numero_documento(self, value):
        value = value.replace('.', '').replace('-', '').replace('/', '').replace(' ', '')
        tipo = self.initial_data.get('tipo_documento')

        if tipo == 'cpf' and len(value) != 11:
            raise serializers.ValidationError("CPF deve ter 11 dígitos.")
        if tipo == 'cnpj' and len(value) != 14:
            raise serializers.ValidationError("CNPJ deve ter 14 dígitos.")

        return value


class CustomTokenSerializer(serializers.Serializer):
    login = serializers.CharField(write_only=True)  # usuário ou email
    password = serializers.CharField(write_only=True)
    access = serializers.CharField(read_only=True)
    refresh = serializers.CharField(read_only=True)

    def validate(self, attrs):
        login = attrs.get('login')
        password = attrs.get('password')
        user = None

        user = authenticate(username=login, password=password)

        if user is None:
            try:
                user_obj = User.objects.get(email=login)
                user = authenticate(username=user_obj.username, password=password)
            except User.DoesNotExist:
                pass

        if user is None:
            raise serializers.ValidationError('Usuário ou senha inválidos')

        refresh = RefreshToken.for_user(user)
        return {
            'access': str(refresh.access_token),
            'refresh': str(refresh)
        }