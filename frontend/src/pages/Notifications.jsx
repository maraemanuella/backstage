import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  FaBell, 
  FaTicketAlt, 
  FaCalendarAlt, 
  FaExchangeAlt, 
  FaStar, 
  FaInfoCircle,
  FaTrash,
  FaCheckDouble,
  FaFilter,
  FaArrowLeft
} from "react-icons/fa";
import api from "../api";
import { toast } from "react-toastify";
import Header from "../components/Header";
import Modal from "../components/Modal";

function Notifications() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const ITEMS_PER_PAGE = 20;

  const notificationTypes = [
    { value: "", label: "Todos os Tipos" },
    { value: "vaga_lista_espera", label: "Vaga na Lista de Espera" },
    { value: "evento_proximo", label: "Evento Próximo" },
    { value: "transferencia", label: "Transferência" },
    { value: "avaliacao", label: "Avaliação" },
    { value: "sistema", label: "Sistema" },
    { value: "evento_cancelado", label: "Evento Cancelado" },
    { value: "evento_modificado", label: "Evento Modificado" },
    { value: "inscricao_confirmada", label: "Inscrição Confirmada" },
    { value: "inscricao_cancelada", label: "Inscrição Cancelada" },
    { value: "favorito_novo_evento", label: "Favorito - Novo Evento" },
    { value: "outros", label: "Outros" }
  ];

  const getNotificationIcon = (tipo) => {
    const iconMap = {
      vaga_lista_espera: <FaTicketAlt className="text-green-500" />,
      evento_proximo: <FaCalendarAlt className="text-blue-500" />,
      transferencia: <FaExchangeAlt className="text-orange-500" />,
      avaliacao: <FaStar className="text-yellow-500" />,
      sistema: <FaBell className="text-purple-500" />,
      evento_cancelado: <FaBell className="text-red-500" />,
      evento_modificado: <FaBell className="text-yellow-500" />,
      inscricao_confirmada: <FaTicketAlt className="text-green-500" />,
      inscricao_cancelada: <FaTicketAlt className="text-red-500" />,
      favorito_novo_evento: <FaStar className="text-blue-500" />,
      outros: <FaInfoCircle className="text-gray-500" />
    };
    return iconMap[tipo] || <FaBell className="text-gray-500" />;
  };

  const fetchNotifications = async (pageNum = 1, reset = false) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (filterType) params.append("tipo", filterType);
      if (filterStatus) params.append("lida", filterStatus);
      params.append("page", pageNum);
      params.append("page_size", ITEMS_PER_PAGE);

      const response = await api.get(`/api/notificacoes/?${params.toString()}`);
      
      if (reset) {
        setNotifications(response.data.results || response.data);
      } else {
        setNotifications(prev => [...prev, ...(response.data.results || response.data)]);
      }
      
      setHasMore(!!response.data.next);
    } catch (error) {
      console.error("Erro ao buscar notificações:", error);
      toast.error("Erro ao carregar notificações");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Carrega usuário para Header/Modal
    (async () => {
      try {
        const res = await api.get("api/user/me/");
        setUser(res.data);
      } catch (e) {
        // se falhar, mantém null
      }
    })();

    setPage(1);
    fetchNotifications(1, true);
  }, [filterType, filterStatus]);

  const markAsRead = async (id, link) => {
    try {
      await api.patch(`/api/notificacoes/${id}/marcar-lida/`);
      
      // Atualizar estado local
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, lida: true } : n)
      );

      // Navegar se houver link
      if (link) {
        navigate(link);
      }
    } catch (error) {
      console.error("Erro ao marcar notificação como lida:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.post("/api/notificacoes/marcar-todas-lidas/");
      
      // Atualizar estado local
      setNotifications(prev => 
        prev.map(n => ({ ...n, lida: true }))
      );
      
      toast.success("Todas as notificações foram marcadas como lidas");
    } catch (error) {
      console.error("Erro ao marcar todas como lidas:", error);
      toast.error("Erro ao marcar todas como lidas");
    }
  };

  const deleteNotification = async (id) => {
    if (!window.confirm("Deseja realmente excluir esta notificação?")) {
      return;
    }

    try {
      await api.delete(`/api/notificacoes/${id}/`);
      
      // Remover do estado local
      setNotifications(prev => prev.filter(n => n.id !== id));
      
      toast.success("Notificação excluída");
    } catch (error) {
      console.error("Erro ao excluir notificação:", error);
      toast.error("Erro ao excluir notificação");
    }
  };

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchNotifications(nextPage, false);
  };

  const unreadCount = notifications.filter(n => !n.lida).length;

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Modal lateral e Header padrão */}
      <Modal isOpen={openModal} setOpenModal={setOpenModal} user={user} />
      <Header user={user} setOpenModal={setOpenModal} />

      <div className="py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/')}
                className="inline-flex items-center gap-2 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-100 px-3 py-2 rounded-md border border-gray-200"
                aria-label="Voltar para a Home"
              >
                <FaArrowLeft />
                Voltar
              </button>

              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-3">
                <FaBell className="text-blue-600" />
                Notificações
              </h1>
              {unreadCount > 0 && (
                <p className="text-sm text-gray-600 mt-1">
                  Você tem {unreadCount} {unreadCount === 1 ? "notificação não lida" : "notificações não lidas"}
                </p>
              )}
            </div>
            
            {notifications.length > 0 && unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium"
              >
                <FaCheckDouble />
                Marcar todas como lidas
              </button>
            )}
          </div>

          {/* Filtros */}
          <div className="mt-6 flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <FaFilter className="text-gray-500" />
                Tipo de Notificação
              </label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {notificationTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Todas</option>
                <option value="false">Não Lidas</option>
                <option value="true">Lidas</option>
              </select>
            </div>
          </div>
        </div>

        {/* Lista de Notificações */}
        <div className="space-y-3">
          {loading && page === 1 ? (
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-4">Carregando notificações...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <FaBell className="text-6xl text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                Nenhuma notificação
              </h3>
              <p className="text-gray-500">
                Você não tem notificações no momento
              </p>
            </div>
          ) : (
            <>
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`bg-white rounded-lg shadow-sm p-4 transition-all hover:shadow-md ${
                    !notification.lida ? "border-l-4 border-blue-500" : ""
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 text-2xl mt-1">
                      {getNotificationIcon(notification.tipo)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <h3 className={`text-base font-semibold ${!notification.lida ? "text-gray-900" : "text-gray-700"}`}>
                            {notification.titulo}
                          </h3>
                          <p className={`text-sm mt-1 ${!notification.lida ? "text-gray-700" : "text-gray-600"}`}>
                            {notification.mensagem}
                          </p>
                          <p className="text-xs text-gray-500 mt-2">
                            {notification.tempo_decorrido}
                          </p>
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0">
                          {!notification.lida && notification.link && (
                            <button
                              onClick={() => markAsRead(notification.id, notification.link)}
                              className="text-blue-600 hover:text-blue-700 text-sm font-medium px-3 py-1 rounded hover:bg-blue-50 transition-colors"
                            >
                              Ver
                            </button>
                          )}
                          {!notification.lida && !notification.link && (
                            <button
                              onClick={() => markAsRead(notification.id, null)}
                              className="text-gray-600 hover:text-gray-700 text-sm font-medium px-3 py-1 rounded hover:bg-gray-100 transition-colors"
                            >
                              Marcar como lida
                            </button>
                          )}
                          <button
                            onClick={() => deleteNotification(notification.id)}
                            className="text-red-500 hover:text-red-700 p-2 rounded hover:bg-red-50 transition-colors"
                            aria-label="Excluir notificação"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Botão Carregar Mais */}
              {hasMore && (
                <div className="text-center py-6">
                  <button
                    onClick={loadMore}
                    disabled={loading}
                    className="bg-white hover:bg-gray-50 text-gray-700 font-medium px-6 py-3 rounded-lg border border-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? "Carregando..." : "Carregar mais notificações"}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      </div>
    </main>
  );
}

export default Notifications;
