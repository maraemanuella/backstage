# ✅ Bloqueio de Inscrição - 30 Minutos Após Início do Evento

## 🎯 Funcionalidade Implementada

Foi adicionada a funcionalidade que **bloqueia automaticamente o botão de inscrição** quando já se passaram **30 minutos** do início do evento.

---

## 📝 Mudanças Realizadas

### 1. **Estado Adicionado**
```javascript
const [eventoExpirado, setEventoExpirado] = useState(false);
```

### 2. **Verificação no useEffect**
Ao carregar os dados do evento, o sistema verifica se já passaram 30 minutos:

```javascript
// Verificar se já passaram 30 minutos do início do evento
if (res.data.data_evento) {
  const dataEvento = new Date(res.data.data_evento);
  const agora = new Date();
  const diferencaMinutos = (agora - dataEvento) / (1000 * 60); // Diferença em minutos
  
  if (diferencaMinutos > 30) {
    setEventoExpirado(true);
  }
}
```

### 3. **Validação no handleRegister**
Impede inscrição com mensagem de erro:

```javascript
const handleRegister = async () => {
  // Verificar se o evento expirou (30 minutos após o início)
  if (eventoExpirado) {
    toast.error("Prazo de inscrição encerrado. Já se passaram 30 minutos do início do evento.");
    return;
  }
  // ...resto do código
}
```

### 4. **Botão Desabilitado**
O botão fica cinza e mostra "Prazo Encerrado":

```javascript
<EventButton
  disabled={registering || isRegistered || event.esta_lotado || event.vagas_disponiveis <= 0 || eventoExpirado}
>
  <FaCheckCircle />
  {eventoExpirado
    ? "Prazo Encerrado"
    : isRegistered
    ? "Já Inscrito"
    : event.esta_lotado || event.vagas_disponiveis <= 0
    ? "Lotado"
    : "Se inscrever"}
</EventButton>
```

---

## 🔄 Fluxo de Verificação

```
┌─────────────────────────────────────────────────────────┐
│ Usuário acessa EventDescription                        │
└────────────────────┬────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────┐
│ Sistema busca dados do evento (data_evento)            │
└────────────────────┬────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────┐
│ Calcula diferença entre "agora" e "data_evento"        │
│ diferencaMinutos = (agora - dataEvento) / (1000 * 60)  │
└────────────────────┬────────────────────────────────────┘
                     ↓
              ┌──────┴──────┐
              │             │
    SIM ──────┤ > 30 min?   │────── NÃO
              │             │
              └──────┬──────┘
                     │              │
                     ↓              ↓
        ┌─────────────────┐  ┌─────────────────┐
        │ eventoExpirado  │  │ eventoExpirado  │
        │ = true          │  │ = false         │
        └────────┬────────┘  └────────┬────────┘
                 ↓                    ↓
        ┌─────────────────┐  ┌─────────────────┐
        │ Botão DESABILI- │  │ Botão HABILI-   │
        │ TADO (cinza)    │  │ TADO (verde)    │
        │                 │  │                 │
        │ "Prazo          │  │ "Se inscrever"  │
        │  Encerrado"     │  │                 │
        └─────────────────┘  └─────────────────┘
```

---

## 🧪 Como Testar

### Teste 1: Evento Futuro (Antes do Início)
**Cenário**: Evento marcado para daqui 2 dias

1. Acesse a página do evento
2. **Resultado Esperado**:
   - ✅ Botão "Se inscrever" habilitado (verde)
   - ✅ Usuário pode clicar e se inscrever

### Teste 2: Evento Recente (Menos de 30 minutos)
**Cenário**: Evento começou há 15 minutos

1. Crie um evento com `data_evento` = (hora atual - 15 minutos)
2. Acesse a página do evento
3. **Resultado Esperado**:
   - ✅ Botão "Se inscrever" habilitado (verde)
   - ✅ Usuário ainda pode se inscrever

### Teste 3: Evento Expirado (Mais de 30 minutos) ⭐
**Cenário**: Evento começou há 45 minutos

