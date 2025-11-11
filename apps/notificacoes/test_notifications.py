"""
Script de teste para verificar o sistema de notificações
Execute com: Get-Content apps\notificacoes\test_notifications.py | python manage.py shell
"""
import sys
from apps.users.models import CustomUser
from apps.eventos.models import Evento
from apps.inscricoes.models import Inscricao
from apps.notificacoes.models import Notificacao
from apps.favoritos.models import Favorite
from django.utils import timezone
from datetime import timedelta

print("\n" + "="*60)
print("TESTE DO SISTEMA DE NOTIFICACOES")
print("="*60 + "\n")

# Limpar notificações antigas de teste
print("1. Limpando notificacoes de teste antigas...")
Notificacao.objects.filter(mensagem__contains="TESTE").delete()
print("   OK Limpeza concluida\n")

# Buscar ou criar usuários de teste
print("2. Preparando usuarios de teste...")
try:
    organizador = CustomUser.objects.filter(is_staff=True).first()
    if not organizador:
        organizador = CustomUser.objects.first()
    
    usuario_teste = CustomUser.objects.exclude(id=organizador.id).first()
    if not usuario_teste:
        print("   AVISO: Precisa de pelo menos 2 usuarios no sistema")
        print("   Criando usuario de teste...")
        usuario_teste = CustomUser.objects.create_user(
            username='teste_notif',
            email='teste@notif.com',
            password='teste123'
        )
    
    print(f"   OK Organizador: {organizador.username}")
    print(f"   OK Usuario teste: {usuario_teste.username}\n")
except Exception as e:
    print(f"   ERRO ao buscar usuarios: {e}")
    sys.exit(1)

# Teste 1: Notificação de novo evento para seguidores
print("3. Teste: Notificacao de novo evento para seguidores")
try:
    # Criar um evento anterior do organizador para o usuário favoritar
    evento_anterior = Evento.objects.filter(organizador=organizador).first()
    if not evento_anterior:
        evento_anterior = Evento.objects.create(
            titulo="[TESTE] Evento Anterior",
            descricao="Evento anterior para teste",
            organizador=organizador,
            data_evento=timezone.now() - timedelta(days=30),
            hora_inicio="19:00",
            hora_fim="23:00",
            endereco="Rua Teste, 123",
            cidade="Sao Paulo",
            estado="SP",
            categoria="show",
            capacidade_maxima=100,
            valor_deposito=50.00,
            status='publicado'
        )
    
    # Criar favorito se não existir
    Favorite.objects.get_or_create(
        user=usuario_teste,
        evento=evento_anterior
    )
    print(f"   OK {usuario_teste.username} favoritou evento de {organizador.username}")
    
    # Contar notificações antes
    notif_antes = Notificacao.objects.filter(
        usuario=usuario_teste,
        tipo='favorito_novo_evento'
    ).count()
    
    # Criar evento
    evento = Evento.objects.create(
        titulo="[TESTE] Evento de Notificacao",
        descricao="Este e um evento de teste para notificacoes",
        organizador=organizador,
        data_evento=timezone.now() + timedelta(days=7),
        hora_inicio="19:00",
        hora_fim="23:00",
        endereco="Rua Teste, 123",
        cidade="Sao Paulo",
        estado="SP",
        categoria="show",
        capacidade_maxima=100,
        valor_deposito=50.00,
        status='publicado'
    )
    print(f"   OK Evento criado: {evento.titulo}")
    
    # Verificar se notificação foi criada
    notif_depois = Notificacao.objects.filter(
        usuario=usuario_teste,
        tipo='favorito_novo_evento'
    ).count()
    
    if notif_depois > notif_antes:
        notif = Notificacao.objects.filter(
            usuario=usuario_teste,
            tipo='favorito_novo_evento'
        ).latest('created_at')
        print(f"   OK SUCESSO: Notificacao criada!")
        print(f"      Titulo: {notif.titulo}")
        print(f"      Mensagem: {notif.mensagem}\n")
    else:
        print(f"   X FALHA: Notificacao NAO foi criada\n")
    
except Exception as e:
    print(f"   X Erro: {e}\n")
    import traceback
    traceback.print_exc()

# Teste 2: Notificacao de inscricao confirmada
print("4. Teste: Notificacao de inscricao confirmada")
try:
    # Contar notificacoes antes
    notif_antes = Notificacao.objects.filter(
        usuario=usuario_teste,
        tipo='inscricao_confirmada'
    ).count()
    
    # Criar inscricao pendente primeiro
    inscricao = Inscricao.objects.create(
        usuario=usuario_teste,
        evento=evento,
        nome_completo_inscricao=usuario_teste.get_full_name() or usuario_teste.username,
        email_inscricao=usuario_teste.email,
        metodo_pagamento='pix',
        aceita_termos=True,
        valor_final=50.00,
        status='pendente'
    )
    print(f"   OK Inscricao criada com status pendente")
    
    # Confirmar inscricao (isso deve disparar o signal)
    inscricao.status = 'confirmada'
    inscricao.save()
    print(f"   OK Inscricao confirmada")
    
    # Verificar se notificacao foi criada
    notif_depois = Notificacao.objects.filter(
        usuario=usuario_teste,
        tipo='inscricao_confirmada'
    ).count()
    
    if notif_depois > notif_antes:
        notif = Notificacao.objects.filter(
            usuario=usuario_teste,
            tipo='inscricao_confirmada'
        ).latest('created_at')
        print(f"   OK SUCESSO: Notificacao criada!")
        print(f"      Titulo: {notif.titulo}")
        print(f"      Mensagem: {notif.mensagem}\n")
    else:
        print(f"   X FALHA: Notificacao NAO foi criada\n")
    
except Exception as e:
    print(f"   X Erro: {e}\n")
    import traceback
    traceback.print_exc()

# Teste 3: Notificacao de evento cancelado
print("5. Teste: Notificacao de evento cancelado")
try:
    # Contar notificacoes antes
    notif_antes = Notificacao.objects.filter(
        usuario=usuario_teste,
        tipo='evento_cancelado'
    ).count()
    
    # Cancelar o evento
    evento.status = 'cancelado'
    evento.save()
    print(f"   OK Evento cancelado")
    
    # Verificar se notificacao foi criada
    notif_depois = Notificacao.objects.filter(
        usuario=usuario_teste,
        tipo='evento_cancelado'
    ).count()
    
    if notif_depois > notif_antes:
        notif = Notificacao.objects.filter(
            usuario=usuario_teste,
            tipo='evento_cancelado'
        ).latest('created_at')
        print(f"   OK SUCESSO: Notificacao criada!")
        print(f"      Titulo: {notif.titulo}")
        print(f"      Mensagem: {notif.mensagem}\n")
    else:
        print(f"   X FALHA: Notificacao NAO foi criada\n")
    
except Exception as e:
    print(f"   X Erro: {e}\n")
    import traceback
    traceback.print_exc()

# Resumo
print("="*60)
print("RESUMO DOS TESTES")
print("="*60)
total_notif = Notificacao.objects.filter(usuario=usuario_teste).count()
nao_lidas = Notificacao.objects.filter(usuario=usuario_teste, lida=False).count()
print(f"Total de notificacoes para {usuario_teste.username}: {total_notif}")
print(f"Nao lidas: {nao_lidas}")
print("\nPara ver todas as notificacoes:")
print(f"  Notificacao.objects.filter(usuario_id={usuario_teste.id})")
print("\nAcesse: http://127.0.0.1:8000/admin/notificacoes/notificacao/")
print("\n" + "="*60 + "\n")
