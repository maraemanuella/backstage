from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404

from .models import Favorite
from .serializers import FavoriteSerializer
from apps.eventos.models import Evento


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_favorites(request):
    favorites = Favorite.objects.filter(user=request.user)
    serializer = FavoriteSerializer(favorites, many=True, context={'request': request})
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def toggle_favorite(request, evento_id):
    user = request.user
    evento = get_object_or_404(Evento, id=evento_id)
    favorite, created = Favorite.objects.get_or_create(user=user, evento=evento)

    if not created:
        favorite.delete()
        return Response({"favorito": False})

    return Response({"favorito": True})

