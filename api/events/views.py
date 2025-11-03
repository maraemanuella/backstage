from rest_framework import generics, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from django.shortcuts import get_object_or_404
from django.db.models import Avg, Sum
from api.events.models import Evento, Avaliacao
from api.events.serializers import EventoSerializer, AvaliacaoSerializer


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


class ManageEventosView(generics.ListAPIView):
    """Retorna todos os eventos criados pelo usuário autenticado"""
    serializer_class = EventoSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Evento.objects.filter(organizador=user).order_by('-created_at')


class EventoRetrieveUpdateView(generics.RetrieveUpdateAPIView):
    """View para buscar e atualizar um evento específico"""
    parser_classes = (MultiPartParser, FormParser)
    serializer_class = EventoSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = 'id'

    def get_queryset(self):
        return Evento.objects.filter(organizador=self.request.user)


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


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def evento_resumo_inscricao(request, evento_id):
    evento = get_object_or_404(Evento, id=evento_id, status='publicado')
    usuario = request.user

    from api.registrations.models import Inscricao
    inscricao = Inscricao.objects.filter(usuario=usuario, evento=evento).first()
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
        'ja_inscrito': ja_inscrito,
        'inscricao_id': str(inscricao.id) if inscricao else None  # ⭐ ADICIONADO
    }

    return Response(data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_metricas(request):
    user = request.user
    from api.registrations.models import Inscricao

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

