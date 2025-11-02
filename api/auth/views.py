"""
Views do módulo de Autenticação
"""
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from .serializers import CustomTokenSerializer


class CustomTokenObtainView(APIView):
    """View customizada para obter token JWT (aceita username ou email)"""
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = CustomTokenSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        return Response(serializer.validated_data, status=status.HTTP_200_OK)
from django.contrib.auth import get_user_model, authenticate
from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken

User = get_user_model()


class CustomTokenSerializer(serializers.Serializer):
    """Serializer para autenticação customizada (username ou email)"""
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
        }

