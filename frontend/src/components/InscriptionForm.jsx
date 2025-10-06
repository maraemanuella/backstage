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
  
  const [metodoPagamento, setMetodoPagamento] = useState('')
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
    if (!metodoPagamento) {
      toast.error('Selecione um método de pagamento')
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
        evento: eventId,
        ...dadosParticipante,
        cpf_inscricao: cpfLimpo,
        metodo_pagamento: metodoPagamento,
        aceita_termos: aceitouTermos
      }
      console.log('Payload inscrição:', payload)
      const response = await api.post('/api/inscricoes/', payload)

      console.log('Inscrição criada:', response.data)
      toast.success('Inscrição realizada com sucesso!')

      // Navega para a página de finalização/QR code
      if (response.data && response.data.id) {
        navigate(`/inscricao-realizada/${response.data.id}`)
        return
      }

      // Fallback: busca as inscrições do usuário e encontra a inscrição para este evento
      try {
        const minhas = await api.get('/api/inscricoes/minhas/')
        const inscricoes = minhas.data || []
        const match = inscricoes.find(i => String(i.evento_id || i.evento || i.event) === String(eventId) || String(i.evento) === String(eventId))
        if (match && match.id) {
          navigate(`/inscricao-realizada/${match.id}`)
          return
        }
      } catch (e) {
        console.error('Erro ao buscar minhas inscrições para fallback:', e)
      }
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
          if (data.detail) parts.push(data.detail)
          Object.keys(data).forEach(key => {
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
            <PaymentMethodSelector 
              metodoPagamento={metodoPagamento}
              onSelect={setMetodoPagamento}
            />
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