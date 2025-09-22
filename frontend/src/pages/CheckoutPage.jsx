import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock } from 'lucide-react';
import '../styles/CheckoutPage.css';

function CheckoutPage() {
    const navigate = useNavigate();
    const [paymentMethod, setPaymentMethod] = useState('credit');
    const [formData, setFormData] = useState({
        cardNumber: '',
        cardName: '',
        expiryDate: '',
        cvv: ''
    });
    const [loading, setLoading] = useState(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        
        // Formatação específica para cada campo
        let formattedValue = value;
        
        if (name === 'cardNumber') {
            // Remove espaços e adiciona espaços a cada 4 dígitos
            formattedValue = value.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim();
            if (formattedValue.length > 19) formattedValue = formattedValue.slice(0, 19);
        } else if (name === 'expiryDate') {
            // Formato MM/AA
            formattedValue = value.replace(/\D/g, '').replace(/(\d{2})(\d)/, '$1/$2');
            if (formattedValue.length > 5) formattedValue = formattedValue.slice(0, 5);
        } else if (name === 'cvv') {
            // Apenas números, máximo 4 dígitos
            formattedValue = value.replace(/\D/g, '').slice(0, 4);
        }
        
        setFormData(prev => ({
            ...prev,
            [name]: formattedValue
        }));
    };

    const handlePaymentMethodChange = (method) => {
        setPaymentMethod(method);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        
        try {
            // Simular processamento do pagamento
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Redirecionar para página de sucesso
            navigate('/pagamento-sucesso');
        } catch (error) {
            console.error('Erro no pagamento:', error);
        } finally {
            setLoading(false);
        }
    };

    const isFormValid = () => {
        if (paymentMethod === 'pix') return true;
        
        return formData.cardNumber.replace(/\s/g, '').length >= 16 &&
               formData.cardName.trim().length > 0 &&
               formData.expiryDate.length === 5 &&
               formData.cvv.length >= 3;
    };

    return (
        <div className="checkout-container">
            <button className="back-btn" onClick={() => navigate(-1)}>
                Voltar
            </button>

            <div className="checkout-content">
                <div className="checkout-header">
                    <h1 className="checkout-title">Finalizar Compra</h1>
                    <p className="checkout-subtitle">Complete seus dados para finalizar o pedido</p>
                </div>

                <form onSubmit={handleSubmit} className="checkout-form">
                    <div className="payment-method-section">
                        <div className="section-header">
                            <Lock size={20} />
                            <h2>Método de Pagamento</h2>
                        </div>
                        
                        <div className="payment-options">
                            <label className={`payment-option ${paymentMethod === 'credit' ? 'selected' : ''}`}>
                                <input
                                    type="radio"
                                    name="paymentMethod"
                                    value="credit"
                                    checked={paymentMethod === 'credit'}
                                    onChange={() => handlePaymentMethodChange('credit')}
                                />
                                <span>Cartão de Crédito</span>
                            </label>
                            
                            <label className={`payment-option ${paymentMethod === 'debit' ? 'selected' : ''}`}>
                                <input
                                    type="radio"
                                    name="paymentMethod"
                                    value="debit"
                                    checked={paymentMethod === 'debit'}
                                    onChange={() => handlePaymentMethodChange('debit')}
                                />
                                <span>Cartão de Débito</span>
                            </label>
                            
                            <label className={`payment-option ${paymentMethod === 'pix' ? 'selected' : ''}`}>
                                <input
                                    type="radio"
                                    name="paymentMethod"
                                    value="pix"
                                    checked={paymentMethod === 'pix'}
                                    onChange={() => handlePaymentMethodChange('pix')}
                                />
                                <span>PIX</span>
                            </label>
                        </div>
                    </div>

                    {(paymentMethod === 'credit' || paymentMethod === 'debit') && (
                        <div className="card-details-section">
                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="cardNumber">Número do Cartão</label>
                                    <input
                                        type="text"
                                        id="cardNumber"
                                        name="cardNumber"
                                        value={formData.cardNumber}
                                        onChange={handleInputChange}
                                        placeholder="0000 0000 0000 0000"
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="cardName">Nome no Cartão</label>
                                    <input
                                        type="text"
                                        id="cardName"
                                        name="cardName"
                                        value={formData.cardName}
                                        onChange={handleInputChange}
                                        placeholder="Nome como está no cartão"
                                        required
                                    />
                                </div>
                            </div>
                            
                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="expiryDate">Validade</label>
                                    <input
                                        type="text"
                                        id="expiryDate"
                                        name="expiryDate"
                                        value={formData.expiryDate}
                                        onChange={handleInputChange}
                                        placeholder="MM/AA"
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="cvv">CVV</label>
                                    <input
                                        type="text"
                                        id="cvv"
                                        name="cvv"
                                        value={formData.cvv}
                                        onChange={handleInputChange}
                                        placeholder="123"
                                        required
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    <button 
                        type="submit" 
                        className="confirm-payment-btn"
                        disabled={!isFormValid() || loading}
                    >
                        {loading ? 'Processando...' : 'Confirmar Pagamento'}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default CheckoutPage;