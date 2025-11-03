from rest_framework import serializers
from api.favorites.models import Favorite
from api.events.serializers import EventoSerializer
from api.events.models import Evento


class FavoriteSerializer(serializers.ModelSerializer):
    evento = EventoSerializer(read_only=True)
    evento_id = serializers.UUIDField(write_only=True)
    user = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = Favorite
        fields = ["id", "user", "evento", "evento_id"]

    def create(self, validated_data):
        user = self.context['request'].user
        evento_id = validated_data.pop('evento_id')
        evento = Evento.objects.get(id=evento_id)
        favorite, created = Favorite.objects.get_or_create(user=user, evento=evento)
        return favorite
from rest_framework import serializers
from api.analytics.models import EventoAnalytics, InteracaoSimulador, VisualizacaoEvento


class EventoAnalyticsSerializer(serializers.ModelSerializer):
    """Serializer para dados analíticos do evento"""

    evento_titulo = serializers.CharField(source='evento.titulo', read_only=True)

    class Meta:
        model = EventoAnalytics
        fields = [
            'evento',
            'evento_titulo',
            'custo_total',
            'receita_total',
            'roi',
            'total_visualizacoes',
            'total_interacoes_simulador',
            'updated_at',
        ]
        read_only_fields = ['evento', 'updated_at']


class InteracaoSimuladorSerializer(serializers.ModelSerializer):
    """Serializer para interações com simuladores"""

    usuario_nome = serializers.CharField(source='usuario.username', read_only=True)
    evento_titulo = serializers.CharField(source='evento.titulo', read_only=True)

    class Meta:
        model = InteracaoSimulador
        fields = [
            'id',
            'evento',
            'evento_titulo',
            'usuario',
            'usuario_nome',
            'tipo_simulador',
            'duracao_segundos',
            'concluiu',
            'created_at',
        ]
        read_only_fields = ['id', 'created_at']


class VisualizacaoEventoSerializer(serializers.ModelSerializer):
    """Serializer para visualizações de eventos"""

    usuario_nome = serializers.CharField(source='usuario.username', read_only=True)
    evento_titulo = serializers.CharField(source='evento.titulo', read_only=True)

    class Meta:
        model = VisualizacaoEvento
        fields = [
            'id',
            'evento',
            'evento_titulo',
            'usuario',
            'usuario_nome',
            'ip_address',
            'user_agent',
            'created_at',
        ]
        read_only_fields = ['id', 'created_at']

