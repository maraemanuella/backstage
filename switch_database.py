#!/usr/bin/env python
"""
Script para alternar entre banco de dados LOCAL e NA NUVEM
Uso: python switch_database.py [local|nuvem]
"""

import os
import sys
from pathlib import Path

def ler_env():
    """Lê o arquivo .env e retorna as linhas"""
    env_file = Path('.env')
    if not env_file.exists():
        print("❌ Erro: Arquivo .env não encontrado!")
        return None

    with open(env_file, 'r', encoding='utf-8') as f:
        return f.readlines()

def escrever_env(linhas):
    """Escreve as linhas no arquivo .env"""
    with open('.env', 'w', encoding='utf-8') as f:
        f.writelines(linhas)

def status_atual():
    """Verifica o status atual do banco"""
    linhas = ler_env()
    if linhas is None:
        return None

    for linha in linhas:
        if 'USE_LOCAL_DB=' in linha:
            if 'True' in linha:
                return 'local'
            else:
                return 'nuvem'
    return None

def alternar_para_local():
    """Alterna para banco de dados LOCAL"""
    linhas = ler_env()
    if linhas is None:
        return False

    novas_linhas = []
    for linha in linhas:
        if 'USE_LOCAL_DB=' in linha:
            novas_linhas.append('USE_LOCAL_DB=True\n')
        else:
            novas_linhas.append(linha)

    escrever_env(novas_linhas)

    print("✅ Alterado para PostgreSQL LOCAL")
    print()
    print("📋 Configuração:")
    print("   Host: localhost")
    print("   Porta: 5432")
    print("   Database: backstage")
    print()
    print("⚠️  Certifique-se de que o PostgreSQL local está rodando!")
    return True

def alternar_para_nuvem():
    """Alterna para banco de dados NA NUVEM (Supabase)"""
    linhas = ler_env()
    if linhas is None:
        return False

    novas_linhas = []
    for linha in linhas:
        if 'USE_LOCAL_DB=' in linha:
            novas_linhas.append('USE_LOCAL_DB=False\n')
        else:
            novas_linhas.append(linha)

    escrever_env(novas_linhas)

    print("✅ Alterado para PostgreSQL NA NUVEM (Supabase)")
    print()
    print("📋 Configuração:")
    print("   Host: Supabase (AWS)")
    print("   Porta: 6543")
    print("   Database: postgres")
    print("   SSL: Habilitado")
    return True

def menu_interativo():
    """Menu interativo para escolher o banco"""
    print("=" * 50)
    print("  BACKSTAGE - Alternar Banco de Dados")
    print("=" * 50)
    print()

    atual = status_atual()
    if atual == 'local':
        print("📊 Status Atual: PostgreSQL LOCAL")
    elif atual == 'nuvem':
        print("📊 Status Atual: PostgreSQL NA NUVEM (Supabase)")
    else:
        print("⚠️  Status não identificado")

    print()
    print("=" * 50)
    print("  Escolha o Banco de Dados:")
    print("=" * 50)
    print()
    print("  1. PostgreSQL LOCAL (localhost:5432)")
    print("  2. PostgreSQL NA NUVEM (Supabase)")
    print("  3. Cancelar")
    print()
    print("=" * 50)
    print()

    try:
        opcao = input("Digite sua opção (1-3): ").strip()
    except KeyboardInterrupt:
        print("\n\n❌ Operação cancelada pelo usuário")
        return False

    print()

    if opcao == '1':
        return alternar_para_local()
    elif opcao == '2':
        return alternar_para_nuvem()
    elif opcao == '3':
        print("ℹ️  Operação cancelada")
        return False
    else:
        print("❌ Opção inválida!")
        return False

def main():
    """Função principal"""
    print()

    # Se passou argumento, usa ele
    if len(sys.argv) > 1:
        tipo = sys.argv[1].lower()

        if tipo in ['local', 'l', '1']:
            sucesso = alternar_para_local()
        elif tipo in ['nuvem', 'cloud', 'n', 'c', '2']:
            sucesso = alternar_para_nuvem()
        elif tipo in ['status', 's']:
            atual = status_atual()
            if atual == 'local':
                print("📊 Banco Atual: PostgreSQL LOCAL")
            elif atual == 'nuvem':
                print("📊 Banco Atual: PostgreSQL NA NUVEM (Supabase)")
            return
        else:
            print(f"❌ Tipo inválido: {tipo}")
            print()
            print("Uso: python switch_database.py [local|nuvem|status]")
            return
    else:
        # Menu interativo
        sucesso = menu_interativo()

    if sucesso:
        print()
        print("=" * 50)
        print("  IMPORTANTE:")
        print("=" * 50)
        print()
        print("  ⚠️  Reinicie o servidor Django para aplicar as mudanças")
        print("  ⚠️  Verifique se as migrações estão aplicadas")
        print()
        print("  Comandos úteis:")
        print("    python manage.py showmigrations   # Ver status")
        print("    python manage.py migrate          # Aplicar migrações")
        print()
        print("=" * 50)

    print()

if __name__ == '__main__':
    main()

