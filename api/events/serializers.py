from rest_framework import serializers
from api.events.models import Evento, Avaliacao
from django.core.validators import MinValueValidator, MaxValueValidator


class EventoSerializer(serializers.ModelSerializer):
    """Serializer para o modelo Evento"""

    # Campos calculados
    inscritos_count = serializers.ReadOnlyField()
    vagas_disponiveis = serializers.ReadOnlyField()
    esta_lotado = serializers.ReadOnlyField()

    # Informações do organizador
    organizador_nome = serializers.CharField(source='organizador.get_full_name', read_only=True)
    organizador_username = serializers.CharField(source='organizador.username', read_only=True)
    organizador_score = serializers.FloatField(source='organizador.score', read_only=True)

    # URLs das imagens
    foto_capa = serializers.ImageField(use_url=True, required=False)
    latitude = serializers.FloatField(required=False, allow_null=True)
    longitude = serializers.FloatField(required=False, allow_null=True)

    class Meta:
        model = Evento
        fields = [
            'id',
            'titulo',
            'descricao',
            'categoria',
            'data_evento',
            'endereco',
            'local_especifico',
            'capacidade_maxima',
            'valor_deposito',
            'permite_transferencia',
            'politica_cancelamento',
            'foto_capa',
            'status',
            'created_at',
            'updated_at',
            'latitude',
            'longitude',
            # Campos do organizador
            'organizador_nome',
            'organizador_username',
            'organizador_score',
            # Campos calculados
            'inscritos_count',
            'vagas_disponiveis',
            'esta_lotado',
        ]
        read_only_fields = [
            'id', 'created_at', 'updated_at',
            'inscritos_count', 'vagas_disponiveis', 'esta_lotado',
            'organizador_nome', 'organizador_username', 'organizador_score'
        ]

    def create(self, validated_data):
        """Define automaticamente o organizador como o usuário logado"""
        evento = Evento.objects.create(**validated_data)
        return evento

    def to_representation(self, instance):
        """Customiza a representação do evento para incluir valor com desconto"""
        data = super().to_representation(instance)

        # Se houver usuário na requisição, calcula o valor com desconto
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            valor_com_desconto = instance.calcular_valor_com_desconto(request.user)
            desconto_aplicado = instance.valor_deposito - valor_com_desconto

            data['valor_com_desconto'] = valor_com_desconto
            data['desconto_aplicado'] = desconto_aplicado
            data['percentual_desconto'] = (desconto_aplicado / instance.valor_deposito * 100) if instance.valor_deposito > 0 else 0

        return data


class AvaliacaoSerializer(serializers.ModelSerializer):
    usuario_nome = serializers.CharField(source='usuario.username', read_only=True)
    evento_titulo = serializers.CharField(source='evento.titulo', read_only=True)

    class Meta:
        model = Avaliacao
        fields = [
            'id', 'evento', 'evento_titulo', 'usuario', 'usuario_nome', 'nota', 'comentario', 'criado_em'
        ]
        read_only_fields = ['id', 'usuario', 'evento', 'criado_em', 'usuario_nome', 'evento_titulo']

