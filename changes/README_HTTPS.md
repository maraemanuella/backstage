# 🔐 HTTPS + WebSocket - Início Rápido

## 🚀 Início Rápido (3 Passos)

### 1️⃣ Instalar Dependência
```bash
pip install cryptography
```

### 2️⃣ Gerar Certificados SSL
```bash
python generate_ssl_cert_alt.py
```

### 3️⃣ Iniciar Tudo
```bash
# Windows
start_all_https.bat

# Linux/Mac
# Backend:
daphne -e ssl:8000:privateKey=ssl_certs/key.pem:certKey=ssl_certs/cert.pem settings.asgi:application

# Frontend (em outro terminal):
cd frontend && npm run dev
```

---

## 📱 Usar no Celular

1. **Descubra seu IP local**:
   ```bash
   # Windows
   ipconfig
   
   # Linux/Mac
   ifconfig
   ```
   Procure por: `192.168.X.X`

2. **Conecte o celular na MESMA rede WiFi**

3. **Acesse no celular**:
   ```
   https://192.168.X.X:5173
   ```
   Substitua `192.168.X.X` pelo seu IP

4. **Aceite o certificado auto-assinado**:
   - Android: "Avançado" → "Continuar"
   - iOS: "Avançado" → "Visitar este site"

5. **Permita acesso à câmera**

6. **✅ Pronto! Scanner de QR code funcionando!**

---

## 🔧 Comandos Úteis

### Iniciar Só Backend HTTPS:
```bash
start_https_server.bat
```

### Iniciar Só Frontend HTTPS:
```bash
cd frontend
start_frontend_https.bat
```

### Iniciar Backend + Frontend Juntos:
```bash
start_all_https.bat
```

---

## 🌐 URLs

| Serviço | Local | Rede Local |
|---------|-------|------------|
| Frontend | `https://localhost:5173` | `https://192.168.X.X:5173` |
| Backend | `https://localhost:8000` | `https://192.168.X.X:8000` |
| Admin | `https://localhost:8000/admin/` | `https://192.168.X.X:8000/admin/` |
| WebSocket | `wss://localhost:8000/ws/...` | `wss://192.168.X.X:8000/ws/...` |

---

## ⚠️ Avisos Importantes

### ✅ Normal:
- Navegador mostrará "Conexão não é particular"
- Isso é NORMAL para certificados auto-assinados
- Clique em "Avançado" e prossiga

### ❌ NÃO Usar em Produção:
- Certificados auto-assinados são APENAS para desenvolvimento
- Em produção, use Let's Encrypt ou certificado comercial

---

## 🐛 Problemas Comuns

### Erro: "Não foi possível conectar"
- Verifique se está usando `https://` (não `http://`)
- Confirme que backend e frontend estão rodando
- Teste primeiro no PC, depois no celular

### Erro: "Certificado inválido"
- É esperado! Clique em "Avançado" e aceite
- No celular, aceite manualmente

### Câmera não funciona:
- HTTPS é obrigatório
- Verifique se aceitou o certificado
- Dê permissão para câmera quando solicitado

---

## 📚 Documentação Completa

Para mais detalhes, veja: **GUIA_HTTPS_WEBSOCKET.md**

---

**Pronto para usar! 🚀**

