from django.db import models


class TransferRequest(models.Model):
    """Model de transferência de inscrição"""

    STATUS_CHOICES = [
        ('sent', 'Enviada'),
        ('accepted', 'Aceita'),
        ('denied', 'Negada'),
        ('cancelled', 'Cancelada'),
    ]

    inscricao = models.ForeignKey(
        'Inscricao',
        on_delete=models.CASCADE,
        related_name='transfer_requests'
    )

    from_user = models.ForeignKey(
        'CustomUser',
        on_delete=models.CASCADE,
        related_name='transfer_requests_sent'
    )

    to_user = models.ForeignKey(
        'CustomUser',
        on_delete=models.CASCADE,
        related_name='transfer_requests_received'
    )

    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='sent')
    mensagem = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Transferir Inscrição"
        verbose_name_plural = "Transfer. de Inscrição"
        db_table = 'api_transferrequest'
        app_label = 'api'

    def __str__(self):
        return f"Transferência de {self.from_user.username} para {self.to_user.username} ({self.status})"

