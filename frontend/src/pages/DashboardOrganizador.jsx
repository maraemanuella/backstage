import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  Users,
  TrendingUp,
  DollarSign,
  Bell,
  Plus,
  Eye,
  Edit3,
  MapPin,
  Clock,
  Star,
  Award,
  Activity,
  BarChart3
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
  Cell
} from 'recharts';
import Header from '../components/Header';
import Modal from '../components/Modal';
import api from '../api';

function DashboardOrganizador() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [metrics, setMetrics] = useState({
    totalInscricoes: 0,
    taxaComparecimento: 0,
    receitaTotal: 0,
    scoreMedia: 0
  });
  const [proximosEventos, setProximosEventos] = useState([]);
  const [eventosAnteriores, setEventosAnteriores] = useState([]);
  const [notificacoes, setNotificacoes] = useState([]);
  const [graficos, setGraficos] = useState({
    comparecimentoMensal: [],
    scoreMedio: [],
    desempenhoEventos: []
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        const [userRes] = await Promise.allSettled([
          api.get("api/user/me/")
        ]);

        if (userRes.status === 'fulfilled') {
          const userData = userRes.value.data;
          setUser(userData);
          
          // Verificar se o documento foi aprovado
          if (userData.documento_verificado !== 'aprovado') {
            alert('Você precisa verificar seu documento antes de acessar o dashboard de organizador.');
            navigate('/verificar-documento');
            return;
          }
        }

        // Buscar dados das APIs
        const [metricas, eventosProximos, eventosAnteriores, notificacoes, graficos] = 
          await Promise.allSettled([
            api.get("/api/dashboard/metricas/"),
            api.get("/api/dashboard/eventos-proximos/"),
            api.get("/api/dashboard/eventos-anteriores/"),
            api.get("/api/dashboard/notificacoes/"),
            api.get("/api/dashboard/graficos/")
          ]);

        // Atualizar métricas
        if (metricas.status === 'fulfilled') {
          setMetrics(metricas.value.data);
        } else {
          // Dados de fallback
          setMetrics({
            totalInscricoes: 0,
            taxaComparecimento: 0,
            receitaTotal: 0,
            scoreMedia: 0
          });
        }

        // Atualizar próximos eventos
        if (eventosProximos.status === 'fulfilled') {
          setProximosEventos(eventosProximos.value.data);
        } else {
          setProximosEventos([]);
        }

        // Atualizar eventos anteriores
        if (eventosAnteriores.status === 'fulfilled') {
          setEventosAnteriores(eventosAnteriores.value.data);
        } else {
          setEventosAnteriores([]);
        }

        // Atualizar notificações
        if (notificacoes.status === 'fulfilled') {
          setNotificacoes(notificacoes.value.data);
        } else {
          setNotificacoes([]);
        }

        // Atualizar gráficos
        if (graficos.status === 'fulfilled') {
          setGraficos(graficos.value.data);
        } else {
          // Dados de fallback para gráficos
          setGraficos({
            comparecimentoMensal: [],
            scoreMedio: [],
            desempenhoEventos: [
              { name: 'Completos', value: 0, color: '#10B981' },
              { name: 'Em andamento', value: 0, color: '#F59E0B' },
              { name: 'Cancelados', value: 0, color: '#EF4444' }
            ]
          });
        }

      } catch (error) {
        console.error("Erro ao carregar dados do dashboard:", error);
        // Definir dados de fallback em caso de erro
        setMetrics({
          totalInscricoes: 0,
          taxaComparecimento: 0,
          receitaTotal: 0,
          scoreMedia: 0
        });
        setProximosEventos([]);
        setEventosAnteriores([]);
        setNotificacoes([]);
        setGraficos({
          comparecimentoMensal: [],
          scoreMedio: [],
          desempenhoEventos: [
            { name: 'Completos', value: 0, color: '#10B981' },
            { name: 'Em andamento', value: 0, color: '#F59E0B' },
            { name: 'Cancelados', value: 0, color: '#EF4444' }
          ]
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatCurrency = (value) => {
    if (value === null || value === undefined || isNaN(value)) {
      return 'R$ 0,00';
    }
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString) => {
    if (!dateString) {
      return 'Data não disponível';
    }
    try {
      return new Date(dateString).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } catch (error) {
      return 'Data inválida';
    }
  };

  const MetricCard = ({ icon: Icon, title, value, subtitle, color = "blue" }) => (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {subtitle && (
            <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
          )}
        </div>
        <div className={`p-3 rounded-lg bg-${color}-50`}>
          <Icon className={`h-6 w-6 text-${color}-600`} />
        </div>
      </div>
    </div>
  );

  const EventCard = ({ evento, tipo = "proximo" }) => (
    <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow duration-200">
      <div className="flex justify-between items-start mb-3">
        <h4 className="font-semibold text-gray-900 text-sm">{evento.titulo}</h4>
        {tipo === "proximo" ? (
          <span className={`px-2 py-1 text-xs rounded-full ${
            evento.status === 'Confirmado' 
              ? 'bg-green-100 text-green-700' 
              : 'bg-yellow-100 text-yellow-700'
          }`}>
            {evento.status}
          </span>
        ) : (
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 text-yellow-400 fill-current" />
            <span className="text-sm font-medium">{evento.score}</span>
          </div>
        )}
      </div>
      
      <div className="space-y-2 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          <span>{formatDate(evento.data)}</span>
        </div>
        
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4" />
          <span>
            {tipo === "proximo" 
              ? `${evento.inscricoes} inscrições`
              : `${evento.comparecimento}/${evento.inscricoes} presentes`
            }
          </span>
        </div>

        {tipo === "proximo" && evento.local && (
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            <span>{evento.local}</span>
          </div>
        )}

        {tipo === "anterior" && (
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            <span>{formatCurrency(evento.receita)}</span>
          </div>
        )}
      </div>

      <div className="flex gap-2 mt-4">
        <button 
          onClick={() => navigate(`/evento/${evento.id}/analytics`)}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors"
        >
          <BarChart3 className="h-4 w-4" />
          Analytics
        </button>
        <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors">
          <Eye className="h-4 w-4" />
          Ver
        </button>
        {tipo === "proximo" && (
          <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors">
            <Edit3 className="h-4 w-4" />
            Editar
          </button>
        )}
      </div>
    </div>
  );

  const NotificationCard = ({ notificacao }) => {
    const getIconAndColor = (tipo) => {
      switch (tipo) {
        case 'warning':
          return { icon: Clock, color: 'text-yellow-600 bg-yellow-50' };
        case 'success':
          return { icon: Award, color: 'text-green-600 bg-green-50' };
        default:
          return { icon: Bell, color: 'text-blue-600 bg-blue-50' };
      }
    };

    const { icon: Icon, color } = getIconAndColor(notificacao.tipo);

    return (
      <div className="flex items-start gap-3 p-3 bg-white border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
        <div className={`p-2 rounded-lg ${color}`}>
          <Icon className="h-4 w-4" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-gray-900 text-sm">{notificacao.titulo}</h4>
          <p className="text-sm text-gray-600 mt-1">{notificacao.mensagem}</p>
          <p className="text-xs text-gray-400 mt-2">{notificacao.tempo}</p>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando dashboard...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <Modal isOpen={openModal} setOpenModal={setOpenModal} user={user} />
      <Header user={user} setOpenModal={setOpenModal} />
      
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        {/* Header do Dashboard */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Dashboard do Organizador</h1>
            <p className="text-gray-600 mt-1">Gerencie seus eventos e acompanhe métricas</p>
          </div>
          <button 
            onClick={() => alert('Funcionalidade "Criar Evento" será implementada em breve!')}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-5 w-5" />
            Criar Evento
          </button>
        </div>

        {/* Métricas Principais */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            icon={Users}
            title="Total de Inscrições"
            value={metrics.totalInscricoes ? metrics.totalInscricoes.toLocaleString() : '0'}
            subtitle="Último mês"
            color="blue"
          />
          <MetricCard
            icon={TrendingUp}
            title="Taxa de Comparecimento"
            value={`${metrics.taxaComparecimento || 0}%`}
            subtitle="Média geral"
            color="green"
          />
          <MetricCard
            icon={DollarSign}
            title="Receita Total"
            value={formatCurrency(metrics.receitaTotal)}
            subtitle="Este ano"
            color="purple"
          />
          <MetricCard
            icon={Star}
            title="Score Médio"
            value={metrics.scoreMedia ? metrics.scoreMedia.toFixed(1) : '0.0'}
            subtitle="Avaliação dos eventos"
            color="yellow"
          />
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Gráfico de Comparecimento Mensal */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Comparecimento Mensal (%)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={graficos.comparecimentoMensal || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="comparecimento" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Gráfico de Score por Evento */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Score Médio por Evento</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={graficos.scoreMedio || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="evento" />
                <YAxis domain={[0, 5]} />
                <Tooltip />
                <Line type="monotone" dataKey="score" stroke="#10B981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Gráfico de Desempenho dos Eventos */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Status dos Eventos</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={graficos.desempenhoEventos || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {(graficos.desempenhoEventos || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-4 mt-4">
              {(graficos.desempenhoEventos || []).map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <span className="text-sm text-gray-600">{item.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Notificações */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Notificações</h3>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {notificacoes.length > 0 ? (
                notificacoes.map((notificacao) => (
                  <NotificationCard key={notificacao.id} notificacao={notificacao} />
                ))
              ) : (
                <div className="text-center py-8">
                  <Bell className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">Nenhuma notificação no momento</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Cards de Eventos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Próximos Eventos */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Próximos Eventos</h3>
            <div className="space-y-4">
              {proximosEventos && proximosEventos.length > 0 ? (
                proximosEventos.map((evento) => (
                  <EventCard key={evento.id} evento={evento} tipo="proximo" />
                ))
              ) : (
                <div className="text-center py-8">
                  <Calendar className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">Nenhum evento próximo encontrado</p>
                </div>
              )}
            </div>
          </div>

          {/* Eventos Anteriores */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Eventos Anteriores</h3>
            <div className="space-y-4">
              {eventosAnteriores && eventosAnteriores.length > 0 ? (
                eventosAnteriores.map((evento) => (
                  <EventCard key={evento.id} evento={evento} tipo="anterior" />
                ))
              ) : (
                <div className="text-center py-8">
                  <Clock className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">Nenhum evento anterior encontrado</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default DashboardOrganizador;