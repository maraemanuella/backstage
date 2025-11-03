"""
Arquivo centralizado de models para o Django Admin e Migrations
Este arquivo importa todos os models dos módulos para que o Django os reconheça
"""

# Users models
from api.users.models import CustomUser, CustomUserManager

# Events models
from api.events.models import Evento, Avaliacao

# Registrations models
from api.registrations.models import Inscricao

# Analytics models
from api.analytics.models import EventoAnalytics, InteracaoSimulador, VisualizacaoEvento

# Waitlist models
from api.waitlist.models import WaitlistEntry

# Transfers models
from api.transfers.models import TransferRequest

# Favorites models
from api.favorites.models import Favorite


__all__ = [
    'CustomUser',
    'CustomUserManager',
    'Evento',
    'Avaliacao',
    'Inscricao',
    'EventoAnalytics',
    'InteracaoSimulador',
    'VisualizacaoEvento',
    'WaitlistEntry',
    'TransferRequest',
    'Favorite',
]

