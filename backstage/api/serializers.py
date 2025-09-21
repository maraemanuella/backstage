from django.contrib.auth import get_user_model, authenticate
from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    profile_photo = serializers.ImageField(use_url=True)

    class Meta:
        model = User
        fields = (
            "id",
            "username",
            "email",
            "telefone",
            "cpf",
            "cnpj",
            "data_nascimento",
            "sexo",
            "password",
            "profile_photo"
        )
        extra_kwargs = {
            "password": {"write_only": True},
        }

    def create(self, validated_data):
        password = validated_data.pop("password", None)
        user = User.objects.create_user(password=password, **validated_data)
        return user


class CustomTokenSerializer(serializers.Serializer):
    login = serializers.CharField(write_only=True)  # usuário ou email
    password = serializers.CharField(write_only=True)
    access = serializers.CharField(read_only=True)
    refresh = serializers.CharField(read_only=True)

    def validate(self, attrs):
        login = attrs.get('login')
        password = attrs.get('password')
        user = None

        # Primeiro tenta autenticar pelo username
        user = authenticate(username=login, password=password)

        # Se falhar, tenta pelo email
        if user is None:
            try:
                user_obj = User.objects.get(email=login)
                user = authenticate(username=user_obj.username, password=password)
            except User.DoesNotExist:
                pass

        if user is None:
            raise serializers.ValidationError('Usuário ou senha inválidos')

        # Gera tokens
        refresh = RefreshToken.for_user(user)
        return {
            'access': str(refresh.access_token),
            'refresh': str(refresh)
