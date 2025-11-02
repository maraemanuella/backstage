"""
Views do módulo de Usuários
"""
from django.contrib.auth import get_user_model
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import generics, status
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser
from rest_framework.decorators import api_view, permission_classes
from .serializers import UserSerializer, DocumentoVerificacaoSerializer
import time

User = get_user_model()


class CreateUserView(generics.CreateAPIView):
    """View para criar novo usuário"""
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]


class ListUsersView(generics.ListAPIView):
    """View para listar usuários"""
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]


class RetrieveUpdateUserView(generics.RetrieveUpdateAPIView):
    """View para recuperar e atualizar usuário"""
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]


class DeleteUserView(generics.DestroyAPIView):
    """View para deletar usuário"""
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]


class MeView(APIView):
    """View para obter dados do usuário autenticado"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def update_user_profile(request):
    """Atualizar perfil do usuário autenticado"""
    user = request.user
    try:
        updatable_fields = [
            'username', 'email', 'telefone', 'cpf', 'cnpj',
            'data_nascimento', 'sexo', 'profile_photo'
        ]

        if 'email' in request.data:
            email = request.data['email']
            if User.objects.filter(email=email).exclude(id=user.id).exists():
                return Response({'email': ['Este email já está em uso por outro usuário.']}, status=status.HTTP_400_BAD_REQUEST)

        if 'username' in request.data:
            username = request.data['username']
            if User.objects.filter(username=username).exclude(id=user.id).exists():
                return Response({'username': ['Este nome de usuário já está em uso.']}, status=status.HTTP_400_BAD_REQUEST)

        if 'cpf' in request.data and request.data['cpf']:
            cpf = request.data['cpf'].replace('.', '').replace('-', '').replace(' ', '')
            if len(cpf) != 11 or not cpf.isdigit():
                return Response({'cpf': ['CPF deve ter exatamente 11 dígitos.']}, status=status.HTTP_400_BAD_REQUEST)
            if User.objects.filter(cpf=cpf).exclude(id=user.id).exists():
                return Response({'cpf': ['Este CPF já está em uso por outro usuário.']}, status=status.HTTP_400_BAD_REQUEST)
            request.data['cpf'] = cpf

        if 'cnpj' in request.data and request.data['cnpj']:
            cnpj = request.data['cnpj'].replace('.', '').replace('/', '').replace('-', '').replace(' ', '')
            if len(cnpj) != 14 or not cnpj.isdigit():
                return Response({'cnpj': ['CNPJ deve ter exatamente 14 dígitos.']}, status=status.HTTP_400_BAD_REQUEST)
            if User.objects.filter(cnpj=cnpj).exclude(id=user.id).exists():
                return Response({'cnpj': ['Este CNPJ já está em uso por outro usuário.']}, status=status.HTTP_400_BAD_REQUEST)
            request.data['cnpj'] = cnpj

        if 'telefone' in request.data and request.data['telefone']:
            telefone = request.data['telefone'].replace('(', '').replace(')', '').replace('-', '').replace(' ', '')
            if len(telefone) not in [10, 11] or not telefone.isdigit():
                return Response({'telefone': ['Telefone deve ter 10 ou 11 dígitos.']}, status=status.HTTP_400_BAD_REQUEST)
            request.data['telefone'] = telefone

        for field in updatable_fields:
            if field in request.data:
                setattr(user, field, request.data[field])

        user.save()

        serializer = UserSerializer(user)
        return Response({'message': 'Perfil atualizado com sucesso!', 'user': serializer.data}, status=status.HTTP_200_OK)

    except Exception:
        return Response({'error': 'Erro interno do servidor.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def verificar_documento(request):
    """Verificar documento do usuário"""
    user = request.user
    if user.documento_verificado == 'aprovado':
        return Response({'error': 'Seu documento já foi verificado e aprovado.'}, status=status.HTTP_400_BAD_REQUEST)

    serializer = DocumentoVerificacaoSerializer(user, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save(documento_verificado='verificando')
        time.sleep(7)
        user.documento_verificado = 'aprovado'
        user.save()
        return Response({'status': 'aprovado', 'mensagem': 'Documento verificado com sucesso! Você já pode criar eventos.'})

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def status_documento(request):
    """Obter status de verificação do documento"""
    user = request.user
    return Response({
        'tipo_documento': user.tipo_documento,
        'numero_documento': user.numero_documento,
        'documento_verificado': user.documento_verificado
    })

