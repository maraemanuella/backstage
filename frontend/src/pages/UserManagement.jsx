import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import api from '../api.js';
import TitleUpdater from '../components/TitleUpdater';
import userApi from '../api/users';
import UserList from '../components/UserList';
import UserFilters from '../components/UserFilters';
import UserProfileModal from '../components/UserProfileModal';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [filter, setFilter] = useState({ role: 'todos', verified: null, search: '' });
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

  useEffect(() => {
    loadUsers();
    // fetch current user for header / permissions
    const fetchCurrentUser = async () => {
      try {
        const resp = await api.get('api/user/me/');
        setUser(resp.data);
      } catch (err) {
        console.warn('Não foi possível obter usuário atual', err);
      }
    };

    fetchCurrentUser();
  }, [filter]);

  return (
    <main className="min-h-screen bg-gray-50">
      <TitleUpdater title="Gestão de Usuários - Backstage" />
  <Header user={user} />
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">Gestão de Usuários</h1>
        <UserFilters filter={filter} setFilter={setFilter} />

        <div className="mt-6">
          <UserList
            users={users}
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
