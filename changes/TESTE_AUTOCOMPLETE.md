# 🧪 Como Testar o Autocomplete do Google Places

## 🚀 Passos para Testar

### 1. Certifique-se que o Frontend está Rodando
```bash
cd E:\repositorios\backstage\frontend
npm run dev
```

### 2. Acesse a Página de Criar Evento
Abra o navegador em:
```
http://localhost:5173/criar-evento
```

### 3. Teste o Autocomplete de Endereço

#### 3.1 Digite um endereço parcial:
```
Exemplo: "Av Paulista"
```

#### 3.2 Aguarde as sugestões aparecerem
Você verá uma lista dropdown com sugestões do Google, por exemplo:
- Avenida Paulista, São Paulo - SP, Brasil
- Avenida Paulista, Bela Vista, São Paulo - SP, Brasil
- etc.

#### 3.3 Selecione uma opção
Clique em uma das sugestões.

#### 3.4 Verifique o resultado
- ✅ O campo "Endereço" deve estar preenchido com o endereço completo
- ✅ Latitude e longitude foram preenchidas automaticamente (invisíveis no formulário)

### 4. Preencha os Demais Campos e Crie o Evento

Complete o formulário:
- Título
- Categoria
- Descrição
- Data e Hora
- Capacidade
- Valor do Depósito
- etc.

Clique em **"Criar Evento"**

### 5. Verifique o Console do Navegador (F12)

Abra o Developer Tools (F12) e vá para a aba Console.

Você deve ver a requisição sendo enviada com:
```javascript
{
  endereco: "Avenida Paulista, 1578 - Bela Vista, São Paulo - SP, Brasil",
  latitude: "-23.5613551",
  longitude: "-46.6565897",
  // ... outros campos
}
```

---

## 🔍 Troubleshooting

### ❌ Autocomplete não aparece?

**Possíveis causas:**
1. Script do Google não carregou
2. API Key inválida ou com cotas esgotadas
3. Conexão com internet

**Solução:**
- Abra o Console (F12) → aba Console
- Procure por erros do Google Maps
- Verifique se o script foi carregado em Network → JS

### ❌ Erro: "This API project is not authorized to use this API"

**Causa:** A API Places não está habilitada no projeto Google Cloud

**Solução:**
1. Acesse: https://console.cloud.google.com/
2. Vá em "APIs & Services" → "Library"
3. Procure por "Places API"
4. Clique em "Enable"

### ❌ Erro: "RefererNotAllowedMapError"

**Causa:** O domínio localhost não está autorizado na API Key

**Solução:**
1. Acesse: https://console.cloud.google.com/
2. Vá em "APIs & Services" → "Credentials"
3. Clique na API Key
4. Em "Application restrictions" → "HTTP referrers"
5. Adicione: `http://localhost:5173/*`

---

## ✅ Verificação Visual

### Antes de Selecionar:
```
┌─────────────────────────────────────────┐
│ Endereço *                             │
│ ┌─────────────────────────────────────┐│
│ │ Av Paulista                        ││
│ └─────────────────────────────────────┘│
│ ┌─────────────────────────────────────┐│
│ │ 📍 Av Paulista, São Paulo - SP     ││
│ │ 📍 Av Paulista, Bela Vista, SP     ││
│ │ 📍 Av Paulista, 1578 - SP          ││
│ └─────────────────────────────────────┘│
└─────────────────────────────────────────┘
```

### Depois de Selecionar:
```
┌─────────────────────────────────────────┐
│ Endereço *                             │
│ ┌─────────────────────────────────────┐│
│ │ Avenida Paulista, 1578 - Bela     ││
│ │ Vista, São Paulo - SP, Brasil     ││
│ └─────────────────────────────────────┘│
│ ✅ Latitude e longitude preenchidas    │
└─────────────────────────────────────────┘
```

---

## 📊 Dados Esperados no Backend

Quando o formulário for enviado, o backend deve receber:

```python
{
    'titulo': 'Meu Evento',
    'endereco': 'Avenida Paulista, 1578 - Bela Vista, São Paulo - SP, Brasil',
    'latitude': '-23.5613551',  # ✅ Preenchido automaticamente
    'longitude': '-46.6565897', # ✅ Preenchido automaticamente
    'local_especifico': 'Auditório Principal',
    # ... outros campos
}
```

---

## 🎯 Teste Completo - Checklist

- [ ] Frontend rodando sem erros
- [ ] Página /criar-evento acessível
- [ ] Campo de endereço visível
- [ ] Ao digitar, sugestões aparecem
- [ ] Ao selecionar, campo é preenchido
- [ ] Formulário pode ser submetido
- [ ] Evento criado com sucesso
- [ ] Latitude e longitude salvos no banco

---

**Se todos os itens acima estiverem OK, o autocomplete está funcionando perfeitamente! ✅**

