# Script para gerar certificados SSL auto-assinados
# Execute: python generate_ssl_cert.py

import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
CERT_DIR = BASE_DIR / 'ssl_certs'

# Criar diretório para certificados
CERT_DIR.mkdir(exist_ok=True)

print("📋 Gerando certificados SSL auto-assinados...")
print(f"📁 Diretório: {CERT_DIR}")

# Comando OpenSSL para gerar certificado
cert_file = CERT_DIR / 'cert.pem'
key_file = CERT_DIR / 'key.pem'

# Gerar certificado auto-assinado válido por 365 dias
cmd = f'''openssl req -x509 -newkey rsa:4096 -nodes -out "{cert_file}" -keyout "{key_file}" -days 365 -subj "/C=BR/ST=SP/L=SaoPaulo/O=Backstage/OU=Dev/CN=localhost" -addext "subjectAltName=DNS:localhost,DNS:127.0.0.1,DNS:192.168.100.34,IP:127.0.0.1,IP:192.168.100.34"'''

print("\n🔐 Executando comando OpenSSL...")
print(cmd)
print()

result = os.system(cmd)

if result == 0:
    print("✅ Certificados gerados com sucesso!")
    print(f"📄 Certificado: {cert_file}")
    print(f"🔑 Chave privada: {key_file}")
    print()
    print("⚠️  IMPORTANTE:")
    print("   - Estes são certificados AUTO-ASSINADOS para desenvolvimento")
    print("   - O navegador mostrará um aviso de segurança")
    print("   - Você precisa aceitar o certificado manualmente")
    print("   - NO CELULAR: Aceite o certificado quando aparecer o aviso")
    print()
    print("📱 Para usar no celular:")
    print("   1. Acesse https://SEU_IP_LOCAL:8000")
    print("   2. Aceite o aviso de certificado auto-assinado")
    print("   3. A câmera do QR code funcionará!")
else:
    print("❌ Erro ao gerar certificados!")
    print("   Certifique-se de ter o OpenSSL instalado:")
    print("   - Windows: https://slproweb.com/products/Win32OpenSSL.html")
    print("   - Linux/Mac: Já vem instalado")

