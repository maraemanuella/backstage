from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()


class Notificacao(models.Model):
    """
    Modelo para armazenar notificações do sistema.
    Suporta diferentes tipos de alertas para engajamento do usuário.
    """
    
    TIPO_CHOICES = [
        ('vaga_lista_espera', 'Vaga na Lista de Espera'),
        ('evento_proximo', 'Evento Próximo'),
        ('transferencia_aprovada', 'Transferência Aprovada'),
        ('transferencia_recusada', 'Transferência Recusada'),
        ('transferencia_recebida', 'Solicitação de Transferência Recebida'),
        ('inscricao_confirmada', 'Inscrição Confirmada'),
        ('checkin_lembrete', 'Lembrete de Check-in'),
        ('avaliacao_pendente', 'Avaliação Pendente'),
        ('documento_aprovado', 'Documento Aprovado'),
        ('documento_rejeitado', 'Documento Rejeitado'),
        ('sistema', 'Notificação do Sistema'),
    ]
    
    usuario = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        related_name='notificacoes',
        verbose_name='Usuário'
    )
    tipo = models.CharField(
        max_length=50, 
        choices=TIPO_CHOICES,
        verbose_name='Tipo'
    )
    titulo = models.CharField(
        max_length=200,
        verbose_name='Título'
    )
    mensagem = models.TextField(
        verbose_name='Mensagem'
    )
    lida = models.BooleanField(
        default=False,
        verbose_name='Lida'
    )
    link = models.CharField(
        max_length=500, 
        blank=True,
        help_text='Link para redirecionar quando a notificação for clicada',
        verbose_name='Link'
    )
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name='Criada em'
    )
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Notificação'
        verbose_name_plural = 'Notificações'
        indexes = [
            models.Index(fields=['usuario', '-created_at']),
            models.Index(fields=['usuario', 'lida']),
        ]
    
    def __str__(self):
        return f"{self.get_tipo_display()} - {self.usuario.username} - {self.created_at.strftime('%d/%m/%Y %H:%M')}"
    
    @classmethod
    def criar_notificacao(cls, usuario, tipo, titulo, mensagem, link=''):
        """
        Método helper para criar notificações de forma consistente.
        """
        return cls.objects.create(
            usuario=usuario,
            tipo=tipo,
            titulo=titulo,
            mensagem=mensagem,
            link=link
        )
    
    def marcar_como_lida(self):
        """Marca a notificação como lida."""
        self.lida = True
        self.save(update_fields=['lida'])
