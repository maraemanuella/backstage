import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { CreditCard, CheckCircle, Upload } from 'lucide-react';
import api from '../api';
import '../styles/PaymentPage.css';

const PaymentPage = () => {
  const { inscricaoId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [paymentData, setPaymentData] = useState(null);
  const [comprovante, setComprovante] = useState(null);
  const [observacoes, setObservacoes] = useState('');

  useEffect(() => {
    // Dados vêm do estado da navegação
    if (location.state?.paymentData) {
      setPaymentData(location.state.paymentData);
    } else {
      setError('Dados de pagamento não encontrados');
    }
  }, [location.state]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validar tipo de arquivo
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
      if (!validTypes.includes(file.type)) {
        setError('Por favor, envie uma imagem (JPG, PNG) ou PDF');
        return;
      }
      // Validar tamanho (máx 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('O arquivo deve ter no máximo 5MB');
        return;
      }
      setComprovante(file);
      setError('');
    }
  };

  const handleConfirmarPagamento = async () => {
    try {
      setLoading(true);
      setError('');

      // Criar FormData para enviar arquivo
      const formData = new FormData();
      if (comprovante) {
        formData.append('comprovante', comprovante);
      }
      if (observacoes) {
        formData.append('observacoes', observacoes);
      }

      const response = await api.post(
        `/api/inscricoes/${inscricaoId}/confirmar-pagamento/`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (response.status === 200) {
        // Redirecionar para página de sucesso
        navigate('/inscricoes/sucesso', {
          state: {
            inscricao: response.data,
            message: response.data.mensagem,
            aguardandoAprovacao: true
          }
        });
      }
    } catch (err) {
      console.error('Erro ao confirmar pagamento:', err);
      setError(
        err.response?.data?.erro || 
        'Erro ao confirmar pagamento. Tente novamente.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleVoltar = () => {
    navigate(-1);
  };

  if (error && !paymentData) {
    return (
      <div className="payment-container">
        <button className="back-btn" onClick={handleVoltar}>← Voltar</button>
        <div className="payment-content">
          <div className="error-message">
            <h2>Erro</h2>
            <p>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!paymentData) {
    return (
      <div className="payment-container">
        <div className="payment-content">
          <div className="loading">Carregando...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-container">
      <button className="back-btn" onClick={handleVoltar}>← Voltar</button>
      
      <div className="payment-content">
        <div className="payment-header">
          <div className="payment-icon">
            <CreditCard size={40} />
          </div>
          <h1>Pagamento via PIX</h1>
          <p>Escaneie o QR Code para realizar o pagamento</p>
        </div>

        <div className="event-summary">
          <h3>{paymentData.evento?.titulo}</h3>
          <p className="event-date">
            {paymentData.evento?.data_evento && 
              new Date(paymentData.evento.data_evento).toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })
            }
          </p>
        </div>

        <div className="payment-details">
          <h3>Resumo do Pagamento</h3>
          <div className="detail-row">
            <span>Valor original:</span>
            <span className="value">
              R$ {parseFloat(paymentData.pagamento?.valor_original || 0).toFixed(2)}
            </span>
          </div>
          
          {parseFloat(paymentData.pagamento?.desconto_aplicado || 0) > 0 && (
            <div className="detail-row discount">
              <span>Desconto aplicado:</span>
              <span className="value">
                - R$ {parseFloat(paymentData.pagamento?.desconto_aplicado || 0).toFixed(2)}
              </span>
            </div>
          )}
          
          <div className="detail-row total">
            <span>Valor total:</span>
            <span className="value">
              R$ {parseFloat(paymentData.pagamento?.valor_final || 0).toFixed(2)}
            </span>
          </div>
        </div>

        {paymentData.pagamento?.qr_code_pix_url ? (
          <div className="qr-code-section">
            <h3>QR Code PIX</h3>
            <div className="qr-code-wrapper">
              <img 
                src={paymentData.pagamento.qr_code_pix_url} 
                alt="QR Code PIX" 
                className="qr-code-image"
              />
            </div>
            
            <div className="instructions-box">
              <h4>Como pagar:</h4>
              <ol className="payment-steps">
                <li>Abra o app do seu banco</li>
                <li>Escolha a opção PIX</li>
                <li>Escaneie o QR Code acima</li>
                <li>Confirme o pagamento</li>
                <li>Clique no botão abaixo após realizar o pagamento</li>
              </ol>
            </div>
          </div>
        ) : (
          <div className="alert-box error">
            <p>⚠️ QR Code não disponível. Entre em contato com o organizador.</p>
          </div>
        )}

        <div className="comprovante-section">
          <h3>Comprovante de Pagamento (Opcional)</h3>
          <p className="help-text">
            Para facilitar a aprovação, você pode anexar o comprovante do pagamento PIX
          </p>
          
          <div className="file-upload-wrapper">
            <input
              type="file"
              id="comprovante"
              accept="image/*,.pdf"
              onChange={handleFileChange}
              className="file-input"
            />
            <label htmlFor="comprovante" className="file-label">
              <Upload size={20} />
              {comprovante ? comprovante.name : 'Selecionar arquivo'}
            </label>
            {comprovante && (
              <button 
                onClick={() => setComprovante(null)} 
                className="remove-file-btn"
                type="button"
              >
                ✕ Remover
              </button>
            )}
          </div>

          <div className="observacoes-wrapper">
            <label htmlFor="observacoes">Observações (Opcional)</label>
            <textarea
              id="observacoes"
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              placeholder="Adicione informações adicionais sobre o pagamento..."
              rows="3"
              className="observacoes-input"
            />
          </div>
        </div>

        {error && (
          <div className="alert-box error">
            <p>{error}</p>
          </div>
        )}

        <div className="action-buttons">
          <button
            onClick={handleConfirmarPagamento}
            className="confirm-btn"
            disabled={loading || !paymentData.pagamento?.qr_code_pix_url}
          >
            <CheckCircle size={20} />
            {loading ? 'Confirmando...' : 'Confirmar Pagamento'}
          </button>
        </div>

        <div className="status-box">
          <p className="status-text">
            <strong>Status:</strong> Aguardando pagamento
          </p>
          <p className="info-text">
            ℹ️ Após confirmar, sua inscrição ficará pendente até o organizador aprovar o pagamento.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
