"""
payment_views.py
Views relacionadas ao sistema de pagamento PIX
Separado para evitar conflitos de merge
"""
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404

from .models import Evento, Inscricao
from .payment_serializers import (
    PaymentInscricaoCreateSerializer,
    QRCodePixSerializer,
    PaymentInfoSerializer
)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def evento_qrcode_pix(request, evento_id):
    """
    Retorna apenas o QR Code PIX do evento.
    Endpoint simplificado para a PaymentPage.
    
    GET /api/pagamento/evento/<uuid>/qrcode/
    """
    evento = get_object_or_404(Evento, id=evento_id)
    
    serializer = QRCodePixSerializer(evento, context={'request': request})
    
    return Response({
        'evento_id': str(evento.id),
        'evento_titulo': evento.titulo,
        'qr_code_pix_url': serializer.data.get('qr_code_pix_url'),
        'tem_qr_code': bool(evento.qr_code_pix),
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def inscricao_pagamento_info(request, inscricao_id):
    """
    Retorna informações de pagamento de uma inscrição específica.
    Usado para exibir dados na PaymentPage.
    
    GET /api/pagamento/inscricao/<uuid>/
    """
    inscricao = get_object_or_404(
        Inscricao,
        id=inscricao_id,
        usuario=request.user
    )
    
    # Busca QR Code do evento
    qr_code_pix_url = None
    if inscricao.evento.qr_code_pix:
        qr_code_pix_url = request.build_absolute_uri(inscricao.evento.qr_code_pix.url)
    
    data = {
        'inscricao_id': str(inscricao.id),
        'metodo_pagamento': inscricao.metodo_pagamento,
        'status_pagamento': inscricao.status_pagamento,
        'valor_original': inscricao.valor_original,
        'valor_final': inscricao.valor_final,
        'desconto_aplicado': inscricao.desconto_aplicado,
        'qr_code_pix_url': qr_code_pix_url,
        'evento': {
            'id': str(inscricao.evento.id),
            'titulo': inscricao.evento.titulo,
            'data_evento': inscricao.evento.data_evento,
        }
    }
    
    return Response(data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def atualizar_status_pagamento(request, inscricao_id):
    """
    Atualiza o status de pagamento de uma inscrição.
    Usado para confirmar pagamento manualmente (futuro: webhook).
    
    POST /api/pagamento/inscricao/<uuid>/atualizar/
    Body: { "status_pagamento": "aprovado" }
    """
    inscricao = get_object_or_404(
        Inscricao,
        id=inscricao_id
    )
    
    # Verifica permissão (usuário ou organizador)
    if inscricao.usuario != request.user and inscricao.evento.organizador != request.user:
        return Response(
            {'error': 'Você não tem permissão para atualizar este pagamento'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    novo_status = request.data.get('status_pagamento')
    
    # Valida status
    status_validos = ['pendente', 'aprovado', 'rejeitado', 'reembolsado']
    if novo_status not in status_validos:
        return Response(
            {'error': f'Status inválido. Use: {", ".join(status_validos)}'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    inscricao.status_pagamento = novo_status
    inscricao.save(update_fields=['status_pagamento'])
    
    return Response({
        'message': 'Status de pagamento atualizado com sucesso',
        'inscricao_id': str(inscricao.id),
        'status_pagamento': inscricao.status_pagamento,
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def pagamentos_pendentes(request):
    """
    Lista todas as inscrições do usuário com pagamento pendente.
    
    GET /api/pagamento/pendentes/
    """
    inscricoes = Inscricao.objects.filter(
        usuario=request.user,
        status_pagamento='pendente'
    ).select_related('evento')
    
    data = [
        {
            'inscricao_id': str(i.id),
            'evento_id': str(i.evento.id),
            'evento_titulo': i.evento.titulo,
            'valor_final': float(i.valor_final),
            'data_inscricao': i.created_at,
        }
        for i in inscricoes
    ]
    
    return Response({
        'count': len(data),
        'pagamentos_pendentes': data
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def historico_pagamentos(request):
    """
    Retorna histórico completo de pagamentos do usuário.
    
    GET /api/pagamento/historico/
    """
    inscricoes = Inscricao.objects.filter(
        usuario=request.user
    ).select_related('evento').order_by('-created_at')
    
    data = [
        {
            'inscricao_id': str(i.id),
            'evento_titulo': i.evento.titulo,
            'metodo_pagamento': i.metodo_pagamento,
            'status_pagamento': i.status_pagamento,
            'valor_final': float(i.valor_final),
            'desconto_aplicado': float(i.desconto_aplicado),
            'data_inscricao': i.created_at,
        }
        for i in inscricoes
    ]
    
    return Response({
        'count': len(data),
        'historico': data
    })
