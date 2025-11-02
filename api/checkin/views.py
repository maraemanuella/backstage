"""
Views do módulo de Check-in
"""
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view, permission_classes
from rest_framework import status
from django.shortcuts import get_object_or_404
from django.utils import timezone
from api.models import Inscricao


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def realizar_checkin(request, inscricao_id):
    """Realiza o check-in de um participante através do QR code"""
    try:
        inscricao = get_object_or_404(Inscricao, id=inscricao_id)

        if inscricao.evento.organizador != request.user:
            return Response({'error': 'Você não tem permissão para realizar check-in neste evento.'}, status=status.HTTP_403_FORBIDDEN)

        if inscricao.checkin_realizado:
            return Response({
                'error': 'Check-in já realizado para este participante.',
                'participante': inscricao.nome_completo_inscricao,
                'data_checkin': inscricao.data_checkin.isoformat() if inscricao.data_checkin else None
            }, status=status.HTTP_400_BAD_REQUEST)

        if inscricao.status != 'confirmada':
            return Response({
                'error': f'Inscrição não está confirmada. Status atual: {inscricao.get_status_display()}',
                'participante': inscricao.nome_completo_inscricao
            }, status=status.HTTP_400_BAD_REQUEST)

        inscricao.checkin_realizado = True
        inscricao.data_checkin = timezone.now()
        inscricao.save()

        # WebSocket notification
        try:
            from channels.layers import get_channel_layer
            from asgiref.sync import async_to_sync

            channel_layer = get_channel_layer()
            room_group_name = f'checkin_{str(inscricao.id)}'

            checkin_data = {
                'checkin_realizado': True,
                'data_checkin': inscricao.data_checkin.isoformat(),
                'participante': inscricao.nome_completo_inscricao,
                'evento': inscricao.evento.titulo,
            }

            async_to_sync(channel_layer.group_send)(
                room_group_name,
                {
                    'type': 'checkin_update',
                    'data': checkin_data
                }
            )
        except Exception:
            pass  # WebSocket é opcional

        return Response({
            'success': True,
            'message': 'Check-in realizado com sucesso!',
            'participante': inscricao.nome_completo_inscricao,
            'evento': inscricao.evento.titulo,
            'data_checkin': inscricao.data_checkin.isoformat(),
            'email': inscricao.email_inscricao
        }, status=status.HTTP_200_OK)

    except Inscricao.DoesNotExist:
        return Response({'error': 'Inscrição não encontrada. Verifique o QR code.'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': f'Erro ao realizar check-in: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        status_update = request.data.get('status')

        if transfer_request.to_user != request.user and not request.user.is_staff:
            return Response({'error': 'Apenas o destinatário ou um admin pode aceitar ou negar.'}, status=status.HTTP_403_FORBIDDEN)

        if status_update not in ['accepted', 'denied']:
            return Response({'error': 'Status inválido.'}, status=status.HTTP_400_BAD_REQUEST)

        transfer_request.status = status_update

        if status_update == 'accepted':
            inscricao = transfer_request.inscricao
            inscricao.usuario = transfer_request.to_user
            inscricao.status = 'transferida'
            inscricao.nome_completo_inscricao = transfer_request.to_user.get_full_name() or transfer_request.to_user.username
            inscricao.cpf_inscricao = transfer_request.to_user.cpf
            inscricao.telefone_inscricao = transfer_request.to_user.telefone
            inscricao.email_inscricao = transfer_request.to_user.email
            inscricao.save()

        transfer_request.save()
        serializer = self.get_serializer(transfer_request)
        return Response(serializer.data)

