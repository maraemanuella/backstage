from django.contrib.auth import get_user_model
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import generics, status
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser
from .serializers import CustomTokenSerializer, UserSerializer, EventoSerializer, InscricaoCreateSerializer, InscricaoSerializer
from rest_framework.decorators import api_view, permission_classes
from django.shortcuts import get_object_or_404
from django.http import JsonResponse
from .models import Evento, Inscricao
import qrcode
from io import BytesIO
import base64

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
        inscricao = serializer.save()

        # Retorna os dados completos da inscrição criada
        response_serializer = InscricaoSerializer(inscricao)
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)

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

    # Verifica se já está inscrito
    ja_inscrito = Inscricao.objects.filter(usuario=usuario, evento=evento).exists()

    if ja_inscrito:
        return Response({
            'error': 'Você já está inscrito neste evento'
        }, status=status.HTTP_400_BAD_REQUEST)

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