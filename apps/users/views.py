from django.contrib.auth import get_user_model
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import generics, status
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser
from rest_framework.decorators import api_view, permission_classes
import time
import requests
import os
import secrets
from rest_framework_simplejwt.tokens import RefreshToken

from .serializers import CustomTokenSerializer, UserSerializer, DocumentoVerificacaoSerializer

User = get_user_model()


class CustomTokenObtainView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = CustomTokenSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        return Response(serializer.validated_data, status=status.HTTP_200_OK)


class CreateUserView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]


class ListUsersView(generics.ListAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]


class RetrieveUpdateUserView(generics.RetrieveUpdateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]


class DeleteUserView(generics.DestroyAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]


class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def patch(self, request):
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

        except Exception as e:
            return Response({'error': 'Erro interno do servidor.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def update_user_profile(request):
    user = request.user
    try:
        updatable_fields = [
            'username', 'email', 'telefone', 'cpf', 'cnpj',
            'data_nascimento', 'sexo', 'profile_photo'
        ]

        if 'email' in request.data:
            email = request.data['email']
            if User.objects.filter(email=email).exclude(id=user.id).exists():
                return Response({'email': ['Este email j est em uso por outro usurio.']}, status=status.HTTP_400_BAD_REQUEST)

        if 'username' in request.data:
            username = request.data['username']
            if User.objects.filter(username=username).exclude(id=user.id).exists():
                return Response({'username': ['Este nome de usurio j est em uso.']}, status=status.HTTP_400_BAD_REQUEST)

        if 'cpf' in request.data and request.data['cpf']:
            cpf = request.data['cpf'].replace('.', '').replace('-', '').replace(' ', '')
            if len(cpf) != 11 or not cpf.isdigit():
                return Response({'cpf': ['CPF deve ter exatamente 11 dgitos.']}, status=status.HTTP_400_BAD_REQUEST)
            if User.objects.filter(cpf=cpf).exclude(id=user.id).exists():
                return Response({'cpf': ['Este CPF j est em uso por outro usurio.']}, status=status.HTTP_400_BAD_REQUEST)
            request.data['cpf'] = cpf

        if 'cnpj' in request.data and request.data['cnpj']:
            cnpj = request.data['cnpj'].replace('.', '').replace('/', '').replace('-', '').replace(' ', '')
            if len(cnpj) != 14 or not cnpj.isdigit():
                return Response({'cnpj': ['CNPJ deve ter exatamente 14 dgitos.']}, status=status.HTTP_400_BAD_REQUEST)
            if User.objects.filter(cnpj=cnpj).exclude(id=user.id).exists():
                return Response({'cnpj': ['Este CNPJ j est em uso por outro usurio.']}, status=status.HTTP_400_BAD_REQUEST)
            request.data['cnpj'] = cnpj

        if 'telefone' in request.data and request.data['telefone']:
            telefone = request.data['telefone'].replace('(', '').replace(')', '').replace('-', '').replace(' ', '')
            if len(telefone) not in [10, 11] or not telefone.isdigit():
                return Response({'telefone': ['Telefone deve ter 10 ou 11 dgitos.']}, status=status.HTTP_400_BAD_REQUEST)
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
    user = request.user
    if user.documento_verificado == 'aprovado':
        return Response({'error': 'Seu documento j foi verificado e aprovado.'}, status=status.HTTP_400_BAD_REQUEST)

    serializer = DocumentoVerificacaoSerializer(user, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save(documento_verificado='verificando')
        time.sleep(7)
        user.documento_verificado = 'aprovado'
        user.save()
        return Response({'status': 'aprovado', 'mensagem': 'Documento verificado com sucesso! Voc j pode criar eventos.'})

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def status_documento(request):
    user = request.user
    return Response({
        'tipo_documento': user.tipo_documento,
        'numero_documento': user.numero_documento,
        'documento_verificado': user.documento_verificado
    })

class GoogleLoginView(APIView):

    permission_classes = [AllowAny]

    def post(self, request):
        code = request.data.get('code')
        if not code:
            return Response({'error': 'Código não fornecido'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            client_secret = os.getenv('GOOGLE_CLIENT_SECRET', '')
            client_id = os.getenv('GOOGLE_CLIENT_ID', '')
            
            print(f"[DEBUG] Client Secret presente: {bool(client_secret) and client_secret != 'YOUR_GOOGLE_CLIENT_SECRET_HERE'}")
            print(f"[DEBUG] Tamanho do secret: {len(client_secret) if client_secret else 0}")
            
            # Se não tiver client secret configurado, retornar erro explicativo
            if not client_secret or client_secret == 'YOUR_GOOGLE_CLIENT_SECRET_HERE':
                return Response({
                    'error': 'Google Client Secret não configurado',
                    'message': 'Por favor, configure o GOOGLE_CLIENT_SECRET no arquivo .env com o valor correto do Google Cloud Console'
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
            token_url = 'https://oauth2.googleapis.com/token'
            
           
            redirect_uri = 'postmessage'
            
            token_data = {
                'code': code,
                'client_id': client_id,
                'client_secret': client_secret,
                'redirect_uri': redirect_uri,
                'grant_type': 'authorization_code',
            }

            print(f"[DEBUG] Tentando trocar code por token...")
            print(f"[DEBUG] Client ID: {client_id[:20]}...")
            print(f"[DEBUG] Redirect URI: {redirect_uri}")
            
            token_resp = requests.post(token_url, data=token_data, timeout=10)
            token_json = token_resp.json()
            
            print(f"[DEBUG] Response status: {token_resp.status_code}")
            print(f"[DEBUG] Response body: {token_json}")
            
            # Se falhar com postmessage, tentar com a URL real
            if token_resp.status_code != 200 and 'redirect_uri_mismatch' in str(token_json):
                print("[DEBUG] Tentando com redirect_uri alternativo...")
                token_data['redirect_uri'] = 'http://localhost:5173'
                token_resp = requests.post(token_url, data=token_data, timeout=10)
                token_json = token_resp.json()
                print(f"[DEBUG] Response status (retry): {token_resp.status_code}")
                print(f"[DEBUG] Response body (retry): {token_json}")
            
            if token_resp.status_code != 200 or 'error' in token_json:
                return Response({'error': 'Falha ao trocar code por token', 'details': token_json}, status=status.HTTP_400_BAD_REQUEST)

            access_token = token_json.get('access_token')
            if not access_token:
                return Response({'error': 'access_token não retornado pelo Google'}, status=status.HTTP_400_BAD_REQUEST)

            userinfo_url = 'https://www.googleapis.com/oauth2/v2/userinfo'
            userinfo_resp = requests.get(userinfo_url, headers={'Authorization': f'Bearer {access_token}'}, timeout=10)
            userinfo = userinfo_resp.json()

            email = userinfo.get('email')
            if not email:
                return Response({'error': 'Email não disponível no perfil do Google'}, status=status.HTTP_400_BAD_REQUEST)

            # Tentar obter usuário existente por email
            user = User.objects.filter(email=email).first()
            
            if not user:
                # Criar novo usuário
                base_username = email.split('@')[0]
                username = base_username
                
                # Se o username já existir, adicionar um número
                counter = 1
                while User.objects.filter(username=username).exists():
                    username = f"{base_username}{counter}"
                    counter += 1
                
                user = User.objects.create(
                    email=email,
                    username=username,
                    first_name=userinfo.get('given_name', ''),
                    last_name=userinfo.get('family_name', ''),
                    documento_verificado='pendente',
                )
                # definir senha aleatória segura
                user.set_password(secrets.token_urlsafe(32))
                user.save()

            refresh = RefreshToken.for_user(user)

            return Response({
                'access': str(refresh.access_token),
                'refresh': str(refresh),
                'user': {
                    'id': user.id,
                    'email': user.email,
                    'username': user.username,
                    'first_name': user.first_name,
                    'last_name': user.last_name,
                    'documento_verificado': user.documento_verificado,
                }
            }, status=status.HTTP_200_OK)

        except Exception as e:
            import traceback
            print(f"[ERROR] Erro no login do Google: {str(e)}")
            print(f"[ERROR] Traceback completo:")
            traceback.print_exc()
            return Response({
                'error': f'Erro ao processar login Google: {str(e)}',
                'type': type(e).__name__
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_ranking(request):
    """
    Retorna informações completas de ranking do usuário autenticado.
    Inclui: score, nível, cor, e informações sobre o próximo nível.
    """
    user = request.user
    ranking_info = user.get_ranking_info()

    return Response({
        'score': ranking_info['score'],
        'nivel': ranking_info['nivel'],
        'cor': ranking_info['cor'],
        'proximo_nivel': ranking_info['proximo_nivel'],
        'descricao': get_nivel_descricao(ranking_info['nivel'])
    }, status=status.HTTP_200_OK)


def get_nivel_descricao(nivel):
    """Retorna a descrição e benefícios de cada nível"""
    descricoes = {
        'Bronze': {
            'titulo': 'Bronze',
            'descricao': 'Você está começando sua jornada!',
            'beneficios': [],
            'dica': 'Para manter seu score alto, compareça aos eventos que você se inscreveu. O objetivo da plataforma é reduzir as ausências!'
        },
        'Prata': {
            'titulo': 'Prata',
            'descricao': 'Usuário confiável da plataforma',
            'beneficios': [],
            'dica': 'Para manter seu score alto, compareça aos eventos que você se inscreveu. O objetivo da plataforma é reduzir as ausências!'
        },
        'Ouro': {
            'titulo': 'Ouro',
            'descricao': 'Membro valioso da comunidade',
            'beneficios': [
                'Acesso a eventos exclusivos',
                'Check-in prioritário',
                'Suporte exclusivo'
            ],
            'dica': 'Para manter seu score alto, compareça aos eventos que você se inscreveu. O objetivo da plataforma é reduzir as ausências!'
        },
        'Platina': {
            'titulo': 'Platina',
            'descricao': 'Usuário exemplar e confiável',
            'beneficios': [
                'Acesso a eventos exclusivos',
                'Check-in prioritário',
                'Suporte exclusivo'
            ],
            'dica': 'Para manter seu score alto, compareça aos eventos que você se inscreveu. O objetivo da plataforma é reduzir as ausências!'
        },
        'Diamante': {
            'titulo': 'Diamante',
            'descricao': 'Elite da plataforma!',
            'beneficios': [
                'Acesso a eventos exclusivos',
                'Check-in prioritário',
                'Suporte exclusivo'
            ],
            'dica': 'Parabéns! Continue comparecendo aos eventos para manter seu nível máximo!'
        }
    }
    return descricoes.get(nivel, descricoes['Bronze'])
