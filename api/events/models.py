from django.db import models
from django.core.validators import MinValueValidator
import uuid
from decimal import Decimal


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

    # Organizador
    organizador = models.ForeignKey(
        'CustomUser',
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
        db_table = 'api_evento'
        app_label = 'api'

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


class Avaliacao(models.Model):
    """Model de Avaliação de Evento"""
    from django.core.validators import MinValueValidator, MaxValueValidator

    evento = models.ForeignKey(Evento, on_delete=models.CASCADE, related_name='avaliacoes')
    usuario = models.ForeignKey('CustomUser', on_delete=models.CASCADE, related_name='avaliacoes')
    comentario = models.TextField(verbose_name="Comentário")
    nota = models.IntegerField(validators=[MinValueValidator(0), MaxValueValidator(5)], verbose_name="Nota (0-5)")
    criado_em = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Avaliação"
        verbose_name_plural = "Avaliações"
        ordering = ['-criado_em']
        db_table = 'api_avaliacao'
        app_label = 'api'

    def __str__(self):
        return f"{self.usuario.username} - {self.evento.titulo} ({self.nota} estrelas)"

