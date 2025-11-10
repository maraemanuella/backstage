from django.db.models.signals import pre_save, post_save
from django.dispatch import receiver

from .utils import (
    criar_notificacao_inscricao_confirmada,
    criar_notificacao_evento_cancelado,
    notificar_usuarios_favorito,
)


@receiver(pre_save, sender='inscricoes.Inscricao')
def marcar_transicao_inscricao(sender, instance, **kwargs):
    """
    Detecta quando uma inscrição muda para 'confirmada'
    """
    if instance.pk:
        try:
            antigo = sender.objects.get(pk=instance.pk)
            if antigo.status != 'confirmada' and instance.status == 'confirmada':
                setattr(instance, '_notify_confirmed', True)
        except sender.DoesNotExist:
            pass


@receiver(post_save, sender='inscricoes.Inscricao')
def notificar_inscricao_confirmada(sender, instance, created, **kwargs):
    """
    Cria notificação quando inscrição é confirmada
    """
    # Se foi criada já confirmada
    if created and instance.status == 'confirmada':
        criar_notificacao_inscricao_confirmada(instance.usuario, instance.evento)
    # Se mudou para confirmada
    elif getattr(instance, '_notify_confirmed', False):
        criar_notificacao_inscricao_confirmada(instance.usuario, instance.evento)


@receiver(post_save, sender='eventos.Evento')
def notificar_novo_evento(sender, instance, created, **kwargs):
    """
    Notifica usuários que favoritaram o organizador quando um novo evento é criado
    """
    if created and instance.status == 'publicado':
        print(f"[NOTIFICACAO] Novo evento criado: {instance.titulo} por {instance.organizador.username}")
        try:
            notificar_usuarios_favorito(instance.organizador, instance)
            print(f"[NOTIFICACAO] Notificações enviadas para seguidores de {instance.organizador.username}")
        except Exception as e:
            print(f"[NOTIFICACAO] Erro ao notificar seguidores: {str(e)}")


@receiver(pre_save, sender='eventos.Evento')
def marcar_transicao_evento(sender, instance, **kwargs):
    """
    Detecta quando um evento é cancelado
    """
    if instance.pk:
        try:
            antigo = sender.objects.get(pk=instance.pk)
            if antigo.status != 'cancelado' and instance.status == 'cancelado':
                setattr(instance, '_notify_cancelled', True)
        except sender.DoesNotExist:
            pass


@receiver(post_save, sender='eventos.Evento')
def notificar_evento_cancelado(sender, instance, created, **kwargs):
    """
    Notifica todos os inscritos confirmados quando um evento é cancelado
    """
    if getattr(instance, '_notify_cancelled', False):
        from apps.inscricoes.models import Inscricao
        print(f"[NOTIFICACAO] Evento cancelado: {instance.titulo}")
        
        inscricoes = Inscricao.objects.filter(
            evento=instance, 
            status='confirmada'
        ).select_related('usuario')
        
        for insc in inscricoes:
            criar_notificacao_evento_cancelado(insc.usuario, instance)
        
        print(f"[NOTIFICACAO] {inscricoes.count()} usuários notificados sobre cancelamento")
