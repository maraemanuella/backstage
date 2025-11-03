"""
Utilitários para criar notificações programaticamente
"""
from apps.notificacoes.models import Notificacao
from apps.users.models import CustomUser


def criar_notificacao_vaga_lista_espera(usuario, evento):
    """
    Cria notificação quando uma vaga é liberada na lista de espera
    
    Args:
        usuario: Instância de CustomUser
        evento: Instância de Evento
    
    Exemplo:
        from apps.notificacoes.utils import criar_notificacao_vaga_lista_espera
        criar_notificacao_vaga_lista_espera(usuario, evento)
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
    
    Args:
        usuario: Instância de CustomUser
        evento: Instância de Evento
        dias_faltando: Número de dias até o evento
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
    
    Args:
        usuario: Usuário que recebeu a oferta
        transferencia: Instância de Transferencia
        evento: Instância de Evento
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
    Notifica todos os usuários que favoritaram um organizador
    sobre um novo evento
    
    Args:
        organizador: Usuário organizador do evento
        evento: Novo evento criado
    """
    from apps.favoritos.models import Favorito
    
    # Buscar todos que favoritaram este organizador
    favoritos = Favorito.objects.filter(organizador=organizador)
    
    for favorito in favoritos:
        Notificacao.objects.create(
            usuario=favorito.usuario,
            tipo='favorito_novo_evento',
            titulo=f'Novo evento de {organizador.username}',
            mensagem=f'{organizador.username} criou um novo evento: "{evento.titulo}"',
            link=f'/evento/{evento.id}'
        )


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
    (útil para avisos importantes do sistema)
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
