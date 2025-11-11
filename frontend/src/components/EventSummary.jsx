import { Calendar, MapPin, Clock, Users } from 'lucide-react'

function EventSummary({ eventData }) {
  if (!eventData) return null

  const evento = eventData.evento
  
  let itensIncluidos = evento.itens_incluidos || []
  
  if (typeof itensIncluidos === 'string') {
    itensIncluidos = itensIncluidos.split('\n').filter(item => item.trim())
  }
  
  if (!Array.isArray(itensIncluidos) || itensIncluidos.length === 0) {
    itensIncluidos = [
      'Acesso completo ao evento',
      'Material exclusivo do evento', 
      'Networking com outros participantes',
      'Certificado de participação',
      'Kit exclusivo do evento'
    ]
  }

  return (
    <div className="event-summary">
      <h2>{evento.titulo}</h2>
      <div className="event-details">
        <span>
          <Calendar size={16} /> 
          {new Date(evento.data_evento).toLocaleDateString('pt-BR')}
        </span>
        <span>
          <MapPin size={16} /> 
          {evento.endereco}
        </span>
        {evento.local_especifico && (
          <span>
            <Clock size={16} /> 
            {evento.local_especifico}
          </span>
        )}
        <span>
          <Users size={16} /> 
          {evento.capacidade_maxima} participantes
        </span>
      </div>
      
      <hr className="section-divider" />
      
      <h3>O que está incluído:</h3>
      <ul className="included-list">
        {itensIncluidos.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
    </div>
  )
}

export default EventSummary