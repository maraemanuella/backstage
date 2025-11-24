import { useState, useEffect } from 'react';
import { Award, TrendingUp, Star } from 'lucide-react';
import api from '../api';

const ScorePill = () => {
  const [rankingData, setRankingData] = useState(null);
  const [showTooltip, setShowTooltip] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetchRanking();
  }, []);

  const fetchRanking = async () => {
    try {
      console.log('[ScorePill] Buscando dados de ranking...');
      const response = await api.get('/api/user/ranking/');
      console.log('[ScorePill] Dados recebidos:', response.data);
      setRankingData(response.data);
      setError(false);
    } catch (error) {
      console.error('[ScorePill] Erro ao buscar ranking:', error);
      console.error('[ScorePill] Detalhes do erro:', error.response?.data);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  // Mostra indicador de carregamento
  if (loading) {
    return (
      <div className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full bg-gray-100 border border-gray-200">
        <div className="w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
        <span className="text-xs text-gray-500">...</span>
      </div>
    );
  }

  // Se houver erro, não mostra nada (ou mostra mensagem de erro em dev)
  if (error || !rankingData) {
    if (import.meta.env.DEV) {
      return (
        <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-red-50 border border-red-200">
          <span className="text-xs text-red-600">Erro</span>
        </div>
      );
    }
    return null;
  }

  const { score, nivel, cor, proximo_nivel, descricao } = rankingData;
  const porcentagemProximoNivel = proximo_nivel && !proximo_nivel.no_maximo
    ? ((score - (proximo_nivel.score_necessario - proximo_nivel.score_faltante)) / proximo_nivel.score_faltante) * 100
    : 100;

  // Ícone por nível
  const getNivelIcon = () => {
    switch (nivel) {
      case 'Diamante':
        return <Star className="w-3 h-3 sm:w-3.5 sm:h-3.5" fill="currentColor" />;
      case 'Platina':
      case 'Ouro':
        return <Award className="w-3 h-3 sm:w-3.5 sm:h-3.5" />;
      default:
        return <TrendingUp className="w-3 h-3 sm:w-3.5 sm:h-3.5" />;
    }
  };

  return (
    <div className="relative">
      {/* Pílula de Score - Minimalista */}
      <div
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full bg-white hover:bg-gray-50 border border-gray-200 hover:border-gray-300 shadow-sm hover:shadow transition-all duration-200 cursor-pointer"
        style={{
          borderLeftWidth: '3px',
          borderLeftColor: cor,
        }}
      >
        {/* Ícone do nível (pequeno) */}
        <div className="text-gray-500" style={{ color: cor }}>
          {getNivelIcon()}
        </div>

        {/* Score compacto */}
        <span className="text-xs sm:text-sm font-semibold text-gray-700">
          {score.toFixed(1)}
        </span>
      </div>

      {/* Tooltip Moderno */}
      {showTooltip && (
        <div className="absolute top-full right-0 mt-2 w-72 sm:w-80 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-300">
          {/* Header com gradiente */}
          <div
            className="relative px-6 py-4 text-white"
            style={{
              background: `linear-gradient(135deg, ${cor} 0%, ${cor}dd 100%)`
            }}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                {getNivelIcon()}
              </div>
              <div>
                <h3 className="text-base font-bold">{descricao.titulo}</h3>
                <p className="text-xs opacity-90">{descricao.descricao}</p>
              </div>
            </div>

            {/* Score grande */}
            <div className="mt-3 text-center">
              <div className="text-4xl font-bold tracking-tight">
                {score.toFixed(1)}
              </div>
              <div className="text-xs opacity-75 uppercase tracking-wider">Score</div>
            </div>
          </div>

          {/* Conteúdo */}
          <div className="px-6 py-4">
            {/* Barra de progresso */}
            {!proximo_nivel.no_maximo && (
              <div className="mb-4">
                <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
                  <span>Próximo nível: <span className="font-semibold text-gray-900">{proximo_nivel.proximo_nivel}</span></span>
                  <span className="font-semibold">{Math.round(porcentagemProximoNivel)}%</span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${porcentagemProximoNivel}%`,
                      backgroundColor: cor
                    }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1 text-right">
                  +{proximo_nivel.score_faltante.toFixed(1)} pontos necessários
                </p>
              </div>
            )}

            {/* Benefícios (apenas se houver) */}
            {descricao.beneficios && descricao.beneficios.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Benefícios</h4>
                <div className="space-y-2">
                  {descricao.beneficios.map((beneficio, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 text-sm text-gray-700 bg-gray-50 rounded-lg px-3 py-2"
                    >
                      <div
                        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: cor }}
                      />
                      <span>{beneficio}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Mensagem sobre presença */}
            {descricao.beneficios && descricao.beneficios.length === 0 && (
              <div className="text-center py-3">
                <div className="text-3xl mb-2">🎯</div>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Compareça aos eventos para aumentar seu score e desbloquear benefícios!
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-3 bg-gray-50 border-t border-gray-100">
            <p className="text-xs text-gray-500 text-center">
              💡 Mantenha presença constante para manter seu nível
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScorePill;

