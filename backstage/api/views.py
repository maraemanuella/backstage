from django.contrib.auth import get_user_model
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import generics, status
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser
from .serializers import CustomTokenSerializer, UserSerializer

User = get_user_model()

# Login usando login/email + senha
class CustomTokenObtainView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = CustomTokenSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        return Response(serializer.validated_data, status=status.HTTP_200_OK)

# Registro de usuário
class CreateUserView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]

# Listagem de usuários (autenticado)
class ListUsersView(generics.ListAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

# Recuperar/Atualizar usuário específico (autenticado)
class RetrieveUpdateUserView(generics.RetrieveUpdateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

# Deletar usuário (apenas admin)
class DeleteUserView(generics.DestroyAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]

# Retorna o usuário logado
class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data, status=status.HTTP_200_OK)
from .models import Event, Registration
from .serializers import EventSerializer, RegistrationSerializer
import qrcode
from io import BytesIO
import base64
from django.http import JsonResponse

# Listar eventos
class EventListView(generics.ListAPIView):
    queryset = Event.objects.all()
    serializer_class = EventSerializer
    permission_classes = [AllowAny]

# Criar evento
class EventCreateView(generics.CreateAPIView):
    queryset = Event.objects.all()
    serializer_class = EventSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(organizer=self.request.user)

# Detalhes do evento
class EventDetailView(generics.RetrieveAPIView):
    queryset = Event.objects.all()
    serializer_class = EventSerializer
    permission_classes = [AllowAny]

# Inscrever-se em evento
class RegisterForEventView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, event_id):
        try:
            event = Event.objects.get(id=event_id)
        except Event.DoesNotExist:
            return Response({'error': 'Evento não encontrado'}, status=status.HTTP_404_NOT_FOUND)

        # Verificar se já está inscrito
        if Registration.objects.filter(user=request.user, event=event, is_active=True).exists():
            return Response({'error': 'Usuário já inscrito neste evento'}, status=status.HTTP_400_BAD_REQUEST)

        # Verificar vagas disponíveis
        if event.available_spots <= 0:
            return Response({'error': 'Evento lotado'}, status=status.HTTP_400_BAD_REQUEST)

        # Criar inscrição
        registration = Registration.objects.create(user=request.user, event=event)
        serializer = RegistrationSerializer(registration)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

# Obter dados da inscrição com QR Code
class RegistrationDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, registration_id):
        try:
            registration = Registration.objects.get(id=registration_id, user=request.user)
        except Registration.DoesNotExist:
            return Response({'error': 'Inscrição não encontrada'}, status=status.HTTP_404_NOT_FOUND)

        # Gerar QR Code
        qr = qrcode.QRCode(version=1, box_size=10, border=5)
        qr.add_data(registration.qr_code)
        qr.make(fit=True)
        
        img = qr.make_image(fill_color="black", back_color="white")
        buffer = BytesIO()
        img.save(buffer, format='PNG')
        qr_code_base64 = base64.b64encode(buffer.getvalue()).decode()

        serializer = RegistrationSerializer(registration)
        data = serializer.data
        data['qr_code_image'] = f"data:image/png;base64,{qr_code_base64}"
        
        return Response(data, status=status.HTTP_200_OK)

# Listar inscrições do usuário
class UserRegistrationsView(generics.ListAPIView):
    serializer_class = RegistrationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Registration.objects.filter(user=self.request.user, is_active=True)
