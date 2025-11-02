import React from 'react';

const UserFilters = ({ filter, setFilter }) => {
  return (
    <div className="bg-white p-3 sm:p-4 rounded-lg shadow mb-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div>
          <label className="block text-xs sm:text-sm text-gray-600 mb-1 font-medium">Tipo</label>
          <select
            value={filter.role}
            onChange={(e) => setFilter(prev => ({ ...prev, role: e.target.value }))}
            className="w-full px-2 sm:px-3 py-2 text-sm border rounded-md focus:ring-2 focus:ring-sky-500 focus:border-transparent"
          >
            <option value="todos">Todos</option>
            <option value="organizadores">Organizadores</option>
            <option value="usuarios">Usuários</option>
          </select>
        </div>

        <div>
          <label className="block text-xs sm:text-sm text-gray-600 mb-1 font-medium">Status</label>
          <select
            value={filter.status || 'all'}
            onChange={(e) => setFilter(prev => ({ ...prev, status: e.target.value === 'all' ? null : e.target.value }))}
            className="w-full px-2 sm:px-3 py-2 text-sm border rounded-md focus:ring-2 focus:ring-sky-500 focus:border-transparent"
          >
            <option value="all">Todos</option>
            <option value="ativo">Ativos</option>
            <option value="banido">Banidos</option>
          </select>
        </div>

        <div>
          <label className="block text-xs sm:text-sm text-gray-600 mb-1 font-medium">Verificados</label>
          <select
            value={filter.verified === null ? 'all' : (filter.verified ? 'yes' : 'no')}
            onChange={(e) => {
              const v = e.target.value;
              let val = null;
              if (v === 'yes') val = true;
              if (v === 'no') val = false;
              setFilter(prev => ({ ...prev, verified: val }));
            }}
            className="w-full px-2 sm:px-3 py-2 text-sm border rounded-md focus:ring-2 focus:ring-sky-500 focus:border-transparent"
          >
            <option value="all">Todos</option>
            <option value="yes">Aprovados</option>
            <option value="no">Não aprovados</option>
          </select>
        </div>

        <div>
          <label className="block text-xs sm:text-sm text-gray-600 mb-1 font-medium">Buscar</label>
          <input
            type="text"
            value={filter.search}
            onChange={(e) => setFilter(prev => ({ ...prev, search: e.target.value }))}
            placeholder="Nome ou email"
            className="w-full px-2 sm:px-3 py-2 text-sm border rounded-md focus:ring-2 focus:ring-sky-500 focus:border-transparent"
          />
        </div>
      </div>
    </div>
  );
};

export default UserFilters;
