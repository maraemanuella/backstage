# 🧪 GUIA DE TESTE - Categorias e Filtros Avançados

## 📋 Pré-requisitos

1. Backend rodando: `python manage.py runserver`
2. Frontend rodando: `npm run dev` (dentro da pasta frontend)
3. Banco de dados com alguns eventos cadastrados

---

## 🎯 TESTES A REALIZAR

### ✅ Teste 1: Criar Evento com Nova Categoria

**Objetivo:** Verificar se as novas categorias aparecem no formulário

**Passos:**
1. Acesse `/criar-evento`
2. Role até "Categorias"
3. ✅ Verifique se existem 16 categorias:
   - Workshop
   - Palestra
   - Networking
   - Curso
   - Conferência ⭐ (nova)
   - Seminário ⭐ (nova)
   - Hackathon ⭐ (nova)
   - Meetup ⭐ (nova)
   - Webinar ⭐ (nova)
   - Treinamento ⭐ (nova)
   - Festa ⭐ (nova)
   - Show ⭐ (nova)
   - Esporte ⭐ (nova)
   - Cultural ⭐ (nova)
   - Voluntariado ⭐ (nova)
   - Outro
4. Selecione "Hackathon"
5. Preencha os demais campos
6. Crie o evento
7. ✅ Evento criado com sucesso

**Resultado esperado:** ✅ Evento criado com categoria "Hackathon"

---

### ✅ Teste 2: Visualizar Novas Categorias na Home

**Objetivo:** Verificar scroll horizontal de categorias

**Passos:**
1. Acesse `/` (home)
2. Localize a barra de filtros de categorias
3. ✅ Verifique se há scroll horizontal
4. ✅ Role para ver todas as 17 opções (Todos + 16 categorias)
5. ✅ Clique em "Hackathon"
6. ✅ Página filtra apenas hackathons

**Resultado esperado:** ✅ Scroll funciona, categorias visíveis, filtro aplica corretamente

---

### ✅ Teste 3: Filtro - Apenas Eventos Gratuitos

**Objetivo:** Verificar filtro de eventos sem depósito

**Preparação:**
- Certifique-se de ter eventos com `valor_deposito = 0` e outros com `valor_deposito > 0`

**Passos:**
1. Acesse `/` (home)
2. Clique no botão "Filtros Avançados"
3. ✅ Painel expande com animação
4. Marque ☑ "Apenas eventos gratuitos"
5. Clique "Aplicar Filtros"
6. ✅ Apenas eventos com R$ 0,00 são exibidos
7. ✅ Badge mostra "1" filtro ativo

**Resultado esperado:** ✅ Somente eventos gratuitos são exibidos

**API Call esperada:**
```
GET /api/eventos/?deposito_livre=true&ordenacao=data
```

---

### ✅ Teste 4: Filtro - Próximos 7 Dias

**Objetivo:** Verificar filtro de eventos próximos

**Preparação:**
- Certifique-se de ter eventos nos próximos 7 dias e eventos mais distantes

**Passos:**
1. Acesse `/` (home)
2. Expanda "Filtros Avançados"
3. Marque ☑ "Próximos 7 dias"
4. Clique "Aplicar Filtros"
5. ✅ Apenas eventos dos próximos 7 dias são exibidos
6. ✅ Badge mostra "1" filtro ativo

**Resultado esperado:** ✅ Somente eventos até 7 dias no futuro

**API Call esperada:**
```
GET /api/eventos/?proximos=true&ordenacao=data
```

---

### ✅ Teste 5: Filtro - Range de Data

**Objetivo:** Verificar filtro por intervalo de datas

**Passos:**
1. Acesse `/` (home)
2. Expanda "Filtros Avançados"
3. Defina "Data início": `2025-12-01`
4. Defina "Data fim": `2025-12-31`
5. Clique "Aplicar Filtros"
6. ✅ Apenas eventos de dezembro são exibidos
7. ✅ Badge mostra "2" filtros ativos

**Resultado esperado:** ✅ Somente eventos entre as datas especificadas

**API Call esperada:**
```
GET /api/eventos/?data_inicio=2025-12-01&data_fim=2025-12-31&ordenacao=data
```

---

### ✅ Teste 6: Ordenação

**Objetivo:** Verificar diferentes opções de ordenação

**Passos:**
1. Acesse `/` (home)
2. Expanda "Filtros Avançados"
3. Selecione "Ordenar por: Data (mais próximo)"
4. Clique "Aplicar Filtros"
5. ✅ Eventos ordenados do mais próximo ao mais distante

