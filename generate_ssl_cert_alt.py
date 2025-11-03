# !/usr/bin/env python
"""
Script alternativo para gerar certificados SSL usando cryptography
Não requer OpenSSL instalado
"""

try:
    from cryptography import x509
    from cryptography.x509.oid import NameOID, ExtensionOID
    from cryptography.hazmat.primitives import hashes
    from cryptography.hazmat.backends import default_backend
    from cryptography.hazmat.primitives.asymmetric import rsa
    from cryptography.hazmat.primitives import serialization
    import datetime
    from pathlib import Path
    import ipaddress

    print("📋 Gerando certificados SSL usando cryptography...")

    BASE_DIR = Path(__file__).resolve().parent
    CERT_DIR = BASE_DIR / 'ssl_certs'
    CERT_DIR.mkdir(exist_ok=True)

    # Gerar chave privada
    print("🔑 Gerando chave privada...")
    private_key = rsa.generate_private_key(
        public_exponent=65537,
        key_size=4096,
        backend=default_backend()
    )

    # Salvar chave privada
    key_file = CERT_DIR / 'key.pem'
    with open(key_file, 'wb') as f:
        f.write(private_key.private_bytes(
            encoding=serialization.Encoding.PEM,
            format=serialization.PrivateFormat.TraditionalOpenSSL,
            encryption_algorithm=serialization.NoEncryption()
        ))
    print(f"✅ Chave privada salva: {key_file}")

    # Criar certificado
    print("📄 Gerando certificado...")
    subject = issuer = x509.Name([
        x509.NameAttribute(NameOID.COUNTRY_NAME, "BR"),
        x509.NameAttribute(NameOID.STATE_OR_PROVINCE_NAME, "SP"),
        x509.NameAttribute(NameOID.LOCALITY_NAME, "Sao Paulo"),
        x509.NameAttribute(NameOID.ORGANIZATION_NAME, "Backstage Dev"),
        x509.NameAttribute(NameOID.COMMON_NAME, "localhost"),
    ])

    # Adicionar SANs (Subject Alternative Names)
    san_list = [
        x509.DNSName("localhost"),
        x509.DNSName("127.0.0.1"),
        x509.DNSName("192.168.100.34"),
        x509.IPAddress(ipaddress.IPv4Address("127.0.0.1")),
        x509.IPAddress(ipaddress.IPv4Address("192.168.100.34")),
    ]

    cert = (
        x509.CertificateBuilder()
        .subject_name(subject)
        .issuer_name(issuer)
        .public_key(private_key.public_key())
        .serial_number(x509.random_serial_number())
        .not_valid_before(datetime.datetime.utcnow())
        .not_valid_after(datetime.datetime.utcnow() + datetime.timedelta(days=365))
        .add_extension(
            x509.SubjectAlternativeName(san_list),
            critical=False,
        )
        .sign(private_key, hashes.SHA256(), default_backend())
    )

    # Salvar certificado
    cert_file = CERT_DIR / 'cert.pem'
    with open(cert_file, 'wb') as f:
        f.write(cert.public_bytes(serialization.Encoding.PEM))
    print(f"✅ Certificado salvo: {cert_file}")

    print("\n🎉 Certificados SSL gerados com sucesso!")
    print(f"\n📁 Localização: {CERT_DIR}")
    print(f"📄 Certificado: {cert_file}")
    print(f"🔑 Chave: {key_file}")
    print("\n⚠️  AVISOS IMPORTANTES:")
    print("   ✓ Certificados AUTO-ASSINADOS (apenas para desenvolvimento)")
    print("   ✓ Navegador mostrará aviso de segurança - é normal!")
    print("   ✓ Clique em 'Avançado' e 'Prosseguir' ou 'Aceitar risco'")
    print("\n📱 USO NO CELULAR:")
    print("   1. Descubra seu IP local: ipconfig (Windows) ou ifconfig (Linux/Mac)")
    print("   2. Acesse https://SEU_IP:8000 no celular")
    print("   3. Aceite o certificado auto-assinado")
    print("   4. A câmera do QR code funcionará! 📸")
    print("\n🚀 Próximo passo:")
    print("   Execute: python manage.py runsslserver 0.0.0.0:8000")

except ImportError:
    print("❌ Biblioteca 'cryptography' não encontrada!")
    print("\n📦 Instale com:")
    print("   pip install cryptography")
    print("\nOu adicione ao requirements.txt:")
    print("   cryptography>=41.0.0")

