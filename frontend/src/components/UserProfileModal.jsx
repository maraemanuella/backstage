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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg max-w-2xl w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Perfil do Usuário</h2>
          <button onClick={onClose} className="text-gray-500">Fechar</button>
        </div>

        {loading && <p>Carregando...</p>}

        {detail && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <img src={detail.profile_photo || 'https://via.placeholder.com/80'} alt="foto" className="w-20 h-20 rounded-full object-cover" />
              <div>
                <div className="font-medium text-gray-900">{detail.get_full_name || detail.username}</div>
                <div className="text-sm text-gray-600">{detail.email}</div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <div className="text-sm text-gray-500">Telefone</div>
                <div className="text-sm">{detail.telefone || '—'}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Score</div>
                <div className="text-sm">{detail.score}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Documento</div>
                <div className="text-sm">{detail.tipo_documento || '—'} {detail.numero_documento || ''}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Verificação</div>
                <div className="text-sm">{detail.documento_verificado || '—'}</div>
              </div>
            </div>

            {detail.documento_foto && (
              <div>
                <div className="text-sm text-gray-500 mb-2">Foto do Documento</div>
                <img src={detail.documento_foto} alt="Documento" className="max-h-48 object-contain border rounded" />
              </div>
            )}

            <div className="flex gap-3 justify-end">
              <button onClick={handleBan} className="px-4 py-2 bg-red-600 text-white rounded">Ban/Unban</button>
              <button onClick={handleRevert} className="px-4 py-2 bg-yellow-600 text-white rounded">Reverter Organizador</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfileModal;
