import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'
import Header from '../components/Header'
import Modal from '../components/Modal'

function CriarEvento() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [modalAberto, setModalAberto] = useState(false)
  const [loading, setLoading] = useState(false)
  
  const [evento, setEvento] = useState({
    titulo: '',
    descricao: '',
    categoria: '',
    data_evento: '',
    endereco: '',
    local_especifico: '',
    capacidade_maxima: '',
    valor_deposito: '',
    permite_transferencia: true,
    politica_cancelamento: 'Cancelamento gratuito até 24h antes do evento',
    itens_incluidos: '',
    foto_capa: null,
    latitude: '',
    longitude: ''
  })

  useEffect(() => {
    const verificarPermissao = async () => {
      try {
        const response = await api.get('/api/user/me/')
        setUser(response.data)
      } catch (error) {
        console.error('Erro ao verificar usuário:', error)
        navigate('/login')
      }
    }
    
    verificarPermissao()
  }, [navigate])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setEvento(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleFileChange = (e) => {
    setEvento(prev => ({
      ...prev,
      foto_capa: e.target.files[0]
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const formData = new FormData()
      
      formData.append('titulo', evento.titulo)
      formData.append('descricao', evento.descricao)
      formData.append('categoria', evento.categoria)
      formData.append('data_evento', evento.data_evento)
      formData.append('endereco', evento.endereco)
      formData.append('capacidade_maxima', evento.capacidade_maxima)
      formData.append('valor_deposito', evento.valor_deposito)
      formData.append('permite_transferencia', evento.permite_transferencia)
      formData.append('politica_cancelamento', evento.politica_cancelamento)
      
      if (evento.local_especifico) formData.append('local_especifico', evento.local_especifico)
      if (evento.itens_incluidos) formData.append('itens_incluidos', evento.itens_incluidos)
      if (evento.latitude) formData.append('latitude', evento.latitude)
      if (evento.longitude) formData.append('longitude', evento.longitude)
      if (evento.foto_capa) formData.append('foto_capa', evento.foto_capa)

      const response = await api.post('/api/eventos/criar/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      alert('Evento criado com sucesso!')
      navigate(`/evento/${response.data.id}`)
    } catch (error) {
      console.error('Erro ao criar evento:', error)
      if (error.response?.data) {
        console.error('Detalhes:', error.response.data)
        alert(`Erro: ${JSON.stringify(error.response.data)}`)
      } else {
        alert('Erro ao criar evento. Verifique os campos.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header com menu */}
      <Header user={user} setOpenModal={setModalAberto} />

      {/* Conteúdo principal */}
      <main className="max-w-7xl mx-auto">
        <div className="px-8 pt-8 pb-4">
          <h1 className="text-[34px] font-semibold">Criar Evento</h1>
          <hr className="mt-4 border-black/20" />
        </div>

        <div className="px-8 py-6">
          <form onSubmit={handleSubmit} className="max-w-4xl space-y-6">
            {/* Informações Básicas */}
            <div className="bg-white p-6 rounded-lg shadow border">
              <h2 className="text-xl font-semibold mb-4">Informações Básicas</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Título *</label>
                  <input
                    type="text"
                    name="titulo"
                    value={evento.titulo}
                    onChange={handleChange}
                    required
                    maxLength={200}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Categoria *</label>
                  <select
                    name="categoria"
                    value={evento.categoria}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Selecione...</option>
                    <option value="Workshop">Workshop</option>
                    <option value="Palestra">Palestra</option>
                    <option value="Networking">Networking</option>
                    <option value="Curso">Curso</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Descrição *</label>
                  <textarea
                    name="descricao"
                    value={evento.descricao}
                    onChange={handleChange}
                    required
                    rows={5}
                    placeholder="Descreva seu evento..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Itens Incluídos</label>
                  <textarea
                    name="itens_incluidos"
                    value={evento.itens_incluidos}
                    onChange={handleChange}
                    rows={4}
                    placeholder="Digite um item por linha&#10;Ex:&#10;Certificado de participação&#10;Coffee break&#10;Material didático"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <small className="text-gray-500">Digite um item por linha</small>
                </div>
              </div>
            </div>

            {/* Localização */}
            <div className="bg-white p-6 rounded-lg shadow border">
              <h2 className="text-xl font-semibold mb-4">Localização</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Endereço *</label>
                  <input
                    type="text"
                    name="endereco"
                    value={evento.endereco}
                    onChange={handleChange}
                    required
                    maxLength={300}
                    placeholder="Rua, número, bairro, cidade - Estado"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Local Específico</label>
                  <input
                    type="text"
                    name="local_especifico"
                    value={evento.local_especifico}
                    onChange={handleChange}
                    maxLength={100}
                    placeholder="Ex: Auditório Principal, Sala 201..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Latitude</label>
                    <input
                      type="number"
                      step="any"
                      name="latitude"
                      value={evento.latitude}
                      onChange={handleChange}
                      placeholder="-10.123456"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Longitude</label>
                    <input
                      type="number"
                      step="any"
                      name="longitude"
                      value={evento.longitude}
                      onChange={handleChange}
                      placeholder="-48.123456"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Data e Valores */}
            <div className="bg-white p-6 rounded-lg shadow border">
              <h2 className="text-xl font-semibold mb-4">Data e Valores</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Data e Hora do Evento *</label>
                  <input
                    type="datetime-local"
                    name="data_evento"
                    value={evento.data_evento}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Capacidade Máxima *</label>
                    <input
                      type="number"
                      name="capacidade_maxima"
                      value={evento.capacidade_maxima}
                      onChange={handleChange}
                      required
                      min="1"
                      placeholder="100"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Valor do Depósito (R$) *</label>
                    <input
                      type="number"
                      step="0.01"
                      name="valor_deposito"
                      value={evento.valor_deposito}
                      onChange={handleChange}
                      required
                      min="0"
                      placeholder="50.00"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Foto de Capa</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Políticas */}
            <div className="bg-white p-6 rounded-lg shadow border">
              <h2 className="text-xl font-semibold mb-4">Políticas</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="permite_transferencia"
                      checked={evento.permite_transferencia}
                      onChange={handleChange}
                      className="w-4 h-4"
                    />
                    <span className="text-sm font-medium">Permitir transferência de inscrição</span>
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Política de Cancelamento *</label>
                  <textarea
                    name="politica_cancelamento"
                    value={evento.politica_cancelamento}
                    onChange={handleChange}
                    required
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Botões */}
            <div className="flex gap-4 pb-8">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 font-medium"
              >
                {loading ? 'Criando...' : 'Criar Evento'}
              </button>
              
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </main>

      {/* Modal lateral completo */}
      <Modal isOpen={modalAberto} setOpenModal={setModalAberto} user={user} />
    </div>
  )
}

export default CriarEvento