6. Selecione "Ordenar por: Data (mais distante)"
7. Clique "Aplicar Filtros"
8. ✅ Eventos ordenados do mais distante ao mais próximo

9. Selecione "Ordenar por: Título (A-Z)"
10. Clique "Aplicar Filtros"
11. ✅ Eventos ordenados alfabeticamente

**Resultado esperado:** ✅ Ordenação funciona corretamente

**API Calls esperadas:**
```
GET /api/eventos/?ordenacao=data
GET /api/eventos/?ordenacao=-data
GET /api/eventos/?ordenacao=titulo
```

---

### ✅ Teste 7: Combinar Múltiplos Filtros

**Objetivo:** Verificar que múltiplos filtros funcionam juntos

**Passos:**
1. Acesse `/` (home)
2. Selecione categoria "Workshop" (na barra de categorias)
3. Expanda "Filtros Avançados"
4. Marque ☑ "Apenas eventos gratuitos"
5. Marque ☑ "Próximos 7 dias"
6. Selecione "Ordenar por: Título (A-Z)"
7. Clique "Aplicar Filtros"
8. ✅ Badge mostra "2" ou mais filtros ativos
9. ✅ Apenas workshops gratuitos dos próximos 7 dias, em ordem alfabética

**Resultado esperado:** ✅ Todos os filtros são aplicados simultaneamente

**API Call esperada:**
```
GET /api/eventos/?categoria=Workshop&deposito_livre=true&proximos=true&ordenacao=titulo
```

---

### ✅ Teste 8: Limpar Filtros

**Objetivo:** Verificar botão de limpar filtros

**Passos:**
1. Aplique vários filtros (do Teste 7)
2. ✅ Eventos filtrados são exibidos
3. ✅ Badge mostra número de filtros ativos
4. Clique "Limpar Filtros"
5. ✅ Todos os checkboxes desmarcados
6. ✅ Campos de data limpos
7. ✅ Ordenação volta para padrão
8. ✅ Badge desaparece
9. ✅ Todos os eventos são exibidos novamente

**Resultado esperado:** ✅ Filtros resetados e eventos recarregados

**API Call esperada:**
```
GET /api/eventos/?ordenacao=data
```

---

### ✅ Teste 9: Contador de Filtros Ativos

**Objetivo:** Verificar badge de contagem

**Passos:**
1. Acesse `/` (home)
2. ✅ Botão "Filtros Avançados" SEM badge
3. Expanda "Filtros Avançados"
4. Marque ☑ "Apenas eventos gratuitos"
5. ✅ Badge aparece com "1"
6. Marque ☑ "Próximos 7 dias"
7. ✅ Badge atualiza para "2"
8. Defina "Data início"
9. ✅ Badge atualiza para "3"
10. Defina "Data fim"
11. ✅ Badge atualiza para "4"
12. Desmarque "Apenas eventos gratuitos"
13. ✅ Badge volta para "3"

**Resultado esperado:** ✅ Badge conta corretamente filtros ativos

---

### ✅ Teste 10: Responsividade

**Objetivo:** Verificar layout em diferentes telas

#### Desktop (> 1024px):
1. Acesse home
2. Expanda "Filtros Avançados"
3. ✅ Grid com 4 colunas
4. ✅ Todos os filtros visíveis em 2 linhas

#### Tablet (768px - 1023px):
1. Redimensione janela para ~800px
2. ✅ Grid com 2 colunas
3. ✅ Filtros dispostos em 3-4 linhas

#### Mobile (< 768px):
1. Redimensione janela para ~375px
2. ✅ Grid com 1 coluna
3. ✅ Filtros empilhados verticalmente
4. ✅ Botões de ação ocupam largura total
5. ✅ Scroll horizontal de categorias funciona com toque

**Resultado esperado:** ✅ Layout se adapta perfeitamente

---

### ✅ Teste 11: Persistência ao Navegar

**Objetivo:** Verificar se filtros mantêm estado

**Passos:**
1. Acesse home
2. Selecione categoria "Hackathon"
3. Aplique filtros avançados
4. ✅ Eventos filtrados
5. Clique em um evento (ir para detalhes)
6. Volte para home (botão voltar do navegador)
7. ⚠️ **Esperado:** Filtros podem ser perdidos (comportamento normal)
8. ⚠️ **Opcional:** Implementar salvamento em localStorage para manter filtros

**Nota:** Atualmente não há persistência. Isso pode ser adicionado futuramente.

---

