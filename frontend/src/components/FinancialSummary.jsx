function FinancialSummary({ 
  eventData, 
  metodoPagamento, 
  aceitouTermos, 
  onTermosChange, 
  onSubmit, 
  submitting 
}) {
  if (!eventData) return null

  const valorOriginal = eventData.valores.valor_original
  const valorDesconto = eventData.valores.desconto_aplicado
  const desconto = eventData.valores.percentual_desconto
  const subtotal = eventData.valores.valor_com_desconto
  const taxaPagamento = metodoPagamento === 'cartao_credito' ? subtotal * 0.0385 : 0
  const total = subtotal + taxaPagamento

  return (
    <div className="summary-card">
      <h3>Resumo Financeiro</h3>
      
      {desconto > 0 && (
        <div className="discount-badge">
          <span>Desconto Aplicado</span>
          <span className="discount-value">{desconto}%</span>
          <small>Baseado no seu score: {eventData.usuario.score}</small>
        </div>
      )}
      
      <div className="price-breakdown">
        <div className="price-item">
          <span>Valor original:</span>
          <span>R$ {Number(valorOriginal).toFixed(2)}</span>
        </div>
        
      
          <div className="price-item discount">
            <span>Desconto ({desconto}%):</span>
            <span>-R$ {Number(valorDesconto).toFixed(2)}</span>
          </div>
       
        
        <div className="price-item">
          <span>Subtotal:</span>
          <span>R$ {Number(subtotal).toFixed(2)}</span>
        </div>
        
        {taxaPagamento > 0 && (
          <div className="price-item fee">
            <span>Taxa de pagamento:</span>
            <span>+R$ {taxaPagamento.toFixed(2)}</span>
          </div>
        )}
        
        <hr />
        
        <div className="price-item total">
          <span>Total:</span>
          <span>R$ {total.toFixed(2)}</span>
        </div>
      </div>

      <div className="refund-info">
        <h4>Reembolso</h4>
        <p>Estimativa de reembolso após comparecimento:</p>
        <div className="refund-amount">R$ {total.toFixed(2)}</div>
        <small>100% do valor pago será reembolsado mediante confirmação de presença.</small>
      </div>

      <label className="checkbox-container">
        <input
          type="checkbox"
          checked={aceitouTermos}
          onChange={(e) => onTermosChange(e.target.checked)}
        />
        <span>Aceito os termos específicos do evento</span>
      </label>

      <button 
        className="confirm-btn"
        onClick={onSubmit}
        disabled={!aceitouTermos || submitting}
      >
        {submitting ? 'Processando...' : 'Continuar Inscrição'}
      </button>
    </div>
  )
}

export default FinancialSummary