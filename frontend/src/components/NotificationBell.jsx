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
        className="relative p-2 text-gray-600 hover:text-gray-900 focus:outline-none"
      >
        <FaBell className="w-6 h-6" />
        
        {/* Badge de contador */}
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown de notificações */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Notificações</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Marcar todas como lidas
              </button>
            )}
          </div>

          {/* Lista de notificações */}
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-gray-500">
                Carregando...
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                Nenhuma notificação nova
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => markAsRead(notification.id, notification.link)}
                  className="p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl flex-shrink-0">
                      {getNotificationIcon(notification.tipo)}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 mb-1">
                        {notification.titulo}
                      </p>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {notification.mensagem}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {notification.tempo_decorrido}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-gray-200 text-center">
            <button
              onClick={() => {
                navigate('/notificacoes');
                setIsOpen(false);
              }}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
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
