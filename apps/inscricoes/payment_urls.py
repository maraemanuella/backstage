"""
payment_urls.py
URLs relacionadas ao sistema de pagamento com Stripe (Cartão)
"""
from django.urls import path
from . import payment_views

urlpatterns = [
    # Stripe endpoints (Cartão de Crédito/Débito)
    path(
        'stripe/create-checkout-session/',
        payment_views.create_stripe_checkout_session,
        name='stripe-create-checkout-session'
    ),
    path(
        'stripe/success/',
        payment_views.stripe_payment_success,
        name='stripe-payment-success'
    ),
    path(
        'stripe/webhook/',
        payment_views.stripe_webhook,
        name='stripe-webhook'
    ),
    path(
        'stripe/config/',
        payment_views.stripe_config,
        name='stripe-config'
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
