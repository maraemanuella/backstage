from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager

class CustomUserManager(BaseUserManager):
    def create_user(self, username, email, password=None, **extra_fields):
        if not email:
            raise ValueError("O email é obrigatório")
        email = self.normalize_email(email)
        user = self.model(username=username, email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, username, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)

        if extra_fields.get("is_staff") is not True:
            raise ValueError("Superuser precisa ter is_staff=True.")
        if extra_fields.get("is_superuser") is not True:
            raise ValueError("Superuser precisa ter is_superuser=True.")

        return self.create_user(username, email, password, **extra_fields)


class CustomUser(AbstractUser):
    email = models.EmailField(unique=True)
    telefone = models.CharField(max_length=20, blank=True, null=True)
    cpf = models.CharField(max_length=11, blank=True, null=True, unique=True)
    cnpj = models.CharField(max_length=14, blank=True, null=True, unique=True)
    data_nascimento = models.DateField(blank=True, null=True)
    score = models.FloatField(default=5)
    profile_photo = models.ImageField(upload_to="profile_photos/", blank=True, null=True, default="profile_photos/user.jpg")
    sexo = models.CharField(
        max_length=10,
        choices=[("M", "Masculino"), ("F", "Feminino"), ("O", "Outro")],
        blank=True,
        null=True,
    )
    tipo_documento = models.CharField(
        max_length=10,
        choices=[('cpf', 'CPF'), ('cnpj', 'CNPJ')],
        blank=True,
        null=True
    )
    numero_documento = models.CharField(max_length=20, blank=True, null=True)
    documento_foto = models.ImageField(upload_to='documentos/', blank=True, null=True)
    documento_verificado = models.CharField(
        max_length=20,
        choices=[
            ('pendente', 'Pendente'),
            ('verificando', 'Verificando'),
            ('aprovado', 'Aprovado'),
            ('rejeitado', 'Rejeitado'),
        ],
        default='pendente'
    )

    objects = CustomUserManager()

    class Meta:
        db_table = 'api_customuser'

    def __str__(self):
        return self.username

    def get_nivel(self):
        """
        Retorna o nível do usuário baseado no score.

        Níveis:
        - Bronze: 0.0 - 2.9
        - Prata: 3.0 - 3.9
        - Ouro: 4.0 - 4.4
        - Platina: 4.5 - 4.7
        - Diamante: 4.8 - 5.0
        """
        score = float(self.score)

        if score >= 4.8:
            return 'Diamante'
        elif score >= 4.5:
            return 'Platina'
        elif score >= 4.0:
            return 'Ouro'
        elif score >= 3.0:
            return 'Prata'
        else:
            return 'Bronze'

    def get_nivel_cor(self):
        """Retorna a cor associada ao nível"""
        nivel = self.get_nivel()
        cores = {
            'Bronze': '#CD7F32',
            'Prata': '#C0C0C0',
            'Ouro': '#FFD700',
            'Platina': '#E5E4E2',
            'Diamante': '#B9F2FF'
        }
        return cores.get(nivel, '#808080')

    def get_proximo_nivel(self):
        """Retorna informações sobre o próximo nível"""
        score = float(self.score)

        if score >= 4.8:
            return {
                'nivel': 'Diamante',
                'score_necessario': 5.0,
                'score_faltante': 5.0 - score,
                'proximo_nivel': None,
                'no_maximo': True
            }
        elif score >= 4.5:
            return {
                'nivel': 'Platina',
                'score_necessario': 4.8,
                'score_faltante': 4.8 - score,
                'proximo_nivel': 'Diamante',
                'no_maximo': False
            }
        elif score >= 4.0:
            return {
                'nivel': 'Ouro',
                'score_necessario': 4.5,
                'score_faltante': 4.5 - score,
                'proximo_nivel': 'Platina',
                'no_maximo': False
            }
        elif score >= 3.0:
            return {
                'nivel': 'Prata',
                'score_necessario': 4.0,
                'score_faltante': 4.0 - score,
                'proximo_nivel': 'Ouro',
                'no_maximo': False
            }
        else:
            return {
                'nivel': 'Bronze',
                'score_necessario': 3.0,
                'score_faltante': 3.0 - score,
                'proximo_nivel': 'Prata',
                'no_maximo': False
            }

    def get_ranking_info(self):
        """Retorna informações completas de ranking do usuário"""
        return {
            'score': float(self.score),
            'nivel': self.get_nivel(),
            'cor': self.get_nivel_cor(),
            'proximo_nivel': self.get_proximo_nivel()
        }

