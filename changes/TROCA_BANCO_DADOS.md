# 🔄 Troca Dinâmica de Banco de Dados - Implementado

## ✅ Funcionalidade Implementada

Implementado sistema de **troca dinâmica** entre PostgreSQL **LOCAL** e **NA NUVEM** (Supabase) através da variável `USE_LOCAL_DB`.

---

## 🎯 Como Funciona

### Arquivo `.env`:
```env
USE_LOCAL_DB=True   # ← PostgreSQL LOCAL
# ou
USE_LOCAL_DB=False  # ← PostgreSQL NA NUVEM (Supabase)
```

### Django (`settings.py`):
O Django verifica automaticamente o valor de `USE_LOCAL_DB` e conecta no banco correto:

```python
if USE_LOCAL_DB:
    # Conecta em localhost:5432
    print("🔵 Usando PostgreSQL LOCAL")
else:
    # Conecta em Supabase
    print("☁️ Usando PostgreSQL NA NUVEM")
```

---

## 🚀 Como Alternar Entre Bancos

### **Opção 1: Script Interativo (Windows)**
```bash
switch_database.bat
```

**Menu:**
```
1. PostgreSQL LOCAL (localhost:5432)
2. PostgreSQL NA NUVEM (Supabase)
3. Cancelar
```

### **Opção 2: Script Python (Multiplataforma)**
```bash
# Menu interativo
python switch_database.py

# Direto para local
python switch_database.py local

# Direto para nuvem
python switch_database.py nuvem

# Ver status atual
python switch_database.py status
```

### **Opção 3: Manual**
Edite o arquivo `.env` e mude:
```env
USE_LOCAL_DB=True   # para local
# ou
USE_LOCAL_DB=False  # para nuvem
```

---

## 📋 Configurações dos Bancos

### PostgreSQL LOCAL (`USE_LOCAL_DB=True`)
```env
LOCAL_DB_NAME=backstage
LOCAL_DB_USER=postgres
LOCAL_DB_PASSWORD=123
LOCAL_DB_HOST=localhost
LOCAL_DB_PORT=5432
```

**Características:**
- ✅ Rápido (sem latência de rede)
- ✅ Sem custos
- ✅ SSL desabilitado (não necessário)
- ⚠️ Precisa PostgreSQL instalado localmente

### PostgreSQL NA NUVEM (`USE_LOCAL_DB=False`)
```env
DB_NAME=postgres
DB_USER=postgres.jscqcponocgkwtmdhmvo
DB_HOST=aws-1-sa-east-1.pooler.supabase.com
DB_PORT=6543
DB_PASSWORD=kJFuib2hYWvLkRtQ
DB_SSLMODE=require
```

**Características:**
- ✅ Acessível de qualquer lugar
- ✅ Backup automático (Supabase)
- ✅ SSL obrigatório (segurança)
- ⚠️ Latência de rede

---

## 🔧 Após Alternar o Banco

### 1. **Reinicie o Servidor Django**
```bash
# Pare o servidor (Ctrl+C)
# Inicie novamente
python manage.py runserver
# ou
start_https_server.bat
```

### 2. **Verifique o Banco Conectado**
Ao iniciar, verá uma das mensagens:
```
🔵 Usando PostgreSQL LOCAL: localhost:5432/backstage
```
ou
```
☁️ Usando PostgreSQL NA NUVEM (Supabase): aws-1-sa-east-1.pooler.supabase.com/postgres
```

### 3. **Aplique Migrações (se necessário)**
```bash
# Ver status das migrações
python manage.py showmigrations

# Aplicar migrações pendentes
python manage.py migrate
```

---

## 📊 Comparação

| Característica | Local | Nuvem (Supabase) |
|----------------|-------|------------------|
| **Velocidade** | ⚡ Muito rápida | 🌐 Depende da internet |
| **Custo** | 💰 Gratuito | 💰 Gratuito (plano free) |
| **Acesso Remoto** | ❌ Não | ✅ Sim |
| **Backup** | ❌ Manual | ✅ Automático |
| **SSL** | ❌ Opcional | ✅ Obrigatório |
| **Configuração** | 🔧 Requer instalação | ✅ Pronto para usar |

