"""
Serializers do módulo de Favoritos
"""
from rest_framework import serializers
from api.models import Favorite, Evento
from api.events.serializers import EventoSerializer


class FavoriteSerializer(serializers.ModelSerializer):
    """Serializer para favoritos"""
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

