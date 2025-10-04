from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.core.validators import MinValueValidator, MaxValueValidator
import uuid
from decimal import Decimal

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

class Evento(models.Model):
    """Model para eventos criados pelos organizadores"""

    CATEGORIA_CHOICES = [
    ('Workshop', 'Workshop'),
    ('Palestra', 'Palestra'),
    ('Networking', 'Networking'),
    ('Curso', 'Curso'),
    ]

    STATUS_CHOICES = [
        ('rascunho', 'Rascunho'),
        ('publicado', 'Publicado'),
        ('em_andamento', 'Em Andamento'),
        ('finalizado', 'Finalizado'),
        ('cancelado', 'Cancelado'),
    ]

    # Identificação
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    titulo = models.CharField(max_length=200)
    descricao = models.TextField()
    categoria = models.CharField(max_length=20, choices=CATEGORIA_CHOICES)

    # Organizador (usando o CustomUser existente)
    organizador = models.ForeignKey(
        CustomUser,
        on_delete=models.CASCADE,
        related_name='eventos_organizados'
    )
    
    itens_incluidos = models.TextField(
        blank=True,
        default='',
        help_text="Digite um item por linha"
    )

    # Data e Local
    data_evento = models.DateTimeField()
    endereco = models.CharField(max_length=300)
    local_especifico = models.CharField(max_length=100, blank=True, null=True)

    # Capacidade e Financeiro
    capacidade_maxima = models.IntegerField(validators=[MinValueValidator(1)])
    valor_deposito = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0)]
    )

    # Políticas
    permite_transferencia = models.BooleanField(default=True)
    politica_cancelamento = models.TextField(
        default="Cancelamento gratuito até 24h antes do evento"
    )


    # Mídia
    foto_capa = models.ImageField(upload_to='eventos/capas/', blank=True, null=True)

    # Coordenadas para mapa
    latitude = models.FloatField(blank=True, null=True)
    longitude = models.FloatField(blank=True, null=True)

    # Status
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='rascunho')

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-data_evento']

    def __str__(self):
        return f"{self.titulo} - {self.data_evento.strftime('%d/%m/%Y')}"

    @property
    def inscritos_count(self):
        """Retorna o número de inscritos confirmados"""
        return self.inscricoes.filter(status='confirmada').count()

    @property
    def vagas_disponiveis(self):
        """Retorna o número de vagas disponíveis"""
        return self.capacidade_maxima - self.inscritos_count

    @property
    def esta_lotado(self):
        """Verifica se o evento está lotado"""
        return self.vagas_disponiveis <= 0

    def calcular_valor_com_desconto(self, usuario):
        """Calcula o valor com desconto baseado no score do usuário"""
        score = usuario.score
        if score >= 8.5:
            desconto = Decimal('0.25')  # 25%
        elif score >= 7.0:
            desconto = Decimal('0.15')  # 15%
        elif score >= 6.0:
            desconto = Decimal('0.10')  # 10%
        else:
            desconto = Decimal('0.0')   # 0%

        valor_desconto = self.valor_deposito * desconto
        return self.valor_deposito - valor_desconto


