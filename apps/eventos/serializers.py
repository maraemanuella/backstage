from rest_framework import serializers
from .models import Evento

class EventoSerializer(serializers.ModelSerializer):
    inscritos_count = serializers.ReadOnlyField()
    vagas_disponiveis = serializers.ReadOnlyField()
    esta_lotado = serializers.ReadOnlyField()

    organizador_nome = serializers.CharField(source='organizador.get_full_name', read_only=True)
    organizador_username = serializers.CharField(source='organizador.username', read_only=True)
    organizador_score = serializers.FloatField(source='organizador.score', read_only=True)

    foto_capa = serializers.ImageField(use_url=True, required=False)
    latitude = serializers.FloatField(required=False, allow_null=True)
    longitude = serializers.FloatField(required=False, allow_null=True)


    class Meta:
        model = Evento
        fields = [
            'id',
            'titulo',
            'descricao',
            'categorias',
            'categorias_customizadas',
            'itens_incluidos',
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
            'organizador_nome',
            'organizador_username',
            'organizador_score',
            'inscritos_count',
            'vagas_disponiveis',
            'esta_lotado',
        ]
        read_only_fields = [
            'id', 'created_at', 'updated_at',
            'inscritos_count', 'vagas_disponiveis', 'esta_lotado',
            'organizador_nome', 'organizador_username', 'organizador_score'
        ]

    def validate(self, data):
        """
        Valida se categorias_customizadas foi fornecida quando 'Outro' está nas categorias
        """
        categorias = data.get('categorias', [])
        categorias_customizadas = data.get('categorias_customizadas', [])
        
        # Validar que categorias é uma lista
        if not isinstance(categorias, list):
            raise serializers.ValidationError({
                'categorias': 'Categorias deve ser uma lista.'
            })
        
        # Validar que pelo menos uma categoria foi selecionada
        if not categorias:
            raise serializers.ValidationError({
                'categorias': 'Selecione pelo menos uma categoria.'
            })
        
        # Validar categorias válidas
        categorias_validas = [choice[0] for choice in Evento.CATEGORIA_CHOICES]
        for cat in categorias:
            if cat not in categorias_validas:
                raise serializers.ValidationError({
                    'categorias': f'Categoria inválida: {cat}'
                })
        
        # Validar que categorias_customizadas é uma lista
        if not isinstance(categorias_customizadas, list):
            raise serializers.ValidationError({
                'categorias_customizadas': 'Categorias customizadas deve ser uma lista.'
            })
        
        # Se 'Outro' estiver selecionado, pelo menos uma categoria customizada é obrigatória
        if 'Outro' in categorias and not categorias_customizadas:
            raise serializers.ValidationError({
                'categorias_customizadas': 'Adicione pelo menos uma categoria personalizada quando "Outro" é selecionado.'
            })
        
        # Limpar categorias_customizadas se 'Outro' não estiver selecionado
        if 'Outro' not in categorias and categorias_customizadas:
            data['categorias_customizadas'] = []
        
        # Converter itens_incluidos de lista para string se necessário
        itens = data.get('itens_incluidos', [])
        if isinstance(itens, list):
            data['itens_incluidos'] = '\n'.join(itens)

        return data

    def create(self, validated_data):
        evento = Evento.objects.create(**validated_data)
        return evento


    def to_representation(self, instance):
        data = super().to_representation(instance)

        request = self.context.get('request')
        if request and request.user.is_authenticated:
            valor_com_desconto = instance.calcular_valor_com_desconto(request.user)
            desconto_aplicado = instance.valor_deposito - valor_com_desconto

            data['valor_com_desconto'] = valor_com_desconto
            data['desconto_aplicado'] = desconto_aplicado
            data['percentual_desconto'] = (desconto_aplicado / instance.valor_deposito * 100) if instance.valor_deposito > 0 else 0

        return data

