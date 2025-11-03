from rest_framework import serializers
from .models import Favorite
from apps.eventos.serializers import EventoSerializer
from apps.eventos.models import Evento

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

