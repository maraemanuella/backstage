import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Modal from "../components/Modal";
import api from "../api.js";

function DashboardAdmin() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const [metricasGlobais, setMetricasGlobais] = useState(null);
  const [organizadores, setOrganizadores] = useState(null);
  const [verificacoes, setVerificacoes] = useState(null);
  const [performance, setPerformance] = useState(null);
  const [logs, setLogs] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        const userRes = await api.get("/api/user/me/");
        const userData = userRes.data;
        setUser(userData);
        
        if (!userData.is_staff) {
          alert("Acesso negado. Apenas administradores podem acessar este dashboard.");
          navigate('/');
          return;
        }

        const [metricasRes, orgRes, verRes, perfRes, logsRes] = await Promise.allSettled([
          api.get("/api/admin/dashboard/metricas/"),
          api.get("/api/admin/dashboard/organizadores/"),
          api.get("/api/admin/dashboard/verificacoes/"),
          api.get("/api/admin/dashboard/performance/"),
          api.get("/api/admin/dashboard/logs/")
        ]);

        if (metricasRes.status === 'fulfilled') setMetricasGlobais(metricasRes.value.data);
        if (orgRes.status === 'fulfilled') setOrganizadores(orgRes.value.data);
        if (verRes.status === 'fulfilled') setVerificacoes(verRes.value.data);
        if (perfRes.status === 'fulfilled') setPerformance(perfRes.value.data);
        if (logsRes.status === 'fulfilled') setLogs(logsRes.value.data);

      } catch (error) {
        console.error("Erro ao carregar dados:", error);
        if (error.response?.status === 403) {
          alert("Acesso negado. Apenas administradores podem acessar este dashboard.");
          navigate('/');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

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
      <Header user={user} setOpenModal={setOpenModal} />
      <Modal isOpen={openModal} setOpenModal={setOpenModal} user={user} />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Dashboard Administrativo</h1>
          <p className="text-lg text-gray-600">Visão geral do sistema e métricas de performance</p>
        </div>

        {/* Métricas Globais */}
        {metricasGlobais && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600 text-sm font-medium">Usuários Ativos</span>
                <span className="text-3xl">👥</span>
              </div>
              <p className="text-3xl font-bold text-gray-900">{metricasGlobais.usuarios_ativos}</p>
            </div>
            
            <div className="bg-white rounded-xl shadow p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600 text-sm font-medium">Eventos Realizados</span>
                <span className="text-3xl">🎉</span>
              </div>
              <p className="text-3xl font-bold text-gray-900">{metricasGlobais.eventos_realizados}</p>
            </div>
            
            <div className="bg-white rounded-xl shadow p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600 text-sm font-medium">Revenue Total</span>
                <span className="text-3xl">💰</span>
              </div>
              <p className="text-3xl font-bold text-gray-900">
                R$ {metricasGlobais.revenue_total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
            
            <div className="bg-white rounded-xl shadow p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600 text-sm font-medium">Taxa de Crescimento</span>
                <span className="text-3xl">📈</span>
              </div>
              <p className={`text-3xl font-bold ${metricasGlobais.taxa_crescimento > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {metricasGlobais.taxa_crescimento > 0 ? '+' : ''}{metricasGlobais.taxa_crescimento}%
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Organizadores */}
          {organizadores && (
            <div className="bg-white rounded-xl shadow p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Organizadores</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total:</span>
                  <span className="text-2xl font-bold">{organizadores.total_organizadores}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Verificados:</span>
                  <span className="text-xl font-semibold text-green-600">{organizadores.verificados}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Não Verificados:</span>
                  <span className="text-xl font-semibold text-orange-600">{organizadores.nao_verificados}</span>
                </div>
                <div className="pt-4 border-t">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-500">Taxa de Verificação</span>
                    <span className="text-sm font-semibold">{organizadores.percentual_verificados}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-green-500 h-3 rounded-full transition-all"
                      style={{ width: `${organizadores.percentual_verificados}%` }}
                    ></div>
                  </div>
                </div>
                <div className="pt-4 border-t space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Eventos (Verificados):</span>
                    <span className="text-sm font-medium">{organizadores.eventos_verificados}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Eventos (Não Verificados):</span>
                    <span className="text-sm font-medium">{organizadores.eventos_nao_verificados}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Verificações */}
          {verificacoes && (
            <div className="bg-white rounded-xl shadow p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Verificações de Documento</h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <span>Pendentes</span>
                  <span className="px-3 py-1 bg-gray-200 text-gray-700 rounded-full font-semibold">{verificacoes.pendentes}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-yellow-50 rounded">
                  <span>Verificando</span>
                  <span className="px-3 py-1 bg-yellow-200 text-yellow-700 rounded-full font-semibold">{verificacoes.verificando}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-green-50 rounded">
                  <span>Aprovados</span>
                  <span className="px-3 py-1 bg-green-200 text-green-700 rounded-full font-semibold">{verificacoes.aprovados}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-red-50 rounded">
                  <span>Rejeitados</span>
                  <span className="px-3 py-1 bg-red-200 text-red-700 rounded-full font-semibold">{verificacoes.rejeitados}</span>
                </div>
                
                <div className="pt-4 border-t">
                  <p className="text-sm text-gray-600 mb-2">Atividade Recente:</p>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Últimos 7 dias:</span>
                      <span className="font-medium">{verificacoes.ultimos_7_dias}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Últimos 30 dias:</span>
                      <span className="font-medium">{verificacoes.ultimos_30_dias}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Performance */}
        {performance && (
          <div className="bg-white rounded-xl shadow p-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Performance do Sistema</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <p className="text-gray-600 mb-1">Inscrições (último mês)</p>
                <p className="text-3xl font-bold">{performance.inscricoes_mes}</p>
              </div>
              <div>
                <p className="text-gray-600 mb-1">Taxa de Conversão</p>
                <p className="text-3xl font-bold text-green-600">{performance.taxa_conversao}%</p>
              </div>
            </div>
            
            {performance.eventos_populares.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Eventos Mais Populares</h3>
                <div className="space-y-2">
                  {performance.eventos_populares.map((evento, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                      <span className="font-medium">{evento.titulo}</span>
                      <span className="text-sm text-gray-600">{evento.total_inscricoes} inscrições</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Logs */}
        {logs && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Últimas Inscrições</h2>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {logs.ultimas_inscricoes.map((inscricao) => (
                  <div key={inscricao.id} className="p-3 bg-gray-50 rounded">
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-medium text-sm">{inscricao.usuario__username}</span>
                      <span className={`text-xs px-2 py-1 rounded ${
                        inscricao.status_pagamento === 'aprovado' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {inscricao.status_pagamento}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{inscricao.evento__titulo}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(inscricao.created_at).toLocaleString('pt-BR')}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Últimas Transferências</h2>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {logs.ultimas_transferencias.map((transfer) => (
                  <div key={transfer.id} className="p-3 bg-gray-50 rounded">
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-sm">
                        {transfer.from_user__username} → {transfer.to_user__username}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded ${
                        transfer.status === 'accepted' ? 'bg-green-100 text-green-700' : 
                        transfer.status === 'denied' ? 'bg-red-100 text-red-700' : 
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {transfer.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{transfer.inscricao__evento__titulo}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(transfer.created_at).toLocaleString('pt-BR')}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

export default DashboardAdmin;