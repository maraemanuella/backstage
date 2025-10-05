# Imports do Django
from rest_framework import serializers

# Imports locais
from .models import Avaliacao


class AvaliacaoSerializer(serializers.ModelSerializer):
    """Serializer para avaliações de eventos"""
    usuario_nome = serializers.CharField(source='usuario.username', read_only=True)
    evento_titulo = serializers.CharField(source='evento.titulo', read_only=True)

    class Meta:
        model = Avaliacao
        fields = [
            'id', 'evento', 'evento_titulo', 'usuario', 'usuario_nome', 
            'nota', 'comentario', 'criado_em'
        ]
        read_only_fields = ['id', 'usuario', 'evento', 'criado_em', 'usuario_nome', 'evento_titulo']