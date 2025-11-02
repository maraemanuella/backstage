"""
Serializers do módulo de Usuários
"""
from django.contrib.auth import get_user_model
from rest_framework import serializers

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    """Serializer para o modelo CustomUser"""
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
            "is_staff",
            "is_superuser",
            "password",
            "score",
            "profile_photo"
        )
        extra_kwargs = {
            "password": {"write_only": True},
            "is_staff": {"read_only": True},
            "is_superuser": {"read_only": True},
        }

    def create(self, validated_data):
        password = validated_data.pop("password", None)
        user = User.objects.create_user(password=password, **validated_data)
        return user


class DocumentoVerificacaoSerializer(serializers.Serializer):
    """Serializer para verificação de documentos"""
    documento_foto = serializers.ImageField()
    tipo_documento = serializers.ChoiceField(choices=[('cpf', 'CPF'), ('cnpj', 'CNPJ')])