### ✅ Teste 12: Interação com Busca

**Objetivo:** Verificar se busca e filtros funcionam juntos

**Passos:**
1. Acesse home
2. Digite "Workshop" na barra de busca
3. ✅ Eventos com "Workshop" no título/endereço são filtrados
4. Selecione categoria "Palestra"
5. ✅ Busca mantém, mas API filtra por "Palestra"
6. ✅ Resultado: Palestras que contêm "Workshop" no título/endereço

**Resultado esperado:** ✅ Busca local + filtros API funcionam em conjunto

---

## 🐛 POSSÍVEIS PROBLEMAS E SOLUÇÕES

### Problema: Nenhum evento aparece após filtrar
**Causa:** Pode não haver eventos que atendam aos critérios
**Solução:** Crie eventos de teste com as características necessárias

### Problema: Erro 500 na API
**Causa:** Backend pode não estar rodando ou há erro no código
**Solução:** 
1. Verifique se o backend está rodando
2. Verifique logs do Django no terminal
3. Verifique se migrations foram aplicadas: `python manage.py migrate`

### Problema: Filtros não aplicam
**Causa:** Frontend pode não estar comunicando com backend corretamente
**Solução:**
1. Abra DevTools (F12)
2. Vá para "Network"
3. Aplique filtros
4. Verifique se a requisição foi feita
5. Verifique a URL da requisição
6. Verifique a resposta da API

### Problema: Badge não aparece
**Causa:** CSS pode estar faltando
**Solução:** Badge deve aparecer automaticamente. Verifique se o componente foi importado corretamente.

### Problema: Categorias não aparecem no scroll
**Causa:** CSS overflow pode estar incorreto
**Solução:** Verifique se `overflow-x-auto` está aplicado no container

---

## 📊 CHECKLIST DE TESTES

Marque conforme for testando:

- [ ] 16 categorias aparecem no formulário de criar evento
- [ ] Evento pode ser criado com nova categoria
- [ ] Scroll horizontal de categorias funciona na home
- [ ] Filtro por categoria funciona (via API)
- [ ] Filtro "Apenas eventos gratuitos" funciona
- [ ] Filtro "Próximos 7 dias" funciona
- [ ] Filtro por range de data funciona
- [ ] Ordenação por data (próximo) funciona
- [ ] Ordenação por data (distante) funciona
- [ ] Ordenação por título funciona
- [ ] Múltiplos filtros funcionam juntos
- [ ] Botão "Limpar Filtros" reseta tudo
- [ ] Badge de contador aparece corretamente
- [ ] Badge atualiza ao adicionar/remover filtros
- [ ] Layout responsivo em desktop
- [ ] Layout responsivo em tablet
- [ ] Layout responsivo em mobile
- [ ] Busca e filtros funcionam juntos
- [ ] Animação de expandir/colapsar funciona
- [ ] Sem erros no console do navegador
- [ ] Sem erros no console do Django

---

## 🎯 RESULTADO ESPERADO

Após todos os testes:

✅ **Backend:**
- API retorna eventos filtrados corretamente
- Todos os filtros funcionam individualmente
- Múltiplos filtros podem ser combinados
- Ordenação funciona

✅ **Frontend:**
- 16 categorias disponíveis
- Scroll horizontal funciona
- Painel de filtros expande/colapsa
- Badge contador funciona
- Todos os filtros aplicam corretamente
- Layout responsivo
- UX intuitiva

✅ **Integração:**
- Frontend e backend comunicam perfeitamente
- Query params corretos
- Eventos carregam rapidamente
- Sem erros ou warnings críticos

---

## 📝 RELATÓRIO DE BUGS

Se encontrar bugs durante o teste, documente aqui:

### Bug #1: [Título do bug]
**Severidade:** Baixa / Média / Alta / Crítica  
**Como reproduzir:**
1. Passo 1
2. Passo 2
3. ...

**Comportamento esperado:**
[Descreva]

**Comportamento atual:**
[Descreva]

**Screenshot/Log:**
[Cole aqui]

---

## ✅ APROVAÇÃO FINAL

Após completar todos os testes:

- [ ] Todos os testes passaram
- [ ] Nenhum bug crítico encontrado
- [ ] Performance aceitável
- [ ] UX/UI satisfatória
- [ ] Documentação completa

**Testado por:** _______________  
**Data:** _______________  
**Status:** ✅ APROVADO / ⚠️ APROVADO COM RESSALVAS / ❌ REPROVADO

---

**Última atualização:** 16/11/2025

