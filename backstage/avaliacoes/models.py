# Imports da biblioteca padrão

# Imports do Django
from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator


class Avaliacao(models.Model):
    """Model para avaliações de eventos"""
    evento = models.ForeignKey('api.Evento', on_delete=models.CASCADE, related_name='avaliacoes')
    usuario = models.ForeignKey('api.CustomUser', on_delete=models.CASCADE, related_name='avaliacoes')
    comentario = models.TextField(verbose_name="Comentário")
    nota = models.IntegerField(
        validators=[MinValueValidator(0), MaxValueValidator(5)], 
        verbose_name="Nota (0-5)"
    )
    criado_em = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Avaliação"
        verbose_name_plural = "Avaliações"
        ordering = ['-criado_em']
        unique_together = ['evento', 'usuario']  # Um usuário só pode avaliar um evento uma vez

    def __str__(self):
        return f"{self.usuario.username} - {self.evento.titulo} ({self.nota} estrelas)"
