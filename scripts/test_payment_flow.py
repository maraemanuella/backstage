"""
Script de Teste - Sistema de Pagamento com Expiração
Execute: python scripts/test_payment_flow.py
"""

from django.utils import timezone
from datetime import timedelta
from apps.inscricoes.models import Inscricao
from apps.eventos.models import Evento
from apps.users.models import CustomUser

def test_expiracao():
    """Testa se o método de expiração está funcionando"""
    print("\n=== TESTE DE EXPIRAÇÃO ===\n")

    # Criar uma inscrição de teste (sem salvar no banco)
    inscricao = Inscricao()
    inscricao.status_pagamento = 'pendente'

    # Teste 1: Sem data de expiração
    inscricao.expira_em = None
    print(f"1. Inscrição sem expira_em: {inscricao.esta_expirada()}")
    assert inscricao.esta_expirada() == False, "Erro: deveria retornar False"

    # Teste 2: Expira no futuro
    inscricao.expira_em = timezone.now() + timedelta(minutes=5)
    print(f"2. Inscrição expira em 5 min: {inscricao.esta_expirada()}")
    assert inscricao.esta_expirada() == False, "Erro: deveria retornar False"

    # Teste 3: Já expirou
    inscricao.expira_em = timezone.now() - timedelta(minutes=5)
    print(f"3. Inscrição expirou há 5 min: {inscricao.esta_expirada()}")
    assert inscricao.esta_expirada() == True, "Erro: deveria retornar True"

    # Teste 4: Status não é pendente
    inscricao.status_pagamento = 'aprovado'
    inscricao.expira_em = timezone.now() - timedelta(minutes=5)
    print(f"4. Inscrição aprovada (mesmo expirada): {inscricao.esta_expirada()}")
    assert inscricao.esta_expirada() == False, "Erro: deveria retornar False"

    print("\n✅ Todos os testes de expiração passaram!\n")

def verificar_eventos_sem_qrcode():
    """Verifica quantos eventos não têm QR Code PIX"""
    print("\n=== VERIFICAÇÃO DE QR CODES PIX ===\n")

    total_eventos = Evento.objects.count()
    eventos_com_qrcode = Evento.objects.exclude(qr_code_pix='').exclude(qr_code_pix__isnull=True).count()
    eventos_sem_qrcode = total_eventos - eventos_com_qrcode

    print(f"Total de eventos: {total_eventos}")
    print(f"Eventos com QR Code PIX: {eventos_com_qrcode}")
    print(f"Eventos sem QR Code PIX: {eventos_sem_qrcode}")

    if eventos_sem_qrcode > 0:
        print(f"\n⚠️  {eventos_sem_qrcode} eventos não aceitam pagamento via PIX")
        print("   Usuários serão direcionados automaticamente para cartão\n")
    else:
        print("\n✅ Todos os eventos têm QR Code PIX configurado\n")

def verificar_inscricoes_pendentes():
    """Verifica inscrições pendentes e seus status de expiração"""
    print("\n=== INSCRIÇÕES PENDENTES ===\n")

    inscricoes_pendentes = Inscricao.objects.filter(status_pagamento='pendente')
    total_pendentes = inscricoes_pendentes.count()

    print(f"Total de inscrições pendentes: {total_pendentes}")

    if total_pendentes > 0:
        print("\nDetalhes:")
        for inscricao in inscricoes_pendentes[:10]:  # Mostrar apenas 10
            tempo_restante = "Não definido"
            if inscricao.expira_em:
                delta = inscricao.expira_em - timezone.now()
                minutos = int(delta.total_seconds() / 60)
                if minutos > 0:
                    tempo_restante = f"{minutos} minutos"
                else:
                    tempo_restante = "EXPIRADA"

            print(f"  - ID: {str(inscricao.id)[:8]}... | Evento: {inscricao.evento.titulo[:30]} | Tempo: {tempo_restante}")

        if total_pendentes > 10:
            print(f"  ... e mais {total_pendentes - 10} inscrições")

    print()

def main():
    print("\n" + "="*50)
    print("TESTE DO SISTEMA DE PAGAMENTO")
    print("="*50)

    try:
        test_expiracao()
        verificar_eventos_sem_qrcode()
        verificar_inscricoes_pendentes()

        print("="*50)
        print("✅ TESTES CONCLUÍDOS COM SUCESSO!")
        print("="*50 + "\n")

    except Exception as e:
        print(f"\n❌ ERRO: {str(e)}\n")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    # Configurar Django
    import os
    import django
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
    django.setup()

    main()

