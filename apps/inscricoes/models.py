from django.db import models
import uuid

class Inscricao(models.Model):
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
        ('isento', 'Isento de Depósito'),
    ]

    STATUS_PAGAMENTO_CHOICES = [
        ('pendente', 'Pendente'),
        ('aprovado', 'Aprovado'),
        ('rejeitado', 'Rejeitado'),
        ('reembolsado', 'Reembolsado'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    usuario = models.ForeignKey(
        'users.CustomUser',
        on_delete=models.CASCADE,
        related_name='inscricoes'
    )
    evento = models.ForeignKey(
        'eventos.Evento',
        on_delete=models.CASCADE,
        related_name='inscricoes'
    )

    nome_completo_inscricao = models.CharField(max_length=200, verbose_name="Nome Completo")
    cpf_inscricao = models.CharField(max_length=11, verbose_name="CPF")
    telefone_inscricao = models.CharField(max_length=20, verbose_name="Telefone")
    email_inscricao = models.EmailField(verbose_name="Email")

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pendente')

    valor_original = models.DecimalField(max_digits=10, decimal_places=2)
    desconto_aplicado = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    valor_final = models.DecimalField(max_digits=10, decimal_places=2)

    metodo_pagamento = models.CharField(max_length=20, choices=METODO_PAGAMENTO_CHOICES)
    status_pagamento = models.CharField(max_length=20, choices=STATUS_PAGAMENTO_CHOICES, default='pendente')
    
    # Campos para rastreamento de pagamento
    data_pagamento = models.DateTimeField(blank=True, null=True, verbose_name="Data do Pagamento")
    comprovante_pagamento = models.ImageField(upload_to='comprovantes_pagamento/', blank=True, null=True, verbose_name="Comprovante de Pagamento")
    id_transacao_gateway = models.CharField(max_length=200, blank=True, null=True, verbose_name="ID da Transação")
    observacoes_pagamento = models.TextField(blank=True, null=True, verbose_name="Observações sobre o Pagamento")

    checkin_realizado = models.BooleanField(default=False)
    data_checkin = models.DateTimeField(blank=True, null=True)

    qr_code = models.CharField(max_length=100, unique=True, blank=True, null=True)

    aceita_termos = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # Campo para controlar tempo de expiração da inscrição pendente
    expira_em = models.DateTimeField(blank=True, null=True, help_text="Data/hora em que a inscrição pendente expira")

    class Meta:
        unique_together = ['usuario', 'evento']
        ordering = ['-created_at']
        db_table = 'api_inscricao'

    def __str__(self):
        return f"{self.usuario.username} - {self.evento.titulo}"

    def save(self, *args, **kwargs):
        if not self.qr_code:
            if not self.pk:
                super().save(*args, **kwargs)
            self.qr_code = f"BST-{str(self.id)[:8].upper()}-{uuid.uuid4().hex[:8].upper()}"
        super().save(*args, **kwargs)

    def calcular_reembolso_estimado(self):
        return self.valor_final

    def esta_expirada(self):
        """Verifica se a inscrição pendente está expirada"""
        from django.utils import timezone
        if self.expira_em and self.status_pagamento == 'pendente':
            return timezone.now() > self.expira_em
        return False

