# 🚨 INSTRUÇÕES IMPORTANTES - ERRO 404 NO LOGIN

## ❌ Problema Identificado

O servidor Django **NÃO ESTÁ RODANDO**! Por isso você está recebendo erro 404 ao tentar fazer login.

---

## ✅ SOLUÇÃO - Siga estes passos:

### Passo 1: Inicie o Servidor Django

**Opção A - Usando o script automático:**
```bash
# Execute o arquivo start_server.bat
start_server.bat
```

**Opção B - Manualmente:**
```bash
cd E:\repositorios\backstage

# Ativar ambiente virtual (se usar)
.ven\Scripts\activate

# Iniciar servidor
python manage.py runserver
```

### Passo 2: Inicie o Frontend (em outro terminal)
```bash
cd E:\repositorios\backstage\frontend
npm run dev
```

### Passo 3: Acesse a Aplicação
```
http://localhost:5173/login
```

---

## 🔍 Como Verificar se o Servidor Está Rodando

### Método 1: Acessar diretamente a API
Abra no navegador:
```
http://localhost:8000/api/
```

Se aparecer uma página do Django REST Framework, está funcionando! ✅

### Método 2: Via terminal
```bash
netstat -ano | findstr :8000
```

Se aparecer algo, o servidor está rodando! ✅

---

## 📋 Checklist Completo

- [ ] **Servidor Django rodando** na porta 8000
- [ ] **Frontend rodando** na porta 5173
- [ ] **Acessar** http://localhost:5173/login
- [ ] **Testar login**

---

## 🎯 Estrutura Correta

Você deve ter **2 terminais** abertos:

### Terminal 1 - Backend Django
```
E:\repositorios\backstage> python manage.py runserver
Watching for file changes with StatReloader
Performing system checks...

System check identified no issues (0 silenced).
November 02, 2025 - 15:30:00
Django version 4.2.x, using settings 'settings.settings'
Starting development server at http://127.0.0.1:8000/
Quit the server with CTRL-BREAK.
```

### Terminal 2 - Frontend Vite
```
E:\repositorios\backstage\frontend> npm run dev

  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: http://192.168.x.x:5173/
```

---

## 🔧 Correções Já Aplicadas

✅ Rotas de autenticação corrigidas em `api/urls.py`:
```python
path('token/', CustomTokenObtainView.as_view(), name='token_obtain_pair'),
path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
```

✅ Proxy configurado no `vite.config.js`:
```javascript
proxy: {
  '/api': {
    target: 'http://127.0.0.1:8000',
    changeOrigin: true,
  }
}
```

---

## 🚀 AÇÃO NECESSÁRIA

**INICIE O SERVIDOR DJANGO AGORA:**

```bash
cd E:\repositorios\backstage
python manage.py runserver
```

Depois que o servidor estiver rodando, o erro 404 vai desaparecer e você conseguirá fazer login! 🎉

---

**Importante:** Mantenha o servidor Django rodando enquanto usa a aplicação!
@echo off
REM Script para iniciar o servidor Django

echo ========================================
echo   Iniciando Servidor Django Backstage
echo ========================================
echo.

cd /d "%~dp0"

echo Verificando ambiente virtual...
if not exist ".ven\Scripts\activate.bat" (
    echo ERRO: Ambiente virtual nao encontrado!
    echo Execute: python -m venv .ven
    pause
    exit /b 1
)

echo Ativando ambiente virtual...
call .ven\Scripts\activate.bat

echo.
echo Aplicando migrations...
python manage.py migrate

echo.
echo ========================================
echo   Servidor rodando em http://localhost:8000
echo   Pressione Ctrl+C para parar
echo ========================================
echo.

python manage.py runserver

