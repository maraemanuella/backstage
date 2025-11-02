#!/usr/bin/env python
"""
Script para alternar entre PostgreSQL local e PostgreSQL na nuvem (Supabase)

Uso:
    python switch_database.py local    # Usar PostgreSQL local
    python switch_database.py cloud    # Usar PostgreSQL na nuvem
    python switch_database.py status   # Ver banco atual
"""

import os
import sys
from pathlib import Path

# Cores ANSI para terminal
class Colors:
    GREEN = '\033[92m'
    YELLOW = '\033[93m'
    RED = '\033[91m'
    BLUE = '\033[94m'
    CYAN = '\033[96m'
    RESET = '\033[0m'
    BOLD = '\033[1m'


def print_colored(message, color=''):
    """Imprime mensagem colorida"""
    print(f"{color}{message}{Colors.RESET}")


def print_header(title):
    """Imprime cabeçalho formatado"""
    print_colored(f"\n{'='*60}", Colors.BLUE)
    print_colored(f"  {title}", Colors.BOLD + Colors.BLUE)
    print_colored(f"{'='*60}\n", Colors.BLUE)


def read_env_file():
    """Lê o arquivo .env"""
    env_path = Path(__file__).parent / '.env'

    if not env_path.exists():
        print_colored("❌ Erro: Arquivo .env não encontrado!", Colors.RED)
        print_colored("   Copie o arquivo .env.example para .env primeiro.", Colors.YELLOW)
        sys.exit(1)

    try:
        with open(env_path, 'r', encoding='utf-8') as f:
            return f.read()
    except Exception as e:
        print_colored(f"❌ Erro ao ler .env: {e}", Colors.RED)
        sys.exit(1)


def write_env_file(content):
    """Escreve no arquivo .env"""
    env_path = Path(__file__).parent / '.env'

    try:
        with open(env_path, 'w', encoding='utf-8') as f:
            f.write(content)
    except Exception as e:
        print_colored(f"❌ Erro ao escrever .env: {e}", Colors.RED)
        sys.exit(1)


def get_current_database():
    """Retorna o banco de dados atual"""
    content = read_env_file()

    for line in content.split('\n'):
        if line.strip().startswith('USE_LOCAL_DB='):
            value = line.split('=')[1].strip().lower()
            return 'local' if value in ('true', '1', 'yes') else 'cloud'

    return 'cloud'  # Padrão


def get_env_value(content, key):
    """Extrai valor de uma variável do .env"""
    for line in content.split('\n'):
        if line.strip().startswith(f'{key}='):
            value = line.split('=', 1)[1].strip()
            if 'PASSWORD' in key and value:
                return '*' * min(len(value), 12)
            return value if value else '(não definido)'
    return '(não encontrado)'


def switch_to_local():
    """Alterna para PostgreSQL local"""
    print_header("Alternando para PostgreSQL Local")

    content = read_env_file()
    lines = content.split('\n')

    new_lines = []
    for line in lines:
        if line.strip().startswith('USE_LOCAL_DB='):
            new_lines.append('USE_LOCAL_DB=True')
            print_colored("  ✓ Variável USE_LOCAL_DB atualizada para True", Colors.GREEN)
        else:
            new_lines.append(line)

    write_env_file('\n'.join(new_lines))

    print_colored("\n✅ Configuração alterada com sucesso!", Colors.GREEN)
    print_colored(f"\n{'─'*60}", Colors.CYAN)
    print_colored("📋 Próximos Passos:", Colors.BOLD + Colors.CYAN)
    print_colored(f"{'─'*60}", Colors.CYAN)

    steps = [
        "1. Certifique-se de que o PostgreSQL está instalado e rodando",
        "2. Crie o banco de dados (se não existir):",
        "   $ createdb -U postgres backstage",
        "3. Execute as migrations:",
        "   $ python manage.py migrate",
        "4. (Opcional) Crie um superusuário:",
        "   $ python manage.py createsuperuser",
        "5. Inicie o servidor:",
        "   $ python manage.py runserver"
    ]

    for step in steps:
        if step.startswith('   $'):
            print_colored(step, Colors.YELLOW)
        else:
            print(f"  {step}")

    print()


