import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { CreditCard, CheckCircle, Clock, AlertCircle, ArrowLeft } from 'lucide-react';
import api from '../api';
import '../styles/PaymentPage.css';

const PaymentPage = () => {
  const { inscricaoId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [paymentData, setPaymentData] = useState(null);
  const [showChangeMethod, setShowChangeMethod] = useState(false);
  const [changingMethod, setChangingMethod] = useState(false);

  useEffect(() => {
    const fetchPaymentData = async () => {
      // Se já tem dados via navegação, usa eles
      if (location.state?.paymentData) {
        setPaymentData(location.state.paymentData);
        setLoading(false);
        return;
      }

      // Senão, busca os dados da API
      if (!inscricaoId) {
        setError('ID da inscrição não fornecido');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await api.get(`/api/pagamento/inscricao/${inscricaoId}/`);

        // Formatar dados no mesmo formato esperado
        const formattedData = {
          inscricao_id: response.data.inscricao_id,
          metodo_pagamento: response.data.metodo_pagamento,
          evento: response.data.evento,
          pagamento: {
            valor_original: response.data.valor_original,
            desconto_aplicado: response.data.desconto_aplicado,
            valor_final: response.data.valor_final,
            metodo_pagamento: response.data.metodo_pagamento,
            status_pagamento: response.data.status_pagamento,
          },
          expira_em: response.data.expira_em,
          tempo_restante_minutos: response.data.tempo_restante_minutos,
        };

        setPaymentData(formattedData);
        setError('');
      } catch (err) {
        console.error('Erro ao buscar dados de pagamento:', err);

        // Se o erro for 410 (Gone), significa que expirou
        if (err.response?.status === 410) {
          setError(
            err.response?.data?.mensagem ||
            'Esta inscrição expirou. Por favor, faça uma nova inscrição.'
          );
        } else {
          setError(
            err.response?.data?.erro ||
            err.response?.data?.error ||
            'Dados de pagamento não encontrados. A inscrição pode ter expirado.'
          );
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentData();
  }, [location.state, inscricaoId]);


  const handleStripePayment = async () => {
    try {
      setLoading(true);
      setError('');

      // Criar sessão de checkout do Stripe
      const response = await api.post('/api/pagamento/stripe/create-checkout-session/', {
        inscricao_id: inscricaoId
      });

      if (response.data.checkout_url) {
        // Redirecionar para a página de checkout do Stripe
        window.location.href = response.data.checkout_url;
      }
    } catch (err) {
      console.error('Erro ao criar sessão Stripe:', err);
      setError(
        err.response?.data?.error ||
        'Erro ao processar pagamento. Tente novamente.'
      );
      setLoading(false);
    }
  };

  const handleConfirmarPagamento = () => {
    // Apenas pagamento com cartão (Stripe)
    handleStripePayment();
  };

  const handleVoltar = () => {
    navigate(-1);
  };

  const handleTrocarMetodo = async (novoMetodo) => {
    try {
      setChangingMethod(true);
      setError('');

      const response = await api.post(
        `/api/inscricoes/${inscricaoId}/trocar-metodo-pagamento/`,
        { novo_metodo: novoMetodo }
      );

      if (response.data.success) {
        // Atualizar dados localmente
        setPaymentData(prev => ({
          ...prev,
          metodo_pagamento: novoMetodo,
          pagamento: {
            ...prev.pagamento,
            metodo_pagamento: novoMetodo,
          },
        }));

        setShowChangeMethod(false);
      }
    } catch (err) {
      console.error('Erro ao trocar método:', err);
      setError(
        err.response?.data?.error ||
        'Erro ao trocar método de pagamento. Tente novamente.'
      );
    } finally {
      setChangingMethod(false);
    }
  };

  // Mostra loading enquanto carrega
  if (loading && !paymentData) {
    return (
      <div className="payment-container">
        <div className="payment-content">
          <div className="loading">Carregando dados do pagamento...</div>
        </div>
      </div>
    );
  }

  // Mostra erro se houver e não tiver dados
  if (error && !paymentData) {
    return (
      <div className="payment-container">
        <button className="back-btn" onClick={handleVoltar}>← Voltar</button>
        <div className="payment-content">
          <div className="error-message">
            <h2>Erro</h2>
            <p>{error}</p>
            <button onClick={() => navigate(-1)} className="back-btn" style={{ marginTop: '20px' }}>
              Voltar
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Se ainda não tem dados, mostra loading
  if (!paymentData) {
    return (
      <div className="payment-container">
        <div className="payment-content">
          <div className="loading">Carregando...</div>
        </div>
      </div>
    );
  }

  const metodo = paymentData?.metodo_pagamento || 'cartao_credito';

  const getMetodoLabel = (m) => {
    if (m === 'cartao_credito') return 'Cartão de Crédito';
    if (m === 'cartao_debito') return 'Cartão de Débito';
    return m;
  };

  return (
    <div className="payment-container">
      <div className="payment-content">
        {/* Header */}
        <div className="payment-header">
          <button className="back-button" onClick={handleVoltar}>
            <ArrowLeft size={20} />
            Voltar
          </button>
          <h1>Finalizar Pagamento</h1>
          <p className="subtitle">Complete os dados para confirmar sua inscrição</p>
        </div>

        {/* Timer de Expiração */}
        {paymentData?.tempo_restante_minutos > 0 && (
          <div className="alert-info">
            <Clock size={18} />
            <div>
              <strong>Tempo restante:</strong> {paymentData.tempo_restante_minutos} minuto{paymentData.tempo_restante_minutos !== 1 ? 's' : ''}
              <br />
              <small>Complete o pagamento antes que a inscrição expire</small>
            </div>
          </div>
        )}

        {/* Informações do Evento */}
        <div className="card">
          <h3>Detalhes do Evento</h3>
          <div className="event-info">
            <p className="event-title">{paymentData?.evento?.titulo}</p>
            {paymentData?.evento?.data_evento && (
              <p className="event-date">
                {new Date(paymentData.evento.data_evento).toLocaleDateString('pt-BR', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            )}
          </div>
        </div>

        {/* Resumo do Pagamento */}
        <div className="card">
          <h3>Resumo do Pagamento</h3>
          <div className="payment-summary">
            <div className="summary-row">
              <span>Valor original:</span>
              <span>R$ {parseFloat(paymentData?.pagamento?.valor_original || 0).toFixed(2)}</span>
            </div>
            {parseFloat(paymentData?.pagamento?.desconto_aplicado || 0) > 0 && (
              <div className="summary-row discount">
                <span>Desconto aplicado:</span>
                <span>- R$ {parseFloat(paymentData.pagamento.desconto_aplicado).toFixed(2)}</span>
              </div>
            )}
            <div className="summary-row total">
              <span><strong>Total a pagar:</strong></span>
              <span><strong>R$ {parseFloat(paymentData?.pagamento?.valor_final || 0).toFixed(2)}</strong></span>
            </div>
          </div>
        </div>

        {/* Método de Pagamento */}
        <div className="card">
          <div className="method-header">
            <h3>Método de Pagamento</h3>
            <button
              className="change-method-btn"
              onClick={() => setShowChangeMethod(!showChangeMethod)}
            >
              {showChangeMethod ? 'Cancelar' : 'Trocar Método'}
            </button>
          </div>

          <div className="current-method">
            <CreditCard size={20} />
            <span>{getMetodoLabel(metodo)}</span>
          </div>

          {/* Modal de Troca de Método */}
          {showChangeMethod && (
            <div className="change-method-panel">
              <p className="panel-title">Selecione o novo método:</p>
              <div className="method-options">
                <button
                  onClick={() => handleTrocarMetodo('cartao_credito')}
                  disabled={changingMethod || metodo === 'cartao_credito'}
                  className={`method-option ${metodo === 'cartao_credito' ? 'selected' : ''}`}
                >
                  Cartão de Crédito
                </button>
                <button
                  onClick={() => handleTrocarMetodo('cartao_debito')}
                  disabled={changingMethod || metodo === 'cartao_debito'}
                  className={`method-option ${metodo === 'cartao_debito' ? 'selected' : ''}`}
                >
                  Cartão de Débito
                </button>
              </div>
              {changingMethod && <p className="loading-text">Alterando método...</p>}
            </div>
          )}
        </div>

        {/* Conteúdo do pagamento com cartão */}
        <div className="card">
          <h3>Pagamento com Cartão</h3>
          <div className="instructions">
            <ol>
              <li>Clique no botão abaixo para ir ao checkout seguro</li>
              <li>Insira os dados do seu cartão</li>
              <li>Confirme o pagamento</li>
              <li>Você será redirecionado de volta após a conclusão</li>
            </ol>
            <div className="secure-badge">
              <CheckCircle size={16} />
              Pagamento processado com segurança pelo Stripe
            </div>
          </div>
        </div>

        {/* Erro */}
        {error && (
          <div className="alert-error">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {/* Botão de Ação */}
        <div className="action-section">
          <button
            onClick={handleConfirmarPagamento}
            className="btn-primary"
            disabled={loading}
          >
            {loading ? (
              'Processando...'
            ) : (
              <>
                <CreditCard size={20} />
                Pagar com Cartão
              </>
            )}
          </button>

          <p className="info-text">
            Seu pagamento será processado de forma segura pelo Stripe.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
