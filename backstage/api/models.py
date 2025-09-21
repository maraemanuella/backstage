from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models


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

    objects = CustomUserManager()

    def __str__(self):
        return self.username

