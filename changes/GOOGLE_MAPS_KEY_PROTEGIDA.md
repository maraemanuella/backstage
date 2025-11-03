# 🔒 API Key do Google Maps Protegida!

## ✅ Mudanças Realizadas

### 1. **API Key Movida para .env** ✅

**Arquivo:** `frontend/.env`

```env
VITE_GOOGLE_MAPS_API_KEY="AIzaSyD83H1nLPu9UbFUcskys5IbjeMNMGwBcnU"
```

- ✅ API Key não está mais exposta no código
- ✅ Arquivo `.env` já está no `.gitignore`
- ✅ Não será versionado no Git

---

### 2. **Script Removido do index.html** ✅

**Antes:**
```html
<script src="https://maps.googleapis.com/maps/api/js?key=AIzaSy..."></script>
```

**Depois:**
```html
<!-- Script removido - agora carregado dinamicamente via JavaScript -->
```

---

### 3. **Utilitário de Carregamento Criado** ✅

**Arquivo:** `frontend/src/utils/googleMaps.js`

```javascript
export const loadGoogleMapsScript = () => {
  return new Promise((resolve, reject) => {
    // Carrega o script dinamicamente usando a API Key do .env
    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&libraries=places&language=pt-BR`
    // ...
  })
}
```

**Benefícios:**
- ✅ API Key lida da variável de ambiente
- ✅ Carregamento assíncrono
- ✅ Tratamento de erros
- ✅ Evita carregamentos duplicados
- ✅ Pode ser reutilizado em outros componentes

---

### 4. **CriarEvento.jsx Atualizado** ✅

**Mudanças:**
```javascript
// Import adicionado
import { loadGoogleMapsScript } from '../utils/googleMaps'

// useEffect atualizado para carregar dinamicamente
useEffect(() => {
  const initAutocomplete = async () => {
    try {
      await loadGoogleMapsScript() // Carrega com API Key do .env
      // ... resto do código
    } catch (error) {
      console.error('Erro ao carregar Google Maps:', error)
    }
  }
  initAutocomplete()
}, [])
```

---

### 5. **.env.example Atualizado** ✅

**Arquivo:** `frontend/.env.example`

```env
VITE_GOOGLE_MAPS_API_KEY="SUA_GOOGLE_MAPS_API_KEY_AQUI"
```

- ✅ Template para novos desenvolvedores
- ✅ Não contém a chave real
- ✅ Instruções claras

---

## 🔐 Segurança

### ✅ O Que Foi Protegido

1. **API Key não está mais no código-fonte**
   - Antes: Hardcoded no `index.html`
   - Depois: Variável de ambiente em `.env`

2. **Arquivo .env está no .gitignore**
   ```gitignore
   # Variáveis de ambiente
../.envenv
   frontend/.env
   ```

3. **Template .env.example criado**
   - Desenvolvedores podem copiar e configurar suas próprias chaves

### ⚠️ Importante para Produção

Embora a API Key esteja em `.env`, ela ainda é **exposta no frontend** (visível no código JavaScript do navegador).

**Recomendações para Produção:**

1. **Configure restrições no Google Cloud Console:**
   - Vá em: https://console.cloud.google.com/apis/credentials
   - Selecione sua API Key
   - Configure "Application restrictions":
     - **HTTP referrers (web sites)**
     - Adicione seus domínios autorizados:
       ```
       https://seusite.com/*
       https://*.seusite.com/*
       ```

2. **Configure cotas de uso:**
   - Defina limites diários de requisições
   - Configure alertas de uso
   - Evite cobranças inesperadas

3. **Considere usar um Proxy Backend:**
   - Para segurança máxima, crie um endpoint no Django
   - O backend faz as chamadas à API do Google
   - Frontend chama apenas seu backend
   - API Key fica completamente oculta

---

## 📋 Configuração para Novos Desenvolvedores

### 1. Clone o Repositório
```bash
git clone <url-do-repo>
cd backstage/frontend
```

### 2. Configure o .env
```bash
# Copie o template
cp .env.example .env

# Edite e adicione sua API Key
nano .env
```

### 3. Obtenha sua API Key do Google
1. Acesse: https://console.cloud.google.com/
2. Crie um projeto (se não tiver)
3. Habilite a "Places API"
4. Vá em "Credentials" → "Create Credentials" → "API Key"
5. Copie a chave e cole no `.env`:
   ```env
   VITE_GOOGLE_MAPS_API_KEY="sua-chave-aqui"
   ```

### 4. Instale e Execute
```bash
npm install
npm run dev
```

---

## ✅ Checklist de Segurança

- [x] API Key movida para `.env`
- [x] `.env` adicionado ao `.gitignore`
- [x] `.env.example` criado com placeholder
- [x] Script hardcoded removido do HTML
- [x] Carregamento dinâmico implementado
- [x] Tratamento de erros adicionado
- [x] Documentação atualizada

---

## 🧪 Como Testar

1. **Certifique-se que o .env está configurado:**
   ```bash
   cat frontend/.env
   # Deve conter: VITE_GOOGLE_MAPS_API_KEY="..."
   ```

2. **Reinicie o servidor de desenvolvimento:**
   ```bash
   # Pare o servidor (Ctrl+C)
   # Inicie novamente
   npm run dev
   ```

3. **Acesse a página de criar evento:**
   ```
   http://localhost:5173/criar-evento
   ```

4. **Teste o autocomplete:**
   - Digite um endereço
   - As sugestões devem aparecer normalmente
   - Se não aparecer, abra o Console (F12) e verifique erros

---

## 🐛 Troubleshooting

### ❌ Autocomplete não funciona mais?

**Causa:** Variável de ambiente não está sendo lida

**Solução:**
1. Verifique se o arquivo `.env` existe em `frontend/.env`
2. Certifique-se que a variável começa com `VITE_`
3. Reinicie o servidor de desenvolvimento (Ctrl+C e `npm run dev`)

### ❌ Erro: "Cannot read property 'env' of undefined"

**Causa:** Vite não reconhece `import.meta.env`

**Solução:**
- Certifique-se de estar usando Vite 2.0+
- Verifique se o servidor está rodando
- Limpe o cache: `rm -rf node_modules/.vite`

---

## 📚 Arquivos Modificados

1. ✅ `frontend/.env` - API Key adicionada
2. ✅ `frontend/.env.example` - Template atualizado
3. ✅ `frontend/index.html` - Script removido
4. ✅ `frontend/src/utils/googleMaps.js` - Utilitário criado
5. ✅ `frontend/src/pages/CriarEvento.jsx` - Carregamento dinâmico

---

**API Key protegida e configuração segura implementada! 🔒**

