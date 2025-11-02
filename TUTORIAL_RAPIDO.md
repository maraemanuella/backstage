# 🚀 Como Rodar o Projeto - Tutorial Rápido

**Versão:** 1.0 | **Atualizado:** 02/11/2025

---

## ⚡ Início Rápido (3 Passos)

### 1️⃣ Instalar e Configurar

```bash
# 1. Ativar ambiente virtual
venv\Scripts\activate

# 2. Instalar dependências Python
pip install -r requirements.txt

# 3. Configurar banco de dados PostgreSQL
# Crie o banco: CREATE DATABASE backstage;

# 4. Copiar e editar .env
cp .env.example .env
# Edite o .env com suas configurações

# 5. Aplicar migrações
python manage.py migrate

# 6. Criar admin
python manage.py createsuperuser

# 7. Instalar dependências do frontend
cd frontend
npm install
cd ..
```

### 2️⃣ Rodar o Projeto

**Abra 2 terminais:**

**Terminal 1 - Backend:**
```bash
venv\Scripts\activate
python manage.py runserver
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### 3️⃣ Acessar

- **Frontend:** http://localhost:5173
- **Admin:** http://localhost:8000/admin
- **API:** http://localhost:8000/api

---

## 📦 Pré-requisitos

Instale antes de começar:

- ✅ **Python 3.10+** → https://www.python.org/downloads/
- ✅ **PostgreSQL 14+** → https://www.postgresql.org/download/
- ✅ **Node.js 18+** → https://nodejs.org/

---

## 🔧 Configuração Detalhada

### Passo 1: Ambiente Virtual Python

```bash
# Criar ambiente virtual
python -m venv venv

# Ativar
# Windows:
venv\Scripts\activate

# Linux/Mac:
source venv/bin/activate
```

### Passo 2: PostgreSQL

**Criar banco de dados:**

```bash
# Abrir PostgreSQL
psql -U postgres

# Dentro do psql:
CREATE DATABASE backstage;
CREATE USER postgres WITH PASSWORD '123';
GRANT ALL PRIVILEGES ON DATABASE backstage TO postgres;
\q
```

### Passo 3: Variáveis de Ambiente

Edite o arquivo `.env` na raiz do projeto:

```env
# PostgreSQL Local
USE_LOCAL_DB=True
LOCAL_DB_NAME=backstage
LOCAL_DB_USER=postgres
LOCAL_DB_PASSWORD=123
LOCAL_DB_HOST=localhost
LOCAL_DB_PORT=5432
```

### Passo 4: Migrações e Admin

```bash
# Aplicar migrações
python manage.py migrate

# Criar superusuário
python manage.py createsuperuser
# Username: admin
# Email: admin@backstage.com
# Password: (escolha uma senha)
```

### Passo 5: Frontend

```bash
cd frontend
npm install
cd ..
```

---

## ▶️ Comandos para Rodar

### Desenvolvimento Normal

```bash
# Terminal 1 - Backend
venv\Scripts\activate
python manage.py runserver

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### Com WebSocket (Opcional)

Se precisar de WebSocket (check-in em tempo real):

```bash
# Terminal 1 - Redis
redis-server

# Terminal 2 - Backend com Daphne
venv\Scripts\activate
daphne -b 0.0.0.0 -p 8000 config.asgi:application

# Terminal 3 - Frontend
cd frontend
npm run dev
```

---

## 🌐 URLs

| Serviço | URL | Descrição |
|---------|-----|-----------|
| **Frontend** | http://localhost:5173 | Aplicação React |
| **Admin** | http://localhost:8000/admin | Painel Admin Django |
| **API** | http://localhost:8000/api | API REST |
| **Token** | http://localhost:8000/api/token | Obter JWT |

---

## 🐛 Problemas Comuns

### ❌ "No module named 'api'"

**Solução:** Ative o ambiente virtual
```bash
venv\Scripts\activate
```

### ❌ "database does not exist"

**Solução:** Crie o banco
```bash
psql -U postgres
CREATE DATABASE backstage;
\q
```

### ❌ "Port 8000 is already in use"

**Solução:** Mate o processo
```bash
# Windows
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:8000 | xargs kill -9
```

### ❌ "Pedido foi limitado. Disponível em X segundos"

**Causa:** Rate limiting (proteção contra força bruta)

**Solução:** Aguarde o tempo indicado OU desabilite temporariamente em `config/settings.py`:

```python
REST_FRAMEWORK = {
    # Comente estas linhas:
    # 'DEFAULT_THROTTLE_CLASSES': [...],
    # 'DEFAULT_THROTTLE_RATES': {...}
}
```

**⚠️ IMPORTANTE:** Nunca desabilite rate limiting em produção!

