from rest_framework import serializers
from .models import Evento

class EventoSerializer(serializers.ModelSerializer):
    inscritos_count = serializers.ReadOnlyField()
    vagas_disponiveis = serializers.ReadOnlyField()
    esta_lotado = serializers.ReadOnlyField()
    is_nao_reembolsavel = serializers.ReadOnlyField()

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
            'is_nao_reembolsavel',
        ]
        read_only_fields = [
            'id', 'created_at', 'updated_at',
            'inscritos_count', 'vagas_disponiveis', 'esta_lotado', 'is_nao_reembolsavel',
            'organizador_nome', 'organizador_username', 'organizador_score'
        ]

    def validate(self, data):
        """
        Valida categorias e adiciona automaticamente "Outro" se houver categorias_customizadas
        """
        categorias = data.get('categorias', [])
        categorias_customizadas = data.get('categorias_customizadas', [])
        
        # Validar que categorias é uma lista
        if not isinstance(categorias, list):
            raise serializers.ValidationError({
                'categorias': 'Categorias deve ser uma lista.'
            })
        
        # Validar que categorias_customizadas é uma lista
        if not isinstance(categorias_customizadas, list):
            raise serializers.ValidationError({
                'categorias_customizadas': 'Categorias customizadas deve ser uma lista.'
            })

        # Validar que pelo menos uma categoria foi selecionada OU há categoria customizada
        if not categorias and not categorias_customizadas:
            raise serializers.ValidationError({
                'categorias': 'Selecione pelo menos uma categoria ou adicione uma categoria personalizada.'
            })

        # Se houver categorias customizadas, adicionar "Outro" automaticamente
        if categorias_customizadas and 'Outro' not in categorias:
            categorias.append('Outro')
            data['categorias'] = categorias

        # Validar categorias válidas
        categorias_validas = [choice[0] for choice in Evento.CATEGORIA_CHOICES]
        for cat in categorias:
            if cat not in categorias_validas:
                raise serializers.ValidationError({
                    'categorias': f'Categoria inválida: {cat}'
                })
        
        # Limpar categorias_customizadas se não houver nenhuma
        if not categorias_customizadas and 'Outro' in categorias:
            # Remove "Outro" se não há categorias customizadas
            categorias.remove('Outro')
            data['categorias'] = categorias

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