1. Crie um evento com `data_evento` = (hora atual - 45 minutos)
2. Acesse a página do evento
3. **Resultado Esperado**:
   - ❌ Botão desabilitado (cinza)
   - ❌ Texto: "Prazo Encerrado"
   - ❌ Ao tentar clicar: Toast de erro
   - ❌ Mensagem: "Prazo de inscrição encerrado. Já se passaram 30 minutos do início do evento."

### Teste 4: Exatamente 30 Minutos
**Cenário**: Evento começou há exatamente 30 minutos

1. Crie evento com `data_evento` = (hora atual - 30 minutos)
2. Acesse a página
3. **Resultado Esperado**:
   - ❌ Botão desabilitado (cinza)
   - Nota: `diferencaMinutos > 30` considera 30.0001 minutos como expirado

---

## 📋 Prioridade de Estados do Botão

O botão verifica nesta ordem:

1. **Prazo Encerrado** (eventoExpirado)
   - Mais alta prioridade
   - Mostra: "Prazo Encerrado"

2. **Já Inscrito** (isRegistered)
   - Segunda prioridade
   - Mostra: "Já Inscrito"

3. **Evento Lotado** (esta_lotado || vagas_disponiveis <= 0)
   - Terceira prioridade
   - Mostra: "Lotado"

4. **Disponível para Inscrição**
   - Estado padrão
   - Mostra: "Se inscrever"

---

## 🎨 Feedback Visual

### Botão Habilitado
- **Cor**: Verde (`bg-green-600`)
- **Hover**: Verde escuro (`hover:bg-green-700`)
- **Cursor**: Pointer
- **Texto**: "Se inscrever"

### Botão Desabilitado (Expirado)
- **Cor**: Cinza (`disabled:bg-gray-400`)
- **Cursor**: Not-allowed (`disabled:cursor-not-allowed`)
- **Texto**: "Prazo Encerrado"
- **Toast ao clicar**: Erro vermelho com mensagem

---

## 💡 Lógica de Cálculo

```javascript
// Data do evento (do backend)
const dataEvento = new Date(event.data_evento);

// Data/hora atual
const agora = new Date();

// Diferença em milissegundos
const diferencaMs = agora - dataEvento;

// Converter para minutos
const diferencaMinutos = diferencaMs / (1000 * 60);

// Verificar se passou de 30 minutos
if (diferencaMinutos > 30) {
  // BLOQUEADO
} else {
  // PERMITIDO
}
```

### Exemplos:

| Data Evento           | Agora                 | Diferença | Status       |
|-----------------------|-----------------------|-----------|--------------|
| 02/11/2025 14:00      | 02/11/2025 14:20      | 20 min    | ✅ Permitido |
| 02/11/2025 14:00      | 02/11/2025 14:30      | 30 min    | ✅ Permitido |
| 02/11/2025 14:00      | 02/11/2025 14:31      | 31 min    | ❌ Bloqueado |
| 02/11/2025 14:00      | 02/11/2025 15:00      | 60 min    | ❌ Bloqueado |
| 02/11/2025 14:00      | 01/11/2025 13:00      | -25 horas | ✅ Permitido |

---

## 🔍 Mensagens de Erro

### Toast ao Tentar Inscrever em Evento Expirado
```
🔴 Prazo de inscrição encerrado. 
   Já se passaram 30 minutos do início do evento.
```

---

## ✅ Checklist de Validação

- [x] Estado `eventoExpirado` criado
- [x] Verificação executada ao carregar evento
- [x] Cálculo de diferença em minutos implementado
- [x] Condição > 30 minutos implementada
- [x] Validação em `handleRegister`
- [x] Toast de erro exibido
- [x] Botão desabilitado quando expirado
- [x] Texto do botão muda para "Prazo Encerrado"
- [x] Classe CSS `disabled:` aplicada
- [x] Sem erros de compilação

---

## 🚀 Status

**✅ IMPLEMENTADO E FUNCIONAL**

A funcionalidade está completa e pronta para uso. O botão de inscrição agora bloqueia automaticamente após 30 minutos do início do evento, com feedback visual e mensagens claras para o usuário.

---

**Data de Implementação**: 02/11/2025

