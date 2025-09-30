import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
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
    if (!dadosParticipante.nome_completo_inscricao || !dadosParticipante.email_inscricao || 
        !dadosParticipante.telefone_inscricao || !dadosParticipante.cpf_inscricao || 
        !metodoPagamento || !aceitouTermos) {
      alert('Preencha todos os campos obrigatórios')
      return
    }

    setSubmitting(true)

    try {
      const response = await api.post('/api/inscricoes/', {
        evento: eventId,
        ...dadosParticipante,
        metodo_pagamento: metodoPagamento,
        aceita_termos: aceitouTermos
      })

      console.log('Inscrição criada:', response.data)
      alert('Inscrição realizada com sucesso!')
    } catch (err) {
      console.error('Erro:', err)
      if (err.response) {
        alert(err.response.data.detail || err.response.data.error || 'Erro na inscrição')
      } else {
        alert('Erro ao processar inscrição')
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