"""
Models relacionados a Analytics de Eventos
"""
import uuid
from django.db import models
from django.conf import settings


class EventoAnalytics(models.Model):
    """Model para armazenar dados analíticos de eventos"""
    
    evento = models.OneToOneField(
        'Evento',
        on_delete=models.CASCADE,
        related_name='analytics',
        primary_key=True
    )
    
    # Custos do evento
    custo_total = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0,
        help_text="Custo total de organização do evento"
    )
    
    # Receita
    receita_total = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0,
        help_text="Receita total gerada"
    )
    
    # ROI
    roi = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0,
        help_text="Return on Investment calculado automaticamente"
    )
    
    # Métricas de engajamento
    total_visualizacoes = models.IntegerField(default=0)
    visualizacoes_unicas = models.IntegerField(default=0)
    total_interacoes_simulador = models.IntegerField(default=0)
    tempo_medio_simulador = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0,
        help_text="Tempo médio de interação com simuladores em segundos"
    )
    
    # Timestamps
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Analytics do Evento"
        verbose_name_plural = "Analytics dos Eventos"
        db_table = "api_eventoanalytics"
    
    def __str__(self):
        return f"Analytics de {self.evento.titulo}"
    
    def calcular_roi(self):
        """Calcula o ROI: ((Receita - Custo) / Custo) * 100"""
        if self.custo_total > 0:
            self.roi = ((self.receita_total - self.custo_total) / self.custo_total) * 100
        else:
            self.roi = 0
        return self.roi


class InteracaoSimulador(models.Model):
    """Model para registrar interações com simuladores durante o evento"""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    evento = models.ForeignKey(
        'Evento',
        on_delete=models.CASCADE,
        related_name='interacoes_simulador'
    )
    
    usuario = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='interacoes_simulador'
    )
    
    tipo_simulador = models.CharField(
        max_length=100,
        help_text="Nome ou tipo do simulador (ex: 'Simulador de ROI', 'Quiz')"
    )
    
    duracao_segundos = models.IntegerField(
        default=0,
        help_text="Duração da interação em segundos"
    )
    
    concluiu = models.BooleanField(
        default=False,
        help_text="Se o usuário concluiu a interação"
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = "Interação com Simulador"
        verbose_name_plural = "Interações com Simuladores"
        ordering = ['-created_at']
        db_table = "api_interacaosimulador"
    
    def __str__(self):
        return f"{self.usuario.username} - {self.tipo_simulador} ({self.evento.titulo})"


class VisualizacaoEvento(models.Model):
    """Model para rastrear visualizações da página do evento"""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    evento = models.ForeignKey(
        'Evento',
        on_delete=models.CASCADE,
        related_name='visualizacoes'
    )
    
    usuario = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='visualizacoes',
        null=True,
        blank=True,
        help_text="Usuário que visualizou (pode ser nulo para visitantes não autenticados)"
    )
    
    ip_address = models.GenericIPAddressField(
        null=True,
        blank=True,
        help_text="IP do visitante"
    )
    
    user_agent = models.TextField(
        blank=True,
        help_text="User agent do navegador"
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = "Visualização de Evento"
        verbose_name_plural = "Visualizações de Eventos"
        ordering = ['-created_at']
        db_table = "api_visualizacaoevento"
    
    def __str__(self):
        usuario_str = self.usuario.username if self.usuario else "Anônimo"
        return f"{usuario_str} visualizou {self.evento.titulo}"
