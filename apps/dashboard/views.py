from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db.models import Sum, Avg

from apps.eventos.models import Evento
from apps.inscricoes.models import Inscricao
from apps.avaliacoes.models import Avaliacao


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

