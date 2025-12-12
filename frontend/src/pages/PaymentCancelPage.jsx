import { useNavigate, useSearchParams } from 'react-router-dom';
import { XCircle, ArrowLeft, RefreshCw, Home, AlertCircle } from 'lucide-react';
import '../styles/PaymentPage.css';

const PaymentCancelPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const inscricaoId = searchParams.get('inscricao_id');

  const handleRetry = () => {
    if (inscricaoId) {
      // Redirecionar para a página de pagamento correta
      navigate(`/pagamento/${inscricaoId}`);
    } else {
      // Se não tiver ID, voltar para eventos
      navigate('/eventos');
    }
  };

  const handleGoHome = () => {
    navigate('/');
  };

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
          <div className="status-icon error">
            <XCircle size={48} />
          </div>
          <h1>Pagamento Cancelado</h1>
          <p className="status-message">
            O processo de pagamento foi cancelado e nenhuma cobrança foi realizada.
          </p>
        </div>

        {/* Information Card */}
        <div className="card">
          <h3>O que aconteceu?</h3>
          <p className="help-text">
            Você cancelou o pagamento ou fechou a janela antes de concluir.
            Sua inscrição ainda está reservada temporariamente e você pode tentar novamente.
          </p>
        </div>

        {/* Options Card */}
        <div className="card">
          <h3>Próximos passos</h3>
          <div className="options-list">
            <div className="option-item">
              <RefreshCw size={20} className="option-icon" />
              <div>
                <strong>Tentar novamente</strong>
                <p>Você pode tentar realizar o pagamento novamente a qualquer momento</p>
              </div>
            </div>
            <div className="option-item">
              <AlertCircle size={20} className="option-icon" />
              <div>
                <strong>Trocar método de pagamento</strong>
                <p>Na página de pagamento, você pode escolher outro método (PIX ou outro cartão)</p>
              </div>
            </div>
          </div>
        </div>

        {/* Alert */}
        <div className="alert-info">
          <AlertCircle size={18} />
          <div>
            <strong>Atenção:</strong> Sua inscrição expira em alguns minutos.
            Complete o pagamento em breve para garantir sua vaga.
          </div>
        </div>

        {/* Action Buttons */}
        <div className="action-section">
          <button onClick={handleRetry} className="btn-primary">
            <RefreshCw size={20} />
            Tentar Pagamento Novamente
          </button>

          <button onClick={handleGoHome} className="btn-secondary">
            <Home size={20} />
            Voltar para Início
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentCancelPage;

