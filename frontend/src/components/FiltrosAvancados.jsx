import { useState } from 'react';

function FiltrosAvancados({ filtrosAvancados, setFiltrosAvancados, onAplicarFiltros }) {
  const [mostrarFiltros, setMostrarFiltros] = useState(false);

  const handleChange = (field, value) => {
    setFiltrosAvancados(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const limparFiltros = () => {
    setFiltrosAvancados({
      depositoLivre: false,
      proximosSete: false,
      dataInicio: '',
      dataFim: '',
      ordenacao: 'data'
    });
    onAplicarFiltros();
  };

  const contarFiltrosAtivos = () => {
    let count = 0;
    if (filtrosAvancados.depositoLivre) count++;
    if (filtrosAvancados.proximosSete) count++;
    if (filtrosAvancados.dataInicio) count++;
    if (filtrosAvancados.dataFim) count++;
    return count;
  };

  const filtrosAtivos = contarFiltrosAtivos();

  return (
    <div className="w-full px-4 mt-4">
      <div className="max-w-6xl mx-auto">
        {/* Botão para mostrar/ocultar filtros */}
        <button
          onClick={() => setMostrarFiltros(!mostrarFiltros)}
          className="group flex items-center gap-3 px-4 md:px-5 py-3 bg-white rounded-xl shadow-sm hover:shadow-md border border-gray-200 hover:border-gray-300 transition-all duration-300 font-medium text-sm w-full md:w-auto"
        >
          <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-gray-100 to-gray-50 rounded-lg group-hover:from-gray-200 group-hover:to-gray-100 transition-all duration-300">
            <svg
              className={`w-5 h-5 text-gray-700 transition-transform duration-300 ${mostrarFiltros ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
          <span className="text-gray-700">Filtros Avançados</span>
          {filtrosAtivos > 0 && (
            <span className="flex items-center justify-center min-w-[24px] h-6 bg-gradient-to-r from-blue-600 to-blue-500 text-white text-xs font-bold px-2 rounded-full shadow-lg shadow-blue-500/30 animate-pulse">
              {filtrosAtivos}
            </span>
          )}
          <svg
            className="w-4 h-4 text-gray-400 ml-auto group-hover:text-gray-600 transition-colors"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
          </svg>
        </button>

        {/* Painel de filtros */}
        <div
          className={`overflow-hidden transition-all duration-500 ease-in-out ${
            mostrarFiltros ? 'max-h-[1000px] md:max-h-[600px] opacity-100 mt-4' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-xl border border-gray-200 p-4 md:p-6">
            {/* Header do painel */}
            <div className="flex items-center gap-3 mb-4 md:mb-6 pb-4 border-b border-gray-200">
              <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-500 rounded-xl shadow-lg shadow-blue-500/30 flex-shrink-0">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-base md:text-lg font-semibold text-gray-900 truncate">Refine sua busca</h3>
                <p className="text-xs md:text-sm text-gray-500 truncate">Encontre exatamente o que você procura</p>
              </div>
            </div>

            {/* Grid de filtros */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
              {/* Checkbox: Apenas eventos gratuitos */}
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative">
                    <input
                      type="checkbox"
                      id="depositoLivre"
                      checked={filtrosAvancados.depositoLivre}
                      onChange={(e) => handleChange('depositoLivre', e.target.checked)}
                      className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 cursor-pointer"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                      Eventos gratuitos
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      Sem taxa de depósito
                    </div>
                  </div>
                </label>
              </div>

              {/* Checkbox: Próximos 7 dias */}
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative">
                    <input
                      type="checkbox"
                      id="proximosSete"
                      checked={filtrosAvancados.proximosSete}
                      onChange={(e) => handleChange('proximosSete', e.target.checked)}
                      className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 cursor-pointer"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                      Próximos 7 dias
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      Eventos da semana
                    </div>
                  </div>
                </label>
              </div>

              {/* Data início */}
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
                <label htmlFor="dataInicio" className="block text-sm font-semibold text-gray-900 mb-2">
                  Data início
                </label>
                <input
                  type="date"
                  id="dataInicio"
                  value={filtrosAvancados.dataInicio}
                  onChange={(e) => handleChange('dataInicio', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-all duration-300"
                />
              </div>

              {/* Data fim */}
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
                <label htmlFor="dataFim" className="block text-sm font-semibold text-gray-900 mb-2">
                  Data fim
                </label>
                <input
                  type="date"
                  id="dataFim"
                  value={filtrosAvancados.dataFim}
                  onChange={(e) => handleChange('dataFim', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-all duration-300"
                />
              </div>

              {/* Ordenação - ocupa toda a linha */}
              <div className="md:col-span-2 lg:col-span-4 bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
                <label htmlFor="ordenacao" className="block text-sm font-semibold text-gray-900 mb-2">
                  Ordenar por
                </label>
                <select
                  id="ordenacao"
                  value={filtrosAvancados.ordenacao}
                  onChange={(e) => handleChange('ordenacao', e.target.value)}
                  className="w-full md:w-64 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-all duration-300 bg-white cursor-pointer"
                >
                  <option value="data">📅 Data (mais próximo)</option>
                  <option value="-data">📅 Data (mais distante)</option>
                  <option value="titulo">🔤 Título (A-Z)</option>
                </select>
              </div>
            </div>

            {/* Botões de ação */}
            <div className="flex flex-col sm:flex-row gap-3 mt-4 md:mt-6 pt-4 md:pt-5 border-t border-gray-200">
              <button
                onClick={onAplicarFiltros}
                className="flex-1 md:flex-none px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl hover:from-blue-700 hover:to-blue-600 font-semibold text-sm transition-all duration-300 shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 hover:scale-105"
              >
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Aplicar Filtros
                </span>
              </button>
              <button
                onClick={limparFiltros}
                className="flex-1 md:flex-none px-8 py-3 bg-white text-gray-700 rounded-xl hover:bg-gray-50 font-semibold text-sm transition-all duration-300 border border-gray-200 hover:border-gray-300 shadow-sm hover:shadow-md"
              >
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Limpar
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FiltrosAvancados;
