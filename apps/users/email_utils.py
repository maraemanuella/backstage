import requests
from django.conf import settings
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from .tokens import password_reset_token


def send_password_reset_email(user, request):
    uid = urlsafe_base64_encode(force_bytes(user.pk))
    token = password_reset_token.make_token(user)

    frontend_url = getattr(settings, 'FRONTEND_URL', 'http://localhost:5173')
    reset_link = f"{frontend_url}/reset-password/{uid}/{token}/"

    mailersend_token = settings.MAILERSEND_API_TOKEN

    if not mailersend_token:
        print(f"⚠️  MAILERSEND_API_TOKEN não configurado. Email não enviado para {user.email}")
        print(f"🔗 Link de recuperação: {reset_link}")
        return

    subject = "Recuperação de Senha - Backstage"

    html = f"""<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background-color: #f8f9fa; padding: 30px; border-radius: 10px;">
        <h2 style="color: #000; margin-top: 0;">Recuperação de Senha</h2>
        <p>Olá <strong>{user.username}</strong>,</p>
        <p>Recebemos uma solicitação para redefinir sua senha na plataforma Backstage.</p>
        <p>Clique no botão abaixo para criar uma nova senha:</p>
        <div style="text-align: center; margin: 30px 0;">
            <a href="{reset_link}" style="background-color: #000; color: #fff; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
                Redefinir Senha
            </a>
        </div>
        <p style="font-size: 14px; color: #666;">Ou copie e cole este link no seu navegador:</p>
        <p style="font-size: 12px; word-break: break-all; background-color: #fff; padding: 10px; border-radius: 5px; border: 1px solid #ddd;">
            {reset_link}
        </p>
        <p style="font-size: 14px; color: #666; margin-top: 30px;">
            <strong>⚠️ Importante:</strong> Se você não solicitou esta alteração, ignore este email. Sua senha permanecerá inalterada.
        </p>
        <p style="font-size: 14px; color: #666;">
            Este link expira em <strong>24 horas</strong>.
        </p>
        <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
        <p style="font-size: 12px; color: #999; text-align: center;">
            Atenciosamente,<br>
            <strong>Equipe Backstage</strong>
        </p>
    </div>
</body>
</html>"""

    text = f"""Olá {user.username},

Recebemos uma solicitação para redefinir sua senha na plataforma Backstage.

Clique no link abaixo para criar uma nova senha:
{reset_link}

⚠️ Importante: Se você não solicitou esta alteração, ignore este email. Sua senha permanecerá inalterada.

Este link expira em 24 horas.

Atenciosamente,
Equipe Backstage"""

    payload = {
        "from": {
            "email": settings.DEFAULT_FROM_EMAIL,
            "name": "Backstage"
        },
        "to": [
            {
                "email": user.email,
                "name": user.username
            }
        ],
        "subject": subject,
        "text": text,
        "html": html
    }

    headers = {
        "Authorization": f"Bearer {mailersend_token}",
        "Content-Type": "application/json",
        "X-Requested-With": "XMLHttpRequest"
    }

    try:
        response = requests.post(
            "https://api.mailersend.com/v1/email",
            json=payload,
            headers=headers,
            timeout=10
        )

        if response.status_code == 202:
            print(f"✅ Email enviado com sucesso para {user.email}")
            print(f"📧 Message ID: {response.headers.get('X-Message-Id', 'N/A')}")
        else:
            print(f"❌ Erro ao enviar email. Status: {response.status_code}")
            print(f"📄 Response: {response.text}")
            print(f"🔗 Link de recuperação (fallback): {reset_link}")

    except requests.exceptions.RequestException as e:
        print(f"❌ Erro de conexão ao enviar email para {user.email}: {str(e)}")
        print(f"🔗 Link de recuperação (fallback): {reset_link}")


def send_password_changed_confirmation_email(user):
    """Envia email de confirmação quando a senha é alterada com sucesso"""

    mailersend_token = settings.MAILERSEND_API_TOKEN

    if not mailersend_token:
        print(f"⚠️  MAILERSEND_API_TOKEN não configurado. Email de confirmação não enviado para {user.email}")
        return

    frontend_url = getattr(settings, 'FRONTEND_URL', 'http://localhost:5173')
    login_link = f"{frontend_url}/login"

    subject = "Senha Alterada com Sucesso - Backstage"

    html = f"""<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background-color: #f8f9fa; padding: 30px; border-radius: 10px;">
        <div style="text-align: center; margin-bottom: 20px;">
            <div style="background-color: #28a745; color: white; width: 60px; height: 60px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 30px;">
                ✓
            </div>
        </div>
        <h2 style="color: #000; margin-top: 0; text-align: center;">Senha Alterada com Sucesso!</h2>
        <p>Olá <strong>{user.username}</strong>,</p>
        <p>Sua senha foi redefinida com sucesso na plataforma Backstage.</p>
        <p>Você já pode fazer login com sua nova senha:</p>
        <div style="text-align: center; margin: 30px 0;">
            <a href="{login_link}" style="background-color: #000; color: #fff; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
                Fazer Login
            </a>
        </div>
        <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 5px;">
            <p style="margin: 0; font-size: 14px; color: #856404;">
                <strong>⚠️ Importante:</strong> Se você não realizou esta alteração, entre em contato conosco imediatamente através do suporte.
            </p>
        </div>
        <p style="font-size: 14px; color: #666;">
            Por segurança, recomendamos:
        </p>
        <ul style="font-size: 14px; color: #666;">
            <li>Não compartilhar sua senha com ninguém</li>
            <li>Usar uma senha forte e única</li>
            <li>Alterar sua senha periodicamente</li>
        </ul>
        <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
        <p style="font-size: 12px; color: #999; text-align: center;">
            Atenciosamente,<br>
            <strong>Equipe Backstage</strong>
        </p>
    </div>
</body>
</html>"""

    text = f"""Olá {user.username},

Sua senha foi redefinida com sucesso na plataforma Backstage.

Você já pode fazer login com sua nova senha em:
{login_link}

⚠️ Importante: Se você não realizou esta alteração, entre em contato conosco imediatamente através do suporte.

Por segurança, recomendamos:
- Não compartilhar sua senha com ninguém
- Usar uma senha forte e única
- Alterar sua senha periodicamente

Atenciosamente,
Equipe Backstage"""

    payload = {
        "from": {
            "email": settings.DEFAULT_FROM_EMAIL,
            "name": "Backstage"
        },
        "to": [
            {
                "email": user.email,
                "name": user.username
            }
        ],
        "subject": subject,
        "text": text,
        "html": html
    }

    headers = {
        "Authorization": f"Bearer {mailersend_token}",
        "Content-Type": "application/json",
        "X-Requested-With": "XMLHttpRequest"
    }

    try:
        response = requests.post(
            "https://api.mailersend.com/v1/email",
            json=payload,
            headers=headers,
            timeout=10
        )

        if response.status_code == 202:
            print(f"✅ Email de confirmação enviado com sucesso para {user.email}")
            print(f"📧 Message ID: {response.headers.get('X-Message-Id', 'N/A')}")
        else:
            print(f"❌ Erro ao enviar email de confirmação. Status: {response.status_code}")
            print(f"📄 Response: {response.text}")

    except requests.exceptions.RequestException as e:
        print(f"❌ Erro de conexão ao enviar email de confirmação para {user.email}: {str(e)}")


