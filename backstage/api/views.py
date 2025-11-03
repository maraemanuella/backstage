from django.contrib.auth import get_user_model
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import generics, status
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser
from rest_framework.decorators import api_view, permission_classes
from django.shortcuts import get_object_or_404
from .serializers import FavoriteSerializer
from .models import Evento, Favorite, TransferRequest, Inscricao, Avaliacao
from django.http import JsonResponse
from rest_framework.parsers import MultiPartParser, FormParser
from django.db import models
import time, random

User = get_user_model()

from .serializers import (
    CustomTokenSerializer,
    UserSerializer,
    EventoSerializer,
    InscricaoSerializer,
    AvaliacaoSerializer,
    TransferRequestSerializer,
    DocumentoVerificacaoSerializer,
)
# Import do serializer de pagamento (movido para módulo separado)
from .payment_serializers import PaymentInscricaoCreateSerializer

from .models import Evento, Inscricao, Avaliacao

import qrcode
from io import BytesIO
import base64

# =======================
# EVENTOS E AVALIAÇÕES
# =======================

class EventoCreateView(generics.CreateAPIView):
    """
    View para criar eventos.
    """
    queryset = Evento.objects.all()
    serializer_class = EventoSerializer
    permission_classes = [IsAuthenticated]  

    def perform_create(self, serializer):
        serializer.save(
            organizador=self.request.user,
            status='publicado'  
        )


class AvaliacaoListView(generics.ListAPIView):
    serializer_class = AvaliacaoSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        evento_id = self.kwargs.get('evento_id')
        return Avaliacao.objects.filter(evento__id=evento_id)


class AvaliacaoCreateView(generics.CreateAPIView):
    serializer_class = AvaliacaoSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        evento_id = self.kwargs.get('evento_id')
        evento = get_object_or_404(Evento, id=evento_id)
        serializer.save(usuario=self.request.user, evento=evento)


class EventoListView(generics.ListAPIView):
    queryset = Evento.objects.filter(status='publicado')
    serializer_class = EventoSerializer
    permission_classes = [AllowAny]


# =======================
# USUÁRIOS
# =======================

User = get_user_model()


class CustomTokenObtainView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = CustomTokenSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        return Response(serializer.validated_data, status=status.HTTP_200_OK)


class CreateUserView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]


class ListUsersView(generics.ListAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]


class RetrieveUpdateUserView(generics.RetrieveUpdateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]


class DeleteUserView(generics.DestroyAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]


class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data, status=status.HTTP_200_OK)


# =======================
# INSCRIÇÕES
# =======================

class EventoDetailView(generics.RetrieveAPIView):
    queryset = Evento.objects.filter(status='publicado')
    serializer_class = EventoSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = 'id'

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context


