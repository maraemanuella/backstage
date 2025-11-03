from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db.models import Sum, Avg, Count
from django.utils import timezone
from datetime import datetime, timedelta

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
        'totalInscricoes': total_inscricoes,
        'taxaComparecimento': taxa_comparecimento,
        'receitaTotal': float(receita_total),
        'scoreMedia': round(float(score_medio), 1)
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def eventos_proximos(request):
    user = request.user
    now = timezone.now()
    
    eventos = Evento.objects.filter(
        organizador=user,
        data_evento__gte=now
    ).order_by('data_evento')[:5]
    
    data = []
    for evento in eventos:
        inscricoes_count = Inscricao.objects.filter(evento=evento).count()
        data.append({
            'id': evento.id,
            'titulo': evento.titulo,
            'data': evento.data_evento.isoformat(),
            'status': evento.status.capitalize() if evento.status else 'Confirmado',
            'inscricoes': inscricoes_count,
            'local': f"{evento.endereco}, {evento.local_especifico}" if evento.local_especifico else evento.endereco
        })
    
    return Response(data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def eventos_anteriores(request):
    user = request.user
    now = timezone.now()
    
    eventos = Evento.objects.filter(
        organizador=user,
        data_evento__lt=now
    ).order_by('-data_evento')[:5]
    
    data = []
    for evento in eventos:
        inscricoes = Inscricao.objects.filter(evento=evento)
        inscricoes_count = inscricoes.count()
        comparecimento = inscricoes.filter(checkin_realizado=True).count()
        receita = inscricoes.filter(status_pagamento='aprovado').aggregate(total=Sum('valor_final'))['total'] or 0
        avaliacoes = Avaliacao.objects.filter(evento=evento)
        score = avaliacoes.aggregate(media=Avg('nota'))['media'] or 0
        
        data.append({
            'id': evento.id,
            'titulo': evento.titulo,
            'data': evento.data_evento.isoformat(),
            'inscricoes': inscricoes_count,
            'comparecimento': comparecimento,
            'receita': float(receita),
            'score': round(float(score), 1)
        })
    
    return Response(data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def notificacoes(request):
    user = request.user
    now = timezone.now()
    
    # Buscar eventos próximos (próximas 24h)
    eventos_proximos = Evento.objects.filter(
        organizador=user,
        data_evento__gte=now,
        data_evento__lte=now + timedelta(days=1)
    )
    
    notificacoes_list = []
    
    for evento in eventos_proximos:
        notificacoes_list.append({
            'id': f'evento-{evento.id}',
            'tipo': 'warning',
            'titulo': 'Evento se aproximando',
            'mensagem': f'{evento.titulo} acontecerá em breve!',
            'tempo': 'Hoje'
        })
    
    # Adicionar notificação sobre eventos com baixo número de inscrições
    eventos_pouco_inscrito = Evento.objects.filter(
        organizador=user,
        data_evento__gte=now
    ).annotate(num_inscricoes=Count('inscricoes')).filter(num_inscricoes__lt=5)
    
    for evento in eventos_pouco_inscrito[:3]:
        notificacoes_list.append({
            'id': f'baixa-inscricao-{evento.id}',
            'tipo': 'info',
            'titulo': 'Poucas inscrições',
            'mensagem': f'{evento.titulo} tem apenas {evento.num_inscricoes} inscrições',
            'tempo': 'Recente'
        })
    
    return Response(notificacoes_list[:10])


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def graficos(request):
    user = request.user
    
    # Gráfico de comparecimento mensal (últimos 6 meses)
    comparecimento_mensal = []
    meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
    
    for i in range(6):
        mes_data = timezone.now() - timedelta(days=30 * i)
        mes_nome = meses[mes_data.month - 1]
        
        eventos_mes = Evento.objects.filter(
            organizador=user,
            data_evento__month=mes_data.month,
            data_evento__year=mes_data.year
        )
        
        total_inscritos = Inscricao.objects.filter(evento__in=eventos_mes).count()
        total_presentes = Inscricao.objects.filter(evento__in=eventos_mes, checkin_realizado=True).count()
        taxa = round((total_presentes / total_inscritos) * 100) if total_inscritos > 0 else 0
        
        comparecimento_mensal.insert(0, {
            'mes': mes_nome,
            'comparecimento': taxa
        })
    
    # Gráfico de score por evento (últimos 5 eventos)
    eventos_recentes = Evento.objects.filter(
        organizador=user,
        data_evento__lt=timezone.now()
    ).order_by('-data_evento')[:5]
    
    score_medio = []
    for evento in reversed(list(eventos_recentes)):
        avaliacoes = Avaliacao.objects.filter(evento=evento)
        score = avaliacoes.aggregate(media=Avg('nota'))['media'] or 0
        score_medio.append({
            'evento': evento.titulo[:15] + '...' if len(evento.titulo) > 15 else evento.titulo,
            'score': round(float(score), 1)
        })
    
    # Gráfico de desempenho dos eventos
    total_eventos = Evento.objects.filter(organizador=user).count()
    eventos_finalizados = Evento.objects.filter(organizador=user, status='finalizado').count()
    eventos_publicados = Evento.objects.filter(organizador=user, status='publicado').count()
    eventos_em_andamento = Evento.objects.filter(organizador=user, status='em_andamento').count()
    eventos_rascunho = Evento.objects.filter(organizador=user, status='rascunho').count()
    eventos_cancelados = Evento.objects.filter(organizador=user, status='cancelado').count()
    
    desempenho_eventos = [
        {'name': 'Finalizados', 'value': eventos_finalizados, 'color': '#10B981'},
        {'name': 'Publicados', 'value': eventos_publicados, 'color': '#3B82F6'},
        {'name': 'Em Andamento', 'value': eventos_em_andamento, 'color': '#F59E0B'},
        {'name': 'Rascunho', 'value': eventos_rascunho, 'color': '#6B7280'},
        {'name': 'Cancelados', 'value': eventos_cancelados, 'color': '#EF4444'}
    ]
    
    return Response({
        'comparecimentoMensal': comparecimento_mensal,
        'scoreMedio': score_medio,
        'desempenhoEventos': desempenho_eventos
    })

