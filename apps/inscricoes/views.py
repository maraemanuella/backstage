from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view, permission_classes
from django.shortcuts import get_object_or_404
from django.utils import timezone

from .models import Inscricao
from .serializers import InscricaoCreateSerializer, InscricaoSerializer
from apps.eventos.models import Evento
from apps.notificacoes.models import Notificacao


class InscricaoCreateView(generics.CreateAPIView):
    queryset = Inscricao.objects.all()
    serializer_class = InscricaoCreateSerializer
    permission_classes = [IsAuthenticated]

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            inscricao = serializer.save()
            
            # Criar notificação de inscrição recebida
            Notificacao.objects.create(
                usuario=inscricao.usuario,
                tipo='inscricao_confirmada',
                titulo='Inscrição recebida!',
                mensagem=f'Sua inscrição para "{inscricao.evento.titulo}" foi recebida e está aguardando aprovação do pagamento.',
                link=f'/evento/{inscricao.evento.id}'
            )
            
        except Exception as e:
            return Response({'error': 'Erro ao criar inscrição', 'details': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        try:
            response_serializer = InscricaoSerializer(inscricao)
            return Response(response_serializer.data, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({'error': 'Inscrição criada, porém falha ao montar resposta', 'details': str(e), 'id': str(inscricao.id)}, status=status.HTTP_201_CREATED)


class MinhasInscricoesView(generics.ListAPIView):
    serializer_class = InscricaoSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Inscricao.objects.filter(usuario=self.request.user).order_by('-created_at')


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def inscricao_detalhes(request, inscricao_id):
    inscricao = get_object_or_404(
        Inscricao,
        id=inscricao_id,
        usuario=request.user
    )

    # Verificar se está expirada e cancelar se necessário
    if inscricao.esta_expirada():
        inscricao.status = 'cancelada'
        inscricao.status_pagamento = 'rejeitado'
        inscricao.save()

    serializer = InscricaoSerializer(inscricao)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def verificar_pagamento_pendente(request, evento_id):
    """
    Verifica se o usuário tem uma inscrição com pagamento pendente para este evento.
    Retorna os dados da inscrição se houver pagamento pendente.
    Se a inscrição estiver expirada, cancela automaticamente.

    GET /api/inscricoes/evento/<uuid>/pagamento-pendente/
    """
    try:
        inscricao = Inscricao.objects.filter(
            usuario=request.user,
            evento_id=evento_id,
            status_pagamento='pendente'
        ).first()

        if inscricao:
            # Verificar se a inscrição está expirada
            if inscricao.esta_expirada():
                inscricao.status = 'cancelada'
                inscricao.status_pagamento = 'rejeitado'
                inscricao.save()

                return Response({
                    'tem_pagamento_pendente': False,
                    'expirado': True,
                    'mensagem': 'Sua inscrição anterior expirou. Por favor, faça uma nova inscrição.'
                })

            # Retornar dados necessários para finalizar o pagamento
            qr_code_url = None
            if inscricao.metodo_pagamento == 'pix' and inscricao.evento.qr_code_pix:
                qr_code_url = request.build_absolute_uri(inscricao.evento.qr_code_pix.url)

            # Calcular tempo restante em minutos
            tempo_restante = None
            if inscricao.expira_em:
                from datetime import timedelta
                delta = inscricao.expira_em - timezone.now()
                tempo_restante = int(delta.total_seconds() / 60)

            return Response({
                'tem_pagamento_pendente': True,
                'inscricao_id': str(inscricao.id),
                'metodo_pagamento': inscricao.metodo_pagamento,
                'valor_final': str(inscricao.valor_final),
                'status_pagamento': inscricao.status_pagamento,
                'qr_code_pix_url': qr_code_url,
                'created_at': inscricao.created_at,
                'expira_em': inscricao.expira_em.isoformat() if inscricao.expira_em else None,
                'tempo_restante_minutos': tempo_restante,
                'dados_temporarios': {
                    'nome_completo_inscricao': inscricao.nome_completo_inscricao,
                    'cpf_inscricao': inscricao.cpf_inscricao,
                    'telefone_inscricao': inscricao.telefone_inscricao,
                    'email_inscricao': inscricao.email_inscricao,
                },
            })
        else:
            return Response({
                'tem_pagamento_pendente': False
            })
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def iniciar_inscricao_pagamento(request):
    """
    Cria a inscrição com status pendente e retorna o QR Code PIX do evento
    """
    evento_id = request.data.get('evento_id')
    
    if not evento_id:
        return Response(
            {'error': 'evento_id é obrigatório'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Buscar evento
    evento = get_object_or_404(Evento, id=evento_id)
    
    # Verificar se já tem inscrição
    inscricao_existente = Inscricao.objects.filter(
        usuario=request.user,
        evento=evento
    ).first()
    
    if inscricao_existente:
        return Response(
            {'error': 'Você já está inscrito neste evento'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Verificar vagas
    if evento.esta_lotado:
        return Response(
            {'error': 'Evento lotado'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Calcular valores
    valor_original = evento.valor_deposito
    valor_com_desconto = evento.calcular_valor_com_desconto(request.user)
    desconto_aplicado = valor_original - valor_com_desconto
    
    # EVENTO SEM DEPÓSITO INICIAL (valor zero ou abaixo do mínimo)
    if valor_com_desconto == 0 or valor_com_desconto < Decimal('0.50'):
        # Criar inscrição já confirmada (sem depósito necessário)
        inscricao = Inscricao.objects.create(
            usuario=request.user,
            evento=evento,
            nome_completo_inscricao=request.data.get('nome_completo_inscricao', request.user.get_full_name()),
            cpf_inscricao=request.data.get('cpf_inscricao', ''),
            telefone_inscricao=request.data.get('telefone_inscricao', ''),
            email_inscricao=request.data.get('email_inscricao', request.user.email),
            metodo_pagamento='isento',
            aceita_termos=request.data.get('aceita_termos', True),
            valor_original=valor_original,
            desconto_aplicado=desconto_aplicado,
            valor_final=valor_com_desconto,
            status='confirmada',  # Já confirmado (não requer depósito)
            status_pagamento='aprovado',  # Isento de pagamento inicial
            data_pagamento=timezone.now(),
            expira_em=None  # Não expira
        )

        # Criar notificação de inscrição confirmada
        Notificacao.objects.create(
            usuario=request.user,
            tipo='inscricao_confirmada',
            titulo='Inscrição confirmada!',
            mensagem=f'Sua inscrição para "{evento.titulo}" foi confirmada! Este evento não requer depósito inicial.',
            link=f'/evento/{evento.id}',
            metadata={
                'inscricao_id': str(inscricao.id),
                'evento_id': str(evento.id),
                'isento': True
            }
        )

        # Retornar resposta de sucesso direto
        return Response({
            'inscricao_id': str(inscricao.id),
            'evento': {
                'id': str(evento.id),
                'titulo': evento.titulo,
                'data_evento': evento.data_evento,
            },
            'status': 'confirmada',
            'status_pagamento': 'aprovado',
            'valor_final': str(valor_com_desconto),
            'isento': True,
            'mensagem': 'Inscrição confirmada! Este evento não requer depósito inicial. Compareça para garantir sua vaga!',
        }, status=status.HTTP_201_CREATED)

    # EVENTO PAGO - Validar valor mínimo do Stripe (R$ 0.50)
    if valor_com_desconto < Decimal('0.50'):
        return Response(
            {'error': 'Valor mínimo para pagamento é R$ 0,50. Este evento não pode ser pago com cartão.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Obter método de pagamento (padrão: cartão de crédito)
    metodo_pagamento = request.data.get('metodo_pagamento', 'cartao_credito')

    # Validar método de pagamento - Apenas cartões aceitos
    metodos_validos = ['cartao_credito', 'cartao_debito']
    if metodo_pagamento not in metodos_validos:
        return Response(
            {'error': f'Método de pagamento inválido. Apenas cartões são aceitos: {", ".join(metodos_validos)}'},
            status=status.HTTP_400_BAD_REQUEST
        )


    # Definir tempo de expiração: 15 minutos a partir de agora
    from datetime import timedelta
    expira_em = timezone.now() + timedelta(minutes=15)

    # Criar inscrição com status pendente
    inscricao = Inscricao.objects.create(
        usuario=request.user,
        evento=evento,
        nome_completo_inscricao=request.data.get('nome_completo_inscricao', request.user.get_full_name()),
        cpf_inscricao=request.data.get('cpf_inscricao', ''),
        telefone_inscricao=request.data.get('telefone_inscricao', ''),
        email_inscricao=request.data.get('email_inscricao', request.user.email),
        metodo_pagamento=metodo_pagamento,
        aceita_termos=request.data.get('aceita_termos', True),
        valor_original=valor_original,
        desconto_aplicado=desconto_aplicado,
        valor_final=valor_com_desconto,
        status='pendente',  # Status pendente até confirmar pagamento
        status_pagamento='pendente',
        expira_em=expira_em  # Define quando a inscrição expira
    )
    
    # Criar notificação de pagamento pendente
    Notificacao.objects.create(
        usuario=request.user,
        tipo='pagamento_pendente',
        titulo='Complete seu pagamento!',
        mensagem=f'Sua inscrição para "{evento.titulo}" está aguardando pagamento. Complete agora para garantir sua vaga!',
        link=f'/pagamento/{inscricao.id}',
        metadata={
            'inscricao_id': str(inscricao.id),
            'evento_id': str(evento.id),
            'metodo_pagamento': metodo_pagamento,
            'valor_final': str(valor_com_desconto)
        }
    )
    
    # Retornar dados da inscrição
    dados_temporarios = {
        'nome_completo_inscricao': inscricao.nome_completo_inscricao,
        'cpf_inscricao': inscricao.cpf_inscricao,
        'telefone_inscricao': inscricao.telefone_inscricao,
        'email_inscricao': inscricao.email_inscricao,
    }

    return Response({
        'inscricao_id': str(inscricao.id),
        'evento': {
            'id': str(evento.id),
            'titulo': evento.titulo,
            'data_evento': evento.data_evento,
        },
        'pagamento': {
            'valor_original': str(valor_original),
            'desconto_aplicado': str(desconto_aplicado),
            'valor_final': str(inscricao.valor_final),
            'metodo_pagamento': metodo_pagamento,
            'status_pagamento': inscricao.status_pagamento,
        },
        'status': inscricao.status,
        'metodo_pagamento': metodo_pagamento,
        'expira_em': inscricao.expira_em.isoformat() if inscricao.expira_em else None,
        'dados_temporarios': dados_temporarios,
    }, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def confirmar_pagamento_inscricao(request, inscricao_id):
    """
    Usuário informa que fez o pagamento (aguardando aprovação do organizador)
    """
    try:
        inscricao = get_object_or_404(
            Inscricao,
            id=inscricao_id,
            usuario=request.user
        )

        # Upload do comprovante (opcional)
        comprovante = request.FILES.get('comprovante')
        if comprovante:
            inscricao.comprovante_pagamento = comprovante
        
        # Adicionar observações (opcional)
        observacoes = request.data.get('observacoes')
        if observacoes:
            inscricao.observacoes_pagamento = observacoes

        # Atualizar apenas o status da inscrição para "pendente de aprovação"
        # O organizador precisará aprovar manualmente
        inscricao.status = 'pendente'
        inscricao.data_pagamento = timezone.now()
        inscricao.save()

        return Response({
            'mensagem': 'Pagamento registrado! Aguardando aprovação do organizador.',
            'inscricao_id': str(inscricao.id),
            'status': inscricao.status,
            'status_pagamento': inscricao.status_pagamento
        }, status=status.HTTP_200_OK)

    except Exception as e:
        return Response(
            {'erro': str(e)},
            status=status.HTTP_400_BAD_REQUEST
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def trocar_metodo_pagamento(request, inscricao_id):
    """
    Permite trocar o método de pagamento de uma inscrição pendente

    POST /api/inscricoes/<uuid>/trocar-metodo-pagamento/
    Body: {
        "novo_metodo": "pix" | "cartao_credito" | "cartao_debito"
    }
    """
    try:
        inscricao = get_object_or_404(
            Inscricao,
            id=inscricao_id,
            usuario=request.user
        )

        # Verificar se inscrição está pendente
        if inscricao.status_pagamento != 'pendente':
            return Response(
                {'error': 'Não é possível trocar o método de pagamento de uma inscrição já processada'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Verificar se está expirada
        if inscricao.esta_expirada():
            inscricao.status = 'cancelada'
            inscricao.status_pagamento = 'rejeitado'
            inscricao.save()
            return Response(
                {'error': 'Esta inscrição expirou. Por favor, faça uma nova inscrição.'},
                status=status.HTTP_410_GONE
            )

        novo_metodo = request.data.get('novo_metodo')

        # Validar método - Apenas cartões aceitos
        metodos_validos = ['cartao_credito', 'cartao_debito']
        if novo_metodo not in metodos_validos:
            return Response(
                {'error': f'Método de pagamento inválido. Apenas cartões são aceitos: {", ".join(metodos_validos)}'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Atualizar método de pagamento
        inscricao.metodo_pagamento = novo_metodo
        inscricao.save()

        return Response({
            'success': True,
            'mensagem': 'Método de pagamento alterado com sucesso',
            'inscricao_id': str(inscricao.id),
            'metodo_pagamento': inscricao.metodo_pagamento,
        }, status=status.HTTP_200_OK)

    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def aprovar_pagamento_inscricao(request, inscricao_id):
    """
    Endpoint para o organizador aprovar ou rejeitar o pagamento da inscrição
    """
    try:
        inscricao = get_object_or_404(Inscricao, id=inscricao_id)
        
        # Verificar se o usuário é o organizador do evento
        if inscricao.evento.organizador != request.user:
            return Response(
                {'erro': 'Apenas o organizador do evento pode aprovar pagamentos'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        acao = request.data.get('acao')  # 'aprovar' ou 'rejeitar'
        observacoes = request.data.get('observacoes_admin', '')
        
        if acao == 'aprovar':
            inscricao.status = 'confirmada'
            inscricao.status_pagamento = 'aprovado'
            mensagem = 'Pagamento aprovado com sucesso!'
            
            # Criar notificação de pagamento aprovado
            Notificacao.objects.create(
                usuario=inscricao.usuario,
                tipo='inscricao_confirmada',
                titulo='Pagamento aprovado!',
                mensagem=f'Seu pagamento para "{inscricao.evento.titulo}" foi aprovado. Você está confirmado no evento!',
                link=f'/evento/{inscricao.evento.id}'
            )
            
        elif acao == 'rejeitar':
            inscricao.status = 'cancelada'
            inscricao.status_pagamento = 'rejeitado'
            mensagem = 'Pagamento rejeitado'
            
            # Criar notificação de pagamento rejeitado
            Notificacao.objects.create(
                usuario=inscricao.usuario,
                tipo='sistema',
                titulo='Pagamento rejeitado',
                mensagem=f'Seu pagamento para "{inscricao.evento.titulo}" foi rejeitado. Entre em contato com o organizador.',
                link=f'/evento/{inscricao.evento.id}'
            )
        else:
            return Response(
                {'erro': 'Ação inválida. Use "aprovar" ou "rejeitar"'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Adicionar observações do admin se houver
        if observacoes:
            if inscricao.observacoes_pagamento:
                inscricao.observacoes_pagamento += f'\n\nAdmin: {observacoes}'
            else:
                inscricao.observacoes_pagamento = f'Admin: {observacoes}'
        
        inscricao.save()
        
        return Response({
            'mensagem': mensagem,
            'inscricao_id': str(inscricao.id),
            'status': inscricao.status,
            'status_pagamento': inscricao.status_pagamento
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response(
            {'erro': str(e)},
            status=status.HTTP_400_BAD_REQUEST
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def listar_pagamentos_pendentes(request, evento_id):
    """
    Lista todas as inscrições com pagamento pendente de aprovação para um evento
    """
    try:
        evento = get_object_or_404(Evento, id=evento_id)
        
        # Verificar se o usuário é o organizador
        if evento.organizador != request.user:
            return Response(
                {'erro': 'Apenas o organizador pode visualizar pagamentos pendentes'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        inscricoes_pendentes = Inscricao.objects.filter(
            evento=evento,
            status='pendente',
            status_pagamento='pendente'
        ).select_related('usuario')
        
        serializer = InscricaoSerializer(inscricoes_pendentes, many=True)
        
        return Response({
            'evento': {
                'id': str(evento.id),
                'nome': evento.nome
            },
            'total_pendentes': inscricoes_pendentes.count(),
            'inscricoes': serializer.data
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response(
            {'erro': str(e)},
            status=status.HTTP_400_BAD_REQUEST
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def cancelar_inscricao(request, inscricao_id):
    """
    Permite que o usuário cancele sua própria inscrição
    """
    try:
        inscricao = get_object_or_404(
            Inscricao,
            id=inscricao_id,
            usuario=request.user
        )
        
        # Verificar se a inscrição já foi cancelada
        if inscricao.status == 'cancelada':
            return Response(
                {'erro': 'Esta inscrição já foi cancelada'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Verificar se o evento já passou
        if inscricao.evento.data_evento < timezone.now():
            return Response(
                {'erro': 'Não é possível cancelar inscrição de evento já realizado'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Atualizar status
        inscricao.status = 'cancelada'
        inscricao.save()
        
        # Criar notificação para o usuário
        Notificacao.objects.create(
            usuario=request.user,
            tipo='inscricao_cancelada',
            titulo='Inscrição cancelada',
            mensagem=f'Sua inscrição no evento "{inscricao.evento.titulo}" foi cancelada com sucesso.',
            link=f'/evento/{inscricao.evento.id}'
        )
        
        # Notificar o organizador
        Notificacao.objects.create(
            usuario=inscricao.evento.organizador,
            tipo='inscricao_cancelada',
            titulo='Inscrição cancelada',
            mensagem=f'{request.user.get_full_name() or request.user.username} cancelou a inscrição no evento "{inscricao.evento.titulo}".',
            link=f'/evento/{inscricao.evento.id}'
        )
        
        return Response(
            {
                'mensagem': 'Inscrição cancelada com sucesso',
                'inscricao': InscricaoSerializer(inscricao).data
            },
            status=status.HTTP_200_OK
        )
        
    except Exception as e:
        return Response(
            {'erro': str(e)},
            status=status.HTTP_400_BAD_REQUEST
        )
