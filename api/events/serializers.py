"""
Serializers do módulo de Eventos, Inscrições e Avaliações
"""
from rest_framework import serializers
from api.models import Evento, Inscricao, Avaliacao
from io import BytesIO
import base64


class AvaliacaoSerializer(serializers.ModelSerializer):
    """Serializer para avaliações/comentários de eventos"""
    usuario_nome = serializers.CharField(source='usuario.username', read_only=True)
    evento_titulo = serializers.CharField(source='evento.titulo', read_only=True)

    class Meta:
        model = Avaliacao
        fields = [
            'id', 'evento', 'evento_titulo', 'usuario', 'usuario_nome', 'nota', 'comentario', 'criado_em'
        ]
        read_only_fields = ['id', 'usuario', 'evento', 'criado_em', 'usuario_nome', 'evento_titulo']


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
            'itens_incluidos',
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


class InscricaoCreateSerializer(serializers.ModelSerializer):
    """Serializer para criar uma nova inscrição"""

    class Meta:
        model = Inscricao
        fields = [
            'evento',
            'nome_completo_inscricao',
            'cpf_inscricao',
            'telefone_inscricao',
            'email_inscricao',
            'metodo_pagamento',
            'aceita_termos',
        ]

    def validate(self, attrs):
        """Validações"""
        evento = attrs.get('evento')
        usuario = self.context['request'].user

        # Verifica se já está inscrito
        if Inscricao.objects.filter(usuario=usuario, evento=evento).exists():
            raise serializers.ValidationError("Você já está inscrito neste evento.")

        # Verifica se o evento não está lotado
        if evento.esta_lotado:
            raise serializers.ValidationError("Este evento está lotado.")

        # Verifica se aceita os termos
        if not attrs.get('aceita_termos'):
            raise serializers.ValidationError("Você deve aceitar os termos para se inscrever.")

        # Validação de CPF
        cpf = attrs.get('cpf_inscricao', '').replace('.', '').replace('-', '')
        if len(cpf) != 11 or not cpf.isdigit():
            raise serializers.ValidationError("CPF deve ter 11 dígitos.")
        attrs['cpf_inscricao'] = cpf

        return attrs

    def create(self, validated_data):
        """Cria a inscrição com os cálculos automáticos"""
        usuario = self.context['request'].user
        evento = validated_data['evento']

        # Calcula valores
        valor_original = evento.valor_deposito
        valor_com_desconto = evento.calcular_valor_com_desconto(usuario)
        desconto_aplicado = valor_original - valor_com_desconto

        # Cria a inscrição
        inscricao = Inscricao.objects.create(
            usuario=usuario,
            evento=evento,
            nome_completo_inscricao=validated_data['nome_completo_inscricao'],
            cpf_inscricao=validated_data['cpf_inscricao'],
            telefone_inscricao=validated_data['telefone_inscricao'],
            email_inscricao=validated_data['email_inscricao'],
            metodo_pagamento=validated_data['metodo_pagamento'],
            aceita_termos=validated_data['aceita_termos'],
            valor_original=valor_original,
            desconto_aplicado=desconto_aplicado,
            valor_final=valor_com_desconto,
            status='confirmada',
            status_pagamento='aprovado'
        )

        return inscricao


class InscricaoSerializer(serializers.ModelSerializer):
    """Serializer completo para visualizar inscrições"""
    # Dados do evento
    evento_id = serializers.UUIDField(source='evento.id', read_only=True)
    evento_titulo = serializers.CharField(source='evento.titulo', read_only=True)
    evento_data = serializers.DateTimeField(source='evento.data_evento', read_only=True)
    evento_endereco = serializers.CharField(source='evento.endereco', read_only=True)
    evento_local_especifico = serializers.CharField(source='evento.local_especifico', read_only=True)
    evento_foto_capa = serializers.ImageField(source='evento.foto_capa', read_only=True)
    organizador_nome = serializers.CharField(source='evento.organizador.get_full_name', read_only=True)
    organizador_telefone = serializers.CharField(source='evento.organizador.telefone', read_only=True)

    # Dados do usuário
    usuario_nome = serializers.CharField(source='usuario.get_full_name', read_only=True)
    usuario_username = serializers.CharField(source='usuario.username', read_only=True)
    usuario_email = serializers.CharField(source='usuario.email', read_only=True)

    # Campos calculados
    reembolso_estimado = serializers.SerializerMethodField()
    qr_code_image = serializers.SerializerMethodField()

    class Meta:
        model = Inscricao
        fields = [
            'id',
            'status',
            'valor_original',
            'desconto_aplicado',
            'valor_final',
            'metodo_pagamento',
            'status_pagamento',
            'checkin_realizado',
            'data_checkin',
            'qr_code',
            'qr_code_image',
            'aceita_termos',
            'created_at',
            'updated_at',
            'evento_id',
            'evento_titulo',
            'evento_data',
            'evento_endereco',
            'evento_local_especifico',
            'evento_foto_capa',
            'organizador_nome',
            'organizador_telefone',
            'usuario_nome',
            'usuario_username',
            'usuario_email',
            'reembolso_estimado',
        ]
        read_only_fields = [
            'id', 'status', 'valor_original', 'desconto_aplicado',
            'valor_final', 'qr_code', 'qr_code_image', 'created_at', 'updated_at', 'evento_id'
        ]

    def get_reembolso_estimado(self, obj):
        """Calcula o valor estimado de reembolso"""
        return obj.calcular_reembolso_estimado()

    def get_qr_code_image(self, obj):
        """Gera uma imagem PNG do qr_code"""
        try:
            import qrcode
            qr_text = obj.qr_code or str(obj.id)
            qr = qrcode.QRCode(version=1, box_size=10, border=4)
            qr.add_data(qr_text)
            qr.make(fit=True)
            img = qr.make_image(fill_color="black", back_color="white")

            buffered = BytesIO()
            img.save(buffered, format="PNG")
            img_bytes = buffered.getvalue()
            b64 = base64.b64encode(img_bytes).decode('utf-8')
            return f"data:image/png;base64,{b64}"
        except Exception:
            return None

