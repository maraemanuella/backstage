# 🔄 Variáveis de Ambiente Unificadas!

## ✅ O Que Mudou

### Antes ❌
```
backstage/
├── .env                    # Variáveis do Django
└── frontend/
    └── .env               # Variáveis do Vite (DUPLICADO)
```

### Depois ✅
```
backstage/
├── .env                    # TODAS as variáveis (Django + Vite)
└── frontend/
    └── .env.example       # Apenas redirecionamento
```

---

## 📋 Estrutura do .env Unificado

**Arquivo:** `backstage/.env`

```env
# ========================================
# BACKEND (Django)
# ========================================
USE_LOCAL_DB=True
DB_NAME=postgres
DB_USER=postgres.xxxxx
DB_HOST=aws-1-sa-east-1.pooler.supabase.com
DB_PORT=6543
DB_PASSWORD=sua_senha
DB_SSLMODE=require

LOCAL_DB_NAME=backstage
LOCAL_DB_USER=postgres
LOCAL_DB_PASSWORD=123
LOCAL_DB_HOST=localhost
LOCAL_DB_PORT=5432

ADMIN_DEBUG=False

# ========================================
# FRONTEND (Vite/React)
# ========================================
VITE_API_URL="/api"
VITE_GOOGLE_MAPS_API_KEY="AIzaSy..."
VITE_LOCAL_IP="192.168.100.34"
VITE_FRONTEND_URL="https://192.168.100.34:5173"
```

---

## 🔧 Configurações Aplicadas

### 1. **Vite Configurado para Usar .env da Raiz** ✅

**Arquivo:** `frontend/vite.config.js`

```javascript
import path from 'path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  envDir: path.resolve(__dirname, '..'), // 👈 Aponta para a raiz
  // ...
})
```

### 2. **Frontend .env Removido** ✅
- `frontend/.env` foi deletado
- Agora usa apenas `backstage/.env`

### 3. **Gitignore Atualizado** ✅

```gitignore
# Variáveis de ambiente (UNIFICADO na raiz)
../.env
```

Removido: `frontend/.env`

### 4. **Templates Atualizados** ✅
- `.env_example` na raiz → Todas as variáveis
- `frontend/.env.example` → Redirecionamento

---

## 🚀 Como Usar

### Para Desenvolvimento Local

**Não há mudança nos comandos!** Tudo funciona igual:

```bash
# Backend
cd backstage
python manage.py runserver

# Frontend
cd frontend
npm run dev
```

### Para Novos Desenvolvedores

```bash
# 1. Clone o repositório
git clone <url>
cd backstage

# 2. Copie o template
cp .env_example .env

# 3. Configure suas variáveis
nano .env

# 4. Configure backend
pip install -r requirements.txt
python manage.py migrate

# 5. Configure frontend
cd frontend
npm install
npm run dev
```

---

## ✅ Benefícios

### 1. **Centralização**
- ✅ Um único arquivo para todas as variáveis
- ✅ Mais fácil de gerenciar
- ✅ Sem duplicação

### 2. **Consistência**
- ✅ Mesmas variáveis em todo o projeto
- ✅ Sem conflitos entre backend/frontend
- ✅ Configuração única

### 3. **Simplicidade**
- ✅ Menos arquivos para editar
- ✅ Mais fácil para onboarding
- ✅ Menos chance de erro

### 4. **Manutenção**
- ✅ Atualizar em um só lugar
- ✅ Versionamento mais limpo
- ✅ Backup mais simples

---

## 📂 Estrutura de Arquivos

```
backstage/
├── .env                          ✅ ÚNICO arquivo de variáveis
├── .env_example                  ✅ Template completo
├── .gitignore                    ✅ Ignora apenas .env da raiz
│
├── manage.py
├── settings/
│
└── frontend/
    ├── .env.example             ℹ️  Redirecionamento
    ├── vite.config.js           ✅ envDir configurado
    └── src/
```

---

## 🔍 Como Funciona Tecnicamente

### Backend (Django)
Django automaticamente lê `.env` da raiz usando `python-decouple` ou `django-environ`.

### Frontend (Vite)
O Vite foi configurado para buscar variáveis no diretório pai:

```javascript
envDir: path.resolve(__dirname, '..')
```

Isso faz o Vite procurar por `.env` em `backstage/` ao invés de `backstage/frontend/`.

---

## ⚙️ Variáveis do Frontend (Vite)

**Importante:** Todas as variáveis do Vite devem começar com `VITE_`

### Variáveis Disponíveis:
- `VITE_API_URL` → URL base da API
- `VITE_GOOGLE_MAPS_API_KEY` → Chave do Google Maps
- `VITE_LOCAL_IP` → IP local para desenvolvimento
- `VITE_FRONTEND_URL` → URL completa do frontend

### Como Usar no Código:
```javascript
// Em qualquer arquivo .jsx ou .js
const apiUrl = import.meta.env.VITE_API_URL
const googleKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
```

---

## 🧪 Testar a Configuração

```bash
# 1. Certifique-se que o .env existe na raiz
ls -la .env

# 2. Verifique se o frontend NÃO tem .env
ls -la frontend/.env  # Deve dar erro "não encontrado"

# 3. Inicie os servidores
python manage.py runserver  # Backend
cd frontend && npm run dev  # Frontend

# 4. Verifique no console do navegador
# Abra: http://localhost:5173
# Console → Digite: import.meta.env
# Deve mostrar as variáveis VITE_*
```

---

## 🐛 Troubleshooting

### ❌ Frontend não encontra variáveis

**Sintoma:** `import.meta.env.VITE_API_URL` retorna `undefined`

**Solução:**
1. Certifique-se que `.env` está na raiz
2. Reinicie o servidor Vite (`Ctrl+C` e `npm run dev`)
3. Verifique se as variáveis começam com `VITE_`

### ❌ Erro: "Cannot find module 'path'"

**Sintoma:** Erro no `vite.config.js`

**Solução:**
```bash
cd frontend
npm install
```

O módulo `path` já vem com Node.js, mas se der erro, reinstale as dependências.

---

## 📝 Checklist de Migração

- [x] `.env` unificado na raiz criado
- [x] Variáveis do backend migradas
- [x] Variáveis do frontend migradas
- [x] `frontend/.env` removido
- [x] `vite.config.js` atualizado com `envDir`
- [x] `.env_example` atualizado
- [x] `frontend/.env.example` atualizado
- [x] `.gitignore` atualizado
- [x] Documentação criada

---

## 🎉 Conclusão

**As variáveis de ambiente foram unificadas com sucesso!**

Agora você tem:
- ✅ Um único arquivo `.env` na raiz
- ✅ Backend e frontend usando as mesmas variáveis
- ✅ Configuração mais simples e centralizada
- ✅ Menos chance de erros

**Próximo passo:** Reinicie os servidores para aplicar as mudanças!

```bash
# Reiniciar frontend (importante!)
cd frontend
npm run dev
```

