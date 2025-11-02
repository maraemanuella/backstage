"""
Views do módulo de Favoritos
"""
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view, permission_classes
from django.shortcuts import get_object_or_404
from api.models import Favorite, Evento
from .serializers import FavoriteSerializer


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_favorites(request):
    """Lista favoritos do usuário"""
    favorites = Favorite.objects.filter(user=request.user)
    serializer = FavoriteSerializer(favorites, many=True, context={'request': request})
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def toggle_favorite(request, evento_id):
    """Adiciona/remove favorito"""
    user = request.user
    evento = get_object_or_404(Evento, id=evento_id)
    favorite, created = Favorite.objects.get_or_create(user=user, evento=evento)

    if not created:
        favorite.delete()
        return Response({"favorito": False})

    return Response({"favorito": True})

