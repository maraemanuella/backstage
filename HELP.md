# 📚 HELP - Guia Completo do Projeto Backstage

## 📋 Índice
1. [Instalação Inicial](#instalação-inicial)
2. [Configuração de IP](#configuração-de-ip)
3. [Como Iniciar os Servidores](#como-iniciar-os-servidores)
4. [Solução de Problemas](#solução-de-problemas)
5. [Comandos Úteis](#comandos-úteis)

---

## 🚀 Instalação Inicial

### 1️⃣ Instalar Dependências do Python (Backend)

```bash
# Navegar para a pasta do backend
cd E:\repositorios\backstage\backstage

# Instalar as dependências do Python
pip install -r ../requirements.txt

# Coletar arquivos estáticos do Django Admin
python manage.py collectstatic --noinput

# Aplicar migrações do banco de dados (se necessário)
python manage.py migrate
```

### 2️⃣ Instalar Dependências do Node.js (Frontend)

```bash
# Navegar para a pasta do frontend
cd E:\repositorios\backstage\frontend

# Instalar as dependências do Node.js
npm install
```
---

## 🌐 Configuração de IP

### Backend - Arquivo `.env`

**Localização:** `E:\repositorios\backstage\.env`

```env
# Configurações do Banco de Dados
DB_NAME=seu_banco
DB_USER=seu_usuario
DB_PASSWORD=sua_senha
DB_HOST=localhost
DB_PORT=5432
```

⚠️ **Nota:** O backend permite conexões de qualquer IP (`ALLOWED_HOSTS = ["*"]`)

---

### Frontend - Arquivo `.env`

**Localização:** `E:\repositorios\backstage\frontend\.env`

```env
# URL da API Backend (HTTPS)
VITE_API_URL="https://192.168.100.34:8000"

# Chave da API do Google Maps
VITE_GOOGLE_MAPS_API_KEY="AIzaSyBcUyU0bl6l6rJjnc721cVoPGJcNFvAwUw"

# IP Local da Rede (usado para WebSocket)
VITE_LOCAL_IP="192.168.100.34"

# URL do Frontend
VITE_FRONTEND_URL="https://192.168.100.34:5173"
```

### 📝 Como Mudar o Endereço IP

**Quando você precisa mudar o IP:**
- Mudou de rede Wi-Fi
- IP do computador mudou
- Quer acessar de outro dispositivo na rede

**Passos:**

1. **Descubra seu IP atual:**
   ```bash
   ipconfig
   ```
   Procure por "Endereço IPv4" na seção da sua conexão Wi-Fi/Ethernet

2. **Atualize o arquivo `.env` do frontend:**
   ```env
   VITE_API_URL="https://SEU_NOVO_IP:8000"
   VITE_LOCAL_IP="SEU_NOVO_IP"
   VITE_FRONTEND_URL="https://SEU_NOVO_IP:5173"
   ```

3. **Exemplo com IP `192.168.1.100`:**
   ```env
   VITE_API_URL="https://192.168.1.100:8000"
   VITE_LOCAL_IP="192.168.1.100"
   VITE_FRONTEND_URL="https://192.168.1.100:5173"
   ```

4. **Reinicie o frontend** para aplicar as mudanças:
   - Pare o servidor (CTRL+C)
   - Inicie novamente com `npm run dev`

---

## ⚡ Como Iniciar os Servidores

### 🔴 BACKEND (Django + Daphne + WebSocket + HTTPS)

**Comando Único (RECOMENDADO):**

```bash
E:\repositorios\backstage\backstage\start_https.bat
```

**O que o script faz:**
1. Navega para a pasta correta
2. Configura variáveis de ambiente
3. Inicia o Daphne com suporte a:
   - ✅ WebSocket
   - ✅ HTTPS (SSL/TLS)
   - ✅ Servidor na porta 8000

**Você deve ver:**
```
Iniciando Daphne com suporte a WebSocket e HTTPS...

2025-10-19 19:44:37 INFO     Starting server at ssl:8000:privateKey=certs/localhost.key:certKey=certs/localhost.crt
2025-10-19 19:44:37 INFO     Listening on TCP address 0.0.0.0:8000
```

✅ **Backend disponível em:** `https://192.168.100.34:8000` (ou seu IP configurado)

---

### 🔵 FRONTEND (React + Vite + HTTPS)

**Comando:**

```bash
cd E:\repositorios\backstage\frontend
npm run dev
```

**Você deve ver:**
```
VITE v5.x.x  ready in xxx ms

➜  Local:   https://localhost:5173/
➜  Network: https://192.168.100.34:5173/
```

✅ **Frontend disponível em:** `https://192.168.100.34:5173` (ou seu IP configurado)

---

## 🎯 Ordem de Inicialização Correta

```
1️⃣ BACKEND  →  2️⃣ FRONTEND  →  3️⃣ NAVEGADOR
```

### Passo a Passo:

1. **Abra um terminal** e execute:
   ```bash
   E:\repositorios\backstage\backstage\start_https.bat
   ```
   ⏳ Aguarde até ver: `Listening on TCP address 0.0.0.0:8000`

2. **Abra outro terminal** e execute:
   ```bash
   cd E:\repositorios\backstage\frontend
   npm run dev
   ```
   ⏳ Aguarde até ver as URLs do Vite

3. **Abra o navegador** e acesse:
   ```
   https://192.168.100.34:5173
   ```

4. **Aceite o certificado SSL:**
   - Clique em **"Avançado"**
   - Clique em **"Prosseguir para 192.168.100.34:5173"**
   - Faça o mesmo para: `https://192.168.100.34:8000/api/eventos/`

---

## 🛑 Como Parar os Servidores

### Backend:
- Pressione `CTRL+C` no terminal
- **OU** pressione qualquer tecla na janela do `.bat`

### Frontend:
- Pressione `CTRL+C` no terminal

---

## 🔧 Solução de Problemas

### ❌ Problema: "Porta 8000 já está em uso"

**Solução:**
```bash
# Verificar qual processo está usando a porta
netstat -ano | findstr :8000

# Matar o processo (substitua [PID] pelo número que apareceu)
taskkill /PID [PID] /F

# Tentar iniciar novamente
E:\repositorios\backstage\backstage\start_https.bat
```

---

### ❌ Problema: "ModuleNotFoundError: No module named 'django'"

**Solução:**
```bash
cd E:\repositorios\backstage\backstage
pip install -r ../requirements.txt
```

---

### ❌ Problema: "npm: command not found" ou dependências faltando

**Solução:**
```bash
cd E:\repositorios\backstage\frontend
npm install
```

---

### ❌ Problema: "Certificado SSL não confiável"

**Solução:**

1. Acesse no navegador: `https://192.168.100.34:8000/api/eventos/`
2. Clique em **"Avançado"**
3. Clique em **"Prosseguir para 192.168.100.34:8000"**
4. Repita para: `https://192.168.100.34:5173`

Isso precisa ser feito **uma vez por navegador**.

---

### ❌ Problema: "WebSocket não conecta"

**Verificações:**

1. **Backend está rodando com Daphne?**
   ```bash
   # Verifique se o Daphne está ativo
   netstat -ano | findstr :8000
   ```

2. **Certificado SSL foi aceito?**
   - Acesse `https://192.168.100.34:8000/api/eventos/` e aceite

3. **Abra o Console do navegador (F12):**
   - Deve ver: `WebSocket conectado para inscrição: [ID]`
   - Se ver erro, verifique a URL do WebSocket

---

### ❌ Problema: "Django Admin sem estilos (404 nos CSS)"

**Solução:**
```bash
cd E:\repositorios\backstage\backstage
python manage.py collectstatic --noinput
```

Depois reinicie o backend.

---

### ❌ Problema: "ERR_SSL_PROTOCOL_ERROR"

**Causas comuns:**
- Backend não está rodando em HTTPS
- Tentando usar `python manage.py runserver` (não suporta SSL)

**Solução:**
- ❌ NÃO use: `python manage.py runserver`
- ❌ NÃO use: `python manage.py runsslserver` (não funciona com Python 3.13)
- ✅ USE: `E:\repositorios\backstage\backstage\start_https.bat`

---

## 📱 Acessar no Celular

### Pré-requisitos:
- ✅ Celular e PC na **mesma rede Wi-Fi**
- ✅ Servidores backend e frontend rodando

### Passos:

1. **Descubra o IP do seu PC:**
   ```bash
   ipconfig
   ```
   Exemplo: `192.168.100.34`

2. **Configure o `.env` do frontend com este IP** (já explicado acima)

3. **No celular, aceite os certificados SSL:**
   - Acesse: `https://192.168.100.34:8000/api/eventos/`
   - Aceite o aviso de segurança
   - Acesse: `https://192.168.100.34:5173`
   - Aceite o aviso de segurança

4. **Faça login e use normalmente!**

---

## 🎓 Comandos Úteis

### Backend (Django):

```bash
# Criar superusuário para o Django Admin
python manage.py createsuperuser

# Fazer migrações do banco de dados
python manage.py makemigrations
python manage.py migrate

# Coletar arquivos estáticos
python manage.py collectstatic --noinput

# Acessar o shell do Django
python manage.py shell

# Ver todas as rotas disponíveis
python manage.py show_urls
```

### Frontend (React):

```bash
# Instalar nova dependência
npm install nome-do-pacote

# Atualizar dependências
npm update

# Limpar cache e reinstalar
rm -rf node_modules package-lock.json
npm install

# Build para produção
npm run build

# Preview do build
npm run preview
```
---

## 🔍 Verificar se Está Funcionando

### ✅ Backend:
```
Acesse: https://192.168.100.34:8000/api/eventos/
Deve mostrar: JSON com lista de eventos
```

### ✅ Frontend:
```
Acesse: https://192.168.100.34:5173
Deve mostrar: Página de login/home
```

### ✅ Django Admin:
```
Acesse: https://192.168.100.34:8000/admin/
Deve mostrar: Interface do Django Admin com estilos
```

### ✅ WebSocket:
```
1. Abra o Console (F12)
2. Vá para uma tela de check-in
3. Deve ver: "WebSocket conectado para inscrição: [ID]"
```

---

## 🎨 Estrutura do Projeto

```
backstage/
├── backstage/                    # Django Backend
│   ├── api/                      # App principal da API
│   │   ├── models.py            # Modelos do banco
│   │   ├── views.py             # Lógica das views
│   │   ├── serializers.py       # Serializers REST
│   │   ├── consumers.py         # WebSocket consumers
│   │   └── routing.py           # Rotas WebSocket
│   ├── backstage/               # Configurações Django
│   │   ├── settings.py          # Configurações principais
│   │   ├── urls.py              # URLs principais
│   │   └── asgi.py              # Configuração ASGI
│   ├── certs/                   # Certificados SSL
│   │   ├── localhost.crt
│   │   └── localhost.key
│   ├── staticfiles/             # Arquivos estáticos coletados
│   ├── media/                   # Upload de arquivos
│   ├── manage.py                # CLI do Django
│   └── start_https.bat          # Script para iniciar servidor
│
├── frontend/                     # React Frontend
│   ├── src/
│   │   ├── components/          # Componentes React
│   │   ├── pages/               # Páginas da aplicação
│   │   ├── api.js               # Configuração do Axios
│   │   ├── App.jsx              # Componente principal
│   │   └── main.jsx             # Ponto de entrada
│   ├── .env                     # Variáveis de ambiente
│   ├── package.json             # Dependências Node.js
│   └── vite.config.js           # Configuração do Vite
│
├── requirements.txt             # Dependências Python
├── HELP.md                      # Este arquivo
├── COMO_INICIAR.md             # Guia rápido
└── WEBSOCKET_COMPLETO.md       # Documentação WebSocket
```

---

**Última atualização:** 19 de outubro de 2025
**Versão:** 1.0

