from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Sum, Avg, Count
from django.utils import timezone
from datetime import timedelta

from apps.eventos.models import Evento
from apps.inscricoes.models import Inscricao
from apps.avaliacoes.models import Avaliacao
from apps.users.models import CustomUser as User
from apps.transferencias.models import TransferRequest


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_metricas(request):
    """Dashboard do Organizador - métricas dos eventos do usuário logado"""
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
# DASHBOARD ADMIN
# =======================

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_metricas_globais(request):
    """
    Dashboard Admin - Métricas Globais do Sistema
    Retorna estatísticas gerais da plataforma (usuários ativos, eventos, receita, crescimento)
    Acesso: Apenas administradores (is_staff=True)
    """
    
    if not request.user.is_staff:
        return Response(
            {'error': 'Acesso negado. Apenas administradores podem acessar este recurso.'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    # Usuários que fizeram login nos últimos 30 dias
    usuarios_ativos = User.objects.filter(
        last_login__gte=timezone.now() - timedelta(days=30)
    ).count()
    
    # Eventos já finalizados
    eventos_realizados = Evento.objects.filter(
        data_evento__lt=timezone.now()
    ).count()
    
    # Receita total de inscrições aprovadas
    revenue_total = Inscricao.objects.filter(
        status_pagamento='aprovado'
    ).aggregate(total=Sum('valor_final'))['total'] or 0
    
    # Taxa de crescimento de novos usuários (últimos 30 dias vs 30 dias anteriores)
    hoje = timezone.now()
    ultimos_30 = User.objects.filter(
        date_joined__gte=hoje - timedelta(days=30)
    ).count()
    anteriores_30 = User.objects.filter(
        date_joined__gte=hoje - timedelta(days=60),
        date_joined__lt=hoje - timedelta(days=30)
    ).count()
    
    if anteriores_30 > 0:
        taxa_crescimento = ((ultimos_30 - anteriores_30) / anteriores_30) * 100
    else:
        taxa_crescimento = 100 if ultimos_30 > 0 else 0
    
    data = {
        'usuarios_ativos': usuarios_ativos,
        'eventos_realizados': eventos_realizados,
        'revenue_total': float(revenue_total),
        'taxa_crescimento': round(taxa_crescimento, 2)
    }
    
    from .serializers import DashboardMetricasSerializer
    serializer = DashboardMetricasSerializer(data)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_organizadores(request):
    """
    Dashboard Admin - Comparativo de Organizadores
    Compara organizadores verificados vs não verificados e seus eventos
    Acesso: Apenas administradores
    """
    
    if not request.user.is_staff:
        return Response(
            {'error': 'Acesso negado. Apenas administradores podem acessar este recurso.'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    # Conta todos os usuários que criaram pelo menos um evento
    # Usa o ID do evento para verificar se existe algum relacionamento
    ids_organizadores = Evento.objects.values_list('organizador_id', flat=True).distinct()
    total_organizadores = len(ids_organizadores)
    
    # Organizadores com documento verificado
    verificados = User.objects.filter(
        id__in=ids_organizadores,
        documento_verificado='aprovado'
    ).count()
    
    nao_verificados = total_organizadores - verificados
    
    # Eventos criados por organizadores verificados
    eventos_verificados = Evento.objects.filter(
        organizador__documento_verificado='aprovado'
    ).count()
    
    # Eventos criados por organizadores não verificados
    eventos_nao_verificados = Evento.objects.exclude(
        organizador__documento_verificado='aprovado'
    ).count()
    
    data = {
        'total_organizadores': total_organizadores,
        'verificados': verificados,
        'nao_verificados': nao_verificados,
        'eventos_verificados': eventos_verificados,
        'eventos_nao_verificados': eventos_nao_verificados,
        'percentual_verificados': round((verificados / total_organizadores * 100), 2) if total_organizadores > 0 else 0
    }
    
    from .serializers import DashboardOrganizadoresSerializer
    serializer = DashboardOrganizadoresSerializer(data)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_verificacoes(request):
    """
    Dashboard Admin - Estatísticas de Verificações de Documento
    Mostra o status das verificações de documentos dos usuários
    Acesso: Apenas administradores
    """
    
    if not request.user.is_staff:
        return Response(
            {'error': 'Acesso negado. Apenas administradores podem acessar este recurso.'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    # Usuários com verificação pendente (que já enviaram documento)
    total_pendentes = User.objects.filter(
        documento_verificado='pendente'
    ).exclude(tipo_documento__isnull=True).count()
    
    # Em processo de verificação
    total_verificando = User.objects.filter(
        documento_verificado='verificando'
    ).count()
    
    # Verificações aprovadas
    total_aprovados = User.objects.filter(
        documento_verificado='aprovado'
    ).count()
    
    # Verificações rejeitadas
    total_rejeitados = User.objects.filter(
        documento_verificado='rejeitado'
    ).count()
    
    # Aprovados nos últimos 7 dias
    # Usando date_joined como referência já que updated_at não existe no modelo User
    ultimos_7_dias = User.objects.filter(
        documento_verificado='aprovado',
        date_joined__gte=timezone.now() - timedelta(days=7)
    ).count()
    
    # Aprovados nos últimos 30 dias
    ultimos_30_dias = User.objects.filter(
        documento_verificado='aprovado',
        date_joined__gte=timezone.now() - timedelta(days=30)
    ).count()
    
    data = {
        'pendentes': total_pendentes,
        'verificando': total_verificando,
        'aprovados': total_aprovados,
        'rejeitados': total_rejeitados,
        'ultimos_7_dias': ultimos_7_dias,
        'ultimos_30_dias': ultimos_30_dias
    }
    
    from .serializers import DashboardVerificacoesSerializer
    serializer = DashboardVerificacoesSerializer(data)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_performance(request):
    """
    Dashboard Admin - Métricas de Performance do Sistema
    Mostra inscrições do mês, taxa de conversão e eventos mais populares
    Acesso: Apenas administradores
    """
    
    if not request.user.is_staff:
        return Response(
            {'error': 'Acesso negado. Apenas administradores podem acessar este recurso.'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    # Inscrições criadas nos últimos 30 dias
    inscricoes_mes = Inscricao.objects.filter(
        created_at__gte=timezone.now() - timedelta(days=30)
    ).count()
    
    # Taxa de conversão: % de inscrições aprovadas vs total
    total_inscricoes = Inscricao.objects.count()
    inscricoes_aprovadas = Inscricao.objects.filter(status_pagamento='aprovado').count()
    taxa_conversao = (inscricoes_aprovadas / total_inscricoes * 100) if total_inscricoes > 0 else 0
    
    # Top 5 eventos com mais inscrições
    eventos_populares = list(Evento.objects.annotate(
        total_inscricoes=Count('inscricoes')
    ).order_by('-total_inscricoes')[:5].values('titulo', 'total_inscricoes'))
    
    data = {
        'inscricoes_mes': inscricoes_mes,
        'taxa_conversao': round(taxa_conversao, 2),
        'eventos_populares': eventos_populares
    }
    
    from .serializers import DashboardPerformanceSerializer
    serializer = DashboardPerformanceSerializer(data)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_logs(request):
    """
    Dashboard Admin - Logs de Atividade Recente
    Retorna as últimas inscrições e transferências do sistema
    Acesso: Apenas administradores
    """
    
    if not request.user.is_staff:
        return Response(
            {'error': 'Acesso negado. Apenas administradores podem acessar este recurso.'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    # Últimas 10 inscrições criadas
    ultimas_inscricoes = list(Inscricao.objects.select_related(
        'usuario', 'evento'
    ).order_by('-created_at')[:10].values(
        'id',
        'usuario__username',
        'evento__titulo',
        'created_at',
        'status_pagamento'
    ))
    
    # Últimas 10 transferências criadas
    ultimas_transferencias = list(TransferRequest.objects.select_related(
        'from_user', 'to_user', 'inscricao__evento'
    ).order_by('-created_at')[:10].values(
        'id',
        'from_user__username',
        'to_user__username',
        'inscricao__evento__titulo',
        'status',
        'created_at'
    ))
    
    return Response({
        'ultimas_inscricoes': ultimas_inscricoes,
        'ultimas_transferencias': ultimas_transferencias
    })

