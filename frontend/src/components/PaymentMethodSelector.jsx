function PaymentMethodSelector({ metodoPagamento, onSelect }) {
  return (
    <div className="form-card">
      <h3>Método de Pagamento</h3>
      <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '1rem' }}>
        Atualmente aceitamos apenas pagamento via PIX
      </p>
      
      <div className="payment-methods">
        <label className={`payment-option ${metodoPagamento === 'pix' ? 'selected' : ''}`}>
          <input
            type="radio"
            name="pagamento"
            value="pix"
            checked={metodoPagamento === 'pix'}
            onChange={(e) => onSelect(e.target.value)}
          />
          <span>💰 PIX</span>
        </label>
        
        {/* Opções desabilitadas para referência futura */}
        <label className="payment-option disabled" style={{ opacity: 0.5, cursor: 'not-allowed' }}>
          <input
            type="radio"
            name="pagamento"
            value="cartao_credito"
            disabled
          />
          <span>💳 Cartão de Crédito (em breve)</span>
        </label>
        
        <label className="payment-option disabled" style={{ opacity: 0.5, cursor: 'not-allowed' }}>
          <input
            type="radio"
            name="pagamento"
            value="cartao_debito"
            disabled
          />
          <span>💳 Cartão de Débito (em breve)</span>
        </label>
      </div>
    </div>
  )
}

export default PaymentMethodSelector