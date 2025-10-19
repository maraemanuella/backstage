import ssl
import os
from pathlib import Path

# Criar diretório para certificados
cert_dir = Path(__file__).parent / 'certs'
cert_dir.mkdir(exist_ok=True)

cert_file = cert_dir / 'localhost.crt'
key_file = cert_dir / 'localhost.key'

# Gerar certificado autoassinado usando openssl via comando do sistema
import subprocess

print("Gerando certificados SSL autoassinados...")

# Comando para gerar certificado
cmd = [
    'openssl', 'req', '-x509', '-newkey', 'rsa:4096',
    '-keyout', str(key_file),
    '-out', str(cert_file),
    '-days', '365', '-nodes',
    '-subj', '/CN=192.168.100.34'
]

try:
    subprocess.run(cmd, check=True)
    print(f"✅ Certificados criados com sucesso!")
    print(f"Certificado: {cert_file}")
    print(f"Chave: {key_file}")
except FileNotFoundError:
    print("❌ OpenSSL não está instalado.")
    print("\nSOLUÇÃO ALTERNATIVA:")
    print("Use o comando abaixo no PowerShell:")
    print(f'\nopenssl req -x509 -newkey rsa:4096 -keyout {key_file} -out {cert_file} -days 365 -nodes -subj "/CN=192.168.100.34"')
except Exception as e:
    print(f"Erro: {e}")

