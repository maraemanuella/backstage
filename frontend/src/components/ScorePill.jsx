import { useState, useEffect } from 'react';
import { Award, TrendingUp, Star, Info } from 'lucide-react';
import api from '../api';

const ScorePill = () => {
  const [rankingData, setRankingData] = useState(null);
  const [showTooltip, setShowTooltip] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRanking();
  }, []);

  const fetchRanking = async () => {
    try {
      const response = await api.get('/api/user/ranking/');
      setRankingData(response.data);
    } catch (error) {
      console.error('Erro ao buscar ranking:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !rankingData) return null;

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
      {/* Pílula de Score */}
      <div
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-full bg-gradient-to-r from-gray-100 to-gray-50 hover:from-gray-200 hover:to-gray-100 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer group"
        style={{
          borderLeft: `3px solid ${cor}`,
        }}
      >
        {/* Ícone do nível */}
        <div className="text-gray-600 group-hover:scale-110 transition-transform duration-300">
          {getNivelIcon()}
        </div>

        {/* Score */}
        <div className="flex items-baseline gap-0.5 sm:gap-1">
          <span className="text-sm sm:text-base font-bold text-gray-900">
            {score.toFixed(1)}
          </span>
          <span className="text-[10px] sm:text-xs text-gray-500 font-medium">
            /5.0
          </span>
        </div>

        {/* Badge do nível (apenas desktop) */}
        <div className="hidden md:flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide"
          style={{
            backgroundColor: `${cor}20`,
            color: cor
          }}
        >
          {nivel}
        </div>

        {/* Ícone de info */}
        <Info className="w-3 h-3 text-gray-400 group-hover:text-gray-600 transition-colors" />
      </div>

      {/* Tooltip */}
      {showTooltip && (
        <div className="absolute top-full right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-300">
          {/* Header */}
          <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-200">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg"
              style={{ backgroundColor: cor }}
            >
              {getNivelIcon()}
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">{descricao.titulo}</h3>
              <p className="text-xs text-gray-500">{descricao.descricao}</p>
            </div>
          </div>

          {/* Score atual */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Score Atual</span>
              <span className="text-2xl font-bold" style={{ color: cor }}>
                {score.toFixed(1)}
              </span>
            </div>

            {/* Barra de progresso */}
            {!proximo_nivel.no_maximo && (
              <>
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden mb-1">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${porcentagemProximoNivel}%`,
                      backgroundColor: cor
                    }}
                  />
                </div>
                <p className="text-xs text-gray-500 text-right">
                  Faltam {proximo_nivel.score_faltante.toFixed(2)} pontos para {proximo_nivel.proximo_nivel}
                </p>
              </>
            )}
          </div>

          {/* Benefícios */}
          <div className="mb-4">
            <h4 className="text-sm font-semibold text-gray-900 mb-2">Benefícios do seu nível:</h4>
            <ul className="space-y-1.5">
              {descricao.beneficios.map((beneficio, index) => (
                <li key={index} className="flex items-start gap-2 text-xs text-gray-600">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <span>{beneficio}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Dica */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-xs text-blue-900">
              <span className="font-semibold">💡 Dica:</span> {descricao.dica}
            </p>
          </div>

          {/* Importância do Score */}
          <div className="mt-4 pt-3 border-t border-gray-200">
            <h4 className="text-sm font-semibold text-gray-900 mb-2">Por que o score é importante?</h4>
            <ul className="space-y-1 text-xs text-gray-600">
              <li>• <strong>Prioridade</strong> em listas de espera</li>
              <li>• <strong>Confiança</strong> de organizadores</li>
              <li>• <strong>Acesso</strong> a eventos exclusivos</li>
              <li>• <strong>Destaque</strong> na plataforma</li>
            </ul>
          </div>

          {/* Como melhorar */}
          <div className="mt-3 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-3">
            <h4 className="text-xs font-semibold text-green-900 mb-1">Como melhorar meu score?</h4>
            <ul className="space-y-1 text-xs text-green-800">
              <li>✓ Participe de eventos regularmente</li>
              <li>✓ Seja pontual e compareça</li>
              <li>✓ Avalie organizadores positivamente</li>
              <li>✓ Mantenha perfil completo</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScorePill;

