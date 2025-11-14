from django.db import models
from django.core.validators import MinValueValidator
import uuid
from decimal import Decimal

class Evento(models.Model):
    CATEGORIA_CHOICES = [
    ('Workshop', 'Workshop'),
    ('Palestra', 'Palestra'),
    ('Networking', 'Networking'),
    ('Curso', 'Curso'),
    ('Outro', 'Outro'),
    ]

    STATUS_CHOICES = [
        ('rascunho', 'Rascunho'),
        ('publicado', 'Publicado'),
        ('em_andamento', 'Em Andamento'),
        ('finalizado', 'Finalizado'),
        ('cancelado', 'Cancelado'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    titulo = models.CharField(max_length=200)
    descricao = models.TextField()
    categorias = models.JSONField(default=list, help_text="Lista de categorias do evento")
    categorias_customizadas = models.JSONField(default=list, blank=True, help_text="Lista de categorias personalizadas quando 'Outro' é selecionado")

    organizador = models.ForeignKey(
        'users.CustomUser',
        on_delete=models.CASCADE,
        related_name='eventos_organizados'
    )

    itens_incluidos = models.TextField(
        blank=True,
        default='',
        help_text="Digite um item por linha"
    )

    data_evento = models.DateTimeField()
    endereco = models.CharField(max_length=300)
    local_especifico = models.CharField(max_length=100, blank=True, null=True)

    capacidade_maxima = models.IntegerField(validators=[MinValueValidator(1)])
    valor_deposito = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0)]
    )

    permite_transferencia = models.BooleanField(default=True)
    politica_cancelamento = models.TextField(
        default="Cancelamento gratuito até 24h antes do evento"
    )

    foto_capa = models.ImageField(upload_to='eventos/capas/', blank=True, null=True)
    qr_code_pix = models.ImageField(upload_to='eventos/qrcodes_pix/', blank=True, null=True)

    latitude = models.FloatField(blank=True, null=True)
    longitude = models.FloatField(blank=True, null=True)

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='rascunho')

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-data_evento']
        db_table = 'api_evento'

    def __str__(self):
        return f"{self.titulo} - {self.data_evento.strftime('%d/%m/%Y')}"

    @property
    def inscritos_count(self):
        return self.inscricoes.filter(status='confirmada').count()

    @property
    def vagas_disponiveis(self):
        return self.capacidade_maxima - self.inscritos_count

    @property
    def esta_lotado(self):
        return self.vagas_disponiveis <= 0

    def calcular_valor_com_desconto(self, usuario):
        score = usuario.score
        if score >= 8.5:
            desconto = Decimal('0.25')
        elif score >= 7.0:
            desconto = Decimal('0.15')
        elif score >= 6.0:
            desconto = Decimal('0.10')
        else:
            desconto = Decimal('0.0')

        valor_desconto = self.valor_deposito * desconto
        return self.valor_deposito - valor_desconto