class Inscricao(models.Model):
    """Model para inscrições em eventos"""

    STATUS_CHOICES = [
        ('pendente', 'Pendente'),
        ('confirmada', 'Confirmada'),
        ('cancelada', 'Cancelada'),
        ('transferida', 'Transferida'),
        ('lista_espera', 'Lista de Espera'),
    ]

    METODO_PAGAMENTO_CHOICES = [
        ('cartao_credito', 'Cartão de Crédito'),
        ('cartao_debito', 'Cartão de Débito'),
        ('pix', 'PIX'),
    ]

    STATUS_PAGAMENTO_CHOICES = [
        ('pendente', 'Pendente'),
        ('aprovado', 'Aprovado'),
        ('rejeitado', 'Rejeitado'),
        ('reembolsado', 'Reembolsado'),
    ]

    # Identificação
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    # Relacionamentos (usando CustomUser existente)
    usuario = models.ForeignKey(
        CustomUser,
        on_delete=models.CASCADE,
        related_name='inscricoes'
    )
    evento = models.ForeignKey(
        Evento,
        on_delete=models.CASCADE,
        related_name='inscricoes'
    )

    nome_completo_inscricao = models.CharField(max_length=200, verbose_name="Nome Completo")
    cpf_inscricao = models.CharField(max_length=11, verbose_name="CPF")
    telefone_inscricao = models.CharField(max_length=20, verbose_name="Telefone")
    email_inscricao = models.EmailField(verbose_name="Email")

    # Dados da inscrição
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pendente')

    # Dados financeiros
    valor_original = models.DecimalField(max_digits=10, decimal_places=2)
    desconto_aplicado = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    valor_final = models.DecimalField(max_digits=10, decimal_places=2)

    # Dados de pagamento
    metodo_pagamento = models.CharField(max_length=20, choices=METODO_PAGAMENTO_CHOICES)
    status_pagamento = models.CharField(max_length=20, choices=STATUS_PAGAMENTO_CHOICES, default='pendente')

    # Check-in
    checkin_realizado = models.BooleanField(default=False)
    data_checkin = models.DateTimeField(blank=True, null=True)

    # QR Code
    qr_code = models.CharField(max_length=100, unique=True, blank=True, null=True)

    # Termos
    aceita_termos = models.BooleanField(default=False)

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ['usuario', 'evento']  # Um usuário só pode se inscrever uma vez por evento
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.usuario.username} - {self.evento.titulo}"

    def save(self, *args, **kwargs):
        """Override save para gerar QR code único"""
        if not self.qr_code:
            # Primeiro salva para gerar o ID
            if not self.pk:
                super().save(*args, **kwargs)
            self.qr_code = f"BST-{str(self.id)[:8].upper()}-{uuid.uuid4().hex[:8].upper()}"
        super().save(*args, **kwargs)

    def calcular_reembolso_estimado(self):
        """Calcula o valor estimado de reembolso se comparecer"""
        return self.valor_final

# Model de Avaliação de Evento
class Avaliacao(models.Model):
    evento = models.ForeignKey('Evento', on_delete=models.CASCADE, related_name='avaliacoes')
    usuario = models.ForeignKey('CustomUser', on_delete=models.CASCADE, related_name='avaliacoes')
    comentario = models.TextField(verbose_name="Comentário")
    nota = models.IntegerField(validators=[MinValueValidator(0), MaxValueValidator(5)], verbose_name="Nota (0-5)")
    criado_em = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Avaliação"
        verbose_name_plural = "Avaliações"
        ordering = ['-criado_em']

    def __str__(self):
        return f"{self.usuario.username} - {self.evento.titulo} ({self.nota} estrelas)"
    
    
# Model de Favorito
class Favorite(models.Model):   
    user = models.ForeignKey(
        CustomUser,
        on_delete=models.CASCADE,
        related_name="favorites"
    )
    evento = models.ForeignKey(
        Evento,
        on_delete=models.CASCADE,
        related_name="favorited_by"
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("user", "evento")
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.user.username} favoritou {self.evento.titulo}"
    
# Model de transferência de inscrição
class TransferRequest(models.Model):
    STATUS_CHOICES = [
        ('sent', 'Enviada'),
        ('accepted', 'Aceita'),
        ('denied', 'Negada'),
        ('cancelled', 'Cancelada'),
    ]

    inscricao = models.ForeignKey(
        Inscricao, 
        on_delete=models.CASCADE, 
        related_name='transfer_requests'
        )
    
    from_user = models.ForeignKey(
        CustomUser, 
        on_delete=models.CASCADE, 
        related_name='transfer_requests_sent'
        )
    
    to_user = models.ForeignKey(
        CustomUser, 
        on_delete=models.CASCADE, 
        related_name='transfer_requests_received'
        )
    
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='sent')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Transferência de {self.from_user.username} para {self.to_user.username} ({self.status})"