---

## 🎯 Quando Usar Cada Um

### Use **LOCAL** quando:
- ✅ Desenvolvendo localmente
- ✅ Sem conexão com internet
- ✅ Precisa de performance máxima
- ✅ Testando migrações

### Use **NUVEM** quando:
- ✅ Trabalhando em equipe
- ✅ Precisa acessar de múltiplos dispositivos
- ✅ Fazendo deploy/produção
- ✅ Quer backup automático

---

## 🧪 Testando a Troca

### Teste 1: Local para Nuvem
```bash
# 1. Verifique status atual
python switch_database.py status
# Resultado: "Banco Atual: PostgreSQL LOCAL"

# 2. Alterne para nuvem
python switch_database.py nuvem
# Resultado: "✅ Alterado para PostgreSQL NA NUVEM"

# 3. Reinicie o servidor
python manage.py runserver

# 4. Veja a mensagem
# "☁️ Usando PostgreSQL NA NUVEM (Supabase)"
```

### Teste 2: Nuvem para Local
```bash
# 1. Alterne para local
switch_database.bat
# Escolha: 1 (PostgreSQL LOCAL)

# 2. Reinicie o servidor
start_https_server.bat

# 3. Veja a mensagem
# "🔵 Usando PostgreSQL LOCAL: localhost:5432/backstage"
```

---

## 📝 Arquivos Criados/Modificados

### Criados:
- ✅ `switch_database.bat` - Script Windows para alternar
- ✅ `switch_database.py` - Script Python para alternar
- ✅ `TROCA_BANCO_DADOS.md` - Esta documentação

### Modificados:
- ✅ `settings/settings.py` - Lógica de troca dinâmica
- ✅ `.env.example` - Documentação das variáveis

---

## ⚠️ Avisos Importantes

### 🔴 Dados Separados:
- Banco LOCAL e NUVEM são **independentes**
- Dados em um **não aparecem** no outro
- Migrações devem ser aplicadas em **ambos**

### 🔴 Sincronização:
- **Não há sincronização automática** entre os bancos
- Se criar dados em LOCAL, eles **não vão** para NUVEM
- Use dumps/backups para transferir dados

### 🔴 Migrações:
- Aplique migrações em **ambos os bancos**
- Use `python manage.py migrate` após alternar

---

## 💡 Dicas

### Criar Backup Local:
```bash
# Exportar dados do LOCAL
python manage.py dumpdata > backup_local.json

# Alternar para NUVEM
python switch_database.py nuvem

# Importar dados na NUVEM
python manage.py loaddata backup_local.json
```

### Comandos Úteis:
```bash
# Ver qual banco está conectado
python switch_database.py status

# Ver migrações aplicadas
python manage.py showmigrations

# Criar superusuário no banco atual
python manage.py createsuperuser

# Resetar banco LOCAL (cuidado!)
python manage.py flush
```

---

## ✅ Checklist de Validação

- [x] `USE_LOCAL_DB` implementado no settings.py
- [x] Configurações de LOCAL_DB_* no .env
- [x] Configurações de DB_* no .env
- [x] Script switch_database.bat criado
- [x] Script switch_database.py criado
- [x] Mensagens de log no console
- [x] SSL correto para cada banco
- [x] Documentação completa

---

## 🚀 Status

**✅ TROCA DINÂMICA TOTALMENTE FUNCIONAL**

Agora você pode alternar facilmente entre:
- 🔵 PostgreSQL LOCAL (desenvolvimento rápido)
- ☁️ PostgreSQL NA NUVEM (acesso remoto/produção)

**Execute `switch_database.bat` ou `python switch_database.py` para alternar!** 🔄

---

**Data de Implementação**: 02/11/2025

