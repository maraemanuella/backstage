# 🔍 Troubleshooting - Botão de Check-in Não Aparece

## ❌ Problema Reportado

O botão "Fazer Check-in" **não está aparecendo** na página EventDescription, mesmo quando o usuário está inscrito.

---

## ✅ Solução Implementada

### 1. **Logs de Debug Adicionados**

Agora o código exibe logs detalhados no console para identificar o problema:

```javascript
console.log('📋 Dados do resumo de inscrição:', res.data);
console.log('✅ Está inscrito:', res.data.ja_inscrito);
console.log('🎫 ID da inscrição capturado:', res.data.inscricao_id);
console.log('🔍 Estados do botão de check-in:', {
  isRegistered,
  inscricaoId,
  mostrarBotao: isRegistered && inscricaoId
});
```

### 2. **Fallback para Buscar Inscrição**

Se o backend não retornar `inscricao_id`, o código agora busca automaticamente:

```javascript
// Se inscricao_id não vier no resumo
if (!res.data.inscricao_id) {
  // Busca todas as inscrições do usuário
  const inscricaoRes = await api.get('/api/inscricoes/minhas/', { 
    headers: { Authorization: `Bearer ${token}` } 
  });
  
  // Encontra a inscrição deste evento
  const inscricao = inscricaoRes.data.find(
    i => i.evento === eventId || i.evento?.id === eventId
  );
  
  if (inscricao) {
    setInscricaoId(inscricao.id);
  }
}
```

---

## 🧪 Como Debugar

### Passo 1: Abrir Console do Navegador
1. Pressione **F12** para abrir DevTools
2. Vá para aba **Console**

### Passo 2: Acessar Página do Evento
1. Faça login
2. Inscreva-se em um evento
3. Acesse a página do evento

### Passo 3: Verificar Logs

#### Logs Esperados (SUCESSO):
```
📋 Dados do resumo de inscrição: {ja_inscrito: true, inscricao_id: "abc-123"}
✅ Está inscrito: true
🎫 ID da inscrição capturado: abc-123
🔍 Estados do botão de check-in: {
  isRegistered: true,
  inscricaoId: "abc-123",
  mostrarBotao: true
}
```
**Resultado**: Botão DEVE aparecer ✅

#### Logs de Problema 1 (Sem inscricao_id no resumo):
```
📋 Dados do resumo de inscrição: {ja_inscrito: true}
✅ Está inscrito: true
⚠️ inscricao_id não retornado pelo backend
📝 Inscrições do usuário: [{id: "abc-123", evento: "xyz-789", ...}]
🎫 ID da inscrição encontrado via /api/inscricoes/minhas/: abc-123
🔍 Estados do botão de check-in: {
  isRegistered: true,
  inscricaoId: "abc-123",
  mostrarBotao: true
}
```
**Resultado**: Botão DEVE aparecer (via fallback) ✅

#### Logs de Problema 2 (Não inscrito):
```
📋 Dados do resumo de inscrição: {ja_inscrito: false}
✅ Está inscrito: false
🔍 Estados do botão de check-in: {
  isRegistered: false,
  inscricaoId: null,
  mostrarBotao: false
}
```
**Resultado**: Botão NÃO aparece (correto) ✅

#### Logs de Problema 3 (Inscrição não encontrada):
```
📋 Dados do resumo de inscrição: {ja_inscrito: true}
✅ Está inscrito: true
⚠️ inscricao_id não retornado pelo backend
📝 Inscrições do usuário: []
❌ Nenhuma inscrição encontrada para este evento
🔍 Estados do botão de check-in: {
  isRegistered: true,
  inscricaoId: null,
  mostrarBotao: false
}
```
**Resultado**: Botão NÃO aparece ❌ **PROBLEMA IDENTIFICADO**

---

## 🔧 Possíveis Causas e Soluções

### Causa 1: Backend não retorna `inscricao_id`
**Sintoma**: Log mostra "⚠️ inscricao_id não retornado pelo backend"

**Solução**: 
- O código agora busca automaticamente via `/api/inscricoes/minhas/`
- Se o log mostrar "🎫 ID da inscrição encontrado", está resolvido

**Ação**: Nenhuma, o código já resolve automaticamente ✅

