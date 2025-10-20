from cryptography import x509
from cryptography.x509.oid import NameOID
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.backends import default_backend
from cryptography.hazmat.primitives.asymmetric import rsa
from cryptography.hazmat.primitives import serialization
import datetime
import ipaddress
from pathlib import Path

# Criar diretório para certificados
cert_dir = Path(__file__).parent / 'certs'
cert_dir.mkdir(exist_ok=True)

cert_file = cert_dir / 'localhost.crt'
key_file = cert_dir / 'localhost.key'

print("Gerando certificados SSL autoassinados...")

# Gerar chave privada
private_key = rsa.generate_private_key(
    public_exponent=65537,
    key_size=2048,
    backend=default_backend()
)

# Salvar chave privada
with open(key_file, 'wb') as f:
    f.write(private_key.private_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PrivateFormat.TraditionalOpenSSL,
        encryption_algorithm=serialization.NoEncryption()
    ))

# Criar certificado
subject = issuer = x509.Name([
    x509.NameAttribute(NameOID.COMMON_NAME, u"192.168.100.34"),
])

cert = x509.CertificateBuilder().subject_name(
    subject
).issuer_name(
    issuer
).public_key(
    private_key.public_key()
).serial_number(
    x509.random_serial_number()
).not_valid_before(
    datetime.datetime.utcnow()
).not_valid_after(
    datetime.datetime.utcnow() + datetime.timedelta(days=365)
).add_extension(
    x509.SubjectAlternativeName([
        x509.DNSName(u"192.168.100.34"),
        x509.DNSName(u"localhost"),
        x509.IPAddress(ipaddress.IPv4Address(u"192.168.100.34")),
    ]),
    critical=False,
).sign(private_key, hashes.SHA256(), default_backend())

# Salvar certificado
with open(cert_file, 'wb') as f:
    f.write(cert.public_bytes(serialization.Encoding.PEM))

print(f"✅ Certificados criados com sucesso!")
print(f"Certificado: {cert_file}")
print(f"Chave: {key_file}")
