from django.contrib import admin
from django.conf import settings
from django.conf.urls.static import static
from django.urls import path, include
from rest_framework_simplejwt.views import TokenRefreshView

from apps.users.views import (
    CreateUserView, CustomTokenObtainView, ListUsersView,
    RetrieveUpdateUserView, DeleteUserView, MeView,
    update_user_profile, verificar_documento, status_documento
)
from apps.eventos.views import (
    EventoCreateView, EventoListView, EventoDetailView,
    evento_resumo_inscricao, ManageEventosView, EventoRetrieveUpdateView
)
from apps.inscricoes.views import (
    InscricaoCreateView, MinhasInscricoesView, inscricao_detalhes
)
from apps.avaliacoes.views import AvaliacaoListView, AvaliacaoCreateView
from apps.favoritos.views import list_favorites, toggle_favorite
from apps.transferencias.views import (
    TransferRequestCreateView, TransferRequestListView, TransferRequestDetailView
)
from apps.waitlist.views import waitlist_status, waitlist_join, waitlist_leave, waitlist_suggestions
from apps.analytics.views import (
    evento_analytics_geral, evento_analytics_demograficos, evento_analytics_interacoes,
    evento_analytics_roi, evento_analytics_atualizar_custo, evento_analytics_exportar_pdf
)
from apps.dashboard.views import dashboard_metricas
from apps.checkin.views import realizar_checkin

urlpatterns = [
    # Admin
    path('admin/', admin.site.urls),

    # Users & Authentication
    path('api/user/register/', CreateUserView.as_view(), name='register'),
    path('api/user/', ListUsersView.as_view(), name='usuario-listar'),
    path('api/user/<int:pk>/', RetrieveUpdateUserView.as_view(), name='usuario-detalhe'),
    path('api/user/<int:pk>/delete/', DeleteUserView.as_view(), name='usuario-deletar'),
    path('api/user/me/', MeView.as_view(), name='me'),
    path('api/user/profile/', update_user_profile, name='update-user-profile'),
    path('api/token/', CustomTokenObtainView.as_view(), name='get_token'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='refresh'),
    path('api/api-auth/', include('rest_framework.urls')),
    path('api/verificar-documento/', verificar_documento, name='verificar-documento'),
    path('api/status-documento/', status_documento, name='status-documento'),

    # User Management (Admin)
    path('api/user-management/', include('apps.user_management.urls')),

    # Eventos
    path('api/eventos/', EventoListView.as_view(), name='evento-list'),
    path('api/eventos/<uuid:id>/', EventoDetailView.as_view(), name='evento-detail'),
    path('api/eventos/criar/', EventoCreateView.as_view(), name='criar-evento'),
    path('api/eventos/<uuid:evento_id>/resumo-inscricao/', evento_resumo_inscricao, name='evento-resumo-inscricao'),
    path('api/manage/', ManageEventosView.as_view(), name='manage-eventos'),
    path('api/manage/eventos/<uuid:id>/', EventoRetrieveUpdateView.as_view(), name='manage-evento-detail'),

    # Inscrições
    path('api/inscricoes/', InscricaoCreateView.as_view(), name='inscricao-create'),
    path('api/inscricoes/minhas/', MinhasInscricoesView.as_view(), name='minhas-inscricoes'),
    path('api/inscricoes/<uuid:inscricao_id>/', inscricao_detalhes, name='inscricao-detail'),
    path('api/registrations/<uuid:inscricao_id>/', inscricao_detalhes, name='registration-detail'),

    # Avaliações
    path('api/eventos/<uuid:evento_id>/avaliacoes/', AvaliacaoListView.as_view(), name='avaliacao-list'),
    path('api/eventos/<uuid:evento_id>/avaliacoes/criar/', AvaliacaoCreateView.as_view(), name='avaliacao-create'),

    # Favoritos
    path('api/favorites/', list_favorites, name='list_favorites'),
    path('api/favorites/toggle/<uuid:evento_id>/', toggle_favorite, name='toggle_favorite'),

    # Transferências
    path('api/transfer-requests/', TransferRequestListView.as_view(), name='transfer-request-list'),
    path('api/transfer-requests/create/', TransferRequestCreateView.as_view(), name='transfer-request-create'),
    path('api/transfer-requests/<int:pk>/', TransferRequestDetailView.as_view(), name='transfer-request-detail'),

    # Waitlist
    path('api/waitlist/<uuid:event_id>/status/', waitlist_status, name='waitlist-status'),
    path('api/waitlist/<uuid:event_id>/join/', waitlist_join, name='waitlist-join'),
    path('api/waitlist/<uuid:event_id>/leave/', waitlist_leave, name='waitlist-leave'),
    path('api/waitlist/<uuid:event_id>/suggestions/', waitlist_suggestions, name='waitlist-suggestions'),

    # Analytics
    path('api/eventos/<uuid:evento_id>/analytics/geral/', evento_analytics_geral, name='evento-analytics-geral'),
    path('api/eventos/<uuid:evento_id>/analytics/demograficos/', evento_analytics_demograficos, name='evento-analytics-demograficos'),
    path('api/eventos/<uuid:evento_id>/analytics/interacoes/', evento_analytics_interacoes, name='evento-analytics-interacoes'),
    path('api/eventos/<uuid:evento_id>/analytics/roi/', evento_analytics_roi, name='evento-analytics-roi'),
    path('api/eventos/<uuid:evento_id>/analytics/atualizar-custo/', evento_analytics_atualizar_custo, name='evento-analytics-atualizar-custo'),
    path('api/eventos/<uuid:evento_id>/analytics/exportar-pdf/', evento_analytics_exportar_pdf, name='evento-analytics-exportar-pdf'),

    # Dashboard
    path('api/dashboard/metricas/', dashboard_metricas, name='dashboard-metricas'),

    # Check-in
    path('api/checkin/<uuid:inscricao_id>/', realizar_checkin, name='realizar-checkin'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

