import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import "../styles/EventInscription.css"
import "../styles/InscriptionInfo.css"
import EventSummary from './EventSummary'
import ParticipantForm from './ParticipantForm'
import PaymentMethodSelector from './PaymentMethodSelector'
import FinancialSummary from './FinancialSummary'
import api from '../api.js'

function InscriptionForm({ eventId }) {
  const navigate = useNavigate()
  
  const [eventData, setEventData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  const [dadosParticipante, setDadosParticipante] = useState({
    nome_completo_inscricao: '',
    email_inscricao: '',
    telefone_inscricao: '',
    cpf_inscricao: ''
  })
  
  const [metodoPagamento, setMetodoPagamento] = useState('pix')
  const [aceitouTermos, setAceitouTermos] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const fetchEventData = async () => {
      try {
        const response = await api.get(`/api/eventos/${eventId}/resumo-inscricao/`)
        setEventData(response.data)

        // Apenas cartão é aceito como método de pagamento
        setMetodoPagamento('cartao_credito')

        setError(null)
      } catch (err) {
        console.error('Erro ao carregar evento:', err)
        if (err.response) {
          setError(err.response.data.error || 'Não foi possível carregar os dados do evento.')
        } else {
          setError('Erro de conexão com o servidor.')
        }
      } finally {
        setLoading(false)
      }
    }

    if (eventId) {
      fetchEventData()
    }
  }, [eventId])

  const handleInputChange = (field, value) => {
    setDadosParticipante(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async () => {
    // Validações client-side
    if (!dadosParticipante.nome_completo_inscricao) {
      toast.error('Preencha o nome completo')
      return
    }
    if (!dadosParticipante.email_inscricao || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(dadosParticipante.email_inscricao)) {
      toast.error('Informe um email válido')
      return
    }
    if (!dadosParticipante.telefone_inscricao || dadosParticipante.telefone_inscricao.replace(/\D/g, '').length < 10) {
      toast.error('Informe um telefone válido')
      return
    }
    const cpfOnly = (dadosParticipante.cpf_inscricao || '').replace(/\D/g, '')
    if (!cpfOnly || cpfOnly.length !== 11) {
      toast.error('CPF deve conter 11 dígitos')
      return
    }
    if (!aceitouTermos) {
      toast.error('Você precisa aceitar os termos para prosseguir')
      return
    }

    setSubmitting(true)

    // Sanitiza CPF: envia apenas dígitos
    const cpfLimpo = (dadosParticipante.cpf_inscricao || '').replace(/\D/g, '')

    try {
      const payload = {
        evento_id: eventId,
        ...dadosParticipante,
        cpf_inscricao: cpfLimpo,
        metodo_pagamento: metodoPagamento,
        aceita_termos: aceitouTermos
      }
      
      console.log('Criando inscrição:', payload)

      // Usa o endpoint de iniciar pagamento
      const response = await api.post('/api/inscricoes/iniciar-pagamento/', payload)

      console.log('Inscrição iniciada:', response.data)
      
      // Se for evento sem depósito inicial, redireciona para página de sucesso direto
      if (response.data.isento || response.data.status === 'confirmada') {
        toast.success('Inscrição confirmada! Este evento não requer depósito inicial.')
        navigate('/inscricoes/sucesso', {
          state: {
            inscricao: {
              id: response.data.inscricao_id,
              evento_titulo: response.data.evento?.titulo || eventData?.titulo || 'Evento',
              status: 'confirmada',
              valor_final: response.data.valor_final || '0.00'
            },
            message: 'Inscrição confirmada! Compareça ao evento para garantir sua vaga.',
            isento: true
          }
        })
        return
      }

      // Se for evento pago, redireciona para a página de pagamento
      if (response.data && response.data.inscricao_id) {
        navigate(`/pagamento/${response.data.inscricao_id}`, {
          state: {
            paymentData: {
              ...response.data,
              metodo_pagamento: metodoPagamento
            }
          }
        })
        return
      }

      toast.error('Erro ao processar inscrição: dados incompletos')
    } catch (err) {
      console.error('Erro:', err)

      // Mostra mensagem detalhada retornada pelo DRF (campo/array/dict/string)
      if (err.response && err.response.data) {
        const data = err.response.data
        // Se for string
        if (typeof data === 'string') {
          toast.error(data)
        } else if (Array.isArray(data)) {
          toast.error(data.join(' '))
        } else if (typeof data === 'object') {
          // junta mensagens de campos e non_field_errors
          const parts = []
          if (data.error) parts.push(data.error)
          if (data.detail) parts.push(data.detail)
          Object.keys(data).forEach(key => {
            if (key === 'error' || key === 'detail') return
            const val = data[key]
            if (Array.isArray(val)) parts.push(`${key}: ${val.join(' ')}`)
            else if (typeof val === 'string') parts.push(`${key}: ${val}`)
            else parts.push(`${key}: ${JSON.stringify(val)}`)
          })
          toast.error(parts.join(' | '))
        } else {
          toast.error('Erro na inscrição')
        }
      } else {
        toast.error('Erro ao processar inscrição')
      }
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <div className="inscription-container"><div className="loading">Carregando dados do evento...</div></div>
  
  if (error) return (
    <div className="inscription-container">
      <button className="back-btn" onClick={() => navigate(-1)}>← Voltar</button>
      <div className="error-message"><h2>Erro</h2><p>{error}</p></div>
    </div>
  )

  return (
    <div className="inscription-container">
      <ToastContainer />
      <button className="back-btn" onClick={() => navigate(-1)}>← Voltar</button>
      <div className="inscription-content">
        <div className="inscription-header">
          <h1>Inscrição do Evento</h1>
          <p>Complete sua inscrição e garanta sua vaga!</p>
        </div>

        <EventSummary eventData={eventData} />

        <div className="inscription-layout">
          <div className="form-section">
            <ParticipantForm 
              dadosParticipante={dadosParticipante}
              onInputChange={handleInputChange}
            />
            
            {/* Só mostrar seletor de pagamento se não for gratuito */}
            {eventData?.valor_com_desconto > 0 && eventData?.valor_com_desconto >= 0.50 && (
              <PaymentMethodSelector
                metodoPagamento={metodoPagamento}
                onSelect={setMetodoPagamento}
              />
            )}
          </div>

          <div className="summary-section">
            <FinancialSummary 
              eventData={eventData}
              metodoPagamento={metodoPagamento}
              aceitouTermos={aceitouTermos}
              onTermosChange={setAceitouTermos}
              onSubmit={handleSubmit}
              submitting={submitting}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default InscriptionForm