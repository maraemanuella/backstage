# Módulo de Pagamento PIX - Backstage

## 📦 Arquivos do Módulo

Este módulo foi separado para facilitar o merge e evitar conflitos. Todos os arquivos relacionados a pagamento estão isolados:

### Estrutura
```
backstage/api/
├── payment_models.py       # Mixins para campos de pagamento
├── payment_serializers.py  # Serializers de pagamento
├── payment_views.py        # Views de pagamento
└── payment_urls.py         # URLs de pagamento
```

---

## 🔧 Como Usar

### 1. Payment Models (payment_models.py)

**PaymentMixin** - Adiciona campos de pagamento a qualquer modelo:

```python
from .payment_models import PaymentMixin

class MinhaModel(PaymentMixin, models.Model):
    # Herda automaticamente:
    # - metodo_pagamento (CharField)
    # - status_pagamento (CharField)
    pass
```

**QRCodePixMixin** - Adiciona campo de QR Code PIX:

```python
from .payment_models import QRCodePixMixin

class MeuEvento(QRCodePixMixin, models.Model):
    # Herda automaticamente:
    # - qr_code_pix (ImageField)
    pass
```

### 2. Payment Serializers (payment_serializers.py)

**PaymentInscricaoCreateSerializer** - Para criar inscrições com pagamento:

```python
from .payment_serializers import PaymentInscricaoCreateSerializer

# Em suas views:
serializer = PaymentInscricaoCreateSerializer(
    data=request.data,
    context={'request': request}
)
```

**QRCodePixSerializer** - Para retornar QR Code do evento:

```python
from .payment_serializers import QRCodePixSerializer

serializer = QRCodePixSerializer(evento, context={'request': request})
qr_url = serializer.data.get('qr_code_pix_url')
```

### 3. Payment Views (payment_views.py)

Endpoints disponíveis:

- `evento_qrcode_pix`: GET QR Code de um evento
- `inscricao_pagamento_info`: GET informações de pagamento
- `atualizar_status_pagamento`: POST atualizar status
- `pagamentos_pendentes`: GET listar pendentes
- `historico_pagamentos`: GET histórico completo

### 4. Payment URLs (payment_urls.py)

As rotas são automaticamente incluídas em `/api/pagamento/`:

```
GET  /api/pagamento/evento/<uuid>/qrcode/
GET  /api/pagamento/inscricao/<uuid>/
POST /api/pagamento/inscricao/<uuid>/atualizar/
GET  /api/pagamento/pendentes/
GET  /api/pagamento/historico/
```

---

## 🔗 Integração com o Sistema Existente

### No models.py principal:

Se você quiser usar os mixins nos modelos existentes:

```python
# ANTES (com campos duplicados)
class Inscricao(models.Model):
    metodo_pagamento = models.CharField(...)
    status_pagamento = models.CharField(...)

# DEPOIS (usando mixin)
from .payment_models import PaymentMixin

class Inscricao(PaymentMixin, models.Model):
    # Outros campos...
    pass
```

### No serializers.py principal:

```python
# Importe o serializer de pagamento
from .payment_serializers import PaymentInscricaoCreateSerializer

# Use onde necessário
class MinhaView(APIView):
    def post(self, request):
        serializer = PaymentInscricaoCreateSerializer(
            data=request.data,
            context={'request': request}
        )
        # ...
```

### No urls.py principal:

Já está configurado! As rotas são incluídas automaticamente:

```python
# Em api/urls.py
urlpatterns += [
    path('pagamento/', include('api.payment_urls')),
]
```

---

## 🚀 Endpoints da API

### 1. GET QR Code do Evento

```bash
GET /api/pagamento/evento/{evento_id}/qrcode/
Authorization: Bearer {token}

Response:
{
  "evento_id": "uuid",
  "evento_titulo": "Nome do Evento",
  "qr_code_pix_url": "http://..../media/eventos/qrcodes_pix/qr.png",
  "tem_qr_code": true
}
```

### 2. GET Informações de Pagamento da Inscrição

```bash
GET /api/pagamento/inscricao/{inscricao_id}/
Authorization: Bearer {token}

Response:
{
  "inscricao_id": "uuid",
  "metodo_pagamento": "pix",
  "status_pagamento": "aprovado",
  "valor_original": 100.00,
  "valor_final": 85.00,
  "desconto_aplicado": 15.00,
  "qr_code_pix_url": "http://...",
  "evento": {
    "id": "uuid",
    "titulo": "Evento Teste",
    "data_evento": "2025-11-10T19:00:00Z"
  }
}
```

