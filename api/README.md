# API Backstage - Estrutura Modular

## 📁 Estrutura de Módulos

A API foi reorganizada em uma estrutura modular, onde cada módulo possui seus próprios arquivos de models, views, serializers e URLs.

```
api/
├── __init__.py
├── models.py              # Arquivo centralizador de models
├── admin.py               # Django Admin
├── apps.py                # Configuração da app
├── urls.py                # URLs principais (integra todos os módulos)
│
├── users/                 # Módulo de Usuários
│   ├── __init__.py
│   ├── models.py         # CustomUser, CustomUserManager
│   ├── serializers.py    # UserSerializer, CustomTokenSerializer
│   ├── views.py          # CreateUserView, MeView, etc.
│   └── urls.py           # /api/user/*
│
├── events/                # Módulo de Eventos
│   ├── __init__.py
│   ├── models.py         # Evento, Avaliacao
│   ├── serializers.py    # EventoSerializer, AvaliacaoSerializer
│   ├── views.py          # EventoCreateView, EventoListView, etc.
│   └── urls.py           # /api/eventos/*
│
├── registrations/         # Módulo de Inscrições
│   ├── __init__.py
│   ├── models.py         # Inscricao
│   ├── serializers.py    # InscricaoSerializer, InscricaoCreateSerializer
│   ├── views.py          # InscricaoCreateView, realizar_checkin, etc.
│   └── urls.py           # /api/inscricoes/* e /api/registrations/*
│
├── analytics/             # Módulo de Analytics
│   ├── __init__.py
│   ├── models.py         # EventoAnalytics, InteracaoSimulador, VisualizacaoEvento
│   ├── serializers.py    # EventoAnalyticsSerializer, etc.
│   ├── views.py          # evento_analytics_geral, evento_analytics_roi, etc.
│   └── urls.py           # /api/analytics/*
│
├── waitlist/              # Módulo de Lista de Espera
│   ├── __init__.py
│   ├── models.py         # WaitlistEntry
│   ├── views.py          # waitlist_status, waitlist_join, etc.
│   └── urls.py           # /api/waitlist/*
│
├── transfers/             # Módulo de Transferências
│   ├── __init__.py
│   ├── models.py         # TransferRequest
│   ├── serializers.py    # TransferRequestSerializer
│   ├── views.py          # TransferRequestCreateView, etc.
│   └── urls.py           # /api/transfer-requests/*
│
└── favorites/             # Módulo de Favoritos
    ├── __init__.py
    ├── models.py         # Favorite
    ├── serializers.py    # FavoriteSerializer
    ├── views.py          # list_favorites, toggle_favorite
    └── urls.py           # /api/favorites/*
```

## 🔗 Rotas da API

### Usuários (`/api/user/`)
- `POST /api/user/register/` - Registrar novo usuário
- `POST /api/user/token/` - Obter token JWT
- `POST /api/user/token/refresh/` - Atualizar token
- `GET /api/user/me/` - Dados do usuário logado
- `PATCH /api/user/profile/` - Atualizar perfil
- `POST /api/user/verificar-documento/` - Verificar documento
- `GET /api/user/status-documento/` - Status da verificação

### Eventos (`/api/eventos/`)
- `GET /api/eventos/` - Listar eventos públicos
- `POST /api/eventos/criar/` - Criar evento
- `GET /api/eventos/<id>/` - Detalhe do evento
- `GET /api/eventos/<id>/resumo-inscricao/` - Resumo para inscrição
- `GET /api/eventos/<id>/avaliacoes/` - Listar avaliações
- `POST /api/eventos/<id>/avaliacoes/criar/` - Criar avaliação
- `GET /api/eventos/manage/` - Eventos do organizador
- `GET /api/eventos/dashboard/metricas/` - Métricas do dashboard

### Inscrições (`/api/inscricoes/` ou `/api/registrations/`)
- `POST /api/inscricoes/` - Criar inscrição
- `GET /api/inscricoes/minhas/` - Minhas inscrições
- `GET /api/inscricoes/<id>/` - Detalhe da inscrição
- `POST /api/inscricoes/checkin/<id>/` - Realizar check-in

### Analytics (`/api/analytics/`)
- `GET /api/analytics/eventos/<id>/geral/` - Métricas gerais
- `GET /api/analytics/eventos/<id>/demograficos/` - Dados demográficos
- `GET /api/analytics/eventos/<id>/interacoes/` - Interações
- `GET /api/analytics/eventos/<id>/roi/` - ROI do evento
- `POST /api/analytics/eventos/<id>/atualizar-custo/` - Atualizar custo
- `GET /api/analytics/eventos/<id>/exportar-pdf/` - Exportar PDF

### Waitlist (`/api/waitlist/`)
- `GET /api/waitlist/<id>/status/` - Status da fila
- `POST /api/waitlist/<id>/join/` - Entrar na fila
- `POST /api/waitlist/<id>/leave/` - Sair da fila
- `GET /api/waitlist/<id>/suggestions/` - Sugestões de eventos

### Transferências (`/api/transfer-requests/`)
- `GET /api/transfer-requests/` - Listar transferências
- `POST /api/transfer-requests/create/` - Criar transferência
- `PATCH /api/transfer-requests/<id>/` - Aceitar/Rejeitar

### Favoritos (`/api/favorites/`)
- `GET /api/favorites/` - Listar favoritos
- `POST /api/favorites/toggle/<id>/` - Adicionar/Remover favorito

## 🎯 Vantagens da Estrutura Modular

1. **Separação de Responsabilidades**: Cada módulo é responsável por sua própria lógica
2. **Facilidade de Manutenção**: Código organizado e fácil de localizar
3. **Escalabilidade**: Fácil adicionar novos módulos
4. **Reutilização**: Módulos podem ser reutilizados em outros projetos
5. **Testabilidade**: Cada módulo pode ser testado independentemente
6. **Colaboração**: Múltiplos desenvolvedores podem trabalhar em módulos diferentes

## 📝 Migrações

Para aplicar as mudanças no banco de dados:

```bash
python manage.py makemigrations
python manage.py migrate
```

## ⚙️ Configuração

O arquivo `api/models.py` centraliza todos os models para facilitar as migrations do Django.
Cada módulo define seus models localmente, mas são importados no arquivo central.

## 🔄 Compatibilidade

A nova estrutura mantém compatibilidade com o frontend existente através de:
- Rotas duplicadas quando necessário (ex: `/inscricoes/` e `/registrations/`)
- Mesma estrutura de resposta JSON
- Mesmo comportamento das views