def switch_to_cloud():
    """Alterna para PostgreSQL na nuvem"""
    print_header("Alternando para PostgreSQL na Nuvem (Supabase)")

    content = read_env_file()
    lines = content.split('\n')

    new_lines = []
    for line in lines:
        if line.strip().startswith('USE_LOCAL_DB='):
            new_lines.append('USE_LOCAL_DB=False')
            print_colored("  ✓ Variável USE_LOCAL_DB atualizada para False", Colors.GREEN)
        else:
            new_lines.append(line)

    write_env_file('\n'.join(new_lines))

    print_colored("\n✅ Configuração alterada com sucesso!", Colors.GREEN)
    print_colored(f"\n{'─'*60}", Colors.CYAN)
    print_colored("📋 Próximos Passos:", Colors.BOLD + Colors.CYAN)
    print_colored(f"{'─'*60}", Colors.CYAN)

    steps = [
        "1. Verifique se as credenciais do Supabase estão corretas no .env",
        "2. Execute as migrations:",
        "   $ python manage.py migrate",
        "3. Inicie o servidor:",
        "   $ python manage.py runserver"
    ]

    for step in steps:
        if step.startswith('   $'):
            print_colored(step, Colors.YELLOW)
        else:
            print(f"  {step}")

    print()


def show_status():
    """Mostra o banco de dados atual"""
    current = get_current_database()
    content = read_env_file()

    print_header("Status do Banco de Dados")

    if current == 'local':
        print_colored("✓ Usando: PostgreSQL Local", Colors.GREEN + Colors.BOLD)
        print_colored(f"\n{'─'*60}", Colors.CYAN)
        print_colored("📍 Configurações:", Colors.CYAN)
        print_colored(f"{'─'*60}\n", Colors.CYAN)

        config = {
            'Nome do Banco': get_env_value(content, 'LOCAL_DB_NAME'),
            'Usuário': get_env_value(content, 'LOCAL_DB_USER'),
            'Senha': get_env_value(content, 'LOCAL_DB_PASSWORD'),
            'Host': get_env_value(content, 'LOCAL_DB_HOST'),
            'Porta': get_env_value(content, 'LOCAL_DB_PORT'),
        }

        for key, value in config.items():
            print(f"  {key:.<20} {value}")

    else:
        print_colored("✓ Usando: PostgreSQL na Nuvem (Supabase)", Colors.GREEN + Colors.BOLD)
        print_colored(f"\n{'─'*60}", Colors.CYAN)
        print_colored("📍 Configurações:", Colors.CYAN)
        print_colored(f"{'─'*60}\n", Colors.CYAN)

        config = {
            'Nome do Banco': get_env_value(content, 'DB_NAME'),
            'Usuário': get_env_value(content, 'DB_USER'),
            'Host': get_env_value(content, 'DB_HOST'),
            'Porta': get_env_value(content, 'DB_PORT'),
            'Senha': get_env_value(content, 'DB_PASSWORD'),
            'SSL Mode': get_env_value(content, 'DB_SSLMODE'),
        }

        for key, value in config.items():
            print(f"  {key:.<20} {value}")

    print()


def show_help():
    """Mostra ajuda"""
    print_header("Alternador de Banco de Dados - Backstage")

    print_colored("📝 Uso:", Colors.BOLD + Colors.CYAN)
    print()

    commands = [
        ("local", "Usar PostgreSQL local"),
        ("cloud", "Usar PostgreSQL na nuvem (Supabase)"),
        ("status", "Ver configuração atual do banco de dados"),
        ("help", "Mostrar esta ajuda"),
    ]

    for cmd, desc in commands:
        print_colored(f"  python switch_database.py {cmd:<10}", Colors.YELLOW, end='')
        print(f" # {desc}")

    print()
    print_colored("📚 Documentação:", Colors.BOLD + Colors.CYAN)
    print("  - GUIA_BANCO_DE_DADOS.md   (guia completo)")
    print("  - README_BANCO_DADOS.md    (referência rápida)")
    print()


def main():
    """Função principal"""
    if len(sys.argv) < 2:
        show_help()
        sys.exit(0)

    command = sys.argv[1].lower()

    commands = {
        'local': switch_to_local,
        'localhost': switch_to_local,
        'dev': switch_to_local,
        'development': switch_to_local,

        'cloud': switch_to_cloud,
        'supabase': switch_to_cloud,
        'prod': switch_to_cloud,
        'production': switch_to_cloud,
        'remote': switch_to_cloud,

        'status': show_status,
        'info': show_status,

        'help': show_help,
        '-h': show_help,
        '--help': show_help,
    }

    if command in commands:
        commands[command]()
    else:
        print_colored(f"\n❌ Comando desconhecido: '{command}'", Colors.RED)
        show_help()
        sys.exit(1)


if __name__ == '__main__':
    try:
        main()
    except KeyboardInterrupt:
        print_colored("\n\n⚠️  Operação cancelada pelo usuário.", Colors.YELLOW)
        sys.exit(0)
    except Exception as e:
        print_colored(f"\n❌ Erro inesperado: {e}", Colors.RED)
        sys.exit(1)

