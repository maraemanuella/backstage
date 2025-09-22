from django.contrib.auth import get_user_model, authenticate
from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    profile_photo = serializers.ImageField(use_url=True, required=False)

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
            "score",
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
        }

from .models import Event, Registration

class EventSerializer(serializers.ModelSerializer):
    current_participants = serializers.ReadOnlyField()
    available_spots = serializers.ReadOnlyField()
    organizer_name = serializers.CharField(source='organizer.username', read_only=True)

    class Meta:
        model = Event
        fields = [
            'id', 'title', 'description', 'start_date', 'end_date', 
            'location', 'price', 'max_participants', 'organizer', 
            'organizer_name', 'organizer_contact', 'current_participants', 
            'available_spots', 'created_at', 'updated_at'
        ]
        read_only_fields = ['organizer', 'created_at', 'updated_at']


class RegistrationSerializer(serializers.ModelSerializer):
    event_title = serializers.CharField(source='event.title', read_only=True)
    event_start_date = serializers.DateTimeField(source='event.start_date', read_only=True)
    event_location = serializers.CharField(source='event.location', read_only=True)
    organizer_contact = serializers.CharField(source='event.organizer_contact', read_only=True)

    class Meta:
        model = Registration
        fields = [
            'id', 'user', 'event', 'registration_date', 'qr_code', 
            'is_active', 'event_title', 'event_start_date', 
            'event_location', 'organizer_contact'
        ]
        read_only_fields = ['user', 'registration_date', 'qr_code']
