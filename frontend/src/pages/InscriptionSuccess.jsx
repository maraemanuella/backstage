import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle, Clock, Home, Calendar } from 'lucide-react';
import '../styles/InscriptionSuccess.css';

const InscriptionSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [inscricao, setInscricao] = useState(null);
  const [message, setMessage] = useState('');
  const [aguardandoAprovacao, setAguardandoAprovacao] = useState(false);

  useEffect(() => {
    if (location.state?.inscricao) {
      setInscricao(location.state.inscricao);
      setMessage(location.state.message || 'Inscrição confirmada com sucesso!');
      setAguardandoAprovacao(location.state.aguardandoAprovacao || false);
    }
  }, [location.state]);

  const handleVoltar = () => {
    navigate('/');
  };

  const handleVerMinhasInscricoes = () => {
    navigate('/proximos');
  };

  if (!inscricao) {
    return (
      <div className="inscription-success-container">
        <div className="success-content">
          <div className="loading">Carregando...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="inscription-success-container">
      <button className="back-btn" onClick={handleVoltar}>← Voltar</button>
      
      <div className="success-content">
        <div className={`success-icon ${aguardandoAprovacao ? 'pending' : ''}`}>
          {aguardandoAprovacao ? <Clock size={60} /> : <CheckCircle size={60} />}
        </div>

        <h1 className="success-title">{message}</h1>

        <p className="success-message">
          {aguardandoAprovacao 
            ? 'Seu pagamento foi registrado! O organizador irá verificar e aprovar em breve.' 
            : 'Sua inscrição foi confirmada! Você receberá um email com os detalhes do evento.'}
        </p>

        {aguardandoAprovacao && (
          <div className="warning-box">
            <p>
              ⏳ <strong>Aguardando aprovação do organizador</strong>
            </p>
            <p className="small-text">
              Você receberá uma notificação assim que seu pagamento for aprovado.
            </p>
          </div>
        )}

        <div className="inscription-details">
          <h3>Detalhes da Inscrição</h3>
          <div className="detail-row">
            <span className="detail-label">Evento:</span>
            <span className="detail-value">
              {inscricao.evento_titulo || inscricao.evento?.titulo || 'Não informado'}
            </span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Status:</span>
            <span className={`detail-value status-${inscricao.status || 'confirmada'}`}>
              {inscricao.status === 'confirmada' ? 'Confirmada' : inscricao.status || 'Confirmada'}
            </span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Valor:</span>
            <span className="detail-value">
              {parseFloat(inscricao.valor_final || 0).toFixed(2) === '0.00'
                ? 'Sem depósito'
                : `R$ ${parseFloat(inscricao.valor_final || 0).toFixed(2)}`}
            </span>
          </div>
          {inscricao.qr_code && (
            <div className="detail-row">
              <span className="detail-label">Código QR:</span>
              <span className="detail-value qr-code">{inscricao.qr_code}</span>
            </div>
          )}
        </div>

        <div className="action-buttons">
          <button onClick={handleVoltar} className="action-btn secondary">
            <Home size={20} />
            Voltar ao Início
          </button>
          <button onClick={handleVerMinhasInscricoes} className="action-btn primary">
            <Calendar size={20} />
            Ver Minhas Inscrições
          </button>
        </div>
      </div>
    </div>
  );
};

export default InscriptionSuccess;
