from django.db import models

class TransferRequest(models.Model):
    STATUS_CHOICES = [
        ('sent', 'Enviada'),
        ('accepted', 'Aceita'),
        ('denied', 'Negada'),
        ('cancelled', 'Cancelada'),
    ]

    inscricao = models.ForeignKey(
        'inscricoes.Inscricao',
        on_delete=models.CASCADE,
        related_name='transfer_requests'
    )

    from_user = models.ForeignKey(
        'users.CustomUser',
        on_delete=models.CASCADE,
        related_name='transfer_requests_sent'
    )

    to_user = models.ForeignKey(
        'users.CustomUser',
        on_delete=models.CASCADE,
        related_name='transfer_requests_received'
    )

    class Meta:
        verbose_name = "Transferir Inscrição"
        verbose_name_plural = "Transfer. de Inscrição"
        db_table = 'api_transferrequest'

    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='sent')
    mensagem = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Transferência de {self.from_user.username} para {self.to_user.username} ({self.status})"

