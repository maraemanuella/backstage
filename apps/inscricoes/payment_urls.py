"""
payment_urls.py
URLs relacionadas ao sistema de pagamento PIX
"""
from django.urls import path
from . import payment_views

urlpatterns = [
    # QR Code PIX do evento
    path(
        'evento/<uuid:evento_id>/qrcode/',
        payment_views.evento_qrcode_pix,
        name='evento-qrcode-pix'
    ),
    
    # Informações de pagamento da inscrição
    path(
        'inscricao/<uuid:inscricao_id>/',
        payment_views.inscricao_pagamento_info,
        name='inscricao-pagamento-info'
    ),
    
    # Atualizar status de pagamento
    path(
        'inscricao/<uuid:inscricao_id>/atualizar/',
        payment_views.atualizar_status_pagamento,
        name='atualizar-status-pagamento'
    ),
    
    # Listar pagamentos pendentes
    path(
        'pendentes/',
        payment_views.pagamentos_pendentes,
        name='pagamentos-pendentes'
    ),
    
    # Histórico de pagamentos
    path(
        'historico/',
        payment_views.historico_pagamentos,
        name='historico-pagamentos'
    ),
]
