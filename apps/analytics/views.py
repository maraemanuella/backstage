"""
Views para Analytics do Evento
Arquivo criado separadamente para não alterar views.py existente
"""
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from django.db.models import Count, Avg, Sum, Q, Max, Min
from django.db.models.functions import TruncDate, TruncHour
from django.utils import timezone
from datetime import datetime, timedelta
from decimal import Decimal
import io
import base64

from apps.eventos.models import Evento
from apps.inscricoes.models import Inscricao
from apps.users.models import CustomUser
from apps.avaliacoes.models import Avaliacao
from .models import EventoAnalytics, InteracaoSimulador, VisualizacaoEvento


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def evento_analytics_geral(request, evento_id):
    """
    Retorna métricas gerais do evento para analytics
    """
    evento = get_object_or_404(Evento, id=evento_id)
    
    # Verifica se o usuário é o organizador
    if evento.organizador != request.user and not request.user.is_staff:
        return Response(
            {'error': 'Você não tem permissão para visualizar analytics deste evento'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    # Buscar ou criar analytics
    analytics, created = EventoAnalytics.objects.get_or_create(evento=evento)
    
    # Calcular métricas em tempo real
    inscricoes = Inscricao.objects.filter(evento=evento)
    total_inscricoes = inscricoes.count()
    inscricoes_confirmadas = inscricoes.filter(status='confirmada').count()
    
    # Taxa de comparecimento
    checkins_realizados = inscricoes.filter(checkin_realizado=True).count()
    taxa_comparecimento = 0
    if inscricoes_confirmadas > 0:
        taxa_comparecimento = round((checkins_realizados / inscricoes_confirmadas) * 100, 1)
    
    # Receita
    receita_total = inscricoes.filter(
        status_pagamento='aprovado'
    ).aggregate(total=Sum('valor_final'))['total'] or Decimal('0')
    
    # Score médio
    score_medio = Avaliacao.objects.filter(
        evento=evento
    ).aggregate(media=Avg('nota'))['media'] or 0
    
    # Visualizações
    total_visualizacoes = VisualizacaoEvento.objects.filter(evento=evento).count()
    visualizacoes_unicas = VisualizacaoEvento.objects.filter(
        evento=evento
    ).values('usuario').distinct().count()
    
    # Taxa de conversão
    taxa_conversao = 0
    if total_visualizacoes > 0:
        taxa_conversao = round((total_inscricoes / total_visualizacoes) * 100, 1)
    
    # Atualizar analytics
    analytics.total_visualizacoes = total_visualizacoes
    analytics.receita_total = receita_total
    analytics.save()
    
    return Response({
        'evento_id': str(evento.id),
        'evento_titulo': evento.titulo,
        'metricas_gerais': {
            'total_inscricoes': total_inscricoes,
            'inscricoes_confirmadas': inscricoes_confirmadas,
            'taxa_comparecimento': taxa_comparecimento,
            'total_visualizacoes': total_visualizacoes,
            'visualizacoes_unicas': visualizacoes_unicas,
            'taxa_conversao': taxa_conversao,
            'receita_total': float(receita_total),
            'score_medio': round(float(score_medio), 1),
        }
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def evento_analytics_demograficos(request, evento_id):
    """
    Retorna dados demográficos dos participantes do evento
    """
    evento = get_object_or_404(Evento, id=evento_id)
    
    # Verifica permissão
    if evento.organizador != request.user and not request.user.is_staff:
        return Response(
            {'error': 'Você não tem permissão para visualizar analytics deste evento'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    # Buscar inscrições confirmadas
    inscricoes = Inscricao.objects.filter(
        evento=evento,
        status='confirmada'
    ).select_related('usuario')
    
    # Análise de gênero
    distribuicao_genero = inscricoes.values('usuario__sexo').annotate(
        count=Count('id')
    ).order_by('-count')
    
    genero_data = []
    for item in distribuicao_genero:
        sexo = item['usuario__sexo']
        if sexo == 'M':
            label = 'Masculino'
        elif sexo == 'F':
            label = 'Feminino'
        elif sexo == 'O':
            label = 'Outro'
        else:
            label = 'Não informado'
        
        genero_data.append({
            'categoria': label,
            'quantidade': item['count'],
            'percentual': round((item['count'] / inscricoes.count() * 100), 1) if inscricoes.count() > 0 else 0
        })
    
    # Análise de faixa etária
    faixas_etarias = {
        '18-25': 0,
        '26-35': 0,
        '36-45': 0,
        '46-55': 0,
        '56+': 0,
        'Não informado': 0
    }
    
    for inscricao in inscricoes:
        if inscricao.usuario.data_nascimento:
            idade = (timezone.now().date() - inscricao.usuario.data_nascimento).days // 365
            if 18 <= idade <= 25:
                faixas_etarias['18-25'] += 1
            elif 26 <= idade <= 35:
                faixas_etarias['26-35'] += 1
            elif 36 <= idade <= 45:
                faixas_etarias['36-45'] += 1
            elif 46 <= idade <= 55:
                faixas_etarias['46-55'] += 1
            elif idade > 55:
                faixas_etarias['56+'] += 1
        else:
            faixas_etarias['Não informado'] += 1
    
    faixa_etaria_data = [
        {
            'faixa': faixa,
            'quantidade': quantidade,
            'percentual': round((quantidade / inscricoes.count() * 100), 1) if inscricoes.count() > 0 else 0
        }
        for faixa, quantidade in faixas_etarias.items()
    ]
    
    # Score médio dos participantes
    score_medio_participantes = inscricoes.aggregate(
        media=Avg('usuario__score')
    )['media'] or 0
    
    # Perfil ideal (baseado nos dados mais comuns)
    genero_predominante = genero_data[0]['categoria'] if genero_data else 'Não definido'
    faixa_predominante = max(faixas_etarias, key=faixas_etarias.get)
    
    return Response({
        'distribuicao_genero': genero_data,
        'distribuicao_faixa_etaria': faixa_etaria_data,
        'score_medio_participantes': round(float(score_medio_participantes), 1),
        'perfil_ideal': {
            'genero': genero_predominante,
            'faixa_etaria': faixa_predominante,
            'score_medio': round(float(score_medio_participantes), 1)
        }
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def evento_analytics_interacoes(request, evento_id):
    """
    Retorna métricas de interações ao longo do tempo
    """
    evento = get_object_or_404(Evento, id=evento_id)
    
    # Verifica permissão
    if evento.organizador != request.user and not request.user.is_staff:
        return Response(
            {'error': 'Você não tem permissão para visualizar analytics deste evento'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    # Inscrições ao longo do tempo (últimos 30 dias)
    trinta_dias_atras = timezone.now() - timedelta(days=30)
    
    inscricoes_por_dia = Inscricao.objects.filter(
        evento=evento,
        created_at__gte=trinta_dias_atras
    ).annotate(
        dia=TruncDate('created_at')
    ).values('dia').annotate(
        count=Count('id')
    ).order_by('dia')
    
    timeline_inscricoes = [
        {
            'data': item['dia'].strftime('%Y-%m-%d'),
            'quantidade': item['count']
        }
        for item in inscricoes_por_dia
    ]
    
    # Check-ins por horário (se evento já aconteceu)
    checkins_por_hora = Inscricao.objects.filter(
        evento=evento,
        checkin_realizado=True,
        data_checkin__isnull=False
    ).annotate(
        hora=TruncHour('data_checkin')
    ).values('hora').annotate(
        count=Count('id')
    ).order_by('hora')
    
    timeline_checkins = [
        {
            'horario': item['hora'].strftime('%H:%M'),
            'quantidade': item['count']
        }
        for item in checkins_por_hora
    ]
    
    # Interações com simuladores (mockado para exemplo)
    interacoes_simulador = InteracaoSimulador.objects.filter(evento=evento)
    
    simuladores_stats = interacoes_simulador.values('tipo_simulador').annotate(
        total_acessos=Count('id'),
        tempo_medio=Avg('duracao_segundos')
    ).order_by('-total_acessos')
    
    simuladores_data = [
        {
            'nome': item['tipo_simulador'],
            'acessos': item['total_acessos'],
            'tempo_medio_minutos': round(item['tempo_medio'] / 60, 1) if item['tempo_medio'] else 0
        }
        for item in simuladores_stats
    ]
    
    return Response({
        'timeline_inscricoes': timeline_inscricoes,
        'timeline_checkins': timeline_checkins,
        'interacoes_simuladores': simuladores_data
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def evento_analytics_roi(request, evento_id):
    """
    Retorna cálculo detalhado de ROI do evento
    """
    evento = get_object_or_404(Evento, id=evento_id)
    
    # Verifica permissão
    if evento.organizador != request.user and not request.user.is_staff:
        return Response(
            {'error': 'Você não tem permissão para visualizar analytics deste evento'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    # Buscar ou criar analytics
    analytics, created = EventoAnalytics.objects.get_or_create(evento=evento)
    
    # Calcular receitas
    inscricoes_pagas = Inscricao.objects.filter(
        evento=evento,
        status_pagamento='aprovado'
    )
    
    receita_depositos = inscricoes_pagas.aggregate(
        total=Sum('valor_final')
    )['total'] or Decimal('0')
    
    # Reembolsos não realizados (pessoas que compareceram)
    inscricoes_comparecimento = inscricoes_pagas.filter(checkin_realizado=True)
    reembolsos_nao_realizados = inscricoes_comparecimento.aggregate(
        total=Sum('valor_final')
    )['total'] or Decimal('0')
    
    # Receita total considerando reembolsos não realizados
    receita_total = receita_depositos
    receita_liquida = reembolsos_nao_realizados  # Receita que ficou (não foi reembolsada)
    
    # Atualizar analytics com receita total
    analytics.receita_total = receita_liquida
    analytics.save()
    
    # Calcular ROI
    custo_total = analytics.custo_total or Decimal('0')
    
    if custo_total > 0:
        retorno = receita_liquida - custo_total
        roi_percentual = float((retorno / custo_total) * 100)
        roi_multiplicador = float(receita_liquida / custo_total)
    else:
        retorno = receita_liquida
        roi_percentual = 0
        roi_multiplicador = 0
    
    # Atualizar ROI no analytics
    analytics.calcular_roi()
    analytics.save()
    
    return Response({
        'receita': {
            'depositos_totais': float(receita_depositos),
            'reembolsos_nao_realizados': float(reembolsos_nao_realizados),
            'receita_liquida': float(receita_liquida)
        },
        'custos': {
            'custo_total_evento': float(custo_total)
        },
        'roi': {
            'retorno_financeiro': float(retorno),
            'roi_percentual': round(roi_percentual, 1),
            'roi_multiplicador': round(roi_multiplicador, 2)
        },
        'metricas_adicionais': {
            'total_inscritos': inscricoes_pagas.count(),
            'total_comparecimento': inscricoes_comparecimento.count(),
            'taxa_comparecimento': round(
                (inscricoes_comparecimento.count() / inscricoes_pagas.count() * 100), 1
            ) if inscricoes_pagas.count() > 0 else 0
        }
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def evento_analytics_atualizar_custo(request, evento_id):
    """
    Atualiza o custo total do evento para cálculo de ROI
    """
    evento = get_object_or_404(Evento, id=evento_id)
    
    # Verifica permissão
    if evento.organizador != request.user and not request.user.is_staff:
        return Response(
            {'error': 'Você não tem permissão para editar este evento'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    custo_total = request.data.get('custo_total')
    
    if custo_total is None:
        return Response(
            {'error': 'Campo custo_total é obrigatório'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        custo_total = Decimal(str(custo_total))
        if custo_total < 0:
            return Response(
                {'error': 'Custo total não pode ser negativo'},
                status=status.HTTP_400_BAD_REQUEST
            )
    except:
        return Response(
            {'error': 'Valor inválido para custo_total'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Buscar ou criar analytics
    analytics, created = EventoAnalytics.objects.get_or_create(evento=evento)
    
    # Recalcular receita total (inscrições pagas que compareceram)
    receita_total = Inscricao.objects.filter(
        evento=evento,
        status_pagamento='aprovado',
        checkin_realizado=True
    ).aggregate(total=Sum('valor_final'))['total'] or Decimal('0')
    
    # Atualizar valores
    analytics.custo_total = custo_total
    analytics.receita_total = receita_total
    
    # Recalcular ROI
    analytics.calcular_roi()
    
    # Salvar todas as alterações
    analytics.save()
    
    # Calcular retorno financeiro
    retorno_financeiro = analytics.receita_total - analytics.custo_total
    
    # Calcular multiplicador
    roi_multiplicador = 0
    if analytics.custo_total > 0:
        roi_multiplicador = float(analytics.receita_total / analytics.custo_total)
    
    return Response({
        'message': 'Custo atualizado com sucesso',
        'custo_total': float(analytics.custo_total),
        'receita_total': float(analytics.receita_total),
        'retorno_financeiro': float(retorno_financeiro),
        'roi': round(float(analytics.roi), 1),
        'roi_multiplicador': round(roi_multiplicador, 2)
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def evento_analytics_exportar_pdf(request, evento_id):
    """
    Gera e retorna relatório em PDF do analytics do evento
    """
    evento = get_object_or_404(Evento, id=evento_id)
    
    # Verifica permissão
    if evento.organizador != request.user and not request.user.is_staff:
        return Response(
            {'error': 'Você não tem permissão para visualizar analytics deste evento'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        from reportlab.lib.pagesizes import letter, A4
        from reportlab.lib import colors
        from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
        from reportlab.lib.units import inch
        from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, PageBreak
        from reportlab.lib.enums import TA_CENTER, TA_LEFT
    except ImportError:
        return Response(
            {
                'error': 'Biblioteca reportlab não instalada',
                'message': 'Execute: pip install reportlab'
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
    
    # Criar buffer para o PDF
    buffer = io.BytesIO()
    
    # Criar documento
    doc = SimpleDocTemplate(buffer, pagesize=A4)
    story = []
    styles = getSampleStyleSheet()
    
    # Estilo customizado para título
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=24,
        textColor=colors.HexColor('#1E3A8A'),
        spaceAfter=30,
        alignment=TA_CENTER
    )
    
    # Título do relatório
    story.append(Paragraph(f"Relatório de Analytics<br/>{evento.titulo}", title_style))
    story.append(Spacer(1, 0.3*inch))
    
    # Informações básicas do evento
    info_evento = [
        ['Evento:', evento.titulo],
        ['Data:', evento.data_evento.strftime('%d/%m/%Y')],
        ['Local:', evento.endereco],
        ['Organizador:', evento.organizador.get_full_name() or evento.organizador.username],
        ['Gerado em:', timezone.now().strftime('%d/%m/%Y às %H:%M')]
    ]
    
    table = Table(info_evento, colWidths=[2*inch, 4*inch])
    table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#E5E7EB')),
        ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
        ('GRID', (0, 0), (-1, -1), 1, colors.grey)
    ]))
    
    story.append(table)
    story.append(Spacer(1, 0.5*inch))
    
    # Seção: Métricas Gerais
    story.append(Paragraph("Métricas Gerais", styles['Heading2']))
    story.append(Spacer(1, 0.2*inch))
    
    # Buscar dados
    inscricoes = Inscricao.objects.filter(evento=evento)
    total_inscricoes = inscricoes.count()
    checkins = inscricoes.filter(checkin_realizado=True).count()
    taxa_comparecimento = round((checkins / total_inscricoes * 100), 1) if total_inscricoes > 0 else 0
    
    receita_total = inscricoes.filter(
        status_pagamento='aprovado'
    ).aggregate(total=Sum('valor_final'))['total'] or Decimal('0')
    
    metricas_data = [
        ['Métrica', 'Valor'],
        ['Total de Inscrições', str(total_inscricoes)],
        ['Check-ins Realizados', str(checkins)],
        ['Taxa de Comparecimento', f'{taxa_comparecimento}%'],
        ['Receita Total', f'R$ {receita_total:,.2f}'.replace(',', 'X').replace('.', ',').replace('X', '.')]
    ]
    
    table = Table(metricas_data, colWidths=[3*inch, 2*inch])
    table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#3B82F6')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 12),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('GRID', (0, 0), (-1, -1), 1, colors.grey),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#F3F4F6')])
    ]))
    
    story.append(table)
    story.append(Spacer(1, 0.3*inch))
    
    # Seção: ROI
    analytics, _ = EventoAnalytics.objects.get_or_create(evento=evento)
    
    story.append(Paragraph("Retorno sobre Investimento (ROI)", styles['Heading2']))
    story.append(Spacer(1, 0.2*inch))
    
    custo_total = analytics.custo_total or Decimal('0')
    receita_liquida = inscricoes.filter(
        checkin_realizado=True,
        status_pagamento='aprovado'
    ).aggregate(total=Sum('valor_final'))['total'] or Decimal('0')
    
    if custo_total > 0:
        retorno = receita_liquida - custo_total
        roi_percentual = float((retorno / custo_total) * 100)
    else:
        retorno = receita_liquida
        roi_percentual = 0
    
    roi_data = [
        ['Item', 'Valor'],
        ['Custo Total do Evento', f'R$ {custo_total:,.2f}'.replace(',', 'X').replace('.', ',').replace('X', '.')],
        ['Receita Líquida', f'R$ {receita_liquida:,.2f}'.replace(',', 'X').replace('.', ',').replace('X', '.')],
        ['Retorno Financeiro', f'R$ {retorno:,.2f}'.replace(',', 'X').replace('.', ',').replace('X', '.')],
        ['ROI', f'{roi_percentual:.1f}%']
    ]
    
    table = Table(roi_data, colWidths=[3*inch, 2*inch])
    table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#10B981')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 12),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('GRID', (0, 0), (-1, -1), 1, colors.grey),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#F3F4F6')])
    ]))
    
    story.append(table)
    
    # Construir PDF
    doc.build(story)
    
    # Pegar conteúdo do buffer
    pdf_content = buffer.getvalue()
    buffer.close()
    
    # Retornar PDF em base64
    pdf_base64 = base64.b64encode(pdf_content).decode('utf-8')
    
    return Response({
        'pdf_base64': pdf_base64,
        'filename': f'analytics_{evento.titulo.replace(" ", "_")}_{timezone.now().strftime("%Y%m%d")}.pdf'
    })
