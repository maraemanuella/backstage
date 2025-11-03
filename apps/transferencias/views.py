from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db import models

from .models import TransferRequest
from .serializers import TransferRequestSerializer


class TransferRequestCreateView(generics.CreateAPIView):
    queryset = TransferRequest.objects.all()
    serializer_class = TransferRequestSerializer
    permission_classes = [IsAuthenticated]

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context


class TransferRequestListView(generics.ListAPIView):
    serializer_class = TransferRequestSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return TransferRequest.objects.filter(
            models.Q(from_user=user) | models.Q(to_user=user)
        ).order_by('-created_at')


class TransferRequestDetailView(generics.RetrieveUpdateAPIView):
    queryset = TransferRequest.objects.all()
    serializer_class = TransferRequestSerializer
    permission_classes = [IsAuthenticated]

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

    def update(self, request, *args, **kwargs):
        transfer_request = self.get_object()
        status_update = request.data.get('status')

        if transfer_request.to_user != request.user and not request.user.is_staff:
            return Response({'error': 'Apenas o destinatário ou um admin(debug) pode aceitar ou negar.'}, status=status.HTTP_403_FORBIDDEN)

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

