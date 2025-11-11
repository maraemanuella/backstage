from django.contrib.auth import get_user_model
from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db import models
from django.contrib.auth import get_user_model

from apps.users.serializers import UserSerializer
from apps.eventos.models import Evento

User = get_user_model()


class UsersListView(generics.ListAPIView):
    """List users with optional filters used by the admin UI.

    Query params supported:
    - role=organizador|usuario  (organizador = users who created events)
    - verified=true|false        (documento_verificado == 'aprovado')
    - search=string              (search username or email)
    """
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs = User.objects.all()
        role = self.request.query_params.get('role')
        verified = self.request.query_params.get('verified')
        search = self.request.query_params.get('search')

        if role == 'organizador':
            qs = qs.filter(eventos_organizados__isnull=False).distinct()
        elif role == 'usuario':
            qs = qs.exclude(eventos_organizados__isnull=False)

        if verified is not None:
            if verified.lower() in ['1', 'true', 'yes']:
                qs = qs.filter(documento_verificado='aprovado')
            else:
                qs = qs.exclude(documento_verificado='aprovado')

        if search:
            qs = qs.filter(models.Q(username__icontains=search) | models.Q(email__icontains=search))

        return qs.order_by('-date_joined')


class UserDetailView(generics.RetrieveAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]


@api_view(['POST'])
@permission_classes([IsAdminUser])
def user_ban_toggle(request, pk):
    """Toggle is_active for a user (ban/unban). Admin only."""
    user = get_object_or_404(User, pk=pk)
    # Prevent admin banning themselves
    if user == request.user:
        return Response({'detail': 'Você não pode banir a si mesmo.'}, status=status.HTTP_400_BAD_REQUEST)

    user.is_active = not user.is_active
    user.save()
    return Response({'id': user.id, 'is_active': user.is_active})


@api_view(['POST'])
@permission_classes([IsAdminUser])
def revert_organizer_status(request, pk):
    """A lightweight 'revert organizer' action: prevents user from organizing future events by
    marking their future events as 'cancelado' and setting is_active False for safety.
    This is intentionally conservative: we do NOT delete events. Admins can inspect/change manually.
    """
    user = get_object_or_404(User, pk=pk)
    if user == request.user:
        return Response({'detail': 'Ação inválida para você mesmo.'}, status=status.HTTP_400_BAD_REQUEST)

    # Cancel future events created by this user
    from django.utils import timezone
    now = timezone.now()
    futuros = Evento.objects.filter(organizador=user, data_evento__gte=now)
    futuros.update(status='cancelado')

    # Optionally deactivate account to prevent re-creating events - admin decision
    user.is_active = False
    user.save()

    return Response({'id': user.id, 'future_events_cancelled': futuros.count(), 'is_active': user.is_active})
