from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from api.registrations.models import Inscricao
from api.registrations.serializers import InscricaoCreateSerializer, InscricaoSerializer


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

        from django.utils import timezone
        inscricao.checkin_realizado = True
        inscricao.data_checkin = timezone.now()
        inscricao.save()

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

