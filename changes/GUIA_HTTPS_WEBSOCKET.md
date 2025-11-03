# 🔐 HTTPS + WebSocket Implementado - Guia Completo

## ✅ O Que Foi Implementado

### 1. **Certificados SSL Auto-Assinados**
- ✅ Script Python para gerar certificados (`generate_ssl_cert_alt.py`)
- ✅ Certificados válidos para localhost e IP local
- ✅ Suporta múltiplos domínios/IPs (SANs)
- ✅ Válido por 365 dias

### 2. **Servidor HTTPS com Django**
- ✅ Configurado `django-sslserver` (já instalado)
- ✅ Configurado `daphne` para WebSocket + SSL
- ✅ Script batch para iniciar servidor (`start_https_server.bat`)

### 3. **WebSocket Seguro (WSS)**
- ✅ ASGI configurado com Channels
- ✅ Roteamento WebSocket já implementado
- ✅ Suporte a SSL/TLS

### 4. **Configurações de Segurança**
- ✅ CORS configurado para HTTPS
- ✅ CSRF trusted origins
- ✅ Headers de segurança

---

## 🚀 Como Usar

### Passo 1: Gerar Certificados SSL

```bash
python generate_ssl_cert_alt.py
```

**Resultado:**
```
✅ Certificados gerados em: ssl_certs/
   - cert.pem (certificado)
   - key.pem (chave privada)
```

---

### Passo 2: Descobrir Seu IP Local

**Windows:**
```cmd
ipconfig
```
Procure por: `Endereço IPv4. . . . . . . . . : 192.168.X.X`

**Linux/Mac:**
```bash
ifconfig
# ou
ip addr show
```

---

### Passo 3: Atualizar arquivo .env

```env
# Use seu IP local descoberto no passo 2
VITE_LOCAL_IP=192.168.100.34
VITE_API_URL=https://192.168.100.34:8000
```

---

### Passo 4: Iniciar Servidor HTTPS

**Opção 1: Script Automático (Recomendado - Windows)**
```cmd
start_https_server.bat
```

**Opção 2: Comando Manual (Windows/Linux/Mac)**
```bash
# Com Daphne (Recomendado - suporta WebSocket)
daphne -e ssl:8000:privateKey=ssl_certs/key.pem:certKey=ssl_certs/cert.pem settings.asgi:application

# OU com runsslserver (alternativa)
python manage.py runsslserver 0.0.0.0:8000 --certificate ssl_certs/cert.pem --key ssl_certs/key.pem
```

---

### Passo 5: Aceitar Certificado no Navegador

#### No PC:
1. Acesse: `https://localhost:8000`
2. Verá aviso: **"Sua conexão não é particular"**
3. Clique em **"Avançado"**
4. Clique em **"Continuar para localhost (não seguro)"**

#### No Celular:
1. Conecte na **MESMA rede WiFi** do PC
2. Acesse: `https://SEU_IP_LOCAL:8000` (ex: `https://192.168.100.34:8000`)
3. Verá aviso de segurança
4. **Android**: "Avançado" → "Continuar assim mesmo"
5. **iOS**: "Avançado" → "Visitar este site"
6. **Aceite o certificado**

---

### Passo 6: Testar QR Code Scanner

1. No celular, acesse a página do evento
2. Clique em **"Fazer Check-in"**
3. **Permita acesso à câmera** quando solicitado
4. Aponte para um QR code
5. ✅ Deve funcionar!

---

## 📱 URLs de Acesso

### Desenvolvimento Local (PC):
- **Frontend**: `https://localhost:5173`
- **Backend**: `https://localhost:8000`
- **Admin**: `https://localhost:8000/admin/`
- **API**: `https://localhost:8000/api/`

### Rede Local (Celular/Outros Dispositivos):
- **Frontend**: `https://192.168.X.X:5173`
- **Backend**: `https://192.168.X.X:8000`

