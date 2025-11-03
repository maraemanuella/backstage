from django.db.models.signals import pre_save, post_save
from django.dispatch import receiver

# Usaremos utils para criar notificações
from .utils import (
    criar_notificacao_inscricao_confirmada,
    criar_notificacao_evento_cancelado,
)


@receiver(pre_save, sender=None)
def marcar_transicoes(sender, instance, **kwargs):
    """
    Marca flags em instances antes de salvar para detectar transições de estado
    nas models Inscricao e Evento sem criar acoplamento forte via imports no topo.
    """
    # Importes locais para evitar import circular
    try:
        from apps.inscricoes.models import Inscricao
    except Exception:
        Inscricao = None
    try:
        from apps.eventos.models import Evento
    except Exception:
        Evento = None

    # Transição de Inscricao -> status confirmada
    if Inscricao and isinstance(instance, Inscricao) and instance.pk:
        try:
            antigo = Inscricao.objects.get(pk=instance.pk)
            if antigo.status != 'confirmada' and instance.status == 'confirmada':
                setattr(instance, '_notify_confirmed', True)
        except Inscricao.DoesNotExist:
            pass

    # Transição de Evento -> status cancelado
    if Evento and isinstance(instance, Evento) and instance.pk:
        try:
            antigo = Evento.objects.get(pk=instance.pk)
            if antigo.status != 'cancelado' and instance.status == 'cancelado':
                setattr(instance, '_notify_cancelled', True)
        except Evento.DoesNotExist:
            pass


@receiver(post_save, sender=None)
def acionar_notificacoes(sender, instance, created, **kwargs):
    """
    Após salvar, cria notificações com base nas flags marcadas em pre_save.
    """
    # Importes locais para evitar import circular
    try:
        from apps.inscricoes.models import Inscricao
    except Exception:
        Inscricao = None
    try:
        from apps.eventos.models import Evento
    except Exception:
        Evento = None

    # Inscricao confirmada
    if Inscricao and isinstance(instance, Inscricao):
        if created and instance.status == 'confirmada':
            # Criada já confirmada
            criar_notificacao_inscricao_confirmada(instance.usuario, instance.evento)
        elif getattr(instance, '_notify_confirmed', False):
            criar_notificacao_inscricao_confirmada(instance.usuario, instance.evento)

    # Evento cancelado -> notificar todos os inscritos confirmados
    if Evento and isinstance(instance, Evento):
        if getattr(instance, '_notify_cancelled', False):
            from apps.inscricoes.models import Inscricao as InscricaoModel
            qs = InscricaoModel.objects.filter(evento=instance, status='confirmada').select_related('usuario')
            for insc in qs:
                criar_notificacao_evento_cancelado(insc.usuario, instance)
