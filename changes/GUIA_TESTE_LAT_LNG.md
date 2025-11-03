# 🧪 Guia de Teste - Latitude e Longitude

## Como Testar a Implementação

### ✅ Pré-requisitos
- Servidor Django rodando
- Frontend rodando (`npm run dev`)
- Google Maps API Key configurada no `.env`

---

## 📍 Teste 1: Criar Evento com Coordenadas

### Passos:
1. Acesse: `http://localhost:5173/criar-evento`
2. Preencha o formulário:
   - **Título**: Teste de Localização
   - **Categoria**: Workshop
   - **Descrição**: Testando captura de coordenadas
   
3. **Campo Endereço**:
   - Digite: "Avenida Paulista, 1578"
   - Aguarde as sugestões do Google
   - Selecione a primeira opção
   
4. **Console do Navegador** (F12):
   - Verifique o log:
   ```
   ✅ Endereço selecionado: {
     endereco: "Avenida Paulista, 1578 - Bela Vista, São Paulo - SP",
     lat: -23.5619479,
     lng: -46.6555312,
     ...
   }
   ```

5. Complete os outros campos obrigatórios:
   - Data do evento
   - Capacidade máxima: 50
   - Valor do depósito: 25.00

6. Clique em **Criar Evento**

7. **Verificação**:
   - Evento criado com sucesso ✅
   - Redirecionado para página do evento
   - Mapa mostra a Avenida Paulista
   - Marcador vermelho no local exato

---

## 🗺️ Teste 2: Visualizar Evento no Mapa

### Passos:
1. Na página do evento criado
2. Role até a seção **Localização**
3. **Verificar**:
   - Mapa carregado ✅
   - Centralizado nas coordenadas corretas ✅
   - Marcador visível no local ✅
   - Zoom adequado (nível 15) ✅

4. **Console do Navegador**:
   - Não deve ter erros do Google Maps
   - Mapa carregado sem problemas

---

## ✏️ Teste 3: Editar Endereço do Evento

### Passos:
1. Na página do evento, clique em **Editar** (se for organizador)
2. Acesse: `/editar-evento/{id}`
3. Campo **Endereço** mostra o endereço atual
4. **Alterar Endereço**:
   - Clique no campo de endereço
   - Apague o conteúdo
   - Digite: "Rua Augusta, 2000"
   - Selecione da lista do Google

5. **Console**:
   ```
   ✅ Google Places Autocomplete inicializado!
   ✅ Endereço atualizado: {
     endereco: "Rua Augusta, 2000 - Consolação, São Paulo - SP",
     lat: -23.5555,
     lng: -46.6620
   }
   ```

6. Clique em **Salvar**
7. Volte para a visualização do evento
8. **Verificar**:
   - Endereço atualizado ✅
   - Mapa mostra novo local (Rua Augusta) ✅
   - Marcador no novo endereço ✅

---

## 🔄 Teste 4: Evento Antigo (Sem Coordenadas)

### Cenário:
Eventos criados antes da implementação não têm `latitude` e `longitude`.

### Passos:
1. Acesse um evento antigo
2. **Esperado**:
   - Mapa mostra São Paulo (coordenadas padrão)
   - SEM marcador (pois não tem coordenadas)
   - Endereço exibido normalmente

3. **Atualizar Evento**:
   - Edite o evento
   - Use o autocomplete para selecionar o endereço novamente
   - Salve
   - Agora o evento TEM coordenadas ✅

---

## 🎯 Teste 5: Diferentes Localizações

Teste com diversos endereços:

### Teste 5.1: Teatro Municipal
```
Digite: "Praça Ramos de Azevedo"
Resultado esperado: Centro de São Paulo
Lat: -23.5450, Lng: -46.6366
```

### Teste 5.2: Ibirapuera
```
Digite: "Parque Ibirapuera"
Resultado esperado: Zona Sul SP
Lat: -23.5875, Lng: -46.6575
```

### Teste 5.3: Morumbi
```
Digite: "Estádio do Morumbi"
Resultado esperado: Zona Oeste SP
Lat: -23.6002, Lng: -46.7209
```

---

## ❌ Teste 6: Sem Seleção do Autocomplete

### Passos:
1. Criar evento
2. No campo endereço, digite: "Rua Qualquer"
3. **NÃO selecione da lista**
4. Pressione Tab ou clique fora
5. **Resultado**:
   - Endereço salvo como texto
   - Latitude e longitude NÃO preenchidas
   - Mapa usará fallback (São Paulo)
   - SEM marcador

### ⚠️ Alerta Esperado:
Se tentar buscar um endereço que não existe ou não selecionar da lista:
```
"Nenhum detalhe disponível para o endereço: 'Rua Qualquer'. 
Por favor, selecione uma opção da lista."
```

---

## 🔍 Verificação no Backend

### Verificar no Django Admin ou Database:

1. Acesse: `http://localhost:8000/admin/`
2. Vá em **Eventos**
3. Abra um evento criado
4. **Campos a verificar**:
   - `endereco`: Texto completo ✅
   - `latitude`: Número decimal (ex: -23.5619) ✅
   - `longitude`: Número decimal (ex: -46.6555) ✅

### SQL Query (opcional):
```sql
SELECT titulo, endereco, latitude, longitude 
FROM api_evento 
ORDER BY created_at DESC 
LIMIT 5;
```

---

## 🐛 Troubleshooting

### Problema: Autocomplete não aparece
**Solução**:
1. Verifique `.env` tem `VITE_GOOGLE_MAPS_API_KEY`
2. Verifique console: erro de API Key?
3. Places API habilitada no Google Cloud?

### Problema: Mapa não carrega
**Solução**:
1. F12 → Console → erro?
2. API Key correta?
3. Maps JavaScript API habilitada?

### Problema: Coordenadas não salvam
**Solução**:
1. Console → log de "Endereço selecionado"?
2. FormData inclui latitude/longitude?
3. Backend aceita esses campos?

### Problema: Marcador não aparece
**Solução**:
1. Evento tem latitude e longitude?
2. Valores são números válidos?
3. Console mostra erro do Marker?

---

## ✅ Checklist Final

- [ ] Autocomplete funciona em CriarEvento
- [ ] Autocomplete funciona em EditEvent  
- [ ] Coordenadas salvas no banco
- [ ] Mapa mostra local correto
- [ ] Marcador aparece no mapa
- [ ] Eventos sem coordenadas usam fallback
- [ ] Console sem erros
- [ ] Múltiplos endereços testados
- [ ] Edição de evento atualiza mapa
- [ ] Backend retorna lat/lng na API

---

## 📊 Resultado Esperado

**Status**: ✅ Todos os testes passando

**Funcionalidades**:
- ✅ Criar evento com coordenadas
- ✅ Editar evento atualizando coordenadas
- ✅ Visualizar mapa com localização exata
- ✅ Fallback para eventos sem coordenadas
- ✅ Autocomplete do Google funcionando
- ✅ Logs informativos no console

---

**Boa sorte com os testes! 🚀**