class InscricaoCreateView(generics.CreateAPIView):
    """
    View para criar inscrições em eventos com pagamento.
    Usa PaymentInscricaoCreateSerializer do módulo payment_serializers.
    """
    queryset = Inscricao.objects.all()
    serializer_class = PaymentInscricaoCreateSerializer
    permission_classes = [IsAuthenticated]

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            inscricao = serializer.save()
        except Exception as e:
            return Response({'error': 'Erro ao criar inscrição', 'details': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        try:
            response_serializer = InscricaoSerializer(inscricao)
            return Response(response_serializer.data, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({'error': 'Inscrição criada, porém falha ao montar resposta', 'details': str(e), 'id': str(inscricao.id)}, status=status.HTTP_201_CREATED)


class MinhasInscricoesView(generics.ListAPIView):
    serializer_class = InscricaoSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Inscricao.objects.filter(usuario=self.request.user).order_by('-created_at')


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def evento_resumo_inscricao(request, evento_id):
    evento = get_object_or_404(Evento, id=evento_id, status='publicado')
    usuario = request.user
    ja_inscrito = Inscricao.objects.filter(usuario=usuario, evento=evento).exists()
        
    itens_incluidos = [
        item.strip() 
        for item in evento.itens_incluidos.split('\n') 
        if item.strip()
    ]

    valor_original = evento.valor_deposito
    valor_com_desconto = evento.calcular_valor_com_desconto(usuario)
    desconto_aplicado = valor_original - valor_com_desconto
    percentual_desconto = (desconto_aplicado / valor_original * 100) if valor_original > 0 else 0

    # Gera URL absoluta do QR Code PIX para pagamento (se cadastrado)
    qr_code_pix_url = None
    if evento.qr_code_pix:
        qr_code_pix_url = request.build_absolute_uri(evento.qr_code_pix.url)

    data = {
        'evento': {
            'id': evento.id,
            'titulo': evento.titulo,
            'data_evento': evento.data_evento,
            'endereco': evento.endereco,
            'local_especifico': evento.local_especifico,
            'categoria': evento.categoria,
            'capacidade_maxima': evento.capacidade_maxima,
            'inscritos_count': evento.inscritos_count,
            'vagas_disponiveis': evento.vagas_disponiveis,
            'esta_lotado': evento.esta_lotado,
            'permite_transferencia': evento.permite_transferencia,
            'politica_cancelamento': evento.politica_cancelamento,
            'itens_incluidos': evento.itens_incluidos,
            'qr_code_pix': qr_code_pix_url,
        },
        'organizador': {
            'nome': evento.organizador.get_full_name() or evento.organizador.username,
            'score': evento.organizador.score,
        },
        'valores': {
            'valor_original': valor_original,
            'valor_com_desconto': valor_com_desconto,
            'desconto_aplicado': desconto_aplicado,
            'percentual_desconto': round(percentual_desconto, 1),
        },
        'usuario': {
            'score': usuario.score,
            'nome': usuario.get_full_name() or usuario.username,
            'email': usuario.email,
            'telefone': usuario.telefone,
        },
        'ja_inscrito': ja_inscrito
    }

    return Response(data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def inscricao_detalhes(request, inscricao_id):
    inscricao = get_object_or_404(
        Inscricao,
        id=inscricao_id,
        usuario=request.user
    )

    serializer = InscricaoSerializer(inscricao)
    return Response(serializer.data)


# =======================
# FAVORITOS
# =======================

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_favorites(request):
    favorites = Favorite.objects.filter(user=request.user)
    serializer = FavoriteSerializer(favorites, many=True, context={'request': request})
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def toggle_favorite(request, evento_id):
    user = request.user
    evento = get_object_or_404(Evento, id=evento_id)
    favorite, created = Favorite.objects.get_or_create(user=user, evento=evento)

    if not created:
        favorite.delete()
        return Response({"favorito": False})
    
    return Response({"favorito": True})


# =======================
# TRANSFERÊNCIAS
# =======================

class TransferRequestCreateView(generics.CreateAPIView):
    queryset = TransferRequest.objects.all()
    serializer_class = TransferRequestSerializer
    permission_classes = [IsAuthenticated]

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context


class TransferRequestListView(generics.ListAPIView):
    serializer_class = TransferRequestSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return TransferRequest.objects.filter(
            models.Q(from_user=user) | models.Q(to_user=user)
        ).order_by('-created_at')


class TransferRequestDetailView(generics.RetrieveUpdateAPIView):
    queryset = TransferRequest.objects.all()
    serializer_class = TransferRequestSerializer
    permission_classes = [IsAuthenticated]

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

    def update(self, request, *args, **kwargs):
        transfer_request = self.get_object()
        status_update = request.data.get('status')

        if transfer_request.to_user != request.user and not request.user.is_staff:
            return Response({'error': 'Apenas o destinatário ou um admin(debug) pode aceitar ou negar.'}, status=status.HTTP_403_FORBIDDEN)
        
        if status_update not in ['accepted', 'denied']:
            return Response({'error': 'Status inválido.'}, status=status.HTTP_400_BAD_REQUEST)
        
        transfer_request.status = status_update

        if status_update == 'accepted':
            inscricao = transfer_request.inscricao
            inscricao.usuario = transfer_request.to_user
            inscricao.status = 'transferida'
            inscricao.nome_completo_inscricao = transfer_request.to_user.get_full_name() or transfer_request.to_user.username
            inscricao.cpf_inscricao = transfer_request.to_user.cpf
            inscricao.telefone_inscricao = transfer_request.to_user.telefone
            inscricao.email_inscricao = transfer_request.to_user.email
            inscricao.save()
            
        transfer_request.save()
        serializer = self.get_serializer(transfer_request)
        return Response(serializer.data)


# =======================
# ATUALIZAÇÃO PERFIL
# =======================

@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def update_user_profile(request):
    user = request.user
    try:
        updatable_fields = [
            'username', 'email', 'telefone', 'cpf', 'cnpj', 
            'data_nascimento', 'sexo', 'profile_photo'
        ]
        
        if 'email' in request.data:
            email = request.data['email']
            if User.objects.filter(email=email).exclude(id=user.id).exists():
                return Response({'email': ['Este email já está em uso por outro usuário.']}, status=status.HTTP_400_BAD_REQUEST)
        
        if 'username' in request.data:
            username = request.data['username']
            if User.objects.filter(username=username).exclude(id=user.id).exists():
                return Response({'username': ['Este nome de usuário já está em uso.']}, status=status.HTTP_400_BAD_REQUEST)
        
        if 'cpf' in request.data and request.data['cpf']:
            cpf = request.data['cpf'].replace('.', '').replace('-', '').replace(' ', '')
            if len(cpf) != 11 or not cpf.isdigit():
                return Response({'cpf': ['CPF deve ter exatamente 11 dígitos.']}, status=status.HTTP_400_BAD_REQUEST)
            if User.objects.filter(cpf=cpf).exclude(id=user.id).exists():
                return Response({'cpf': ['Este CPF já está em uso por outro usuário.']}, status=status.HTTP_400_BAD_REQUEST)
            request.data['cpf'] = cpf
        
        if 'cnpj' in request.data and request.data['cnpj']:
            cnpj = request.data['cnpj'].replace('.', '').replace('/', '').replace('-', '').replace(' ', '')
            if len(cnpj) != 14 or not cnpj.isdigit():
                return Response({'cnpj': ['CNPJ deve ter exatamente 14 dígitos.']}, status=status.HTTP_400_BAD_REQUEST)
            if User.objects.filter(cnpj=cnpj).exclude(id=user.id).exists():
                return Response({'cnpj': ['Este CNPJ já está em uso por outro usuário.']}, status=status.HTTP_400_BAD_REQUEST)
            request.data['cnpj'] = cnpj
        
        if 'telefone' in request.data and request.data['telefone']:
            telefone = request.data['telefone'].replace('(', '').replace(')', '').replace('-', '').replace(' ', '')
            if len(telefone) not in [10, 11] or not telefone.isdigit():
                return Response({'telefone': ['Telefone deve ter 10 ou 11 dígitos.']}, status=status.HTTP_400_BAD_REQUEST)
            request.data['telefone'] = telefone
        
        for field in updatable_fields:
            if field in request.data:
                setattr(user, field, request.data[field])
        
        user.save()
        
        serializer = UserSerializer(user)
        return Response({'message': 'Perfil atualizado com sucesso!', 'user': serializer.data}, status=status.HTTP_200_OK)
        
    except Exception:
        return Response({'error': 'Erro interno do servidor.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# =======================
# DASHBOARD ORGANIZADOR
# =======================

from django.db.models import Count, Avg, Sum, Q
from django.utils import timezone
from datetime import timedelta

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_metricas(request):
    user = request.user
    eventos_organizador = Evento.objects.filter(organizador=user)
    total_inscricoes = Inscricao.objects.filter(evento__organizador=user).count()
    eventos_finalizados = eventos_organizador.filter(status='finalizado')
    total_inscritos_finalizados = Inscricao.objects.filter(evento__in=eventos_finalizados).count()
    total_presentes = Inscricao.objects.filter(evento__in=eventos_finalizados, checkin_realizado=True).count()
    taxa_comparecimento = round((total_presentes / total_inscritos_finalizados) * 100, 1) if total_inscritos_finalizados > 0 else 0
    receita_total = Inscricao.objects.filter(evento__organizador=user, status_pagamento='aprovado').aggregate(total=Sum('valor_final'))['total'] or 0
    score_medio = Avaliacao.objects.filter(evento__organizador=user).aggregate(media=Avg('nota'))['media'] or 0

    return Response({
        'total_inscricoes': total_inscricoes,
        'taxa_comparecimento': taxa_comparecimento,
        'receita_total': float(receita_total),
        'score_medio': round(float(score_medio), 1)
    })


# =======================
# CHECK-IN POR QR CODE
# =======================

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def realizar_checkin(request, inscricao_id):
    """
    Realiza o check-in de um participante através do QR code
    """
    try:
        inscricao = get_object_or_404(Inscricao, id=inscricao_id)

        if inscricao.evento.organizador != request.user:
            return Response({'error': 'Você não tem permissão para realizar check-in neste evento.'}, status=status.HTTP_403_FORBIDDEN)

        if inscricao.checkin_realizado:
            return Response({
                'error': 'Check-in já realizado para este participante.',
                'participante': inscricao.nome_completo_inscricao,
                'data_checkin': inscricao.data_checkin.isoformat() if inscricao.data_checkin else None
            }, status=status.HTTP_400_BAD_REQUEST)

        if inscricao.status != 'confirmada':
            return Response({
                'error': f'Inscrição não está confirmada. Status atual: {inscricao.get_status_display()}',
                'participante': inscricao.nome_completo_inscricao
            }, status=status.HTTP_400_BAD_REQUEST)

        from django.utils import timezone
        inscricao.checkin_realizado = True
        inscricao.data_checkin = timezone.now()
        inscricao.save()

        from channels.layers import get_channel_layer
        from asgiref.sync import async_to_sync

        channel_layer = get_channel_layer()
        room_group_name = f'checkin_{str(inscricao.id)}'

        checkin_data = {
            'checkin_realizado': True,
            'data_checkin': inscricao.data_checkin.isoformat(),
            'participante': inscricao.nome_completo_inscricao,
            'evento': inscricao.evento.titulo,
        }

        async_to_sync(channel_layer.group_send)(
            room_group_name,
            {
                'type': 'checkin_update',
                'data': checkin_data
            }
        )

        return Response({
            'success': True,
            'message': 'Check-in realizado com sucesso!',
            'participante': inscricao.nome_completo_inscricao,
            'evento': inscricao.evento.titulo,
            'data_checkin': inscricao.data_checkin.isoformat(),
            'email': inscricao.email_inscricao
        }, status=status.HTTP_200_OK)

    except Inscricao.DoesNotExist:
        return Response({'error': 'Inscrição não encontrada. Verifique o QR code.'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': f'Erro ao realizar check-in: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# =======================
# VERIFICAÇÃO DE DOCUMENTO
# =======================

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def verificar_documento(request):
    user = request.user
    if user.documento_verificado == 'aprovado':
        return Response({'error': 'Seu documento já foi verificado e aprovado.'}, status=status.HTTP_400_BAD_REQUEST)
    
    serializer = DocumentoVerificacaoSerializer(user, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save(documento_verificado='verificando')
        time.sleep(7)
        user.documento_verificado = 'aprovado'
        user.save()
        return Response({'status': 'aprovado', 'mensagem': 'Documento verificado com sucesso! Você já pode criar eventos.'})
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def status_documento(request):
    user = request.user
    return Response({
        'tipo_documento': user.tipo_documento,
        'numero_documento': user.numero_documento,
        'documento_verificado': user.documento_verificado
    })


# =======================
# GERENCIAMENTO DE EVENTOS (ORGANIZADOR)
# =======================

class ManageEventosView(generics.ListAPIView):
    """
    Retorna uma lista de todos os eventos (publicados ou não)
    criados pelo usuário autenticado (o organizador).
    """
    serializer_class = EventoSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user 
        return Evento.objects.filter(organizador=user).order_by('-created_at') 


class EventoRetrieveUpdateView(generics.RetrieveUpdateAPIView):
    """
    View para buscar (GET) e atualizar (PATCH/PUT) um evento específico
    criado pelo usuário logado.
    """
    parser_classes = (MultiPartParser, FormParser)
    serializer_class = EventoSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = 'id'

    def get_queryset(self):
        return Evento.objects.filter(organizador=self.request.user)