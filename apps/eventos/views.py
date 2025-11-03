from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.decorators import api_view, permission_classes
from rest_framework.parsers import MultiPartParser, FormParser
from django.shortcuts import get_object_or_404

from .models import Evento
from .serializers import EventoSerializer


class EventoCreateView(generics.CreateAPIView):
    """
    View para criar eventos.
    Requer que o usuário tenha documento verificado.
    """
    queryset = Evento.objects.all()
    serializer_class = EventoSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        if self.request.user.documento_verificado != 'aprovado':
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied({
                'error': 'Você precisa verificar seu documento antes de criar eventos.',
                'status_verificacao': self.request.user.documento_verificado
            })
        serializer.save(
            organizador=self.request.user,
            status='publicado'
        )


class EventoListView(generics.ListAPIView):
    queryset = Evento.objects.filter(status='publicado')
    serializer_class = EventoSerializer
    permission_classes = [AllowAny]


class EventoDetailView(generics.RetrieveAPIView):
    queryset = Evento.objects.filter(status='publicado')
    serializer_class = EventoSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = 'id'

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def evento_resumo_inscricao(request, evento_id):
    from apps.inscricoes.models import Inscricao

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


class ManageEventosView(generics.ListAPIView):
    """
    Retorna uma lista de todos os eventos (publicados ou não)
    criados pelo usuário autenticado (o organizador).
    Requer que o usuário tenha documento verificado.
    """
    serializer_class = EventoSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.documento_verificado != 'aprovado':
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied({
                'error': 'Você precisa verificar seu documento antes de gerenciar eventos.',
                'status_verificacao': user.documento_verificado
            })
        return Evento.objects.filter(organizador=user).order_by('-created_at')


class EventoRetrieveUpdateView(generics.RetrieveUpdateAPIView):
    """
    View para buscar (GET) e atualizar (PATCH/PUT) um evento específico
    criado pelo usuário logado.
    Requer que o usuário tenha documento verificado.
    """
    parser_classes = (MultiPartParser, FormParser)
    serializer_class = EventoSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = 'id'

    def get_queryset(self):
        if self.request.user.documento_verificado != 'aprovado':
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied({
                'error': 'Você precisa verificar seu documento antes de gerenciar eventos.',
                'status_verificacao': self.request.user.documento_verificado
            })
        return Evento.objects.filter(organizador=self.request.user)