### ❌ Frontend não conecta

**Verifique:**
1. Backend rodando? → http://localhost:8000/api
2. CORS configurado? → Já está em `settings.py`
3. URL correta? → Veja `frontend/src/constants.js`

---

## 🔧 Comandos Úteis

### Backend (Django)

```bash
# Ver migrações
python manage.py showmigrations

# Criar migrações
python manage.py makemigrations

# Aplicar migrações
python manage.py migrate

# Verificar sistema
python manage.py check

# Criar admin
python manage.py createsuperuser

# Resetar banco (⚠️ APAGA TUDO!)
python manage.py flush
```

### Frontend (React)

```bash
cd frontend

# Rodar dev
npm run dev

# Build para produção
npm run build

# Preview da build
npm run preview

# Testes
npm test
```

---

## 📁 Estrutura Simplificada

```
backstage/
├── api/                    # Backend modular
│   ├── auth/              # Autenticação
│   ├── users/             # Usuários
│   ├── events/            # Eventos
│   ├── models.py          # Modelos do banco
│   └── ...
├── config/                # Configurações Django
│   ├── settings.py
│   └── urls.py
├── frontend/              # React + Vite
│   ├── src/
│   └── package.json
├── media/                 # Arquivos de mídia
├── venv/                  # Ambiente virtual
├── .env                   # Variáveis de ambiente
├── manage.py
└── requirements.txt
```

---

## ✅ Checklist Rápido

Antes de rodar:

- [ ] Python 3.10+ instalado
- [ ] PostgreSQL instalado e rodando
- [ ] Node.js 18+ instalado
- [ ] Ambiente virtual criado (`python -m venv venv`)
- [ ] Ambiente virtual ativado (`venv\Scripts\activate`)
- [ ] Dependências instaladas (`pip install -r requirements.txt`)
- [ ] Banco criado (`CREATE DATABASE backstage;`)
- [ ] Arquivo `.env` configurado
- [ ] Migrações aplicadas (`python manage.py migrate`)
- [ ] Admin criado (`python manage.py createsuperuser`)
- [ ] Frontend instalado (`cd frontend && npm install`)

Para rodar:

- [ ] Terminal 1: Backend rodando (`python manage.py runserver`)
- [ ] Terminal 2: Frontend rodando (`cd frontend && npm run dev`)
- [ ] Acesso ao frontend (http://localhost:5173)
- [ ] Acesso ao admin (http://localhost:8000/admin)

---

## 🎯 Primeiro Acesso

1. **Acesse:** http://localhost:5173
2. **Registre** um novo usuário OU
3. **Faça login** com o admin criado
4. **Explore** a aplicação!

---

## 📱 Acessar do Celular

### Início Rápido

1. **Descubra seu IP:**
   ```bash
   ipconfig
   ```
   Procure por "Endereço IPv4" (Ex: `192.168.1.100`)

2. **Rode o backend:**
   ```bash
   python manage.py runserver 0.0.0.0:8000
   ```

3. **Rode o frontend:**
   ```bash
   cd frontend
   npm run dev -- --host
   ```

4. **Acesse do celular:**
   ```
   http://SEU_IP:5173
   ```
   (Ex: `http://192.168.1.100:5173`)

**⚠️ Importante:**
- Computador e celular devem estar na **mesma rede Wi-Fi**
- Libere as portas 8000 e 5173 no firewall do Windows

📖 **[Guia Completo para Celular](ACESSAR_CELULAR.md)**

---

## 🆘 Ajuda Adicional

- **Documentação Completa:** `COMO_RODAR.md`
- **Acesso pelo Celular:** `ACESSAR_CELULAR.md`
- **Arquitetura:** `MODULAR_ARCHITECTURE_FINAL.md`
- **Estrutura Visual:** `ESTRUTURA_VISUAL.md`
- **Testes:** `TESTES_MODULAR.md`

---

## 💡 Dicas

1. **Sempre ative o ambiente virtual** antes de rodar comandos Python
2. **Verifique se PostgreSQL está rodando** antes de iniciar o backend
3. **Aguarde o backend iniciar** antes de acessar o frontend
4. **Use Ctrl+C** para parar os servidores
5. **Consulte os logs** nos terminais se algo der errado

---

## 🎉 Pronto!

Seu projeto está rodando!

**Stack:**
- Backend: Django + DRF + PostgreSQL
- Frontend: React + Vite + Tailwind CSS
- Arquitetura: Modular + Clean Architecture

**Bom desenvolvimento! 🚀**

---

**Última atualização:** 02/11/2025  
**Versão:** 1.0 - Tutorial Rápido  
**Status:** ✅ Funcional

