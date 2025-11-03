# ✅ VARIÁVEIS DE AMBIENTE UNIFICADAS!

## 🎯 Resumo das Mudanças

Os arquivos `.env` do frontend e backend foram **unificados em um único arquivo** na raiz do projeto!

---

## 📋 O Que Foi Feito

### 1. ✅ Arquivo .env Unificado na Raiz
- **Localização:** `backstage/.env`
- **Conteúdo:** Variáveis do Django + Variáveis do Vite
- **Seções:**
  - Backend (PostgreSQL, Debug, etc)
  - Frontend (API URL, Google Maps Key, etc)

### 2. ✅ Frontend Configurado para Usar .env da Raiz
**Arquivo:** `frontend/vite.config.js`
```javascript
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export default defineConfig({
  envDir: resolve(__dirname, '..'), // 👈 Aponta para a raiz
  // ...
})
```

### 3. ✅ Frontend .env Removido
- `frontend/.env` foi **deletado**
- Agora usa apenas `backstage/.env`

### 4. ✅ Templates Atualizados
- `.env_example` (raiz) → Template completo com todas as variáveis
- `frontend/.env.example` → Redirecionamento informando sobre o .env da raiz

### 5. ✅ Gitignore Atualizado

```gitignore
# Variáveis de ambiente (UNIFICADO na raiz)
../.env

# Linha "frontend/.env" removida
```

---

## 📁 Estrutura Atual

```
backstage/
├── .env                    ✅ ÚNICO arquivo (backend + frontend)
├── .env_example            ✅ Template completo
├── .gitignore              ✅ Ignora .env da raiz
│
├── manage.py
├── settings/
│
└── frontend/
    ├── .env.example       ℹ️  Redirecionamento
    ├── vite.config.js     ✅ envDir configurado
    └── src/
```

---

## 🔐 Variáveis Configuradas

### Backend (Django)
```env
USE_LOCAL_DB=True
DB_NAME=postgres
DB_USER=postgres.xxxxx
DB_HOST=aws-1-sa-east-1.pooler.supabase.com
DB_PORT=6543
DB_PASSWORD=kJFuib2hYWvLkRtQ
DB_SSLMODE=require

LOCAL_DB_NAME=backstage
LOCAL_DB_USER=postgres
LOCAL_DB_PASSWORD=123
LOCAL_DB_HOST=localhost
LOCAL_DB_PORT=5432

ADMIN_DEBUG=False
```

### Frontend (Vite)
```env
VITE_API_URL="/api"
VITE_GOOGLE_MAPS_API_KEY="AIzaSyD83H1nLPu9UbFUcskys5IbjeMNMGwBcnU"
VITE_LOCAL_IP="192.168.100.34"
VITE_FRONTEND_URL="https://192.168.100.34:5173"
```

---

## 🚀 Como Usar

### NÃO mudou nada nos comandos!

```bash
# Backend
cd backstage
python manage.py runserver

# Frontend (em outro terminal)
cd frontend
npm run dev
```

### ⚠️ IMPORTANTE: Reinicie o Frontend!

Para que o Vite leia o novo `.env` da raiz, você **DEVE** reiniciar o servidor:

```bash
cd frontend

# Pare o servidor (Ctrl+C)

# Inicie novamente
npm run dev
```

---

## ✅ Benefícios

| Aspecto | Antes | Depois |
|---------|-------|--------|
| **Arquivos .env** | 2 (raiz + frontend) | 1 (apenas raiz) |
| **Duplicação** | Sim | Não |
| **Manutenção** | Mais difícil | Mais fácil |
| **Consistência** | Pode divergir | Sempre igual |
| **Onboarding** | Confuso | Simples |

---

## 🧪 Testar

### 1. Verifique se o .env existe na raiz
```bash
ls -la .env
# Deve mostrar: backstage/.env
```

### 2. Verifique se o frontend NÃO tem .env
```bash
ls -la frontend/.env
# Deve dar erro: arquivo não encontrado ✅
```

### 3. Reinicie o frontend
```bash
cd frontend
npm run dev
```

### 4. Teste no navegador
Abra o console (F12):
```javascript
console.log(import.meta.env)
// Deve mostrar as variáveis VITE_*
```

---

## 📚 Documentação Criada

1. ✅ **`ENV_UNIFICADO.md`** - Detalhes completos da unificação
2. ✅ **`README_ENV.md`** - Guia de uso de variáveis de ambiente
3. ✅ **Este arquivo** - Resumo das mudanças

---

## 🐛 Troubleshooting

### ❌ Frontend não encontra variáveis VITE_*

**Causa:** Servidor não foi reiniciado

**Solução:**
```bash
cd frontend
# Ctrl+C para parar
npm run dev
```

### ❌ Erro: "envDir is not defined"

**Causa:** vite.config.js não foi atualizado corretamente

**Solução:** O arquivo já foi corrigido. Reinicie o servidor.

---

## ✅ Checklist de Verificação

- [x] `.env` unificado na raiz criado
- [x] Variáveis do backend copiadas
- [x] Variáveis do frontend copiadas
- [x] `frontend/.env` removido
- [x] `vite.config.js` atualizado
- [x] `.env_example` atualizado
- [x] `.gitignore` atualizado
- [x] Documentação criada
- [ ] **Frontend reiniciado** ← VOCÊ DEVE FAZER!

---

## 🎉 Conclusão

**As variáveis de ambiente foram unificadas com sucesso!**

Agora você tem:
- ✅ Um único arquivo `.env` centralizado
- ✅ Configuração mais simples
- ✅ Sem duplicação
- ✅ Mais fácil de manter

---

**Próxima ação necessária:**

```bash
cd frontend
npm run dev
```

**Reinicie o frontend para aplicar as mudanças!** 🚀

