"""
Utilitários para criar notificações programaticamente
"""
from apps.notificacoes.models import Notificacao
from apps.users.models import CustomUser


def criar_notificacao_vaga_lista_espera(usuario, evento):
    """
    Cria notificação quando uma vaga é liberada na lista de espera
    
    """
    Notificacao.objects.create(
        usuario=usuario,
        tipo='vaga_lista_espera',
        titulo='Vaga liberada na lista de espera!',
        mensagem=f'Uma vaga foi liberada para o evento "{evento.titulo}". Garanta sua inscrição agora!',
        link=f'/evento/{evento.id}'
    )


def criar_notificacao_evento_proximo(usuario, evento, dias_faltando):
    """
    Cria notificação lembrando que um evento está próximo
    
    """
    if dias_faltando == 1:
        mensagem = f'O evento "{evento.titulo}" é amanhã! Não se esqueça.'
    elif dias_faltando == 0:
        mensagem = f'O evento "{evento.titulo}" é hoje!'
    else:
        mensagem = f'O evento "{evento.titulo}" acontece em {dias_faltando} dias.'
    
    Notificacao.objects.create(
        usuario=usuario,
        tipo='evento_proximo',
        titulo='Evento próximo',
        mensagem=mensagem,
        link=f'/evento/{evento.id}'
    )


def criar_notificacao_transferencia_recebida(usuario, transferencia, evento):
    """
    Notifica quando alguém oferece uma transferência de ingresso
    
    """
    Notificacao.objects.create(
        usuario=usuario,
        tipo='transferencia',
        titulo='Nova oferta de transferência',
        mensagem=f'Você recebeu uma oferta de transferência para o evento "{evento.titulo}"',
        link=f'/transferencia/{transferencia.id}/aceitar'
    )


def criar_notificacao_inscricao_confirmada(usuario, evento):
    """
    Notifica quando a inscrição é confirmada
    """
    Notificacao.objects.create(
        usuario=usuario,
        tipo='inscricao_confirmada',
        titulo='Inscrição confirmada!',
        mensagem=f'Sua inscrição para "{evento.titulo}" foi confirmada com sucesso.',
        link=f'/evento/{evento.id}'
    )


def criar_notificacao_evento_cancelado(usuario, evento):
    """
    Notifica quando um evento é cancelado
    """
    Notificacao.objects.create(
        usuario=usuario,
        tipo='evento_cancelado',
        titulo='Evento cancelado',
        mensagem=f'Infelizmente o evento "{evento.titulo}" foi cancelado.',
        link=f'/evento/{evento.id}'
    )


def criar_notificacao_avaliacao(usuario, evento):
    """
    Solicita avaliação após o evento
    """
    Notificacao.objects.create(
        usuario=usuario,
        tipo='avaliacao',
        titulo='Avalie o evento',
        mensagem=f'Como foi sua experiência no evento "{evento.titulo}"? Deixe sua avaliação.',
        link=f'/evento/{evento.id}/avaliar'
    )


def notificar_usuarios_favorito(organizador, evento):
    """
    Notifica todos os usuários que favoritaram eventos anteriores do organizador
    sobre um novo evento
    """
    from apps.favoritos.models import Favorite
    from apps.eventos.models import Evento
    
    # Buscar todos os eventos anteriores do organizador
    eventos_anteriores = Evento.objects.filter(organizador=organizador).exclude(id=evento.id)
    
    # Buscar usuários que favoritaram eventos deste organizador
    usuarios_interessados = Favorite.objects.filter(
        evento__in=eventos_anteriores
    ).values_list('user_id', flat=True).distinct()
    
    # Criar notificações para cada usuário interessado
    notificacoes = []
    for user_id in usuarios_interessados:
        from apps.users.models import CustomUser
        try:
            usuario = CustomUser.objects.get(id=user_id)
            notificacoes.append(
                Notificacao(
                    usuario=usuario,
                    tipo='favorito_novo_evento',
                    titulo=f'Novo evento de {organizador.username}',
                    mensagem=f'{organizador.username} criou um novo evento: "{evento.titulo}"',
                    link=f'/evento/{evento.id}'
                )
            )
        except CustomUser.DoesNotExist:
            continue
    
    # Bulk create para performance
    if notificacoes:
        Notificacao.objects.bulk_create(notificacoes)
        return len(notificacoes)
    return 0


def criar_notificacao_sistema(usuario, titulo, mensagem, link=None):
    """
    Cria uma notificação genérica do sistema
    """
    Notificacao.objects.create(
        usuario=usuario,
        tipo='sistema',
        titulo=titulo,
        mensagem=mensagem,
        link=link
    )


def notificar_todos_usuarios(titulo, mensagem, link=None):
    """
    Envia uma notificação para TODOS os usuários ativos
    """
    usuarios_ativos = CustomUser.objects.filter(is_active=True)
    
    notificacoes = [
        Notificacao(
            usuario=usuario,
            tipo='sistema',
            titulo=titulo,
            mensagem=mensagem,
            link=link
        )
        for usuario in usuarios_ativos
    ]
    
    # Bulk create para performance
    Notificacao.objects.bulk_create(notificacoes)
