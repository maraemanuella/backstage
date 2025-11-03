# 🔐 Guia de Variáveis de Ambiente

Este projeto usa um **arquivo `.env` unificado** na raiz para configurar tanto o backend (Django) quanto o frontend (Vite/React).

---

## 📍 Localização

```
backstage/
├── .env              👈 TODAS as variáveis aqui
├── .env_example      👈 Template para copiar
```

---

## 🚀 Configuração Rápida

### 1. Copie o template
```bash
cp .env_example .env
```

### 2. Edite as variáveis
```bash
nano .env  # ou use seu editor preferido
```

### 3. Configure suas credenciais
Atualize os valores conforme seu ambiente.

---

## 📋 Variáveis Disponíveis

### 🐘 Backend (Django/PostgreSQL)

| Variável | Descrição | Exemplo |
|----------|-----------|---------|
| `USE_LOCAL_DB` | Usar DB local (True) ou nuvem (False) | `True` |
| `DB_NAME` | Nome do banco (nuvem) | `postgres` |
| `DB_USER` | Usuário do banco (nuvem) | `postgres.xxxxx` |
| `DB_HOST` | Host do banco (nuvem) | `aws-1-sa-east-1.pooler.supabase.com` |
| `DB_PORT` | Porta do banco (nuvem) | `6543` |
| `DB_PASSWORD` | Senha do banco (nuvem) | `sua_senha_segura` |
| `DB_SSLMODE` | Modo SSL (nuvem) | `require` |
| `LOCAL_DB_NAME` | Nome do banco local | `backstage` |
| `LOCAL_DB_USER` | Usuário do banco local | `postgres` |
| `LOCAL_DB_PASSWORD` | Senha do banco local | `123` |
| `LOCAL_DB_HOST` | Host do banco local | `localhost` |
| `LOCAL_DB_PORT` | Porta do banco local | `5432` |
| `ADMIN_DEBUG` | Modo debug do Django | `False` |

### ⚛️ Frontend (Vite/React)

| Variável | Descrição | Exemplo |
|----------|-----------|---------|
| `VITE_API_URL` | URL base da API | `/api` |
| `VITE_GOOGLE_MAPS_API_KEY` | Chave do Google Maps | `AIzaSy...` |
| `VITE_LOCAL_IP` | IP local da máquina | `192.168.1.100` |
| `VITE_FRONTEND_URL` | URL completa do frontend | `https://localhost:5173` |

> **Importante:** Variáveis do frontend **DEVEM** começar com `VITE_`

---

## 💻 Como Usar no Código

### Backend (Django)
```python
import os
from decouple import config

# Ler variável
db_name = config('DB_NAME')
use_local = config('USE_LOCAL_DB', default=False, cast=bool)
```

### Frontend (React/Vite)
```javascript
// Ler variável
const apiUrl = import.meta.env.VITE_API_URL
const googleKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY

// Verificar se está definida
if (!import.meta.env.VITE_GOOGLE_MAPS_API_KEY) {
  console.error('Google Maps API Key não configurada!')
}
```

---

## 🔒 Segurança

### ✅ O Que Está Protegido

1. **Arquivo `.env` está no `.gitignore`**
   - Não será versionado no Git
   - Chaves secretas não serão expostas

2. **Template `.env_example` sem valores sensíveis**
   - Pode ser versionado com segurança
   - Serve como documentação

### ⚠️ Atenção

- **NUNCA** commite o arquivo `.env` real
- **NUNCA** exponha suas chaves de API em público
- Use valores diferentes para desenvolvimento e produção

---

## 🌍 Ambientes

### Desenvolvimento Local
```env
USE_LOCAL_DB=True
LOCAL_DB_NAME=backstage
LOCAL_DB_PASSWORD=senha_simples
ADMIN_DEBUG=True
```

### Produção
```env
USE_LOCAL_DB=False
DB_PASSWORD=senha_muito_segura_aqui
ADMIN_DEBUG=False
VITE_API_URL="https://api.seusite.com"
```

---

## 🧪 Testar Configuração

### Verificar Backend
```bash
python manage.py shell
>>> from django.conf import settings
>>> print(settings.DATABASES)
```

### Verificar Frontend
```bash
# No navegador (Console F12):
console.log(import.meta.env)
```

---

## 🐛 Problemas Comuns

### ❌ Variáveis não carregam no frontend

**Causa:** Servidor não foi reiniciado após mudar `.env`

**Solução:**
```bash
# Pare o servidor (Ctrl+C)
npm run dev
```

### ❌ Erro: "VITE_* is undefined"

**Causa:** Variável não começa com `VITE_`

**Solução:** Renomeie a variável:
```env
# ❌ Errado
API_KEY=123

# ✅ Correto
VITE_API_KEY=123
```

### ❌ Backend não encontra variáveis

**Causa:** Arquivo `.env` não está na raiz

**Solução:**
```bash
# Verifique a localização
ls -la .env

# Deve estar em: backstage/.env
# NÃO em: backstage/frontend/.env
```

---

## 📚 Documentação Adicional

- **`ENV_UNIFICADO.md`** - Detalhes da unificação dos arquivos .env
- **Vite Env Variables:** https://vitejs.dev/guide/env-and-mode.html
- **Django Environ:** https://django-environ.readthedocs.io/

---

## ✅ Checklist

Antes de rodar o projeto:

- [ ] Arquivo `.env` existe na raiz
- [ ] Todas as variáveis necessárias estão configuradas
- [ ] Credenciais de banco de dados corretas
- [ ] Google Maps API Key configurada
- [ ] Servidores reiniciados após mudanças

---

**Precisa de ajuda?** Consulte `ENV_UNIFICADO.md` para mais detalhes!

