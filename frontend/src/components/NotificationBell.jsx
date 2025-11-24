import { useState, useEffect, useRef } from 'react';
import { FaBell } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Buscar contador de não lidas
  const fetchUnreadCount = async () => {
    try {
      const response = await api.get('/api/notificacoes/contador/');
      setUnreadCount(response.data.count);
    } catch (error) {
      console.error('Erro ao buscar contador:', error);
    }
  };

  // Buscar últimas 5 notificações
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/notificacoes/?lida=false');
      setNotifications(response.data.slice(0, 5)); // Pega apenas as 5 primeiras
    } catch (error) {
      console.error('Erro ao buscar notificações:', error);
    } finally {
      setLoading(false);
    }
  };

  // Marcar notificação como lida
  const markAsRead = async (notificationId, link) => {
    try {
      await api.patch(`/api/notificacoes/${notificationId}/marcar-lida/`);
      await fetchUnreadCount();
      await fetchNotifications();
      
      if (link) {
        navigate(link);
      }
      setIsOpen(false);
    } catch (error) {
      console.error('Erro ao marcar como lida:', error);
    }
  };

  // Marcar todas como lidas
  const markAllAsRead = async () => {
    try {
      await api.patch('/api/notificacoes/marcar-todas-lidas/');
      await fetchUnreadCount();
      await fetchNotifications();
    } catch (error) {
      console.error('Erro ao marcar todas como lidas:', error);
    }
  };

  // Buscar contador periodicamente (a cada 30 segundos)
  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  // Buscar notificações quando abrir o dropdown
  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Ícone de tipo de notificação
  const getNotificationIcon = (tipo) => {
    const icons = {
      vaga_lista_espera: '🎫',
      evento_proximo: '📅',
      transferencia_aprovada: '✅',
      transferencia_recusada: '❌',
      transferencia_recebida: '📨',
      inscricao_confirmada: '🎉',
      checkin_lembrete: '⏰',
      avaliacao_pendente: '⭐',
      documento_aprovado: '✔️',
      documento_rejeitado: '❗',
      sistema: 'ℹ️',
    };
    return icons[tipo] || 'ℹ️';
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Botão do sino */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 sm:p-2.5 text-gray-600 hover:text-gray-900 focus:outline-none hover:bg-gray-100 rounded-xl transition-all duration-300 group"
        aria-label="Notificações"
      >
        {/* Ícone do sino com animação */}
        <div className="relative">
          <FaBell className={`w-5 h-5 sm:w-6 sm:h-6 transition-transform duration-300 ${unreadCount > 0 ? 'animate-wiggle' : ''} group-hover:scale-110`} />

          {/* Badge de contador - Design melhorado */}
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 inline-flex items-center justify-center min-w-[18px] sm:min-w-[20px] h-[18px] sm:h-[20px] text-[10px] sm:text-xs font-bold text-white bg-gradient-to-br from-red-500 to-red-600 rounded-full shadow-lg shadow-red-500/50 animate-pulse-subtle ring-2 ring-white">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}

          {/* Indicador de pulsação quando há notificações */}
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 inline-flex h-[18px] sm:h-[20px] w-[18px] sm:w-[20px] rounded-full bg-red-400 opacity-75 animate-ping-slow"></span>
          )}
        </div>
      </button>

      {/* Dropdown de notificações */}
      {isOpen && (
        <div className="fixed sm:absolute left-0 sm:left-auto right-0 sm:right-0 top-[60px] sm:top-auto sm:mt-2 w-full sm:w-96 max-w-full sm:max-w-[calc(100vw-2rem)] bg-white rounded-none sm:rounded-2xl shadow-2xl border-t sm:border border-gray-200 z-50 max-h-[calc(100vh-60px)] sm:max-h-[85vh] flex flex-col animate-in fade-in slide-in-from-top-2 duration-300">
          {/* Header */}
          <div className="flex items-center justify-between p-3 sm:p-4 border-b border-gray-200 flex-shrink-0 bg-gradient-to-r from-gray-50 to-white">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-sm">
                <FaBell className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900">Notificações</h3>
              {unreadCount > 0 && (
                <span className="ml-1 px-2 py-0.5 text-[10px] sm:text-xs font-bold text-blue-600 bg-blue-50 rounded-full">
                  {unreadCount}
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs sm:text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                <span className="hidden xs:inline">Marcar todas como lidas</span>
                <span className="inline xs:hidden">Marcar todas</span>
              </button>
            )}
          </div>

          {/* Lista de notificações */}
          <div className="overflow-y-auto flex-1">
            {loading ? (
              <div className="p-4 text-center text-gray-500">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                <p className="mt-2 text-sm">Carregando...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <FaBell className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p className="text-sm">Nenhuma notificação nova</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => markAsRead(notification.id, notification.link)}
                  className="p-3 sm:p-4 border-b border-gray-100 hover:bg-gray-50 active:bg-gray-100 cursor-pointer transition-colors"
                >
                  <div className="flex items-start gap-2 sm:gap-3">
                    <span className="text-xl sm:text-2xl flex-shrink-0">
                      {getNotificationIcon(notification.tipo)}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm font-semibold text-gray-900 mb-1 break-words">
                        {notification.titulo}
                      </p>
                      <p className="text-xs sm:text-sm text-gray-600 line-clamp-2 break-words">
                        {notification.mensagem}
                      </p>
                      <p className="text-[10px] sm:text-xs text-gray-400 mt-1">
                        {notification.tempo_decorrido}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-3 sm:p-4 border-t border-gray-200 text-center flex-shrink-0 bg-gray-50 sm:bg-white">
            <button
              onClick={() => {
                navigate('/notificacoes');
                setIsOpen(false);
              }}
              className="w-full sm:w-auto text-sm text-blue-600 hover:text-blue-800 font-medium py-2 sm:py-0"
            >
              Ver todas as notificações
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
