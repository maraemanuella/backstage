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
from django.db import models

User = get_user_model()

from .serializers import (
    CustomTokenSerializer,
    UserSerializer,
    EventoSerializer,
    InscricaoCreateSerializer,
    InscricaoSerializer,
    AvaliacaoSerializer,
    TransferRequestSerializer,
    EventoSerializer,
    InscricaoCreateSerializer,
)

from .models import Evento, Inscricao, Avaliacao

import qrcode
from io import BytesIO
import base64


# Listar avaliações de um evento
class AvaliacaoListView(generics.ListAPIView):
    serializer_class = AvaliacaoSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        evento_id = self.kwargs.get('evento_id')
        return Avaliacao.objects.filter(evento__id=evento_id)


# Criar avaliação/comentário para um evento
class AvaliacaoCreateView(generics.CreateAPIView):
    serializer_class = AvaliacaoSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        evento_id = self.kwargs.get('evento_id')
        evento = get_object_or_404(Evento, id=evento_id)
        serializer.save(usuario=self.request.user, evento=evento)


# Listar todos os eventos publicados
class EventoListView(generics.ListAPIView):
    queryset = Evento.objects.filter(status='publicado')
    serializer_class = EventoSerializer
    permission_classes = [AllowAny]


User = get_user_model()


# Login usando login/email + senha
class CustomTokenObtainView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = CustomTokenSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        return Response(serializer.validated_data, status=status.HTTP_200_OK)


# Registro de usuário
class CreateUserView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]


# Listagem de usuários (autenticado)
class ListUsersView(generics.ListAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]


# Recuperar/Atualizar usuário específico (autenticado)
class RetrieveUpdateUserView(generics.RetrieveUpdateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]


# Deletar usuário (apenas admin)
class DeleteUserView(generics.DestroyAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]


# Retorna o usuário logado
class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data, status=status.HTTP_200_OK)


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
    queryset = Inscricao.objects.all()
    serializer_class = InscricaoCreateSerializer
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
            # Erro na hora de salvar a inscrição (ex: problemas relacionados a signals, geração de qr, etc.)
            return Response({'error': 'Erro ao criar inscrição', 'details': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        # Retorna os dados completos da inscrição criada
        try:
            response_serializer = InscricaoSerializer(inscricao)
            return Response(response_serializer.data, status=status.HTTP_201_CREATED)
        except Exception as e:
            # Se ocorrer erro ao serializar a resposta, devolve uma mensagem útil
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

    # Verifica se já está inscrito - retornamos um flag em vez de erro para permitir
    # que o frontend mostre a tela de resumo mesmo quando o usuário já tiver inscrição.
    ja_inscrito = Inscricao.objects.filter(usuario=usuario, evento=evento).exists()
        
    itens_incluidos = [
        item.strip() 
        for item in evento.itens_incluidos.split('\n') 
        if item.strip()
    ]

    # Calcula valores
    valor_original = evento.valor_deposito
    valor_com_desconto = evento.calcular_valor_com_desconto(usuario)
    desconto_aplicado = valor_original - valor_com_desconto
    percentual_desconto = (desconto_aplicado / valor_original * 100) if valor_original > 0 else 0

    # Dados para a tela de inscrição
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
        }
    }
    # Flag indicando se o usuário já possui inscrição neste evento
    data['ja_inscrito'] = ja_inscrito

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


# Lista favoritos do usuário logado
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_favorites(request):
    favorites = Favorite.objects.filter(user=request.user)
    serializer = FavoriteSerializer(favorites, many=True, context={'request': request})
    return Response(serializer.data)

# Alterna favorito: adiciona se não existir, remove se já existir
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def toggle_favorite(request, evento_id):
    user = request.user
    evento = get_object_or_404(Evento, id=evento_id)

    favorite, created = Favorite.objects.get_or_create(user=user, evento=evento)

    if not created:
        # Já existia, então remove
        favorite.delete()
        return Response({"favorito": False})
    
    # Criou agora
    return Response({"favorito": True})

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
        # Mostra solicitações que o usuário recebeu ou enviou
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
        # Somente quem recebeu e um admin(debug) pode aceitar ou negar

        if transfer_request.to_user != request.user and not request.user.is_staff:
            return Response({'error': 'Apenas o destinatário ou um admin(debug) pode aceitar ou negar.'}, status=status.HTTP_403_FORBIDDEN)
        
        if status_update not in ['accepted', 'denied']:
            return Response({'error': 'Status inválido.'}, status=status.HTTP_400_BAD_REQUEST)
        
        transfer_request.status = status_update

        if status_update == 'accepted':
            # Transferir a inscrição
            inscricao = transfer_request.inscricao
            inscricao.usuario = transfer_request.to_user
            inscricao.status = 'transferida'
            inscricao.save()
            
        transfer_request.save()
        serializer = self.get_serializer(transfer_request)
        return Response(serializer.data)


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def update_user_profile(request):
    """
    Atualiza o perfil do usuário autenticado
    """
    user = request.user
    
    try:
        # Campos que podem ser atualizados
        updatable_fields = [
            'username', 'email', 'telefone', 'cpf', 'cnpj', 
            'data_nascimento', 'sexo', 'profile_photo'
        ]
        
        # Validações específicas
        if 'email' in request.data:
            email = request.data['email']
            if User.objects.filter(email=email).exclude(id=user.id).exists():
                return Response(
                    {'email': ['Este email já está em uso por outro usuário.']}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        if 'username' in request.data:
            username = request.data['username']
            if User.objects.filter(username=username).exclude(id=user.id).exists():
                return Response(
                    {'username': ['Este nome de usuário já está em uso.']}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        if 'cpf' in request.data and request.data['cpf']:
            cpf = request.data['cpf'].replace('.', '').replace('-', '').replace(' ', '')
            if len(cpf) != 11 or not cpf.isdigit():
                return Response(
                    {'cpf': ['CPF deve ter exatamente 11 dígitos.']}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            if User.objects.filter(cpf=cpf).exclude(id=user.id).exists():
                return Response(
                    {'cpf': ['Este CPF já está em uso por outro usuário.']}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            request.data['cpf'] = cpf
        
        if 'cnpj' in request.data and request.data['cnpj']:
            cnpj = request.data['cnpj'].replace('.', '').replace('/', '').replace('-', '').replace(' ', '')
            if len(cnpj) != 14 or not cnpj.isdigit():
                return Response(
                    {'cnpj': ['CNPJ deve ter exatamente 14 dígitos.']}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            if User.objects.filter(cnpj=cnpj).exclude(id=user.id).exists():
                return Response(
                    {'cnpj': ['Este CNPJ já está em uso por outro usuário.']}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            request.data['cnpj'] = cnpj
        
        if 'telefone' in request.data and request.data['telefone']:
            telefone = request.data['telefone'].replace('(', '').replace(')', '').replace('-', '').replace(' ', '')
            if len(telefone) not in [10, 11] or not telefone.isdigit():
                return Response(
                    {'telefone': ['Telefone deve ter 10 ou 11 dígitos.']}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            request.data['telefone'] = telefone
        
        # Atualizar campos
        for field in updatable_fields:
            if field in request.data:
                setattr(user, field, request.data[field])
        
        user.save()
        
        # Retornar dados atualizados
        serializer = UserSerializer(user)
        return Response({
            'message': 'Perfil atualizado com sucesso!',
            'user': serializer.data
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response(
            {'error': 'Erro interno do servidor.'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
