function PaymentMethodSelector({ metodoPagamento, onSelect }) {
  return (
    <div className="form-card">
      <h3>Método de Pagamento</h3>
      
      <div className="payment-methods">
        <label className={`payment-option ${metodoPagamento === 'cartao_credito' ? 'selected' : ''}`}>
          <input
            type="radio"
            name="pagamento"
            value="cartao_credito"
            checked={metodoPagamento === 'cartao_credito'}
            onChange={(e) => onSelect(e.target.value)}
          />
          <span> Cartão de Crédito</span>
        </label>
        
        <label className={`payment-option ${metodoPagamento === 'cartao_debito' ? 'selected' : ''}`}>
          <input
            type="radio"
            name="pagamento"
            value="cartao_debito"
            checked={metodoPagamento === 'cartao_debito'}
            onChange={(e) => onSelect(e.target.value)}
          />
          <span> Cartão de Débito</span>
        </label>
        
        <label className={`payment-option ${metodoPagamento === 'pix' ? 'selected' : ''}`}>
          <input
            type="radio"
            name="pagamento"
            value="pix"
            checked={metodoPagamento === 'pix'}
            onChange={(e) => onSelect(e.target.value)}
          />
          <span> PIX</span>
        </label>
      </div>
    </div>
  )
}

export default PaymentMethodSelector