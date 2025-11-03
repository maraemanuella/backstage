# Guia de Migração - Backstage API

## ✅ Estrutura Modular Criada com Sucesso!

A API foi reorganizada em uma estrutura modular completa em `backstage/api/` com os seguintes módulos:

### 📁 Estrutura Criada

```
backstage/api/
├── __init__.py
├── models.py              # ✅ Centralizador de models
├── admin.py               # ✅ Django Admin configurado
├── apps.py                # ✅ App config
├── urls.py                # ✅ URLs principais que integra todos os módulos
├── migrations/            # ✅ Migrations copiadas da estrutura antiga
│
├── users/                 # ✅ Módulo de Usuários
│   ├── models.py         # CustomUser, CustomUserManager
│   ├── serializers.py    # UserSerializer, CustomTokenSerializer
│   ├── views.py          # CreateUserView, MeView, etc.
│   └── urls.py           # /api/user/*
│
├── events/                # ✅ Módulo de Eventos  
│   ├── models.py         # Evento, Avaliacao
│   ├── serializers.py    # EventoSerializer, AvaliacaoSerializer
│   ├── views.py          # EventoCreateView, EventoListView, etc.
│   └── urls.py           # /api/eventos/*
│
├── registrations/         # ✅ Módulo de Inscrições
│   ├── models.py         # Inscricao
│   ├── serializers.py    # InscricaoSerializer
│   ├── views.py          # InscricaoCreateView, realizar_checkin
│   └── urls.py           # /api/inscricoes/* e /api/registrations/*
│
├── analytics/             # ✅ Módulo de Analytics
│   ├── models.py         # EventoAnalytics, InteracaoSimulador
│   ├── serializers.py    # Analytics serializers
│   ├── views.py          # evento_analytics_geral, roi, etc.
│   └── urls.py           # /api/analytics/*
│
├── waitlist/              # ✅ Módulo de Lista de Espera
│   ├── models.py         # WaitlistEntry
│   ├── views.py          # waitlist_status, join, leave
│   └── urls.py           # /api/waitlist/*
│
├── transfers/             # ⚠️ Módulo de Transferências (views precisa ser recriado)
│   ├── models.py         # TransferRequest
│   ├── serializers.py    # TransferRequestSerializer
│   ├── views.py          # PRECISA SER RECRIADO
│   └── urls.py           # /api/transfer-requests/*
│
└── favorites/             # ⚠️ Módulo de Favoritos (views precisa ser recriado)
    ├── models.py         # Favorite
    ├── serializers.py    # FavoriteSerializer
    ├── views.py          # PRECISA SER RECRIADO
    └── urls.py           # /api/favorites/*
```

## ⚠️ Arquivos que Precisam Ser Recriados

Devido a problemas no processo de cópia, os seguintes arquivos precisam ser manualmente recriados:

1. **`backstage/api/favorites/views.py`**
2. **`backstage/api/transfers/views.py`**

### Conteúdo para `backstage/api/favorites/views.py`:

```python
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from api.favorites.models import Favorite
from api.favorites.serializers import FavoriteSerializer
from api.events.models import Evento


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_favorites(request):
    favorites = Favorite.objects.filter(user=request.user)
    serializer = FavoriteSerializer(favorites, many=True, context={'request': request})
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def toggle_favorite(request, evento_id):
    user = request.user
    evento = get_object_or_404(Evento, id=evento_id)
    favorite, created = Favorite.objects.get_or_create(user=user, evento=evento)

    if not created:
        favorite.delete()
        return Response({"favorito": False})
    
    return Response({"favorito": True})
```

### Conteúdo para `backstage/api/transfers/views.py`:

```python
from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db import models
from api.transfers.models import TransferRequest
from api.transfers.serializers import TransferRequestSerializer


class TransferRequestCreateView(generics.CreateAPIView):
    queryset = TransferRequest.objects.all()
    serializer_class = TransferRequestSerializer
    permission_classes = [IsAuthenticated]

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context


class TransferRequestListView(generics.ListAPIView):
    serializer_class = TransferRequestSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return TransferRequest.objects.filter(
            models.Q(from_user=user) | models.Q(to_user=user)
        ).order_by('-created_at')


class TransferRequestDetailView(generics.RetrieveUpdateAPIView):
    queryset = TransferRequest.objects.all()
    serializer_class = TransferRequestSerializer
    permission_classes = [IsAuthenticated]

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

    def update(self, request, *args, **kwargs):
        transfer_request = self.get_object()
        status_update = request.data.get('status')

        if transfer_request.to_user != request.user and not request.user.is_staff:
            return Response({'error': 'Apenas o destinatário ou um admin pode aceitar ou negar.'}, status=status.HTTP_403_FORBIDDEN)
        
        if status_update not in ['accepted', 'denied']:
            return Response({'error': 'Status inválido.'}, status=status.HTTP_400_BAD_REQUEST)
        
        transfer_request.status = status_update

        if status_update == 'accepted':
            inscricao = transfer_request.inscricao
            inscricao.usuario = transfer_request.to_user
            inscricao.status = 'transferida'
            inscricao.nome_completo_inscricao = transfer_request.to_user.get_full_name() or transfer_request.to_user.username
            inscricao.cpf_inscricao = transfer_request.to_user.cpf
            inscricao.telefone_inscricao = transfer_request.to_user.telefone
            inscricao.email_inscricao = transfer_request.to_user.email
            inscricao.save()
            
        transfer_request.save()
        serializer = self.get_serializer(transfer_request)
        return Response(serializer.data)
```

## 🔄 Próximos Passos

1. **Copie manualmente os conteúdos acima** para os arquivos mencionados
2. **Teste a estrutura**:
   ```bash
   cd E:\repositorios\backstage\backstage
   python manage.py check
   ```
3. **Teste as migrations**:
   ```bash
   python manage.py makemigrations --dry-run
   python manage.py migrate
   ```
4. **Inicie o servidor**:
   ```bash
   python manage.py runserver
   ```

## 📝 O Que Foi Realizado

### Imports

**Antes:**
```python
from api.models import Evento, CustomUser, Inscricao
from api.serializers import EventoSerializer
from api.views import EventoListView
```

**Depois:**
```python
from api.events.models import Evento
from api.users.models import CustomUser
from api.registrations.models import Inscricao
from api.events.serializers import EventoSerializer
from api.events.views import EventoListView
```

### URLs

As URLs foram reorganizadas mas mantêm compatibilidade:

- `/api/eventos/` → **Mantido** (eventos públicos)
- `/api/user/` → **Mantido** (usuários)
- `/api/inscricoes/` → **Mantido** (inscrições)
- `/api/registrations/` → **Mantido** (alias para inscricoes)

### Models

Todos os models agora têm:
- `db_table` explícito (ex: `api_evento`, `api_customuser`)
- `app_label = 'api'` para manter compatibilidade com migrations
- ForeignKeys usando strings (ex: `'users.CustomUser'`, `'events.Evento'`)

## ⚠️ Possíveis Problemas

### 1. Imports Circulares

Se encontrar imports circulares, use lazy imports:
```python
# Ao invés de:
from api.events.models import Evento

# Use:
def get_evento_model():
    from api.events.models import Evento
    return Evento
```

### 2. Migrations Conflitantes

Se houver conflito de migrations:
```bash
python manage.py migrate --fake api zero
python manage.py migrate
```

### 3. Django Admin

O admin foi atualizado em `api/admin.py`. Verifique se todos os models estão registrados.

## 🧪 Testes

Após migração, teste:

1. ✅ Autenticação (login/register)
2. ✅ CRUD de Eventos
3. ✅ CRUD de Inscrições
4. ✅ Analytics
5. ✅ Waitlist
6. ✅ Transferências
7. ✅ Favoritos
8. ✅ Check-in
9. ✅ Dashboard

## 🔙 Rollback (se necessário)

Se precisar voltar para a estrutura antiga:

1. Alterar `backstage/settings.py` - remover módulos da API
2. Alterar `backstage/urls.py` - usar `'api.urls'` antigo
3. Executar `python manage.py migrate`

## 📞 Suporte

Em caso de dúvidas ou problemas:
- Verifique os logs do Django
- Consulte a documentação em `api/README.md`
- Revise as mudanças em cada módulo

## 🎉 Benefícios da Nova Estrutura

- ✅ Código mais organizado e legível
- ✅ Facilita manutenção e evolução
- ✅ Permite trabalho em paralelo por múltiplos devs
- ✅ Facilita testes unitários por módulo
- ✅ Preparado para crescimento futuro

