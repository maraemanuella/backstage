# Sistema de Notificações

Este sistema gerencia notificações automáticas para usuários do Backstage.

## Tipos de Notificações Automáticas

### 1. **Inscrição Confirmada**
- **Quando**: Quando uma inscrição muda para status "confirmada"
- **Quem recebe**: O usuário que se inscreveu
- **Como funciona**: Através de Django signals em `signals.py`

### 2. **Novo Evento de Organizador Favoritado**
- **Quando**: Quando um organizador que você favoritou cria um novo evento
- **Quem recebe**: Todos os usuários que favoritaram o organizador
- **Como funciona**: Através de Django signals em `signals.py`

### 3. **Evento Cancelado**
- **Quando**: Quando um evento muda para status "cancelado"
- **Quem recebe**: Todos os inscritos confirmados no evento
- **Como funciona**: Através de Django signals em `signals.py`

### 4. **Lembretes de Evento Próximo**
- **Quando**: X dias, horas ou minutos antes do evento
- **Quem recebe**: Todos os inscritos confirmados
- **Como funciona**: Comandos Django que precisam ser executados periodicamente

## 🔄 Configurando Lembretes Automáticos de Eventos

Há dois comandos para enviar lembretes:

### 1. Lembretes por Dias (`send_event_reminders`)

Envia lembretes para eventos que acontecerão em X dias.

#### Execução Manual

```bash
# Enviar lembretes para eventos em 2, 1 e 0 dias (padrão)
python manage.py send_event_reminders

# Especificar dias customizados
python manage.py send_event_reminders --days 7 3 1 0

# Modo dry-run (apenas simula, não cria notificações)
python manage.py send_event_reminders --dry-run
```

### 2. Lembretes por Horas (`send_event_reminders_hourly`)

Envia lembretes para eventos que acontecerão em 12 horas, 1 hora ou 30 minutos.

#### Execução Manual

```bash
# Enviar lembretes para eventos próximos (12h, 1h, 30min)
python manage.py send_event_reminders_hourly

# Modo dry-run (apenas simula, não cria notificações)
python manage.py send_event_reminders_hourly --dry-run
```

#### Execução Automática via Script PowerShell

Para rodar automaticamente em loop, use os scripts na pasta `scripts/`:

**Para teste (executa a cada 1 minuto):**
```powershell
.\scripts\run_hourly_reminders_test.ps1
```

**Para produção (executa a cada 1 hora):**
```powershell
.\scripts\run_hourly_reminders.ps1
```

**Para parar:** Pressione `Ctrl+C`

> **Nota**: Os scripts usam o diretório atual, então execute-os a partir da raiz do projeto.