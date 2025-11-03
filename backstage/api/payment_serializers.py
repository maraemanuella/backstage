"""
payment_serializers.py
Serializers relacionados ao sistema de pagamento PIX
Separado para evitar conflitos de merge
"""
from rest_framework import serializers
from decimal import Decimal
from .models import Inscricao, Evento


class PaymentInscricaoCreateSerializer(serializers.ModelSerializer):
    """
    Serializer para criar uma nova inscrição em evento com pagamento PIX.
    Calcula automaticamente valores com desconto baseado no score do usuário.
    Método de pagamento: apenas PIX.
    
    Este serializer está separado para evitar conflitos de merge.
    """

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
        """Validações específicas de pagamento e inscrição"""
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
        attrs['cpf_inscricao'] = cpf  # Salva apenas números

        # Valida método de pagamento (apenas PIX)
        metodo = attrs.get('metodo_pagamento', 'pix')
        if metodo != 'pix':
            raise serializers.ValidationError("Apenas pagamento via PIX é aceito no momento.")

        return attrs

    def create(self, validated_data):
        """
        Cria a inscrição com cálculos automáticos de valores.
        Aplica desconto baseado no score do usuário.
        """
        usuario = self.context['request'].user
        evento = validated_data['evento']

        # Calcula valores com desconto
        valor_original = evento.valor_deposito
        valor_com_desconto = evento.calcular_valor_com_desconto(usuario)
        desconto_aplicado = valor_original - valor_com_desconto

        # Cria a inscrição com pagamento aprovado
        inscricao = Inscricao.objects.create(
            usuario=usuario,
            evento=evento,
            nome_completo_inscricao=validated_data['nome_completo_inscricao'],
            cpf_inscricao=validated_data['cpf_inscricao'],
            telefone_inscricao=validated_data['telefone_inscricao'],
            email_inscricao=validated_data['email_inscricao'],
            metodo_pagamento=validated_data.get('metodo_pagamento', 'pix'),
            aceita_termos=validated_data['aceita_termos'],
            valor_original=valor_original,
            desconto_aplicado=desconto_aplicado,
            valor_final=valor_com_desconto,
            status='confirmada',  # Confirmada automaticamente
            status_pagamento='aprovado'  # Pagamento aprovado (PIX é processado externamente)
        )

        return inscricao


class QRCodePixSerializer(serializers.Serializer):
    """
    Serializer para retornar dados do QR Code PIX para pagamento.
    Usado na PaymentPage do frontend.
    """
    qr_code_pix = serializers.ImageField(read_only=True)
    qr_code_pix_url = serializers.SerializerMethodField()
    
    def get_qr_code_pix_url(self, obj):
        """Retorna URL absoluta do QR Code PIX"""
        request = self.context.get('request')
        if obj.qr_code_pix and request:
            return request.build_absolute_uri(obj.qr_code_pix.url)
        return None


class PaymentInfoSerializer(serializers.Serializer):
    """
    Serializer para informações de pagamento do evento.
    Retorna dados necessários para exibir na página de pagamento.
    """
    metodo_pagamento = serializers.CharField(default='pix')
    status_pagamento = serializers.CharField()
    valor_original = serializers.DecimalField(max_digits=10, decimal_places=2)
    valor_final = serializers.DecimalField(max_digits=10, decimal_places=2)
    desconto_aplicado = serializers.DecimalField(max_digits=10, decimal_places=2)
    qr_code_pix_url = serializers.CharField(allow_null=True)
    
    class Meta:
        fields = [
            'metodo_pagamento',
            'status_pagamento',
            'valor_original',
            'valor_final',
            'desconto_aplicado',
            'qr_code_pix_url',
        ]
