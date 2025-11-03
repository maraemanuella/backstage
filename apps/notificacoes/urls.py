from django.urls import path
from . import views

urlpatterns = [
    # Listar notificações
    path('', views.ListNotificacoesView.as_view(), name='notificacoes-list'),
    
    # Contador de não lidas
    path('contador/', views.contador_nao_lidas, name='notificacoes-contador'),
    
    # Marcar como lida
    path('<int:notificacao_id>/marcar-lida/', views.marcar_notificacao_lida, name='notificacao-marcar-lida'),
    
    # Marcar todas como lidas
    path('marcar-todas-lidas/', views.marcar_todas_lidas, name='notificacoes-marcar-todas-lidas'),
    
    # Deletar notificação
    path('<int:notificacao_id>/deletar/', views.deletar_notificacao, name='notificacao-deletar'),
]
