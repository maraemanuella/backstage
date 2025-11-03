from rest_framework import serializers
from .models import EventoAnalytics, InteracaoSimulador, VisualizacaoEvento


class EventoAnalyticsSerializer(serializers.ModelSerializer):
    evento_titulo = serializers.CharField(source='evento.titulo', read_only=True)

    class Meta:
        model = EventoAnalytics
        fields = [
            'evento',
            'evento_titulo',
            'custo_total',
            'receita_total',
            'roi',
            'total_visualizacoes',
            'total_interacoes_simulador',
            'updated_at',
        ]
        read_only_fields = ['evento', 'updated_at']


class InteracaoSimuladorSerializer(serializers.ModelSerializer):
    usuario_nome = serializers.CharField(source='usuario.username', read_only=True)
    evento_titulo = serializers.CharField(source='evento.titulo', read_only=True)

    class Meta:
        model = InteracaoSimulador
        fields = [
            'id',
            'evento',
            'evento_titulo',
            'usuario',
            'usuario_nome',
            'tipo_simulador',
            'duracao_segundos',
            'concluiu',
            'created_at',
        ]
        read_only_fields = ['id', 'created_at']


class VisualizacaoEventoSerializer(serializers.ModelSerializer):
    usuario_nome = serializers.CharField(source='usuario.username', read_only=True)
    evento_titulo = serializers.CharField(source='evento.titulo', read_only=True)

    class Meta:
        model = VisualizacaoEvento
        fields = [
            'id',
            'evento',
            'evento_titulo',
            'usuario',
            'usuario_nome',
            'ip_address',
            'user_agent',
            'created_at',
        ]
        read_only_fields = ['id', 'created_at']
from django.db import models
import uuid

class WaitlistEntry(models.Model):
    STATUS_CHOICES = [
        ('fila', 'Fila'),
        ('notificado', 'Notificado'),
        ('aceitou', 'Aceitou'),
        ('expirado', 'Expirado'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    usuario = models.ForeignKey(
        'users.CustomUser',
        on_delete=models.CASCADE,
        related_name='waitlist_entries'
    )
    evento = models.ForeignKey(
        'eventos.Evento',
        on_delete=models.CASCADE,
        related_name='waitlist_entries'
    )

    inscricao = models.ForeignKey(
        'inscricoes.Inscricao',
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

    def __str__(self):
        return f"{self.usuario.username} na fila do {self.evento.titulo} ({self.status})"

