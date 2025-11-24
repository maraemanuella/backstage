from rest_framework import generics
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.decorators import api_view, permission_classes
from rest_framework.parsers import MultiPartParser, FormParser
from django.shortcuts import get_object_or_404

from .models import Evento
from .serializers import EventoSerializer
from apps.notificacoes.utils import notificar_usuarios_favorito


class EventoCreateView(generics.CreateAPIView):
    queryset = Evento.objects.all()
    serializer_class = EventoSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        evento = serializer.save(
            organizador=self.request.user,
            status='publicado'
        )
        
        # Notificar o organizador que o evento foi criado
        from apps.notificacoes.models import Notificacao
        Notificacao.objects.create(
            usuario=self.request.user,
            tipo='sistema',
            titulo='Evento criado com sucesso!',
            mensagem=f'Seu evento "{evento.titulo}" foi criado e publicado com sucesso.',
            link=f'/evento/{evento.id}'
        )
        
        # Notificar usuários que favoritaram eventos deste organizador
        try:
            num_notificados = notificar_usuarios_favorito(self.request.user, evento)
            if num_notificados > 0:
                print(f"[NOTIFICACAO] Evento criado: {evento.titulo} - {num_notificados} usuarios notificados")
        except Exception as e:
            print(f"[NOTIFICACAO] Erro ao notificar usuarios: {e}")


class EventoListView(generics.ListAPIView):
    serializer_class = EventoSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        from django.utils import timezone
        from datetime import timedelta

        queryset = Evento.objects.filter(status='publicado')

        # Filtro por categoria
        categoria = self.request.query_params.get('categoria', None)
        if categoria and categoria.lower() != 'todos':
            queryset = queryset.filter(categorias__contains=[categoria])

        # Filtro por eventos sem depósito (gratuitos)
        deposito_livre = self.request.query_params.get('deposito_livre', None)
        if deposito_livre == 'true':
            queryset = queryset.filter(valor_deposito=0)

        # Filtro por eventos próximos (próximos 7 dias)
        proximos = self.request.query_params.get('proximos', None)
        if proximos == 'true':
            hoje = timezone.now()
            sete_dias = hoje + timedelta(days=7)
            queryset = queryset.filter(data_evento__gte=hoje, data_evento__lte=sete_dias)

        # Filtro por data específica ou range
        data_inicio = self.request.query_params.get('data_inicio', None)
        data_fim = self.request.query_params.get('data_fim', None)

        if data_inicio:
            queryset = queryset.filter(data_evento__gte=data_inicio)
        if data_fim:
            queryset = queryset.filter(data_evento__lte=data_fim)

        # Ordenação por data (padrão: mais próximos primeiro)
        ordenacao = self.request.query_params.get('ordenacao', 'data')
        if ordenacao == 'data':
            queryset = queryset.order_by('data_evento')
        elif ordenacao == '-data':
            queryset = queryset.order_by('-data_evento')
        elif ordenacao == 'titulo':
            queryset = queryset.order_by('titulo')

        return queryset


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
    inscricao = Inscricao.objects.filter(
        usuario=usuario,
        evento=evento
    ).exclude(status='cancelada').first()

    ja_inscrito = inscricao is not None

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
            'categorias': evento.categorias,
            'categorias_customizadas': evento.categorias_customizadas,
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
        'ja_inscrito': ja_inscrito,
        'inscricao_id': str(inscricao.id) if inscricao else None
    }

    return Response(data)


class ManageEventosView(generics.ListAPIView):
    serializer_class = EventoSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Evento.objects.filter(organizador=user).order_by('-created_at')


class EventoRetrieveUpdateView(generics.RetrieveUpdateAPIView):
    parser_classes = (MultiPartParser, FormParser)
    serializer_class = EventoSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = 'id'

    def get_queryset(self):
        return Evento.objects.filter(organizador=self.request.user)

