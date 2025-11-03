import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import Header from '../components/Header';
import api from '../api.js';
import TitleUpdater from '../components/TitleUpdater';
import userApi from '../api/users';
import UserList from '../components/UserList';
import UserFilters from '../components/UserFilters';
import UserProfileModal from '../components/UserProfileModal';

const UserManagement = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [filter, setFilter] = useState({ role: 'todos', verified: null, search: '', status: null });
  const [selectedUser, setSelectedUser] = useState(null);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filter.role === 'organizadores') params.role = 'organizador';
      if (filter.role === 'usuarios') params.role = 'usuario';
      if (filter.verified !== null) params.verified = filter.verified;
      if (filter.search) params.search = filter.search;

      const data = await userApi.listUsers(params);
      setUsers(data);
    } catch (err) {
      console.error('Erro ao carregar usuários', err);
    } finally {
      setLoading(false);
    }
  };

  // Filter users by status on the client side
  const filteredUsers = React.useMemo(() => {
    if (!filter.status) return users;
    
    if (filter.status === 'ativo') {
      return users.filter(u => u.is_active);
    } else if (filter.status === 'banido') {
      return users.filter(u => !u.is_active);
    }
    
    return users;
  }, [users, filter.status]);

  useEffect(() => {
    loadUsers();
    // fetch current user for header / permissions
    const fetchCurrentUser = async () => {
      try {
        const resp = await api.get('api/user/me/');
        const userData = resp.data;
        setUser(userData);
        
        // Verificar se é admin
        if (!userData.is_staff) {
          alert('Acesso negado. Apenas administradores podem acessar o gerenciamento de usuários.');
          navigate('/');
          return;
        }
      } catch (err) {
        console.warn('Não foi possível obter usuário atual', err);
        navigate('/');
      }
    };

    fetchCurrentUser();
  }, [filter, navigate]);

  return (
    <main className="min-h-screen bg-gray-50">
      <TitleUpdater title="Gestão de Usuários - Backstage" />
      <Header user={user} />
      <div className="max-w-6xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8">
        {/* Botão Voltar */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 sm:mb-6 transition-colors group"
        >
          <FaArrowLeft className="text-sm group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-medium">Voltar para Home</span>
        </button>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
          <h1 className="text-xl sm:text-2xl font-bold">Gestão de Usuários</h1>
          {!loading && (
            <div className="text-sm text-gray-600">
              <span className="font-medium">{filteredUsers.length}</span> usuário{filteredUsers.length !== 1 ? 's' : ''} encontrado{filteredUsers.length !== 1 ? 's' : ''}
            </div>
          )}
        </div>
        <UserFilters filter={filter} setFilter={setFilter} />

        <div className="mt-4 sm:mt-6">
          <UserList
            users={filteredUsers}
            loading={loading}
            onRefresh={loadUsers}
            onOpenProfile={(user) => setSelectedUser(user)}
          />
        </div>

        <UserProfileModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
          onActionCompleted={loadUsers}
        />
      </div>
    </main>
  );
};

export default UserManagement;
