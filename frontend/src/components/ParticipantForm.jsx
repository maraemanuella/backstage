function ParticipantForm({ dadosParticipante, onInputChange }) {
  return (
    <div className="form-card">
      <h3>Dados do Participante</h3>
      
      <input
        className="form-input"
        type="text"
        placeholder="Nome Completo*"
        value={dadosParticipante.nome_completo_inscricao}
        onChange={(e) => onInputChange('nome_completo_inscricao', e.target.value)}
      />
      
      <input
        className="form-input"
        type="email"
        placeholder="E-mail*"
        value={dadosParticipante.email_inscricao}
        onChange={(e) => onInputChange('email_inscricao', e.target.value)}
      />
      
      <div className="form-row">
        <input
          className="form-input"
          type="tel"
          placeholder="Telefone*"
          value={dadosParticipante.telefone_inscricao}
          onChange={(e) => onInputChange('telefone_inscricao', e.target.value)}
        />
        
        <input
          className="form-input"
          type="text"
          placeholder="CPF*"
          value={dadosParticipante.cpf_inscricao}
          onChange={(e) => onInputChange('cpf_inscricao', e.target.value)}
        />
      </div>
    </div>
  )
}

export default ParticipantForm