### 3. POST Atualizar Status de Pagamento

```bash
POST /api/pagamento/inscricao/{inscricao_id}/atualizar/
Authorization: Bearer {token}
Content-Type: application/json

{
  "status_pagamento": "aprovado"
}

Response:
{
  "message": "Status de pagamento atualizado com sucesso",
  "inscricao_id": "uuid",
  "status_pagamento": "aprovado"
}
```

### 4. GET Pagamentos Pendentes

```bash
GET /api/pagamento/pendentes/
Authorization: Bearer {token}

Response:
{
  "count": 2,
  "pagamentos_pendentes": [
    {
      "inscricao_id": "uuid",
      "evento_id": "uuid",
      "evento_titulo": "Evento 1",
      "valor_final": 85.00,
      "data_inscricao": "2025-11-03T10:00:00Z"
    }
  ]
}
```

### 5. GET Histórico de Pagamentos

```bash
GET /api/pagamento/historico/
Authorization: Bearer {token}

Response:
{
  "count": 5,
  "historico": [
    {
      "inscricao_id": "uuid",
      "evento_titulo": "Evento 1",
      "metodo_pagamento": "pix",
      "status_pagamento": "aprovado",
      "valor_final": 85.00,
      "desconto_aplicado": 15.00,
      "data_inscricao": "2025-11-03T10:00:00Z"
    }
  ]
}
```

---

## 🔄 Migrações

Se você estiver aplicando os mixins em modelos existentes, será necessário criar uma migration:

```bash
cd backstage
python manage.py makemigrations
python manage.py migrate
```

**Nota:** Como os campos já existem em Evento e Inscricao, NÃO é necessário criar migration. Os mixins são apenas para organização do código.

---

## 📝 Notas Importantes

### Vantagens da Separação

1. **Sem Conflitos de Merge:** Arquivos independentes
2. **Fácil Manutenção:** Código relacionado junto
3. **Reutilização:** Mixins podem ser usados em outros modelos
4. **Testes Isolados:** Testar apenas o módulo de pagamento
5. **Documentação Clara:** README específico

### Compatibilidade

- ✅ Mantém compatibilidade com código existente
- ✅ Não quebra endpoints antigos
- ✅ Adiciona novos endpoints sem conflitos
- ✅ Mixins são opcionais (não obrigatórios)

### Frontend

O frontend pode usar tanto os endpoints antigos quanto os novos:

**Antigo (ainda funciona):**
```javascript
// Buscar resumo com QR Code
await api.get(`/api/eventos/${id}/resumo-inscricao/`)
```

**Novo (recomendado):**
```javascript
// Buscar apenas QR Code
await api.get(`/api/pagamento/evento/${id}/qrcode/`)

// Buscar info de pagamento
await api.get(`/api/pagamento/inscricao/${id}/`)
```

---

## 🧪 Testes

Para testar o módulo isoladamente:

```bash
# Teste endpoints
curl http://localhost:8000/api/pagamento/evento/{uuid}/qrcode/ \
  -H "Authorization: Bearer {token}"

# Teste criação de inscrição com pagamento
curl -X POST http://localhost:8000/api/inscricoes/ \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "evento": "uuid",
    "nome_completo_inscricao": "Teste",
    "cpf_inscricao": "12345678901",
    "telefone_inscricao": "11999999999",
    "email_inscricao": "teste@test.com",
    "metodo_pagamento": "pix",
    "aceita_termos": true
  }'
```

---

## 🔮 Próximos Passos

1. Adicionar webhook para confirmação automática de pagamento
2. Integrar com API bancária para gerar QR Code dinamicamente
3. Notificações por email quando pagamento confirmado
4. Dashboard de pagamentos para organizadores
5. Relatórios de receita e pagamentos

---

## 📞 Suporte

Se tiver dúvidas sobre o módulo de pagamento:
1. Leia este README
2. Verifique `DOCUMENTACAO_PAGAMENTO_PIX.md` na raiz do projeto
3. Consulte os docstrings nos arquivos Python

---

**Criado em:** 03/11/2025  
**Versão:** 1.0  
**Compatível com:** Django 5.2.7
