import React from 'react'

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
  const total = subtotal
  const isSemDeposito = subtotal === 0 || subtotal < 0.50
  const isNaoReembolsavel = eventData.is_nao_reembolsavel || false

  return (
    <div className="summary-card">
      <h3>Resumo Financeiro</h3>

      {isSemDeposito ? (
        <>
          {desconto > 0 && (
            <div className="discount-applied">
              <span className="discount-label">Desconto aplicado: {desconto}%</span>
              <span className="original-value">Valor original: R$ {Number(valorOriginal).toFixed(2)}</span>
            </div>
          )}

          <div className="info-notice">
            <span>Inscrição sem depósito inicial</span>
            <div className="info-tooltip-wrapper">
              <svg className="info-icon" width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                <path d="m8.93 6.588-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533L8.93 6.588zM9 4.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0z"/>
              </svg>
              <div className="info-tooltip">
                Este evento não requer pagamento inicial. Sua vaga está confirmada, mas o comparecimento é obrigatório. Faltas sem justificativa podem afetar seu score.
              </div>
            </div>
          </div>
        </>
      ) : (
        <>
          {desconto > 0 && (
            <div className="discount-badge">
              <span>Desconto Aplicado</span>
              <span className="discount-value">{desconto}%</span>
              <small>Baseado no seu score: {eventData.usuario.score}</small>
            </div>
          )}

          <div className="price-breakdown">
            <div className="price-item">
              <span>{isNaoReembolsavel ? 'Valor do Ingresso:' : 'Depósito original:'}</span>
              <span>R$ {Number(valorOriginal).toFixed(2)}</span>
            </div>

            {desconto > 0 && (
              <div className="price-item discount">
                <span>Desconto ({desconto}%):</span>
                <span>-R$ {Number(valorDesconto).toFixed(2)}</span>
              </div>
            )}

            <div className="price-item">
              <span>Subtotal:</span>
              <span>R$ {Number(subtotal).toFixed(2)}</span>
            </div>

            <hr />

            <div className="price-item total">
              <span>Total a pagar agora:</span>
              <span>R$ {total.toFixed(2)}</span>
            </div>
          </div>

          {isNaoReembolsavel ? (
            // Aviso para eventos NÃO REEMBOLSÁVEIS
            <div className="warning-notice" style={{
              background: 'linear-gradient(135deg, #fff5f5 0%, #fed7d7 100%)',
              border: '2px solid #fc8181',
              borderRadius: '12px',
              padding: '16px',
              marginTop: '16px'
            }}>
              <div style={{ display: 'flex', alignItems: 'start', gap: '12px' }}>
                <svg style={{ width: '24px', height: '24px', color: '#c53030', flexShrink: 0, marginTop: '2px' }} fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <div style={{ flex: 1 }}>
                  <h4 style={{ margin: '0 0 8px 0', color: '#742a2a', fontSize: '15px', fontWeight: '700' }}>
                    ⚠️ Compra de Ingresso - Não Reembolsável
                  </h4>
                  <p style={{ margin: '0 0 12px 0', color: '#742a2a', fontSize: '13px', lineHeight: '1.6' }}>
                    <strong>ATENÇÃO:</strong> Você está <strong>COMPRANDO UM INGRESSO</strong>, não fazendo um depósito.
                    O valor pago <strong>NÃO será devolvido</strong> em caso de cancelamento ou ausência.
                  </p>
                  <div style={{
                    background: '#fff',
                    borderLeft: '3px solid #e53e3e',
                    padding: '12px',
                    borderRadius: '6px',
                    marginBottom: '12px'
                  }}>
                    <p style={{ margin: '0 0 8px 0', color: '#2d3748', fontSize: '13px', fontWeight: '600' }}>
                      📋 Política de Cancelamento:
                    </p>
                    <p style={{ margin: '0', color: '#4a5568', fontSize: '12px', lineHeight: '1.6', fontStyle: 'italic' }}>
                      "{eventData.politica_cancelamento}"
                    </p>
                  </div>
                  <p style={{ margin: '0 0 8px 0', color: '#742a2a', fontSize: '12px', lineHeight: '1.5' }}>
                    ⚖️ <strong>Proteção do Consumidor:</strong> Esta transação está sujeita ao Código de Defesa do Consumidor (CDC).
                    Em caso de problemas com o evento, você pode solicitar reembolso conforme previsto em lei.
                  </p>
                  <a
                    href="https://www.planalto.gov.br/ccivil_03/leis/l8078compilado.htm"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-block',
                      color: '#c53030',
                      fontSize: '12px',
                      textDecoration: 'underline',
                      fontWeight: '600',
                      marginTop: '4px'
                    }}
                  >
                    📖 Consultar Código de Defesa do Consumidor
                  </a>
                </div>
              </div>
            </div>
          ) : (
            // Aviso para eventos REEMBOLSÁVEIS (depósito)
            <div className="info-notice">
              <span>Depósito 100% reembolsável</span>
              <div className="info-tooltip-wrapper">
                <svg className="info-icon" width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                  <path d="m8.93 6.588-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533L8.93 6.588zM9 4.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0z"/>
                </svg>
                <div className="info-tooltip">
                  Você paga R$ {total.toFixed(2)} e recebe 100% de volta ao comparecer. Se não comparecer, 95% vai para o organizador e 5% fica como taxa de processamento da plataforma.
                </div>
              </div>
            </div>
          )}
        </>
      )}

      <label className="checkbox-container">
        <input
          type="checkbox"
          checked={aceitouTermos}
          onChange={(e) => onTermosChange(e.target.checked)}
        />
        <span>Aceito os termos do evento e comprometo-me a comparecer</span>
      </label>

      <button
        className="confirm-btn"
        onClick={onSubmit}
        disabled={!aceitouTermos || submitting}
      >
        {submitting ? 'Processando...' : (isSemDeposito ? 'Confirmar Inscrição' : 'Pagar Depósito Reembolsável')}
      </button>
    </div>
  )
}

export default FinancialSummary

