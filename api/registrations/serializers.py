from rest_framework import serializers
from api.registrations.models import Inscricao
import qrcode
from io import BytesIO
import base64
from django.utils import timezone
from datetime import timedelta


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

        # Bloqueia inscrição se já tiver passado 30 minutos desde o início do evento
        try:
            if evento and evento.data_evento:
                cutoff = evento.data_evento + timedelta(minutes=30)
                now = timezone.now()
                if now > cutoff:
                    raise serializers.ValidationError("Inscrições encerradas: já passaram 30 minutos desde o início do evento.")
        except Exception:
            # Não falhar a validação por erro de timezone, apenas assumir que não pode inscrever
            raise serializers.ValidationError("Não foi possível validar o horário do evento. Tente novamente mais tarde.")

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

    # Retorna o id do evento
    evento_id = serializers.UUIDField(source='evento.id', read_only=True)

    # Dados do evento resumidos
    evento_titulo = serializers.CharField(source='evento.titulo', read_only=True)
    evento_data = serializers.DateTimeField(source='evento.data_evento', read_only=True)
    evento_endereco = serializers.CharField(source='evento.endereco', read_only=True)
    evento_local_especifico = serializers.CharField(source='evento.local_especifico', read_only=True)
    evento_foto_capa = serializers.ImageField(source='evento.foto_capa', read_only=True)

    # Informações do organizador
    organizador_nome = serializers.CharField(source='evento.organizador.get_full_name', read_only=True)
    organizador_telefone = serializers.CharField(source='evento.organizador.telefone', read_only=True)

    # Dados do usuário
    usuario_nome = serializers.CharField(source='usuario.get_full_name', read_only=True)
    usuario_username = serializers.CharField(source='usuario.username', read_only=True)
    usuario_email = serializers.CharField(source='usuario.email', read_only=True)

    # Valor do reembolso estimado
    reembolso_estimado = serializers.SerializerMethodField()
    # Gera uma imagem PNG do QR code como data URI
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
            # ID do evento
            'evento_id',
            # Dados do evento resumidos
            'evento_titulo',
            'evento_data',
            'evento_endereco',
            'evento_local_especifico',
            'evento_foto_capa',
            # Organizador
            'organizador_nome',
            'organizador_telefone',
            # Dados do usuário
            'usuario_nome',
            'usuario_username',
            'usuario_email',
            # Reembolso
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
        """Gera uma imagem PNG do qr_code do objeto e retorna como data URI"""
        try:
            qr_text = obj.qr_code or str(obj.id)
            # Use getattr to avoid static analysis errors in environments where
            # qrcode stubs don't expose QRCode. If QRCode is unavailable,
            # fall back to qrcode.make which returns a PIL image.
            QRClass = getattr(qrcode, 'QRCode', None)
            if callable(QRClass):
                qr = QRClass(version=1, box_size=10, border=4)
                qr.add_data(qr_text)
                qr.make(fit=True)
                img = qr.make_image(fill_color="black", back_color="white")
            else:
                img = qrcode.make(qr_text)

            buffered = BytesIO()
            img.save(buffered, format="PNG")
            img_bytes = buffered.getvalue()
            b64 = base64.b64encode(img_bytes).decode('utf-8')
            return f"data:image/png;base64,{b64}"
        except Exception:
            return None
