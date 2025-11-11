from rest_framework import serializers
from .models import Inscricao
from io import BytesIO
import base64

class InscricaoCreateSerializer(serializers.ModelSerializer):
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
        evento = attrs.get('evento')
        usuario = self.context['request'].user

        if Inscricao.objects.filter(usuario=usuario, evento=evento).exists():
            raise serializers.ValidationError("Você já está inscrito neste evento.")

        if evento.esta_lotado:
            raise serializers.ValidationError("Este evento está lotado.")

        if not attrs.get('aceita_termos'):
            raise serializers.ValidationError("Você deve aceitar os termos para se inscrever.")

        cpf = attrs.get('cpf_inscricao', '').replace('.', '').replace('-', '')
        if len(cpf) != 11 or not cpf.isdigit():
            raise serializers.ValidationError("CPF deve ter 11 dígitos.")
        attrs['cpf_inscricao'] = cpf

        return attrs

    def create(self, validated_data):
        usuario = self.context['request'].user
        evento = validated_data['evento']

        valor_original = evento.valor_deposito
        valor_com_desconto = evento.calcular_valor_com_desconto(usuario)
        desconto_aplicado = valor_original - valor_com_desconto

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
    evento_id = serializers.UUIDField(source='evento.id', read_only=True)

    evento_titulo = serializers.CharField(source='evento.titulo', read_only=True)
    evento_data = serializers.DateTimeField(source='evento.data_evento', read_only=True)
    evento_endereco = serializers.CharField(source='evento.endereco', read_only=True)
    evento_local_especifico = serializers.CharField(source='evento.local_especifico', read_only=True)
    evento_foto_capa = serializers.SerializerMethodField()

    organizador_nome = serializers.CharField(source='evento.organizador.get_full_name', read_only=True)
    organizador_telefone = serializers.CharField(source='evento.organizador.telefone', read_only=True)

    usuario_nome = serializers.CharField(source='usuario.get_full_name', read_only=True)
    usuario_username = serializers.CharField(source='usuario.username', read_only=True)
    usuario_email = serializers.CharField(source='usuario.email', read_only=True)

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
            'data_pagamento',
            'comprovante_pagamento',
            'id_transacao_gateway',
            'observacoes_pagamento',
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
            'valor_final', 'qr_code', 'qr_code_image', 'created_at', 'updated_at', 'evento_id',
            'data_pagamento', 'id_transacao_gateway'
        ]

    def get_evento_foto_capa(self, obj):
        if obj.evento and obj.evento.foto_capa:
            return obj.evento.foto_capa.url
        return None

    def get_reembolso_estimado(self, obj):
        return obj.calcular_reembolso_estimado()

    def get_qr_code_image(self, obj):
        try:
            try:
                import qrcode
            except Exception:
                return None

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

