import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Clock, Download, ChevronLeft } from 'lucide-react';
import api from '../api';
import '../styles/GerenciarPagamentos.css';

const GerenciarPagamentos = () => {
  const { eventoId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [evento, setEvento] = useState(null);
  const [inscricoesPendentes, setInscricoesPendentes] = useState([]);
  const [error, setError] = useState('');
  const [processando, setProcessando] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const verificarUsuario = async () => {
      try {
        const userRes = await api.get('/api/user/me/');
        const userData = userRes.data;
        setUser(userData);
        
        // Verificar se o documento foi aprovado
        if (userData.documento_verificado !== 'aprovado') {
          alert('Você precisa verificar seu documento antes de gerenciar pagamentos.');
          navigate('/verificar-documento');
          return;
        }
        
        // Se aprovado, carrega os pagamentos
        carregarPagamentosPendentes();
      } catch (err) {
        console.error('Erro ao verificar usuário:', err);
        navigate('/');
      }
    };
    
    verificarUsuario();
  }, [eventoId, navigate]);

  const carregarPagamentosPendentes = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/inscricoes/evento/${eventoId}/pagamentos-pendentes/`);
      setEvento(response.data.evento);
      setInscricoesPendentes(response.data.inscricoes);
      setError('');
    } catch (err) {
      console.error('Erro ao carregar pagamentos:', err);
      setError(err.response?.data?.erro || 'Erro ao carregar pagamentos pendentes');
    } finally {
      setLoading(false);
    }
  };

  const handleAprovar = async (inscricaoId) => {
    if (!confirm('Deseja aprovar este pagamento?')) return;

    try {
      setProcessando(inscricaoId);
      await api.post(`/api/inscricoes/${inscricaoId}/aprovar-pagamento/`, {
        acao: 'aprovar'
      });
      
      // Recarregar lista
      await carregarPagamentosPendentes();
      alert('Pagamento aprovado com sucesso!');
    } catch (err) {
      console.error('Erro ao aprovar:', err);
      alert(err.response?.data?.erro || 'Erro ao aprovar pagamento');
    } finally {
      setProcessando(null);
    }
  };

  const handleRejeitar = async (inscricaoId) => {
    const observacoes = prompt('Motivo da rejeição (opcional):');
    if (observacoes === null) return; // Usuário cancelou

    try {
      setProcessando(inscricaoId);
      await api.post(`/api/inscricoes/${inscricaoId}/aprovar-pagamento/`, {
        acao: 'rejeitar',
        observacoes_admin: observacoes
      });
      
      // Recarregar lista
      await carregarPagamentosPendentes();
      alert('Pagamento rejeitado');
    } catch (err) {
      console.error('Erro ao rejeitar:', err);
      alert(err.response?.data?.erro || 'Erro ao rejeitar pagamento');
    } finally {
      setProcessando(null);
    }
  };

  const handleBaixarComprovante = (comprovanteUrl) => {
    window.open(comprovanteUrl, '_blank');
  };

  if (loading) {
    return (
      <div className="gerenciar-pagamentos-container">
        <div className="loading">Carregando...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="gerenciar-pagamentos-container">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <ChevronLeft size={20} /> Voltar
        </button>
        <div className="error-box">
          <h2>Erro</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="gerenciar-pagamentos-container">
      <button className="back-btn" onClick={() => navigate(-1)}>
        <ChevronLeft size={20} /> Voltar
      </button>

      <div className="header">
        <h1>Gerenciar Pagamentos</h1>
        {evento && <h2>{evento.nome}</h2>}
        <div className="stats">
          <div className="stat-item">
            <Clock size={24} />
            <div>
              <span className="stat-number">{inscricoesPendentes.length}</span>
              <span className="stat-label">Pendentes</span>
            </div>
          </div>
        </div>
      </div>

      {inscricoesPendentes.length === 0 ? (
        <div className="empty-state">
          <CheckCircle size={60} />
          <h3>Nenhum pagamento pendente</h3>
          <p>Todas as inscrições foram processadas!</p>
        </div>
      ) : (
        <div className="inscricoes-list">
          {inscricoesPendentes.map((inscricao) => (
            <div key={inscricao.id} className="inscricao-card">
              <div className="inscricao-header">
                <div className="usuario-info">
                  <h3>{inscricao.usuario_nome || inscricao.usuario_username}</h3>
                  <p>{inscricao.usuario_email}</p>
                </div>
                <div className="valor-info">
                  <span className="valor">R$ {parseFloat(inscricao.valor_final).toFixed(2)}</span>
                  <span className="status-badge pendente">Pendente</span>
                </div>
              </div>

              <div className="inscricao-details">
                <div className="detail-item">
                  <span className="label">Data do pagamento:</span>
                  <span className="value">
                    {inscricao.data_pagamento 
                      ? new Date(inscricao.data_pagamento).toLocaleString('pt-BR')
                      : 'Não informada'}
                  </span>
                </div>
                
                {inscricao.observacoes_pagamento && (
                  <div className="detail-item full-width">
                    <span className="label">Observações:</span>
                    <span className="value">{inscricao.observacoes_pagamento}</span>
                  </div>
                )}

                {inscricao.comprovante_pagamento && (
                  <div className="detail-item">
                    <span className="label">Comprovante:</span>
                    <button 
                      onClick={() => handleBaixarComprovante(inscricao.comprovante_pagamento)}
                      className="download-btn"
                    >
                      <Download size={16} />
                      Baixar comprovante
                    </button>
                  </div>
                )}
              </div>

              <div className="inscricao-actions">
                <button
                  onClick={() => handleAprovar(inscricao.id)}
                  disabled={processando === inscricao.id}
                  className="action-btn aprovar"
                >
                  <CheckCircle size={20} />
                  {processando === inscricao.id ? 'Processando...' : 'Aprovar'}
                </button>
                <button
                  onClick={() => handleRejeitar(inscricao.id)}
                  disabled={processando === inscricao.id}
                  className="action-btn rejeitar"
                >
                  <XCircle size={20} />
                  Rejeitar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GerenciarPagamentos;
