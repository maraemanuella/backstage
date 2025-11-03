from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view, permission_classes
from django.shortcuts import get_object_or_404
from django.utils import timezone

from .models import Inscricao
from .serializers import InscricaoCreateSerializer, InscricaoSerializer
from apps.eventos.models import Evento


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

    serializer = InscricaoSerializer(inscricao)
    return Response(serializer.data)


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
    
    # Criar inscrição com status pendente
    inscricao = Inscricao.objects.create(
        usuario=request.user,
        evento=evento,
        nome_completo_inscricao=request.data.get('nome_completo_inscricao', request.user.get_full_name()),
        cpf_inscricao=request.data.get('cpf_inscricao', ''),
        telefone_inscricao=request.data.get('telefone_inscricao', ''),
        email_inscricao=request.data.get('email_inscricao', request.user.email),
        metodo_pagamento='pix',  # Sempre PIX
        aceita_termos=request.data.get('aceita_termos', True),
        valor_original=valor_original,
        desconto_aplicado=desconto_aplicado,
        valor_final=valor_com_desconto,
        status='pendente',  # Status pendente até confirmar pagamento
        status_pagamento='pendente'
    )
    
    # Retornar dados da inscrição com QR Code
    qr_code_url = None
    if evento.qr_code_pix:
        qr_code_url = request.build_absolute_uri(evento.qr_code_pix.url)
    
    return Response({
        'inscricao_id': str(inscricao.id),
        'evento': {
            'id': str(evento.id),
            'titulo': evento.titulo,
            'data_evento': evento.data_evento,
        },
        'pagamento': {
            'qr_code_pix_url': qr_code_url,
            'valor_original': str(valor_original),
            'desconto_aplicado': str(desconto_aplicado),
            'valor_final': str(inscricao.valor_final),
            'metodo_pagamento': 'pix',
            'status_pagamento': inscricao.status_pagamento,
        },
        'status': inscricao.status,
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
        elif acao == 'rejeitar':
            inscricao.status = 'cancelada'
            inscricao.status_pagamento = 'rejeitado'
            mensagem = 'Pagamento rejeitado'
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

