import React from 'react';

const UserFilters = ({ filter, setFilter }) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow mb-4 flex items-center gap-4">
      <div>
        <label className="block text-sm text-gray-600">Tipo</label>
        <select
          value={filter.role}
          onChange={(e) => setFilter(prev => ({ ...prev, role: e.target.value }))}
          className="mt-1 px-3 py-2 border rounded-md"
        >
          <option value="todos">Todos</option>
          <option value="organizadores">Organizadores</option>
          <option value="usuarios">Usuários</option>
        </select>
      </div>

      <div>
        <label className="block text-sm text-gray-600">Verificados</label>
        <select
          value={filter.verified === null ? 'all' : (filter.verified ? 'yes' : 'no')}
          onChange={(e) => {
            const v = e.target.value;
            let val = null;
            if (v === 'yes') val = true;
            if (v === 'no') val = false;
            setFilter(prev => ({ ...prev, verified: val }));
          }}
          className="mt-1 px-3 py-2 border rounded-md"
        >
          <option value="all">Todos</option>
          <option value="yes">Aprovados</option>
          <option value="no">Não aprovados</option>
        </select>
      </div>

      <div className="flex-1">
        <label className="block text-sm text-gray-600">Buscar</label>
        <input
          type="text"
          value={filter.search}
          onChange={(e) => setFilter(prev => ({ ...prev, search: e.target.value }))}
          placeholder="Nome de usuário ou email"
          className="mt-1 w-full px-3 py-2 border rounded-md"
        />
      </div>
    </div>
  );
};

export default UserFilters;
