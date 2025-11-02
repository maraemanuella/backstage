import React from 'react';
import { FaUser, FaEye, FaBan } from 'react-icons/fa';
import userApi from '../api/users';
import { toast } from 'react-toastify';

const UserList = ({ users, loading, onRefresh, onOpenProfile }) => {
  const handleBan = async (user) => {
    const action = user.is_active ? 'banir' : 'desbanir';
    if (!window.confirm(`Tem certeza que deseja ${action} ${user.username}?`)) return;
    try {
      await userApi.banToggle(user.id);
      toast.success(`Usuário ${action === 'banir' ? 'banido' : 'desbanido'} com sucesso`);
      onRefresh();
    } catch (err) {
      console.error(err);
      toast.error('Falha ao executar ação');
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
        <p className="text-gray-600 mt-4">Carregando usuários...</p>
      </div>
    );
  }

  if (!users || users.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <p className="text-gray-600">Nenhum usuário encontrado com os filtros selecionados.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {/* Mobile Card View */}
      <div className="block md:hidden divide-y divide-gray-200">
        {users.map((u) => (
          <div key={u.id} className="p-4 hover:bg-gray-50">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3 flex-1">
                <FaUser className="text-gray-400 text-lg flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <div className="text-sm font-medium text-gray-900 truncate">{u.username}</div>
                    {!u.is_active && (
                      <span className="px-2 py-0.5 bg-red-100 text-red-800 text-xs font-semibold rounded">
                        BANIDO
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500">ID: {u.id}</div>
                  <div className="text-xs text-gray-500 truncate">{u.email}</div>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
              <div>
                <span className="text-gray-500">Score:</span>
                <span className="ml-1 font-medium">{u.score}</span>
              </div>
              <div>
                <span className="text-gray-500">Status:</span>
                <span className={`ml-1 font-medium ${u.is_active ? 'text-green-600' : 'text-red-600'}`}>
                  {u.is_active ? 'Ativo' : 'Banido'}
                </span>
              </div>
              <div className="col-span-2">
                <span className="text-gray-500">Verificado:</span>
                <span className="ml-1 font-medium">{u.documento_verificado || 'Não verificado'}</span>
              </div>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => onOpenProfile(u)}
                className="flex-1 px-3 py-2 bg-sky-600 text-white text-xs rounded-md hover:bg-sky-700 flex items-center justify-center gap-2"
              >
                <FaEye /> Ver
              </button>
              <button
                onClick={() => handleBan(u)}
                className={`flex-1 px-3 py-2 text-white text-xs rounded-md flex items-center justify-center gap-2 ${
                  u.is_active 
                    ? 'bg-red-600 hover:bg-red-700' 
                    : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                <FaBan /> {u.is_active ? 'Banir' : 'Desbanir'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuário</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Verificado</th>
              <th className="px-6 py-3"></th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-3">
                    <FaUser className="text-gray-400" />
                    <div>
                      <div className="flex items-center gap-2">
                        <div className="text-sm font-medium text-gray-900">{u.username}</div>
                        {!u.is_active && (
                          <span className="px-2 py-0.5 bg-red-100 text-red-800 text-xs font-semibold rounded">
                            BANIDO
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-500">ID: {u.id}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{u.email}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{u.score}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    u.is_active 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {u.is_active ? 'Ativo' : 'Banido'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {u.documento_verificado === 'aprovado' ? (
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">Aprovado</span>
                  ) : u.documento_verificado === 'pendente' ? (
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">Pendente</span>
                  ) : u.documento_verificado === 'rejeitado' ? (
                    <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded">Rejeitado</span>
                  ) : (
                    <span className="text-gray-400">Não verificado</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={() => onOpenProfile(u)}
                      className="px-3 py-2 bg-sky-600 text-white rounded-md hover:bg-sky-700 flex items-center gap-2"
                    >
                      <FaEye /> Ver
                    </button>
                    <button
                      onClick={() => handleBan(u)}
                      className={`px-3 py-2 text-white rounded-md flex items-center gap-2 ${
                        u.is_active 
                          ? 'bg-red-600 hover:bg-red-700' 
                          : 'bg-green-600 hover:bg-green-700'
                      }`}
                    >
                      <FaBan /> {u.is_active ? 'Banir' : 'Desbanir'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserList;
