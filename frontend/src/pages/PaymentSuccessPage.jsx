import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, Loader, ArrowLeft, FileText, Calendar, Award } from 'lucide-react';
import api from '../api';
import '../styles/PaymentPage.css';

const PaymentSuccessPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [paymentInfo, setPaymentInfo] = useState(null);

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        const sessionId = searchParams.get('session_id');
        const inscricaoId = searchParams.get('inscricao_id');

        if (!sessionId || !inscricaoId) {
          setError('Informações de pagamento inválidas');
          setLoading(false);
          return;
        }

        // Verificar status do pagamento no backend
        const response = await api.get('/api/pagamento/stripe/success/', {
          params: {
            session_id: sessionId,
            inscricao_id: inscricaoId
          }
        });

        if (response.data.success) {
          setPaymentInfo(response.data);
        } else {
          setError('Pagamento não foi concluído');
        }
      } catch (err) {
        console.error('Erro ao verificar pagamento:', err);
        setError(
          err.response?.data?.error ||
          'Erro ao verificar pagamento. Por favor, entre em contato conosco.'
        );
      } finally {
        setLoading(false);
      }
    };

    verifyPayment();
  }, [searchParams]);

  const handleGoToInscricoes = () => {
    navigate('/meus-eventos');
  };

  const handleGoHome = () => {
    navigate('/');
  };

  if (loading) {
    return (
      <div className="payment-container">
        <div className="payment-content">
          <div className="card status-card">
            <div className="loading-spinner">
              <Loader size={48} className="spinner" />
            </div>
            <h2>Verificando pagamento...</h2>
            <p className="help-text">
              Por favor, aguarde enquanto confirmamos seu pagamento.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="payment-container">
        <div className="payment-content">
          <div className="payment-header">
            <button className="back-button" onClick={handleGoHome}>
              <ArrowLeft size={20} />
              Voltar
            </button>
          </div>

          <div className="alert-error">
            <Award size={18} />
            <div>
              <strong>Erro ao verificar pagamento</strong>
              <p>{error}</p>
            </div>
          </div>

          <div className="action-section">
            <button onClick={handleGoHome} className="btn-primary">
              Voltar para Início
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-container">
      <div className="payment-content">
        {/* Header */}
        <div className="payment-header">
          <button className="back-button" onClick={handleGoHome}>
            <ArrowLeft size={20} />
            Voltar
          </button>
        </div>

        {/* Status Card */}
        <div className="card status-card">
          <div className="status-icon success">
            <CheckCircle size={48} />
          </div>
          <h1>Pagamento Confirmado!</h1>
          <p className="status-message">
            Sua inscrição foi confirmada com sucesso e você receberá um email de confirmação em breve.
          </p>
        </div>

        {/* Detalhes da Inscrição */}
        {paymentInfo && (
          <div className="card">
            <h3>Detalhes da Inscrição</h3>
            <div className="payment-summary">
              <div className="summary-row">
                <span>Evento:</span>
                <strong>{paymentInfo.inscricao?.evento?.titulo}</strong>
              </div>
              <div className="summary-row">
                <span>Data do Evento:</span>
                <strong>
                  {paymentInfo.inscricao?.evento?.data_evento &&
                    new Date(paymentInfo.inscricao.evento.data_evento).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                </strong>
              </div>
              <div className="summary-row">
                <span>Status:</span>
                <span className="badge-success">
                  {paymentInfo.inscricao?.status === 'confirmada' ? 'Confirmada' : 'Pendente'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Próximos Passos */}
        <div className="card">
          <h3>Próximos Passos</h3>
          <div className="options-list">
            <div className="option-item">
              <FileText size={20} className="option-icon" />
              <div>
                <strong>Email de Confirmação</strong>
                <p>Você receberá um email com todos os detalhes da sua inscrição</p>
              </div>
            </div>
            <div className="option-item">
              <Calendar size={20} className="option-icon" />
              <div>
                <strong>QR Code de Entrada</strong>
                <p>Acesse suas inscrições para visualizar seu QR Code para o dia do evento</p>
              </div>
            </div>
            <div className="option-item">
              <Award size={20} className="option-icon" />
              <div>
                <strong>Fique Atento</strong>
                <p>Você receberá atualizações importantes sobre o evento</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="action-section">
          <button onClick={handleGoToInscricoes} className="btn-primary">
            <FileText size={20} />
            Ver Minhas Inscrições
          </button>

          <button onClick={handleGoHome} className="btn-secondary">
            Voltar para Início
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccessPage;

