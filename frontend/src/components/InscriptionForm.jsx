import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import "../styles/EventInscription.css"
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
  
  const [aceitouTermos, setAceitouTermos] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const fetchEventData = async () => {
      try {
        const response = await api.get(`/api/eventos/${eventId}/resumo-inscricao/`)
        setEventData(response.data)
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
        aceita_termos: aceitouTermos
      }
      
      console.log('Criando inscrição com pagamento PIX:', payload)
      
      // Usa o novo endpoint que retorna o QR Code
      const response = await api.post('/api/inscricoes/iniciar-pagamento/', payload)

      console.log('Inscrição iniciada:', response.data)
      
      // Redireciona para a página de pagamento com os dados
      if (response.data && response.data.inscricao_id) {
        navigate(`/pagamento/${response.data.inscricao_id}`, {
          state: {
            paymentData: response.data
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
            
            <div className="payment-info-box">
              <h3>💳 Método de Pagamento</h3>
              <div className="pix-only-notice">
                <div className="pix-icon">
                  <svg width="40" height="40" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M242.4 292.5C247.8 287.1 247.8 278.2 242.4 272.8L155.5 185.9C150.1 180.5 141.2 180.5 135.8 185.9L106.6 215.1C101.2 220.5 101.2 229.4 106.6 234.8L193.5 321.7C198.9 327.1 207.8 327.1 213.2 321.7L242.4 292.5Z" fill="#32BCAD"/>
                    <path d="M405.4 234.8L318.5 321.7C313.1 327.1 304.2 327.1 298.8 321.7L269.6 292.5C264.2 287.1 264.2 278.2 269.6 272.8L356.5 185.9C361.9 180.5 370.8 180.5 376.2 185.9L405.4 215.1C410.8 220.5 410.8 229.4 405.4 234.8Z" fill="#32BCAD"/>
                  </svg>
                </div>
                <p><strong>Pagamento via PIX</strong></p>
                <p className="pix-description">
                  Após preencher seus dados, você será direcionado para a página de pagamento 
                  onde poderá escanear o QR Code PIX do evento.
                </p>
              </div>
            </div>
          </div>

          <div className="summary-section">
            <FinancialSummary 
              eventData={eventData}
              metodoPagamento="pix"
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