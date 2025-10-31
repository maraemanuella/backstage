from django.contrib.auth import get_user_model, authenticate
from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken
from .models import (
    Avaliacao, Evento, Inscricao, CustomUser, TransferRequest, Favorite,
    EventoAnalytics, InteracaoSimulador, VisualizacaoEvento
)
from django.utils import timezone
from datetime import timedelta
from io import BytesIO
import base64

User = get_user_model()

# Serializer para avaliações/comentários de eventos
class AvaliacaoSerializer(serializers.ModelSerializer):
    usuario_nome = serializers.CharField(source='usuario.username', read_only=True)
    evento_titulo = serializers.CharField(source='evento.titulo', read_only=True)

    class Meta:
        model = Avaliacao
        fields = [
            'id', 'evento', 'evento_titulo', 'usuario', 'usuario_nome', 'nota', 'comentario', 'criado_em'
        ]
        read_only_fields = ['id', 'usuario', 'evento', 'criado_em', 'usuario_nome', 'evento_titulo']


User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    profile_photo = serializers.ImageField(use_url=True, required=False)

    class Meta:
        model = User
        fields = (
            "id",
            "username",
            "email",
            "telefone",
            "cpf",
            "cnpj",
            "data_nascimento",
            "sexo",
            "is_staff",
            "is_superuser",
            "password",
            "score",
            "profile_photo"
        )
        extra_kwargs = {
            "password": {"write_only": True},
            "is_staff": {"read_only": True},
            "is_superuser": {"read_only": True},
        }

    def create(self, validated_data):
        password = validated_data.pop("password", None)
        user = User.objects.create_user(password=password, **validated_data)
        return user


class CustomTokenSerializer(serializers.Serializer):
    login = serializers.CharField(write_only=True)  # usuário ou email
    password = serializers.CharField(write_only=True)
    access = serializers.CharField(read_only=True)
    refresh = serializers.CharField(read_only=True)

    def validate(self, attrs):
        login = attrs.get('login')
        password = attrs.get('password')
        user = None

        # Primeiro tenta autenticar pelo username
        user = authenticate(username=login, password=password)

        # Se falhar, tenta pelo email
        if user is None:
            try:
                user_obj = User.objects.get(email=login)
                user = authenticate(username=user_obj.username, password=password)
            except User.DoesNotExist:
                pass

        if user is None:
            raise serializers.ValidationError('Usuário ou senha inválidos')

        # Gera tokens
        refresh = RefreshToken.for_user(user)
        return {
            'access': str(refresh.access_token),
            'refresh': str(refresh)
        }

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
        attrs['cpf_inscricao'] = cpf  # Salva apenas números

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
            status='confirmada',  # Por enquanto, confirmamos direto
            status_pagamento='aprovado'  # Por enquanto, aprovamos direto
            #MARA É AQUI QUE VOCÊ VAI MEXER
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
    evento_foto_capa = serializers.ImageField(source='evento.foto_capa', read_only=True)  # ⬅️ ADICIONE

    # Id do evento e informações do organizador para facilitar o frontend
    evento_id = serializers.UUIDField(source='evento.id', read_only=True)
    organizador_nome = serializers.CharField(source='evento.organizador.get_full_name', read_only=True)
    organizador_telefone = serializers.CharField(source='evento.organizador.telefone', read_only=True)

    # Dados do usuário
    usuario_nome = serializers.CharField(source='usuario.get_full_name', read_only=True)
    usuario_username = serializers.CharField(source='usuario.username', read_only=True)
    usuario_email = serializers.CharField(source='usuario.email', read_only=True)

    # Valor do reembolso estimado
    reembolso_estimado = serializers.SerializerMethodField()
    # Gera uma imagem PNG do QR code como data URI para uso direto no frontend
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
            'evento_id',
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
            # Import dinâmico para evitar ImportError em tempo de importação do módulo
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


class FavoriteSerializer(serializers.ModelSerializer):
    evento = EventoSerializer(read_only=True)
    evento_id = serializers.UUIDField(write_only=True)  # recebe do frontend
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


class TransferRequestSerializer(serializers.ModelSerializer):
    inscricao_id = serializers.UUIDField(write_only=True)
    to_user_id = serializers.PrimaryKeyRelatedField(queryset=CustomUser.objects.all(), write_only=True)
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

        # Lógica do negócio: só permite se o evento permitir transferência e se a inscrição estiver confirmada
        if not inscricao.evento.permite_transferencia:
            raise serializers.ValidationError("Transferência não permitida para este evento.")
        if inscricao.status != 'confirmada':
            raise serializers.ValidationError("Só inscrições confirmadas podem ser transferidas.")
        
        # Restrição de tempo: evento deve ser daqui a mais de 24h
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
    

class DocumentoVerificacaoSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['tipo_documento', 'numero_documento', 'documento_foto', 'documento_verificado']
        read_only_fields = ['documento_verificado']
    
    def validate_numero_documento(self, value):
        # Remove pontuação
        value = value.replace('.', '').replace('-', '').replace('/', '').replace(' ', '')
        tipo = self.initial_data.get('tipo_documento')
        
        if tipo == 'cpf' and len(value) != 11:
            raise serializers.ValidationError("CPF deve ter 11 dígitos.")
        if tipo == 'cnpj' and len(value) != 14:
            raise serializers.ValidationError("CNPJ deve ter 14 dígitos.")
        
        return value


# ===========================
# ANALYTICS SERIALIZERS
# ===========================

class EventoAnalyticsSerializer(serializers.ModelSerializer):
    """Serializer para dados analíticos do evento"""
    
    evento_titulo = serializers.CharField(source='evento.titulo', read_only=True)
    
    class Meta:
        model = EventoAnalytics
        fields = [
            'evento',
            'evento_titulo',
            'custo_total',
            'receita_total',
            'roi',
            'total_visualizacoes',
            'total_interacoes_simulador',
            'updated_at',
        ]
        read_only_fields = ['evento', 'updated_at']


class InteracaoSimuladorSerializer(serializers.ModelSerializer):
    """Serializer para interações com simuladores"""
    
    usuario_nome = serializers.CharField(source='usuario.username', read_only=True)
    evento_titulo = serializers.CharField(source='evento.titulo', read_only=True)
    
    class Meta:
        model = InteracaoSimulador
        fields = [
            'id',
            'evento',
            'evento_titulo',
            'usuario',
            'usuario_nome',
            'tipo_simulador',
            'duracao_segundos',
            'concluiu',
            'created_at',
        ]
        read_only_fields = ['id', 'created_at']


class VisualizacaoEventoSerializer(serializers.ModelSerializer):
    """Serializer para visualizações de eventos"""
    
    usuario_nome = serializers.CharField(source='usuario.username', read_only=True)
    evento_titulo = serializers.CharField(source='evento.titulo', read_only=True)
    
    class Meta:
        model = VisualizacaoEvento
        fields = [
            'id',
            'evento',
            'evento_titulo',
            'usuario',
            'usuario_nome',
            'ip_address',
            'user_agent',
            'created_at',
        ]
        read_only_fields = ['id', 'created_at']