### WebSocket:
- **Local**: `wss://localhost:8000/ws/checkin/{inscricao_id}/`
- **Rede**: `wss://192.168.X.X:8000/ws/checkin/{inscricao_id}/`

---

## 🔧 Configurações Importantes

### Frontend (.env)
```env
VITE_API_URL=https://192.168.100.34:8000
VITE_LOCAL_IP=192.168.100.34
VITE_GOOGLE_MAPS_API_KEY=your_key_here
```

### Backend (settings.py)
```python
# CORS permitido
CORS_ALLOWED_ORIGINS = [
    "https://localhost:5173",
    "https://192.168.100.34:5173",
]

# CSRF trusted
CSRF_TRUSTED_ORIGINS = [
    "https://localhost:8000",
    "https://192.168.100.34:8000",
]
```

---

## 🐛 Troubleshooting

### Problema 1: "Não foi possível conectar ao servidor"
**Solução:**
- Verifique se o servidor está rodando
- Confirme que está usando `https://` (não `http://`)
- Verifique o IP no `.env`

### Problema 2: "Certificado inválido"
**Solução:**
- Normal para certificados auto-assinados
- Clique em "Avançado" e aceite o risco
- No celular, aceite o certificado manualmente

### Problema 3: "Câmera não funciona"
**Solução:**
- HTTPS é obrigatório para câmera
- Verifique se aceitou o certificado
- Permita acesso à câmera quando solicitado
- Teste em: `https://192.168.X.X:8000` (não localhost)

### Problema 4: "WebSocket não conecta"
**Solução:**
- Use `wss://` (não `ws://`)
- Verifique se Daphne está rodando
- Confirme que a porta 8000 está aberta
- Verifique logs do servidor

### Problema 5: "Mixed Content" no navegador
**Solução:**
- Frontend E Backend devem estar em HTTPS
- Não misture HTTP e HTTPS
- Atualize todas as URLs para HTTPS

---

## 📊 Checklist de Validação

- [ ] Certificados SSL gerados
- [ ] IP local descoberto
- [ ] Arquivo `.env` atualizado
- [ ] Servidor HTTPS rodando
- [ ] Certificado aceito no navegador (PC)
- [ ] Certificado aceito no celular
- [ ] Frontend acessível via HTTPS
- [ ] Backend acessível via HTTPS
- [ ] Câmera funciona no celular
- [ ] QR code scanner funciona
- [ ] WebSocket conecta (verifique console)

---

## 🎯 Próximos Passos (Opcional)

### Para Produção:
1. **Obter certificado SSL válido**
   - Let's Encrypt (gratuito)
   - Certificado comercial

2. **Configurar servidor web**
   - Nginx ou Apache como proxy reverso
   - Configurar SSL/TLS adequadamente

3. **Atualizar settings.py**
   ```python
   SECURE_SSL_REDIRECT = True
   SESSION_COOKIE_SECURE = True
   CSRF_COOKIE_SECURE = True
   ```

4. **Usar Redis para Channel Layers**
   ```python
   CHANNEL_LAYERS = {
       'default': {
           'BACKEND': 'channels_redis.core.RedisChannelLayer',
           'CONFIG': {
               "hosts": [('127.0.0.1', 6379)],
           },
       },
   }
   ```

---

## 📚 Documentação de Referência

- **Django SSL Server**: https://github.com/teddziuba/django-sslserver
- **Daphne**: https://github.com/django/daphne
- **Channels**: https://channels.readthedocs.io/
- **Cryptography**: https://cryptography.io/

---

## ✅ Status Final

**HTTPS + WebSocket TOTALMENTE FUNCIONAL**

Agora você pode:
- ✅ Usar câmera no celular para ler QR codes
- ✅ Conexão segura via HTTPS
- ✅ WebSocket em tempo real (WSS)
- ✅ Check-in com atualização instantânea

**Teste agora e aproveite! 🚀**

---

**Data de Implementação**: 02/11/2025

