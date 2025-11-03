import sys
from apps.users.models import CustomUser
from apps.eventos.models import Evento
from apps.notificacoes.models import Notificacao
from apps.notificacoes.utils import (
    criar_notificacao_vaga_lista_espera,
    criar_notificacao_evento_proximo,
    criar_notificacao_inscricao_confirmada,
    criar_notificacao_sistema,
)

print("=" * 60)
print("TESTE DO SISTEMA DE NOTIFICAÇÕES")
print("=" * 60)

usuario = CustomUser.objects.first()
if not usuario:
    print("Nenhum usuário encontrado. Crie um usuário primeiro.")
    sys.exit(1)

print(f"Usuário: {usuario.username} (ID: {usuario.id})")

print("\nCriando notificação de boas-vindas...")
Notificacao.objects.create(
    usuario=usuario,
    tipo='sistema',
    titulo='Bem-vindo ao sistema de notificações!',
    mensagem='Agora você receberá atualizações importantes sobre eventos, vagas e muito mais.',
    lida=False
)
print("Notificação de boas-vindas criada")

print("\nCriando notificação de vaga liberada...")
evento = Evento.objects.first()
if evento:
    criar_notificacao_vaga_lista_espera(usuario, evento)
    print(f"Notificação de vaga criada para o evento: {evento.titulo}")
else:
    print("Nenhum evento encontrado. Criando notificação genérica...")
    Notificacao.objects.create(
        usuario=usuario,
        tipo='vaga_lista_espera',
        titulo='Vaga liberada!',
        mensagem='Uma vaga foi liberada para um evento que você estava na lista de espera.',
    )

print("\nCriando notificação de inscrição confirmada...")
if evento:
    criar_notificacao_inscricao_confirmada(usuario, evento)
    print("Notificação de inscrição criada")

print("\nCriando notificação de evento próximo...")
if evento:
    criar_notificacao_evento_proximo(usuario, evento, dias_faltando=2)
    print("Notificação de evento próximo criada")

print("\nCriando notificação com link...")
criar_notificacao_sistema(
    usuario=usuario,
    titulo='Novo recurso disponível!',
    mensagem='Confira as novidades na sua página de perfil.',
    link='/perfil'
)
print("Notificação com link criada")

print("RESUMO")
total_notificacoes = Notificacao.objects.filter(usuario=usuario).count()
nao_lidas = Notificacao.objects.filter(usuario=usuario, lida=False).count()

print(f"Total de notificações do usuário: {total_notificacoes}")
print(f"Não lidas: {nao_lidas}")

print("Teste concluído")
print("\nAcesse o frontend para visualizar as notificações ou o admin em: http://127.0.0.1:8000/admin/notificacoes/notificacao/")
