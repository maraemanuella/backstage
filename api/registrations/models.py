from django.db import models
import uuid


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

    # Relacionamentos
    usuario = models.ForeignKey(
        'CustomUser',
        on_delete=models.CASCADE,
        related_name='inscricoes'
    )
    evento = models.ForeignKey(
        'Evento',
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
        unique_together = ['usuario', 'evento']
        ordering = ['-created_at']
        db_table = 'api_inscricao'
        app_label = 'api'

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

