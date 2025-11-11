from django.core.exceptions import ValidationError
from django.utils.translation import gettext as _
import re


class CustomPasswordValidator:
    """
    Validador customizado de senha que verifica:
    - Mínimo 8 caracteres
    - Pelo menos uma letra maiúscula
    - Pelo menos uma letra minúscula
    - Pelo menos um número
    - Pelo menos um caractere especial
    """

    def validate(self, password, user=None):
        if len(password) < 8:
            raise ValidationError(
                _("A senha deve ter no mínimo 8 caracteres."),
                code='password_too_short',
            )

        if not re.search(r'[A-Z]', password):
            raise ValidationError(
                _("A senha deve conter pelo menos uma letra maiúscula."),
                code='password_no_upper',
            )

        if not re.search(r'[a-z]', password):
            raise ValidationError(
                _("A senha deve conter pelo menos uma letra minúscula."),
                code='password_no_lower',
            )

        if not re.search(r'\d', password):
            raise ValidationError(
                _("A senha deve conter pelo menos um número."),
                code='password_no_digit',
            )

        if not re.search(r'[!@#$%^&*(),.?":{}|<>_\-+=\[\]\\\/;~`]', password):
            raise ValidationError(
                _("A senha deve conter pelo menos um caractere especial (!@#$%^&*etc)."),
                code='password_no_special',
            )

    def get_help_text(self):
        return _(
            "Sua senha deve conter no mínimo 8 caracteres, incluindo letras maiúsculas, "
            "minúsculas, números e caracteres especiais."
        )


def validate_password_strength(password):
    """Função auxiliar para validar senha e retornar lista de erros"""
    errors = []

    if len(password) < 8:
        errors.append("A senha deve ter no mínimo 8 caracteres")

    if not re.search(r'[A-Z]', password):
        errors.append("A senha deve conter pelo menos uma letra maiúscula")

    if not re.search(r'[a-z]', password):
        errors.append("A senha deve conter pelo menos uma letra minúscula")

    if not re.search(r'\d', password):
        errors.append("A senha deve conter pelo menos um número")

    if not re.search(r'[!@#$%^&*(),.?":{}|<>_\-+=\[\]\\\/;~`]', password):
        errors.append("A senha deve conter pelo menos um caractere especial")

    return errors

