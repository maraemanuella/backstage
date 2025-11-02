import React from 'react';
import { FaUser, FaEye, FaBan } from 'react-icons/fa';
import userApi from '../api/users';
import { toast } from 'react-toastify';

const UserList = ({ users, loading, onRefresh, onOpenProfile }) => {
  const handleBan = async (user) => {
    if (!window.confirm(`Tem certeza que deseja alternar ban para ${user.username}?`)) return;
    try {
      await userApi.banToggle(user.id);
      toast.success('Ação realizada');
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
    return <p className="text-gray-600">Nenhum usuário encontrado.</p>;
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuário</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Verificado</th>
            <th className="px-6 py-3"></th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {users.map((u) => (
            <tr key={u.id}>
              <td className="px-6 py-4 whitespace-nowrap flex items-center gap-3">
                <FaUser className="text-gray-400" />
                <div>
                  <div className="text-sm font-medium text-gray-900">{u.username}</div>
                  <div className="text-sm text-gray-500">ID: {u.id}</div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{u.email}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{u.score}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{u.documento_verificado || '—'}</td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium flex gap-2 justify-end">
                <button
                  onClick={() => onOpenProfile(u)}
                  className="px-3 py-2 bg-sky-600 text-white rounded-md hover:bg-sky-700"
                >
                  <FaEye className="inline mr-2" /> Ver
                </button>
                <button
                  onClick={() => handleBan(u)}
                  className="px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  <FaBan className="inline mr-2" /> Ban
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserList;
