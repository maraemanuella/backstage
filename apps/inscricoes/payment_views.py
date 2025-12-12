"""
payment_views.py
Views relacionadas ao sistema de pagamento com Stripe (Cartão)
"""
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from django.conf import settings
from django.views.decorators.csrf import csrf_exempt
from django.utils import timezone
import stripe
import json
import logging

from apps.eventos.models import Evento
from apps.inscricoes.models import Inscricao

# Configure logging
logger = logging.getLogger(__name__)

# Configure Stripe
try:
    stripe.api_key = settings.STRIPE_SECRET_KEY
    if not stripe.api_key or stripe.api_key == 'your_stripe_secret_key_here':
        logger.warning("Stripe API key not configured properly")
except AttributeError:
    logger.error("STRIPE_SECRET_KEY not found in settings")



@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_stripe_checkout_session(request):
    """
    Cria uma sessão de checkout do Stripe para pagamento com cartão.

    POST /api/pagamento/stripe/create-checkout-session/
    Body: {
        "inscricao_id": "uuid-da-inscricao"
    }
    """
    inscricao_id = None
    try:
        # Verificar se Stripe está configurado
        if not stripe.api_key or stripe.api_key == 'your_stripe_secret_key_here':
            logger.error("Stripe API key not configured")
            return Response(
                {'error': 'Pagamento com cartão não está configurado. Entre em contato com o suporte.'},
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )

        inscricao_id = request.data.get('inscricao_id')

        if not inscricao_id:
            return Response(
                {'error': 'inscricao_id é obrigatório'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Buscar inscrição
        inscricao = get_object_or_404(
            Inscricao,
            id=inscricao_id,
            usuario=request.user
        )

        # Verificar se pagamento já foi aprovado
        if inscricao.status_pagamento == 'aprovado':
            return Response(
                {'error': 'Pagamento já foi aprovado'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Verificar se o método de pagamento é cartão
        if inscricao.metodo_pagamento not in ['cartao_credito', 'cartao_debito']:
            return Response(
                {'error': 'Esta inscrição não foi configurada para pagamento com cartão'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Criar linha de item para o Stripe
        # Convertendo valor para centavos (Stripe usa centavos)
        amount_in_cents = int(float(inscricao.valor_final) * 100)

        # Validar valor mínimo (50 centavos = R$ 0,50)
        if amount_in_cents < 50:
            return Response(
                {'error': 'Valor mínimo para pagamento com cartão é R$ 0,50'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Obter configurações
        frontend_url = getattr(settings, 'FRONTEND_URL', 'http://localhost:5173')
        stripe_currency = getattr(settings, 'STRIPE_CURRENCY', 'brl')

        # URL de sucesso e cancelamento
        success_url = f"{frontend_url}/payment/success?session_id={{CHECKOUT_SESSION_ID}}&inscricao_id={inscricao.id}"
        cancel_url = f"{frontend_url}/payment/cancel?inscricao_id={inscricao.id}"

        logger.info(f"Creating Stripe checkout session for inscricao {inscricao.id}, amount: {amount_in_cents} cents")

        # Criar sessão de checkout
        checkout_session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            line_items=[
                {
                    'price_data': {
                        'currency': stripe_currency,
                        'unit_amount': amount_in_cents,
                        'product_data': {
                            'name': inscricao.evento.titulo,
                            'description': f'Inscrição para o evento {inscricao.evento.titulo}',
                        },
                    },
                    'quantity': 1,
                },
            ],
            mode='payment',
            success_url=success_url,
            cancel_url=cancel_url,
            client_reference_id=str(inscricao.id),
            customer_email=inscricao.email_inscricao,
            metadata={
                'inscricao_id': str(inscricao.id),
                'evento_id': str(inscricao.evento.id),
                'usuario_id': str(request.user.id),
            }
        )

        # Salvar session_id na inscrição para referência
        inscricao.id_transacao_gateway = checkout_session.id
        inscricao.save()

        logger.info(f"Stripe checkout session created: {checkout_session.id}")

        return Response({
            'checkout_url': checkout_session.url,
            'session_id': checkout_session.id,
        }, status=status.HTTP_200_OK)

    except Inscricao.DoesNotExist:
        logger.error(f"Inscricao not found: {inscricao_id}")
        return Response(
            {'error': 'Inscrição não encontrada'},
            status=status.HTTP_404_NOT_FOUND
        )
    except stripe.error.InvalidRequestError as e:
        logger.error(f"Stripe InvalidRequestError: {str(e)}")
        return Response(
            {'error': f'Erro na configuração do pagamento: {str(e)}'},
            status=status.HTTP_400_BAD_REQUEST
        )
    except stripe.error.AuthenticationError as e:
        logger.error(f"Stripe AuthenticationError: {str(e)}")
        return Response(
            {'error': 'Erro de autenticação com Stripe. Verifique as configurações.'},
            status=status.HTTP_503_SERVICE_UNAVAILABLE
        )
    except stripe.error.APIConnectionError as e:
        logger.error(f"Stripe APIConnectionError: {str(e)}")
        return Response(
            {'error': 'Erro de conexão com Stripe. Tente novamente.'},
            status=status.HTTP_503_SERVICE_UNAVAILABLE
        )
    except stripe.error.StripeError as e:
        logger.error(f"Stripe general error: {str(e)}")
        return Response(
            {'error': f'Erro no Stripe: {str(e)}'},
            status=status.HTTP_400_BAD_REQUEST
        )
    except Exception as e:
        logger.exception(f"Unexpected error creating Stripe checkout session: {str(e)}")
        return Response(
            {'error': f'Erro ao criar sessão de checkout: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def stripe_payment_success(request):
    """
    Endpoint chamado após sucesso no pagamento Stripe.
    Verifica o status da sessão e atualiza a inscrição.

    GET /api/pagamento/stripe/success/?session_id=xxx&inscricao_id=xxx
    """
    try:
        session_id = request.query_params.get('session_id')
        inscricao_id = request.query_params.get('inscricao_id')

        if not session_id or not inscricao_id:
            return Response(
                {'error': 'session_id e inscricao_id são obrigatórios'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Buscar inscrição
        inscricao = get_object_or_404(
            Inscricao,
            id=inscricao_id,
            usuario=request.user
        )

        # Recuperar sessão do Stripe
        session = stripe.checkout.Session.retrieve(session_id)

        # Verificar se o pagamento foi bem-sucedido
        if session.payment_status == 'paid':
            inscricao.status_pagamento = 'aprovado'
            inscricao.status = 'confirmada'
            inscricao.metodo_pagamento = 'cartao_credito'
            inscricao.id_transacao_gateway = session.payment_intent
            inscricao.save()

            return Response({
                'success': True,
                'message': 'Pagamento confirmado com sucesso!',
                'inscricao': {
                    'id': str(inscricao.id),
                    'status': inscricao.status,
                    'status_pagamento': inscricao.status_pagamento,
                    'evento': {
                        'titulo': inscricao.evento.titulo,
                        'data_evento': inscricao.evento.data_evento,
                    }
                }
            }, status=status.HTTP_200_OK)
        else:
            return Response({
                'success': False,
                'message': 'Pagamento não foi concluído',
                'payment_status': session.payment_status
            }, status=status.HTTP_400_BAD_REQUEST)

    except Inscricao.DoesNotExist:
        return Response(
            {'error': 'Inscrição não encontrada'},
            status=status.HTTP_404_NOT_FOUND
        )
    except stripe.error.StripeError as e:
        return Response(
            {'error': f'Erro no Stripe: {str(e)}'},
            status=status.HTTP_400_BAD_REQUEST
        )
    except Exception as e:
        return Response(
            {'error': f'Erro ao verificar pagamento: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([AllowAny])
@csrf_exempt
def stripe_webhook(request):
    """
    Webhook para receber eventos do Stripe.
    Usado para confirmação automática de pagamentos.

    POST /api/pagamento/stripe/webhook/
    """
    payload = request.body
    sig_header = request.META.get('HTTP_STRIPE_SIGNATURE')

    try:
        # Verificar assinatura do webhook (se configurado)
        if settings.STRIPE_WEBHOOK_SECRET:
            event = stripe.Webhook.construct_event(
                payload, sig_header, settings.STRIPE_WEBHOOK_SECRET
            )
        else:
            # Para desenvolvimento, apenas parse o JSON
            event = json.loads(payload)

        # Processar evento
        if event['type'] == 'checkout.session.completed':
            session = event['data']['object']

            # Buscar inscrição
            inscricao_id = session.get('client_reference_id') or session.get('metadata', {}).get('inscricao_id')

            if inscricao_id:
                try:
                    inscricao = Inscricao.objects.get(id=inscricao_id)

                    # Atualizar status do pagamento
                    if session.get('payment_status') == 'paid':
                        inscricao.status_pagamento = 'aprovado'
                        inscricao.status = 'confirmada'
                        inscricao.metodo_pagamento = 'cartao_credito'
                        inscricao.id_transacao_gateway = session.get('payment_intent', session.get('id'))
                        inscricao.save()

                        # TODO: Enviar email de confirmação

                except Inscricao.DoesNotExist:
                    pass

        elif event['type'] == 'payment_intent.payment_failed':
            # Lidar com falha no pagamento
            payment_intent = event['data']['object']
            # Buscar inscrição pelo payment_intent_id
            try:
                inscricao = Inscricao.objects.get(id_transacao_gateway=payment_intent['id'])
                inscricao.status_pagamento = 'rejeitado'
                inscricao.save()
            except Inscricao.DoesNotExist:
                pass

        return Response({'status': 'success'}, status=status.HTTP_200_OK)

    except ValueError:
        return Response({'error': 'Invalid payload'}, status=status.HTTP_400_BAD_REQUEST)
    except stripe.error.SignatureVerificationError:
        return Response({'error': 'Invalid signature'}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def stripe_config(request):
    """
    Retorna a chave pública do Stripe para o frontend.

    GET /api/pagamento/stripe/config/
    """
    return Response({
        'publishable_key': settings.STRIPE_PUBLISHABLE_KEY
    })


# Views PIX (mantidas do código original)


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
    Cancela automaticamente se a inscrição estiver expirada.

    GET /api/pagamento/inscricao/<uuid>/
    """
    inscricao = get_object_or_404(
        Inscricao,
        id=inscricao_id,
        usuario=request.user
    )
    
    # Verificar se está expirada
    if inscricao.esta_expirada():
        inscricao.status = 'cancelada'
        inscricao.status_pagamento = 'rejeitado'
        inscricao.save()

        return Response(
            {
                'erro': 'Dados de pagamento não encontrados',
                'mensagem': 'Esta inscrição expirou. Por favor, faça uma nova inscrição.',
                'expirado': True
            },
            status=status.HTTP_410_GONE
        )

    # Busca QR Code do evento
    qr_code_pix_url = None
    if inscricao.evento.qr_code_pix:
        qr_code_pix_url = request.build_absolute_uri(inscricao.evento.qr_code_pix.url)
    
    # Calcular tempo restante
    tempo_restante = None
    if inscricao.expira_em:
        from django.utils import timezone
        delta = inscricao.expira_em - timezone.now()
        tempo_restante = int(delta.total_seconds() / 60)

    data = {
        'inscricao_id': str(inscricao.id),
        'metodo_pagamento': inscricao.metodo_pagamento,
        'status_pagamento': inscricao.status_pagamento,
        'valor_original': inscricao.valor_original,
        'valor_final': inscricao.valor_final,
        'desconto_aplicado': inscricao.desconto_aplicado,
        'expira_em': inscricao.expira_em.isoformat() if inscricao.expira_em else None,
        'tempo_restante_minutos': tempo_restante,
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

