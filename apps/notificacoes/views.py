from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db.models import Q
from .models import Notificacao
from .serializers import NotificacaoSerializer


class ListNotificacoesView(generics.ListAPIView):
    """
    Lista todas as notificações do usuário autenticado.
    Query params:
    - lida: true/false para filtrar por lidas/não lidas
    - tipo: filtrar por tipo específico
    """
    serializer_class = NotificacaoSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = Notificacao.objects.filter(usuario=self.request.user)
        
        # Filtro por status de leitura
        lida = self.request.query_params.get('lida', None)
        if lida is not None:
            lida_bool = lida.lower() == 'true'
            queryset = queryset.filter(lida=lida_bool)
        
        # Filtro por tipo
        tipo = self.request.query_params.get('tipo', None)
        if tipo:
            queryset = queryset.filter(tipo=tipo)
        
        return queryset


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def marcar_notificacao_lida(request, notificacao_id):
    """Marca uma notificação específica como lida."""
    try:
        notificacao = Notificacao.objects.get(
            id=notificacao_id, 
            usuario=request.user
        )
        notificacao.marcar_como_lida()
        
        serializer = NotificacaoSerializer(notificacao)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Notificacao.DoesNotExist:
        return Response(
            {'error': 'Notificação não encontrada'},
            status=status.HTTP_404_NOT_FOUND
        )


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def marcar_todas_lidas(request):
    """Marca todas as notificações do usuário como lidas."""
    count = Notificacao.objects.filter(
        usuario=request.user, 
        lida=False
    ).update(lida=True)
    
    return Response(
        {'message': f'{count} notificações marcadas como lidas'},
        status=status.HTTP_200_OK
    )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def contador_nao_lidas(request):
    """Retorna o número de notificações não lidas do usuário."""
    count = Notificacao.objects.filter(
        usuario=request.user,
        lida=False
    ).count()
    
    return Response({'count': count}, status=status.HTTP_200_OK)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def deletar_notificacao(request, notificacao_id):
    """Deleta uma notificação específica."""
    try:
        notificacao = Notificacao.objects.get(
            id=notificacao_id,
            usuario=request.user
        )
        notificacao.delete()
        return Response(
            {'message': 'Notificação deletada com sucesso'},
            status=status.HTTP_204_NO_CONTENT
        )
    except Notificacao.DoesNotExist:
        return Response(
            {'error': 'Notificação não encontrada'},
            status=status.HTTP_404_NOT_FOUND
        )
