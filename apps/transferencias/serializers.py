from rest_framework import serializers
from django.utils import timezone
from datetime import timedelta
from django.contrib.auth import get_user_model

from rest_framework import serializers
from django.utils import timezone
from datetime import timedelta
from django.contrib.auth import get_user_model

from .models import TransferRequest
from apps.inscricoes.models import Inscricao

User = get_user_model()

class TransferRequestSerializer(serializers.ModelSerializer):
    inscricao_id = serializers.UUIDField(write_only=True)
    to_user_id = serializers.PrimaryKeyRelatedField(queryset=User.objects.all(), write_only=True)
    to_user_id_read = serializers.IntegerField(source='to_user.id', read_only=True)
    from_user = serializers.CharField(source='from_user.username', read_only=True)
    to_user = serializers.CharField(source='to_user.username', read_only=True)
    mensagem = serializers.CharField(allow_blank=True, allow_null=True, required=False)
    status = serializers.CharField(read_only=True)

    class Meta:
        model = TransferRequest
        fields = [
            'id',
            'inscricao_id',
            'from_user',
            'to_user_id',
            'to_user_id_read',
            'to_user',
            'mensagem',
            'status',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['id', 'from_user', 'to_user', 'status', 'created_at', 'updated_at']

    def create(self, validated_data):
        inscricao_id = validated_data.pop('inscricao_id')
        to_user = validated_data.pop('to_user_id')
        mensagem = validated_data.pop('mensagem', "")
        from_user = self.context['request'].user
        inscricao = Inscricao.objects.get(id=inscricao_id)

        if not inscricao.evento.permite_transferencia:
            raise serializers.ValidationError("Transferência não permitida para este evento.")
        if inscricao.status != 'confirmada':
            raise serializers.ValidationError("Só inscrições confirmadas podem ser transferidas.")

        agora = timezone.now()
        if inscricao.evento.data_evento - agora < timedelta(hours=24):
            raise serializers.ValidationError("A transferência só pode ser feita com mais de 24h de antecedência do evento.")

        transfer_request = TransferRequest.objects.create(
            inscricao=inscricao,
            from_user=from_user,
            to_user=to_user,
            mensagem=mensagem,
            status='sent'
        )
        return transfer_request

