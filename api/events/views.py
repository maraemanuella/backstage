"""
Views do módulo de Eventos, Inscrições e Avaliações
"""
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.decorators import api_view, permission_classes
from rest_framework.parsers import MultiPartParser, FormParser
from django.shortcuts import get_object_or_404
from api.models import Evento, Inscricao, Avaliacao
from .serializers import (
    EventoSerializer,
    InscricaoCreateSerializer,
    InscricaoSerializer,
    AvaliacaoSerializer,
)


# =======================
# EVENTOS
# =======================

class EventoCreateView(generics.CreateAPIView):
    """View para criar eventos"""
    queryset = Evento.objects.all()
    serializer_class = EventoSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(
            organizador=self.request.user,
            status='publicado'
        )


class EventoListView(generics.ListAPIView):
    """View para listar eventos publicados"""
    queryset = Evento.objects.filter(status='publicado')
    serializer_class = EventoSerializer
    permission_classes = [AllowAny]


class EventoDetailView(generics.RetrieveAPIView):
    """View para detalhes de um evento"""
    queryset = Evento.objects.filter(status='publicado')
    serializer_class = EventoSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = 'id'

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context


class ManageEventosView(generics.ListAPIView):
    """View para listar eventos criados pelo organizador"""
    serializer_class = EventoSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Evento.objects.filter(organizador=user).order_by('-created_at')


class EventoRetrieveUpdateView(generics.RetrieveUpdateAPIView):
    """View para buscar e atualizar evento do organizador"""
    parser_classes = (MultiPartParser, FormParser)
    serializer_class = EventoSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = 'id'

    def get_queryset(self):
        return Evento.objects.filter(organizador=self.request.user)


# =======================
# INSCRIÇÕES
# =======================

class InscricaoCreateView(generics.CreateAPIView):
    """View para criar inscrição"""
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
            return Response({'error': 'Erro ao criar inscrição', 'details': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        try:
            response_serializer = InscricaoSerializer(inscricao)
            return Response(response_serializer.data, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({'error': 'Inscrição criada, porém falha ao montar resposta', 'details': str(e), 'id': str(inscricao.id)}, status=status.HTTP_201_CREATED)


class MinhasInscricoesView(generics.ListAPIView):
    """View para listar inscrições do usuário"""
    serializer_class = InscricaoSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Inscricao.objects.filter(usuario=self.request.user).order_by('-created_at')


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def evento_resumo_inscricao(request, evento_id):
    """Retorna resumo do evento para página de inscrição"""
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
        },
        'ja_inscrito': ja_inscrito
    }

    return Response(data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def inscricao_detalhes(request, inscricao_id):
    """Retorna detalhes de uma inscrição"""
    inscricao = get_object_or_404(
        Inscricao,
        id=inscricao_id,
        usuario=request.user
    )

    serializer = InscricaoSerializer(inscricao)
    return Response(serializer.data)


# =======================
# AVALIAÇÕES
# =======================

class AvaliacaoListView(generics.ListAPIView):
    """View para listar avaliações de um evento"""
    serializer_class = AvaliacaoSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        evento_id = self.kwargs.get('evento_id')
        return Avaliacao.objects.filter(evento__id=evento_id)


class AvaliacaoCreateView(generics.CreateAPIView):
    """View para criar avaliação"""
    serializer_class = AvaliacaoSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        evento_id = self.kwargs.get('evento_id')
        evento = get_object_or_404(Evento, id=evento_id)
        serializer.save(usuario=self.request.user, evento=evento)

