from django.db import models

class Favorite(models.Model):
    user = models.ForeignKey(
        'users.CustomUser',
        on_delete=models.CASCADE,
        related_name="favorites"
    )
    evento = models.ForeignKey(
        'eventos.Evento',
        on_delete=models.CASCADE,
        related_name="favorited_by"
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("user", "evento")
        ordering = ["-created_at"]
        db_table = 'api_favorite'

    def __str__(self):
        return f"{self.user.username} favoritou {self.evento.titulo}"

