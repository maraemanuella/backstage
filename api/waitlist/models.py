from django.db import models
import uuid


class WaitlistEntry(models.Model):
    """Model para entradas na lista de espera (waitlist)"""

    STATUS_CHOICES = [
        ('fila', 'Fila'),
        ('notificado', 'Notificado'),
        ('aceitou', 'Aceitou'),
        ('expirado', 'Expirado'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    usuario = models.ForeignKey(
        'CustomUser',
        on_delete=models.CASCADE,
        related_name='waitlist_entries'
    )
    evento = models.ForeignKey(
        'Evento',
        on_delete=models.CASCADE,
        related_name='waitlist_entries'
    )

    # Opcionalmente ligando a uma inscrição existente
    inscricao = models.ForeignKey(
        'Inscricao',
        on_delete=models.SET_NULL,
        related_name='waitlist_entries',
        null=True,
        blank=True
    )

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='fila')
    created_at = models.DateTimeField(auto_now_add=True)
    notified_at = models.DateTimeField(blank=True, null=True)
    expires_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        verbose_name = 'Entradas da Lista de Espera'
        verbose_name_plural = 'Entradas da Lista de Espera'
        ordering = ['created_at']
        unique_together = ('usuario', 'evento')
        db_table = 'api_waitlistentry'
        app_label = 'api'

    def __str__(self):
        return f"{self.usuario.username} na fila do {self.evento.titulo} ({self.status})"

