from django.urls import path
from .views import (
    InscricaoCreateView,
    MinhasInscricoesView,
    inscricao_detalhes,
    iniciar_inscricao_pagamento,
    confirmar_pagamento_inscricao,
    aprovar_pagamento_inscricao,
    listar_pagamentos_pendentes,
    cancelar_inscricao,
    verificar_pagamento_pendente,
    trocar_metodo_pagamento,
)

urlpatterns = [
    path('', InscricaoCreateView.as_view(), name='inscricao-create'),
    path('minhas/', MinhasInscricoesView.as_view(), name='minhas-inscricoes'),
    path('<uuid:inscricao_id>/', inscricao_detalhes, name='inscricao-detail'),
    path('registrations/<uuid:inscricao_id>/', inscricao_detalhes, name='registration-detail'),
    
    # Rotas de pagamento - usuário
    path('iniciar-pagamento/', iniciar_inscricao_pagamento, name='iniciar-inscricao-pagamento'),
    path('<uuid:inscricao_id>/confirmar-pagamento/', confirmar_pagamento_inscricao, name='confirmar-pagamento'),
    path('<uuid:inscricao_id>/trocar-metodo-pagamento/', trocar_metodo_pagamento, name='trocar-metodo-pagamento'),
    path('evento/<uuid:evento_id>/pagamento-pendente/', verificar_pagamento_pendente, name='verificar-pagamento-pendente'),

    # Rotas de pagamento - organizador
    path('<uuid:inscricao_id>/aprovar-pagamento/', aprovar_pagamento_inscricao, name='aprovar-pagamento'),
    path('evento/<uuid:evento_id>/pagamentos-pendentes/', listar_pagamentos_pendentes, name='pagamentos-pendentes'),
    
    # Cancelar inscrição
    path('<uuid:inscricao_id>/cancelar/', cancelar_inscricao, name='cancelar-inscricao'),
]

