import React, { useEffect, useState } from 'react';
import userApi from '../api/users';
import { toast } from 'react-toastify';

const UserProfileModal = ({ user, onClose, onActionCompleted }) => {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) fetchDetail();
    else setDetail(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchDetail = async () => {
    setLoading(true);
    try {
      const data = await userApi.getUser(user.id);
      setDetail(data);
    } catch (err) {
      console.error(err);
      toast.error('Erro ao carregar usuário');
    } finally {
      setLoading(false);
    }
  };

  const handleBan = async () => {
    if (!detail) return;
    if (!window.confirm('Alternar ban para este usuário?')) return;
    try {
      await userApi.banToggle(detail.id);
      toast.success('Ação executada');
      onActionCompleted?.();
      onClose();
    } catch (err) {
      console.error(err);
      toast.error('Falha ao banir');
    }
  };

  const handleRevert = async () => {
    if (!detail) return;
    if (!window.confirm('Reverter status de organizador (cancelar eventos futuros) e desativar usuário?')) return;
    try {
      await userApi.revertOrganizer(detail.id);
      toast.success('Usuário revertido e eventos futuros cancelados');
      onActionCompleted?.();
      onClose();
    } catch (err) {
      console.error(err);
      toast.error('Falha ao reverter');
    }
  };

  if (!user) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-4 sm:px-6 py-4 flex justify-between items-center">
          <h2 className="text-lg sm:text-xl font-semibold">Perfil do Usuário</h2>
          <button 
            onClick={onClose} 
            className="text-gray-500 hover:text-gray-700 px-3 py-1 rounded-md hover:bg-gray-100 transition-colors"
          >
            Fechar
          </button>
        </div>

        <div className="px-4 sm:px-6 py-4 sm:py-6">
          {loading && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-sky-600 mx-auto"></div>
              <p className="mt-3 text-gray-600">Carregando...</p>
            </div>
          )}

          {detail && (
            <div className="space-y-4 sm:space-y-6">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
                <img 
                  src={detail.profile_photo || 'https://via.placeholder.com/80'} 
                  alt="foto" 
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover ring-2 ring-gray-200" 
                />
                <div className="text-center sm:text-left flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-2">
                    <div className="font-medium text-gray-900 text-base sm:text-lg truncate">
                      {detail.get_full_name || detail.username}
                    </div>
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                      detail.is_active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {detail.is_active ? 'Ativo' : 'Banido'}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 truncate">{detail.email}</div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-xs sm:text-sm text-gray-500 mb-1">Telefone</div>
                  <div className="text-sm font-medium">{detail.telefone || '—'}</div>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-xs sm:text-sm text-gray-500 mb-1">Score</div>
                  <div className="text-sm font-medium">{detail.score}</div>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-xs sm:text-sm text-gray-500 mb-1">Documento</div>
                  <div className="text-sm font-medium truncate">
                    {detail.tipo_documento || '—'} {detail.numero_documento || ''}
                  </div>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-xs sm:text-sm text-gray-500 mb-1">Verificação</div>
                  <div className="text-sm font-medium">
                    {detail.documento_verificado === 'aprovado' ? (
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">Aprovado</span>
                    ) : detail.documento_verificado === 'pendente' ? (
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">Pendente</span>
                    ) : detail.documento_verificado === 'rejeitado' ? (
                      <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded">Rejeitado</span>
                    ) : (
                      <span className="text-gray-400">Não verificado</span>
                    )}
                  </div>
                </div>
              </div>

              {detail.documento_foto && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-xs sm:text-sm text-gray-500 mb-2 font-medium">Foto do Documento</div>
                  <img 
                    src={detail.documento_foto} 
                    alt="Documento" 
                    className="w-full max-h-48 sm:max-h-64 object-contain border rounded" 
                  />
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
                <button 
                  onClick={handleBan} 
                  className={`w-full sm:w-auto px-4 py-2.5 text-white text-sm font-medium rounded-lg transition-colors ${
                    detail.is_active 
                      ? 'bg-red-600 hover:bg-red-700' 
                      : 'bg-green-600 hover:bg-green-700'
                  }`}
                >
                  {detail.is_active ? 'Banir Usuário' : 'Desbanir Usuário'}
                </button>
                <button 
                  onClick={handleRevert} 
                  className="w-full sm:w-auto px-4 py-2.5 bg-yellow-600 text-white text-sm font-medium rounded-lg hover:bg-yellow-700 transition-colors"
                >
                  Reverter Organizador
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfileModal;
