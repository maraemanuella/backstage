from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Sum, Avg, Count, Q
from django.utils import timezone
from datetime import datetime, timedelta

from apps.eventos.models import Evento
from apps.inscricoes.models import Inscricao
from apps.avaliacoes.models import Avaliacao
from apps.users.models import CustomUser
from apps.transferencias.models import TransferRequest
from .serializers import (
    DashboardMetricasSerializer,
    DashboardOrganizadoresSerializer,
    DashboardVerificacoesSerializer,
    DashboardPerformanceSerializer,
    DashboardLogInscricaoSerializer,
    DashboardLogTransferenciaSerializer
)


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


# ============================================
# ADMIN DASHBOARD VIEWS (Staff Only)
# ============================================

@api_view(['GET'])
@permission_classes([IsAdminUser])
def dashboard_metricas_globais(request):
    """Global system metrics for admin dashboard"""
    # Total active users
    usuarios_ativos = CustomUser.objects.filter(is_active=True).count()
    
    # Completed events
    eventos_realizados = Evento.objects.filter(
        data_evento__lt=timezone.now()
    ).count()
    
    # Total revenue from approved payments
    revenue_total = Inscricao.objects.filter(
        status_pagamento='aprovado'
    ).aggregate(total=Sum('valor_final'))['total'] or 0
    
    # Growth rate (last 30 days vs previous 30 days)
    now = timezone.now()
    last_30_days = now - timedelta(days=30)
    previous_60_days = now - timedelta(days=60)
    
    users_last_30 = CustomUser.objects.filter(
        date_joined__gte=last_30_days
    ).count()
    users_previous_30 = CustomUser.objects.filter(
        date_joined__gte=previous_60_days,
        date_joined__lt=last_30_days
    ).count()
    
    if users_previous_30 > 0:
        taxa_crescimento = round(((users_last_30 - users_previous_30) / users_previous_30) * 100, 1)
    else:
        taxa_crescimento = 100.0 if users_last_30 > 0 else 0.0
    
    data = {
        'usuarios_ativos': usuarios_ativos,
        'eventos_realizados': eventos_realizados,
        'revenue_total': revenue_total,
        'taxa_crescimento': taxa_crescimento
    }
    
    serializer = DashboardMetricasSerializer(data)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAdminUser])
def dashboard_organizadores(request):
    """Organizer statistics for admin dashboard"""
    # Get all user IDs that have created events (organizers)
    organizador_ids = Evento.objects.values_list('organizador_id', flat=True).distinct()
    
    # Count verified and unverified organizers
    total_organizadores = len(organizador_ids)
    verificados = CustomUser.objects.filter(
        id__in=organizador_ids,
        documento_verificado='aprovado'
    ).count()
    nao_verificados = total_organizadores - verificados
    
    # Calculate percentage
    percentual_verificados = round((verificados / total_organizadores) * 100, 1) if total_organizadores > 0 else 0
    
    # Count events by verified vs unverified organizers
    eventos_verificados = Evento.objects.filter(
        organizador__documento_verificado='aprovado'
    ).count()
    eventos_nao_verificados = Evento.objects.exclude(
        organizador__documento_verificado='aprovado'
    ).count()
    
    data = {
        'total_organizadores': total_organizadores,
        'verificados': verificados,
        'nao_verificados': nao_verificados,
        'percentual_verificados': percentual_verificados,
        'eventos_verificados': eventos_verificados,
        'eventos_nao_verificados': eventos_nao_verificados
    }
    
    serializer = DashboardOrganizadoresSerializer(data)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAdminUser])
def dashboard_verificacoes(request):
    """Document verification statistics for admin dashboard"""
    # Count by verification status
    pendentes = CustomUser.objects.filter(documento_verificado='pendente').count()
    verificando = CustomUser.objects.filter(documento_verificado='verificando').count()
    aprovados = CustomUser.objects.filter(documento_verificado='aprovado').count()
    rejeitados = CustomUser.objects.filter(documento_verificado='rejeitado').count()
    
    # Recent activity (using date_joined as proxy for submission date)
    now = timezone.now()
    last_7_days = now - timedelta(days=7)
    last_30_days = now - timedelta(days=30)
    
    # Count submissions in last 7 and 30 days
    ultimos_7_dias = CustomUser.objects.filter(
        date_joined__gte=last_7_days,
        documento_verificado__in=['verificando', 'aprovado', 'rejeitado']
    ).count()
    ultimos_30_dias = CustomUser.objects.filter(
        date_joined__gte=last_30_days,
        documento_verificado__in=['verificando', 'aprovado', 'rejeitado']
    ).count()
    
    data = {
        'pendentes': pendentes,
        'verificando': verificando,
        'aprovados': aprovados,
        'rejeitados': rejeitados,
        'ultimos_7_dias': ultimos_7_dias,
        'ultimos_30_dias': ultimos_30_dias
    }
    
    serializer = DashboardVerificacoesSerializer(data)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAdminUser])
def dashboard_performance(request):
    """System performance metrics for admin dashboard"""
    now = timezone.now()
    last_month = now - timedelta(days=30)
    
    # Inscriptions in last month
    inscricoes_mes = Inscricao.objects.filter(
        created_at__gte=last_month
    ).count()
    
    # Conversion rate (approved / total inscriptions)
    total_inscricoes = Inscricao.objects.count()
    aprovadas = Inscricao.objects.filter(status_pagamento='aprovado').count()
    taxa_conversao = round((aprovadas / total_inscricoes) * 100, 1) if total_inscricoes > 0 else 0
    
    # Most popular events (by inscription count)
    eventos_populares = Evento.objects.annotate(
        total_inscricoes=Count('inscricoes')
    ).order_by('-total_inscricoes')[:5]
    
    eventos_populares_list = [
        {
            'titulo': evento.titulo,
            'total_inscricoes': evento.total_inscricoes
        }
        for evento in eventos_populares
    ]
    
    data = {
        'inscricoes_mes': inscricoes_mes,
        'taxa_conversao': taxa_conversao,
        'eventos_populares': eventos_populares_list
    }
    
    serializer = DashboardPerformanceSerializer(data)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAdminUser])
def dashboard_logs(request):
    """Recent activity logs for admin dashboard"""
    # Last 10 inscriptions
    ultimas_inscricoes = Inscricao.objects.select_related(
        'usuario', 'evento'
    ).order_by('-created_at')[:10].values(
        'id',
        'usuario__username',
        'evento__titulo',
        'status_pagamento',
        'created_at'
    )
    
    # Last 10 transfers
    ultimas_transferencias = TransferRequest.objects.select_related(
        'from_user', 'to_user', 'inscricao__evento'
    ).order_by('-created_at')[:10].values(
        'id',
        'from_user__username',
        'to_user__username',
        'inscricao__evento__titulo',
        'status',
        'created_at'
    )
    
    return Response({
        'ultimas_inscricoes': list(ultimas_inscricoes),
        'ultimas_transferencias': list(ultimas_transferencias)
    })

