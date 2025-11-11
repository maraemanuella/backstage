from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import get_user_model
from django.utils.http import urlsafe_base64_decode
from django.utils.encoding import force_str
from .password_serializers import PasswordResetRequestSerializer, PasswordResetConfirmSerializer
from .email_utils import send_password_reset_email, send_password_changed_confirmation_email
from .tokens import password_reset_token

User = get_user_model()


@api_view(['POST'])
@permission_classes([AllowAny])
def password_reset_request(request):
    serializer = PasswordResetRequestSerializer(data=request.data)

    if serializer.is_valid():
        email = serializer.validated_data['email']

        try:
            user = User.objects.get(email=email, is_active=True)
            send_password_reset_email(user, request)
        except User.DoesNotExist:
            pass

        return Response(
            {'message': 'Se o email existir em nossa base, você receberá instruções para redefinir sua senha.'},
            status=status.HTTP_200_OK
        )

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def password_reset_confirm(request):
    serializer = PasswordResetConfirmSerializer(data=request.data)

    if serializer.is_valid():
        uid = serializer.validated_data['uid']
        token = serializer.validated_data['token']
        new_password = serializer.validated_data['new_password']

        try:
            user_id = force_str(urlsafe_base64_decode(uid))
            user = User.objects.get(pk=user_id)

            if password_reset_token.check_token(user, token):
                user.set_password(new_password)
                user.save()

                # Enviar email de confirmação
                try:
                    send_password_changed_confirmation_email(user)
                except Exception as e:
                    print(f"⚠️ Erro ao enviar email de confirmação: {str(e)}")

                return Response(
                    {'message': 'Senha redefinida com sucesso! Você já pode fazer login.'},
                    status=status.HTTP_200_OK
                )
            else:
                return Response(
                    {'error': 'Token inválido ou expirado.'},
                    status=status.HTTP_400_BAD_REQUEST
                )

        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            return Response(
                {'error': 'Token inválido ou expirado.'},
                status=status.HTTP_400_BAD_REQUEST
            )

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def password_reset_validate(request):
    uid = request.data.get('uid')
    token = request.data.get('token')

    if not uid or not token:
        return Response(
            {'valid': False, 'error': 'UID e token são obrigatórios.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        user_id = force_str(urlsafe_base64_decode(uid))
        user = User.objects.get(pk=user_id)

        if password_reset_token.check_token(user, token):
            return Response({'valid': True}, status=status.HTTP_200_OK)
        else:
            return Response(
                {'valid': False, 'error': 'Token inválido ou expirado.'},
                status=status.HTTP_400_BAD_REQUEST
            )

    except (TypeError, ValueError, OverflowError, User.DoesNotExist):
        return Response(
            {'valid': False, 'error': 'Token inválido ou expirado.'},
            status=status.HTTP_400_BAD_REQUEST
        )

