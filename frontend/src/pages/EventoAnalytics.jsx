import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Users,
  TrendingUp,
  DollarSign,
  Star,
  Download,
  Calendar,
  Target,
  Activity,
  BarChart3,
  PieChart as PieChartIcon,
  Clock,
  Zap,
  Award,
  Eye,
  MousePointerClick,
  ArrowLeft
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';
import Header from '../components/Header';
import Modal from '../components/Modal';
import api from '../api';

function EventoAnalytics() {
  const { eventoId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('geral');
  const [editandoCusto, setEditandoCusto] = useState(false);
  const [custoEvento, setCustoEvento] = useState('');
  
  // Estados para dados
  const [metricsGeral, setMetricsGeral] = useState(null);
  const [demograficos, setDemograficos] = useState(null);
  const [interacoes, setInteracoes] = useState(null);
  const [roi, setRoi] = useState(null);

  useEffect(() => {
    fetchData();
  }, [eventoId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Buscar usuário
      const userRes = await api.get("/api/user/me/");
      const userData = userRes.data;
      setUser(userData);

      // Verificar se o documento foi aprovado
      if (userData.documento_verificado !== 'aprovado') {
        alert('Você precisa verificar seu documento antes de acessar analytics de eventos.');
        navigate('/verificar-documento');
        return;
      }
      
      // Buscar dados de analytics
      const [geralRes, demograficosRes, interacoesRes, roiRes] = await Promise.allSettled([
        api.get(`/api/eventos/${eventoId}/analytics/geral/`),
        api.get(`/api/eventos/${eventoId}/analytics/demograficos/`),
        api.get(`/api/eventos/${eventoId}/analytics/interacoes/`),
        api.get(`/api/eventos/${eventoId}/analytics/roi/`)
      ]);

      if (geralRes.status === 'fulfilled') {
        setMetricsGeral(geralRes.value.data);
      }
      
      if (demograficosRes.status === 'fulfilled') {
        setDemograficos(demograficosRes.value.data);
      }
      
      if (interacoesRes.status === 'fulfilled') {
        setInteracoes(interacoesRes.value.data);
      }
      
      if (roiRes.status === 'fulfilled') {
        setRoi(roiRes.value.data);
        setCustoEvento(roiRes.value.data.custos.custo_total || '0');
      }

    } catch (error) {
      console.error("Erro ao carregar analytics:", error);
      if (error.response?.status === 403) {
        alert('Você não tem permissão para visualizar analytics deste evento');
        navigate('/dashboard');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAtualizarCusto = async () => {
    try {
      const valor = parseFloat(custoEvento);
      if (isNaN(valor) || valor < 0) {
        alert('Por favor, insira um valor válido');
        return;
      }

      await api.post(`/api/eventos/${eventoId}/analytics/atualizar-custo/`, {
        custo_total: valor
      });

      alert('Custo atualizado com sucesso!');
      setEditandoCusto(false);
      fetchData(); // Recarregar dados
    } catch (error) {
      console.error("Erro ao atualizar custo:", error);
      alert('Erro ao atualizar custo');
    }
  };

  const handleExportarPDF = async () => {
    try {
      const response = await api.get(`/api/eventos/${eventoId}/analytics/exportar-pdf/`);
      
      // Converter base64 para blob e fazer download
      const byteCharacters = atob(response.data.pdf_base64);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'application/pdf' });
      
      // Criar link para download
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = response.data.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error("Erro ao exportar PDF:", error);
      alert('Erro ao exportar PDF. Verifique se a biblioteca reportlab está instalada no backend.');
    }
  };

  const formatCurrency = (value) => {
    if (value === null || value === undefined || isNaN(value)) {
      return 'R$ 0,00';
    }
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const MetricCard = ({ icon: Icon, title, value, subtitle, color = "blue", trend }) => (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <div className={`p-2 rounded-lg bg-${color}-50`}>
              <Icon className={`h-5 w-5 text-${color}-600`} />
            </div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
          </div>
          <p className="text-3xl font-bold text-gray-900 mb-1">{value}</p>
          {subtitle && (
            <p className="text-sm text-gray-500">{subtitle}</p>
          )}
          {trend && (
            <div className={`flex items-center gap-1 mt-2 text-sm ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
              <TrendingUp className="h-4 w-4" />
              <span>{Math.abs(trend)}%</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const TabButton = ({ id, label, icon: Icon }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`flex items-center gap-2 px-4 py-3 rounded-lg font-medium transition-all ${
        activeTab === id
          ? 'bg-blue-600 text-white shadow-md'
          : 'bg-white text-gray-600 hover:bg-gray-50'
      }`}
    >
      <Icon className="h-5 w-5" />
      <span className="hidden sm:inline">{label}</span>
    </button>
  );

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando analytics...</p>
        </div>
      </main>
    );
  }

  if (!metricsGeral) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Erro ao carregar dados</p>
        </div>
      </main>
    );
  }

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  return (
    <main className="min-h-screen bg-gray-50">
      <Modal isOpen={openModal} setOpenModal={setOpenModal} user={user} />
      <Header user={user} setOpenModal={setOpenModal} />
      
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-6 w-6 text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Analytics do Evento
              </h1>
              <p className="text-gray-600 mt-1">{metricsGeral.evento_titulo}</p>
            </div>
          </div>
          
          <button
            onClick={handleExportarPDF}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Download className="h-5 w-5" />
            Exportar PDF
          </button>
        </div>

        {/* Navegação por Abas */}
        <div className="flex flex-wrap gap-2 mb-8 bg-gray-100 p-2 rounded-xl">
          <TabButton id="geral" label="Visão Geral" icon={BarChart3} />
          <TabButton id="performance" label="Performance" icon={Activity} />
          <TabButton id="demograficos" label="Demografia" icon={Users} />
          <TabButton id="roi" label="ROI" icon={DollarSign} />
        </div>

        {/* Conteúdo das Abas */}
        {activeTab === 'geral' && (
          <div className="space-y-6">
            {/* Métricas Principais */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <MetricCard
                icon={Users}
                title="Total de Inscrições"
                value={metricsGeral.metricas_gerais.total_inscricoes}
                subtitle="Inscrições confirmadas"
                color="blue"
              />
              <MetricCard
                icon={TrendingUp}
                title="Taxa de Comparecimento"
                value={`${metricsGeral.metricas_gerais.taxa_comparecimento}%`}
                subtitle="Check-ins realizados"
                color="green"
              />
              <MetricCard
                icon={Eye}
                title="Visualizações"
                value={metricsGeral.metricas_gerais.total_visualizacoes}
                subtitle={`${metricsGeral.metricas_gerais.visualizacoes_unicas} únicas`}
                color="purple"
              />
              <MetricCard
                icon={Star}
                title="Score Médio"
                value={metricsGeral.metricas_gerais.score_medio.toFixed(1)}
                subtitle="Avaliação geral"
                color="yellow"
              />
            </div>

            {/* Gráficos de Visão Geral */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Taxa de Conversão */}
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <MousePointerClick className="h-5 w-5 text-blue-600" />
                  Taxa de Conversão
                </h3>
                <div className="text-center py-8">
                  <div className="relative inline-block">
                    <svg className="w-40 h-40" viewBox="0 0 36 36">
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="#E5E7EB"
                        strokeWidth="3"
                      />
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="#3B82F6"
                        strokeWidth="3"
                        strokeDasharray={`${metricsGeral.metricas_gerais.taxa_conversao}, 100`}
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-3xl font-bold text-gray-900">
                        {metricsGeral.metricas_gerais.taxa_conversao}%
                      </span>
                    </div>
                  </div>
                  <p className="text-gray-600 mt-4">
                    {metricsGeral.metricas_gerais.total_inscricoes} inscrições de{' '}
                    {metricsGeral.metricas_gerais.total_visualizacoes} visualizações
                  </p>
                </div>
              </div>

              {/* Receita Total */}
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  Resumo Financeiro
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
                    <span className="text-gray-600">Receita Total</span>
                    <span className="text-2xl font-bold text-green-600">
                      {formatCurrency(metricsGeral.metricas_gerais.receita_total)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
                    <span className="text-gray-600">Ticket Médio</span>
                    <span className="text-xl font-bold text-blue-600">
                      {formatCurrency(
                        metricsGeral.metricas_gerais.total_inscricoes > 0
                          ? metricsGeral.metricas_gerais.receita_total /
                            metricsGeral.metricas_gerais.total_inscricoes
                          : 0
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'performance' && interacoes && (
          <div className="space-y-6">
            {/* Timeline de Inscrições */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-600" />
                Inscrições ao Longo do Tempo
              </h3>
              {interacoes.timeline_inscricoes && interacoes.timeline_inscricoes.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={interacoes.timeline_inscricoes}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="data" />
                    <YAxis />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="quantidade"
                      stroke="#3B82F6"
                      fill="#3B82F6"
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Sem dados de inscrições nos últimos 30 dias
                </div>
              )}
            </div>

            {/* Check-ins por Horário */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Clock className="h-5 w-5 text-green-600" />
                Check-ins por Horário
              </h3>
              {interacoes.timeline_checkins && interacoes.timeline_checkins.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={interacoes.timeline_checkins}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="horario" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="quantidade" fill="#10B981" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Sem dados de check-in disponíveis
                </div>
              )}
            </div>

            {/* Interações com Simuladores */}
            {interacoes.interacoes_simuladores && interacoes.interacoes_simuladores.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Zap className="h-5 w-5 text-purple-600" />
                  Interações com Simuladores
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 text-gray-600 font-medium">Simulador</th>
                        <th className="text-center py-3 px-4 text-gray-600 font-medium">Acessos</th>
                        <th className="text-center py-3 px-4 text-gray-600 font-medium">Tempo Médio</th>
                        <th className="text-center py-3 px-4 text-gray-600 font-medium">Taxa de Sucesso</th>
                      </tr>
                    </thead>
                    <tbody>
                      {interacoes.interacoes_simuladores.map((sim, index) => (
                        <tr key={index} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4">{sim.nome}</td>
                          <td className="text-center py-3 px-4">{sim.acessos}</td>
                          <td className="text-center py-3 px-4">{sim.tempo_medio_minutos} min</td>
                          <td className="text-center py-3 px-4">
                            <span className={`px-2 py-1 rounded-full text-sm ${
                              sim.taxa_sucesso >= 70 ? 'bg-green-100 text-green-700' :
                              sim.taxa_sucesso >= 40 ? 'bg-yellow-100 text-yellow-700' :
                              'bg-red-100 text-red-700'
                            }`}>
                              {sim.taxa_sucesso}%
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'demograficos' && demograficos && (
          <div className="space-y-6">
            {/* Perfil Ideal */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Award className="h-5 w-5" />
                Perfil Ideal de Participante
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                  <p className="text-sm opacity-90 mb-1">Gênero Predominante</p>
                  <p className="text-2xl font-bold">{demograficos.perfil_ideal.genero}</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                  <p className="text-sm opacity-90 mb-1">Faixa Etária</p>
                  <p className="text-2xl font-bold">{demograficos.perfil_ideal.faixa_etaria}</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                  <p className="text-sm opacity-90 mb-1">Score Médio</p>
                  <p className="text-2xl font-bold">{demograficos.perfil_ideal.score_medio}</p>
                </div>
              </div>
            </div>

            {/* Gráficos Demográficos */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Distribuição por Gênero */}
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Distribuição por Gênero</h3>
                {demograficos.distribuicao_genero && demograficos.distribuicao_genero.length > 0 ? (
                  <>
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie
                          data={demograficos.distribuicao_genero}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="quantidade"
                          label={({ categoria, percentual }) => `${categoria}: ${percentual}%`}
                        >
                          {demograficos.distribuicao_genero.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="mt-4 space-y-2">
                      {demograficos.distribuicao_genero.map((item, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: COLORS[index % COLORS.length] }}
                            ></div>
                            <span className="text-sm text-gray-600">{item.categoria}</span>
                          </div>
                          <span className="text-sm font-medium">{item.quantidade}</span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    Sem dados demográficos disponíveis
                  </div>
                )}
              </div>

              {/* Distribuição por Faixa Etária */}
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Distribuição por Faixa Etária</h3>
                {demograficos.distribuicao_faixa_etaria && demograficos.distribuicao_faixa_etaria.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={demograficos.distribuicao_faixa_etaria}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="faixa" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="quantidade" fill="#8B5CF6" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    Sem dados de faixa etária disponíveis
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'roi' && roi && (
          <div className="space-y-6">
            {/* ROI Principal */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <Target className="h-5 w-5 text-green-600" />
                Retorno sobre Investimento (ROI)
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-4">
                  <div className="p-4 bg-red-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Custo Total do Evento</p>
                    <div className="flex items-center gap-2">
                      <p className="text-2xl font-bold text-red-600">
                        {formatCurrency(roi.custos.custo_total)}
                      </p>
                      {!editandoCusto && (
                        <button
                          onClick={() => setEditandoCusto(true)}
                          className="text-sm text-blue-600 hover:underline"
                        >
                          Editar
                        </button>
                      )}
                    </div>
                    {editandoCusto && (
                      <div className="mt-3 flex gap-2">
                        <input
                          type="number"
                          value={custoEvento}
                          onChange={(e) => setCustoEvento(e.target.value)}
                          className="flex-1 px-3 py-2 border rounded-lg"
                          placeholder="Custo total"
                        />
                        <button
                          onClick={handleAtualizarCusto}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                          Salvar
                        </button>
                        <button
                          onClick={() => {
                            setEditandoCusto(false);
                            setCustoEvento(roi.custos.custo_total);
                          }}
                          className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
                        >
                          Cancelar
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="p-4 bg-green-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Receita Líquida</p>
                    <p className="text-2xl font-bold text-green-600">
                      {formatCurrency(roi.receita.receita_liquida)}
                    </p>
                  </div>

                  <div className="p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Retorno Financeiro</p>
                    <p className={`text-2xl font-bold ${
                      roi.roi.retorno_financeiro >= 0 ? 'text-blue-600' : 'text-red-600'
                    }`}>
                      {formatCurrency(roi.roi.retorno_financeiro)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-center">
                  <div className="text-center">
                    <div className={`text-6xl font-bold mb-2 ${
                      roi.roi.roi >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {roi.roi.roi >= 0 ? '+' : ''}{roi.roi.roi}%
                    </div>
                    <p className="text-gray-600 text-lg">ROI Total</p>
                    <p className="text-sm text-gray-500 mt-2">
                      Multiplicador: {roi.roi.roi_multiplicador}x
                    </p>
                  </div>
                </div>
              </div>

              {/* Breakdown Financeiro */}
              <div className="border-t pt-6">
                <h4 className="font-semibold text-gray-900 mb-4">Detalhamento de Receitas</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600">Depósitos Totais Recebidos</span>
                    <span className="font-semibold">
                      {formatCurrency(roi.receita.depositos_totais)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600">Reembolsos Não Realizados</span>
                    <span className="font-semibold text-green-600">
                      {formatCurrency(roi.receita.reembolsos_nao_realizados)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600">Taxa de Comparecimento</span>
                    <span className="font-semibold">
                      {roi.metricas_adicionais.taxa_comparecimento}%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Métricas Adicionais */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                <div className="flex items-center gap-3 mb-2">
                  <Users className="h-5 w-5 text-blue-600" />
                  <p className="text-sm text-gray-600">Total de Inscritos</p>
                </div>
                <p className="text-3xl font-bold text-gray-900">
                  {roi.metricas_adicionais.total_inscritos}
                </p>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                <div className="flex items-center gap-3 mb-2">
                  <Activity className="h-5 w-5 text-green-600" />
                  <p className="text-sm text-gray-600">Comparecimento</p>
                </div>
                <p className="text-3xl font-bold text-gray-900">
                  {roi.metricas_adicionais.total_comparecimento}
                </p>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                <div className="flex items-center gap-3 mb-2">
                  <TrendingUp className="h-5 w-5 text-purple-600" />
                  <p className="text-sm text-gray-600">Taxa de Sucesso</p>
                </div>
                <p className="text-3xl font-bold text-gray-900">
                  {roi.metricas_adicionais.taxa_comparecimento}%
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

export default EventoAnalytics;