### Causa 2: Endpoint `/api/eventos/{id}/resumo-inscricao/` não existe
**Sintoma**: Log mostra "❌ Erro ao buscar resumo"

**Solução Backend**:
```python
# Criar endpoint em api/events/views.py
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def resumo_inscricao(request, evento_id):
    evento = get_object_or_404(Evento, id=evento_id)
    inscricao = Inscricao.objects.filter(
        evento=evento,
        usuario=request.user
    ).first()
    
    return Response({
        'ja_inscrito': inscricao is not None,
        'inscricao_id': inscricao.id if inscricao else None
    })
```

### Causa 3: Inscrição existe mas não é retornada
**Sintoma**: Log mostra "❌ Nenhuma inscrição encontrada para este evento"

**Verificar**:
1. Inscrição foi criada corretamente?
2. Status da inscrição é 'confirmada'?
3. Evento ID está correto?

**Debug SQL**:
```sql
SELECT * FROM api_inscricao 
WHERE evento_id = '{eventId}' 
AND usuario_id = {userId};
```

### Causa 4: Comparação de IDs falha
**Sintoma**: Inscrição existe mas `find()` retorna undefined

**Problema**: IDs podem ser strings vs UUID

**Solução**: Código já trata ambos:
```javascript
const inscricao = inscricaoRes.data.find(
  i => i.evento === eventId || i.evento?.id === eventId
);
```

---

## 📋 Checklist de Verificação

- [ ] Console está aberto (F12)
- [ ] Usuário está autenticado
- [ ] Usuário está inscrito no evento
- [ ] Log "📋 Dados do resumo" aparece
- [ ] Log "✅ Está inscrito: true" aparece
- [ ] Log "🎫 ID da inscrição" aparece (direto ou via fallback)
- [ ] Log "🔍 Estados" mostra `mostrarBotao: true`
- [ ] Botão azul "Fazer Check-in" está visível

---

## 🛠️ Ações Corretivas

### Se `ja_inscrito: true` mas sem `inscricao_id`:

1. **Verificar backend** retorna o campo:
```python
# api/events/views.py
return Response({
    'ja_inscrito': True,
    'inscricao_id': str(inscricao.id)  # ← Adicionar este campo
})
```

2. **Ou confiar no fallback** (já implementado):
   - Código busca via `/api/inscricoes/minhas/`
   - Encontra automaticamente

### Se `inscricaoRes.data` está vazio:

1. **Verificar endpoint** `/api/inscricoes/minhas/`:
```python
# api/registrations/views.py
class MinhasInscricoesView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        inscricoes = Inscricao.objects.filter(usuario=request.user)
        serializer = InscricaoSerializer(inscricoes, many=True)
        return Response(serializer.data)
```

2. **Verificar serializer** inclui `id` e `evento`:
```python
class InscricaoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Inscricao
        fields = ['id', 'evento', 'status', ...]  # ← Incluir 'id' e 'evento'
```

---

## 🎯 Teste Final

Execute este código no console para testar manualmente:

```javascript
// 1. Verificar inscrições
const token = localStorage.getItem('access');
const eventId = '{seu-event-id}';

fetch(`${API_URL}/api/inscricoes/minhas/`, {
  headers: { Authorization: `Bearer ${token}` }
})
.then(r => r.json())
.then(data => {
  console.log('Todas inscrições:', data);
  const inscricao = data.find(i => i.evento === eventId || i.evento?.id === eventId);
  console.log('Inscrição do evento:', inscricao);
});

// 2. Verificar resumo
fetch(`${API_URL}/api/eventos/${eventId}/resumo-inscricao/`, {
  headers: { Authorization: `Bearer ${token}` }
})
.then(r => r.json())
.then(data => console.log('Resumo:', data));
```

---

## 📊 Status Atual

**Código Atualizado com:**
- ✅ Logs detalhados de debug
- ✅ Fallback para buscar inscrição
- ✅ Endpoint correto `/api/inscricoes/minhas/`
- ✅ Tratamento de erro robusto
- ✅ Verificação dupla de IDs (string e objeto)

**Próximos Passos:**
1. Recarregue a página
2. Abra o console
3. Verifique os logs
4. Se `mostrarBotao: true`, o botão deve aparecer
5. Se não, copie os logs e compartilhe

---

**Data de Atualização**: 02/11/2025

