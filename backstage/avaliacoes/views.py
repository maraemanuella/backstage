# Imports do Django
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.shortcuts import get_object_or_404

# Imports locais
from .models import Avaliacao
from .serializers import AvaliacaoSerializer


class AvaliacaoListView(generics.ListAPIView):
    """Lista avaliações de um evento específico"""
    serializer_class = AvaliacaoSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        evento_id = self.kwargs.get('evento_id')
        return Avaliacao.objects.filter(evento__id=evento_id)


class AvaliacaoCreateView(generics.CreateAPIView):
    """Cria uma nova avaliação para um evento"""
    serializer_class = AvaliacaoSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        from api.models import Evento
        evento_id = self.kwargs.get('evento_id')
        evento = get_object_or_404(Evento, id=evento_id)
        serializer.save(usuario=self.request.user, evento=evento)
