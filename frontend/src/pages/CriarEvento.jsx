import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'
import Header from '../components/Header'
import Modal from '../components/Modal'
import { loadPlacesLibrary } from '../utils/googleMaps'

function CriarEvento() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [modalAberto, setModalAberto] = useState(false)
  const [loading, setLoading] = useState(false)
  const enderecoInputRef = useRef(null)
  const autocompleteRef = useRef(null)

  const [evento, setEvento] = useState({
    titulo: '',
    descricao: '',
    categorias: [],
    categorias_customizadas: [],
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
  
  const [novaCategoria, setNovaCategoria] = useState('')

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

  // Carregar gmpx-api-loader dinamicamente
  useEffect(() => {
    // Verificar se já existe
    if (document.querySelector('gmpx-api-loader')) {
      return
    }

    // Criar elemento gmpx-api-loader
    const apiLoader = document.createElement('gmpx-api-loader')
    apiLoader.setAttribute('key', import.meta.env.VITE_GOOGLE_MAPS_API_KEY)
    apiLoader.setAttribute('solution-channel', 'GMP_GEO')

    // Adicionar ao body
    document.body.appendChild(apiLoader)

    // Cleanup: remover quando componente desmontar
    return () => {
      const loader = document.querySelector('gmpx-api-loader')
      if (loader) {
        loader.remove()
      }
    }
  }, [])

  // Inicializar Google Places Autocomplete (método moderno)
  useEffect(() => {
    let autocomplete = null

    const initAutocomplete = async () => {
      try {
        // Verificar se a API Key está configurada
        if (!import.meta.env.VITE_GOOGLE_MAPS_API_KEY) {
          console.error('❌ Google Maps API Key não configurada! Verifique o arquivo .env')
          if (enderecoInputRef.current) {
            enderecoInputRef.current.placeholder = 'Digite o endereço completo (autocomplete indisponível)'
          }
          return
        }

        // Carregar Places Library usando o método moderno
        const { Autocomplete } = await loadPlacesLibrary()

        if (!enderecoInputRef.current) return

        // Criar autocomplete com as configurações recomendadas pelo Google
        autocomplete = new Autocomplete(enderecoInputRef.current, {
          fields: ['address_components', 'geometry', 'name', 'formatted_address'],
          componentRestrictions: { country: 'br' }
        })

        // Listener para quando um lugar é selecionado
        autocomplete.addListener('place_changed', () => {
          const place = autocomplete.getPlace()

          if (!place.geometry) {
            // Usuário digitou algo que não foi sugerido
            console.warn('⚠️ Nenhum detalhe disponível para:', place.name)
            window.alert(`Nenhum detalhe disponível para o endereço: '${place.name}'. Por favor, selecione uma opção da lista.`)
            return
          }

          // Extrair componentes do endereço
          const getComponentName = (componentType, useShortName = false) => {
            for (const component of place.address_components || []) {
              if (component.types[0] === componentType) {
                return useShortName ? component.short_name : component.long_name
              }
            }
            return ''
          }

          // Montar endereço completo
          const streetNumber = getComponentName('street_number')
          const route = getComponentName('route')
          const neighborhood = getComponentName('sublocality_level_1') || getComponentName('neighborhood')
          const city = getComponentName('locality') || getComponentName('administrative_area_level_2')
          const state = getComponentName('administrative_area_level_1', true)
          const country = getComponentName('country')

          // Formato: Rua Exemplo, 123 - Bairro, Cidade - UF, País
          let fullAddress = ''
          if (route) {
            fullAddress = route
            if (streetNumber) fullAddress += `, ${streetNumber}`
          } else {
            fullAddress = place.name || place.formatted_address
          }

          if (neighborhood && !fullAddress.includes(neighborhood)) {
            fullAddress += ` - ${neighborhood}`
          }
          if (city && !fullAddress.includes(city)) {
            fullAddress += `, ${city}`
          }
          if (state) {
            fullAddress += ` - ${state}`
          }
          if (country && country !== 'Brasil' && country !== 'Brazil') {
            fullAddress += `, ${country}`
          }

          // Preencher o formulário
          setEvento(prev => ({
            ...prev,
            endereco: fullAddress || place.formatted_address,
            latitude: place.geometry.location.lat().toString(),
            longitude: place.geometry.location.lng().toString()
          }))

          console.log('✅ Endereço selecionado:', {
            endereco: fullAddress,
            formatted_address: place.formatted_address,
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng(),
            componentes: {
              rua: route,
              numero: streetNumber,
              bairro: neighborhood,
              cidade: city,
              estado: state
            }
          })
        })

        autocompleteRef.current = autocomplete
        console.log('✅ Google Places Autocomplete inicializado com sucesso!')

      } catch (error) {
        console.error('❌ Erro ao inicializar Google Maps Autocomplete:', error)

        // Mostrar mensagem amigável ao usuário
        if (enderecoInputRef.current) {
          enderecoInputRef.current.placeholder = 'Digite o endereço completo (autocomplete indisponível)'
        }

        // Se for erro de API Key, mostrar detalhes
        if (error.message.includes('API Key')) {
          console.error('⚠️ Verifique se a API Key está configurada corretamente no arquivo .env')
          console.error('⚠️ Verifique também se as APIs estão habilitadas no Google Cloud Console:')
          console.error('   - Places API: https://console.cloud.google.com/apis/library/places-backend.googleapis.com')
          console.error('   - Maps JavaScript API: https://console.cloud.google.com/apis/library/maps-backend.googleapis.com')
        }
      }
    }

    initAutocomplete()

    // Cleanup
    return () => {
      if (autocomplete && window.google?.maps?.event) {
        window.google.maps.event.clearInstanceListeners(autocomplete)
      }
    }
  }, [])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setEvento(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleCategoriaChange = (e) => {
    const { value, checked } = e.target
    setEvento(prev => {
      const novasCategorias = checked
        ? [...prev.categorias, value]
        : prev.categorias.filter(cat => cat !== value)
      
      // Se desmarcar 'Outro', limpar categorias customizadas
      if (!checked && value === 'Outro') {
        return { ...prev, categorias: novasCategorias, categorias_customizadas: [] }
      }
      
      return { ...prev, categorias: novasCategorias }
    })
  }

  const adicionarCategoriaCustomizada = () => {
    if (novaCategoria.trim() && !evento.categorias_customizadas.includes(novaCategoria.trim())) {
      setEvento(prev => ({
        ...prev,
        categorias_customizadas: [...prev.categorias_customizadas, novaCategoria.trim()]
      }))
      setNovaCategoria('')
    }
  }

  const removerCategoriaCustomizada = (index) => {
    setEvento(prev => ({
      ...prev,
      categorias_customizadas: prev.categorias_customizadas.filter((_, i) => i !== index)
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
    
    // Validar se pelo menos uma categoria foi selecionada
    if (evento.categorias.length === 0) {
      alert('Por favor, selecione pelo menos uma categoria.')
      return
    }
    
    // Validar se 'Outro' está selecionado e categorias_customizadas está preenchida
    if (evento.categorias.includes('Outro') && evento.categorias_customizadas.length === 0) {
      alert('Por favor, adicione pelo menos uma categoria personalizada quando "Outro" está selecionado.')
      return
    }
    
    setLoading(true)

    try {
      const formData = new FormData()

      formData.append('titulo', evento.titulo)
      formData.append('descricao', evento.descricao)
      formData.append('categorias', JSON.stringify(evento.categorias))
      if (evento.categorias.includes('Outro') && evento.categorias_customizadas.length > 0) {
        formData.append('categorias_customizadas', JSON.stringify(evento.categorias_customizadas))
      }
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
      if (evento.qr_code_pix) formData.append('qr_code_pix', evento.qr_code_pix)

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
                  <label className="block text-sm font-medium mb-2">Categorias * <span className="text-gray-500 text-xs">(selecione uma ou mais)</span></label>
                  <div className="space-y-2 p-3 border border-gray-300 rounded-lg">
                    {['Workshop', 'Palestra', 'Networking', 'Curso', 'Outro'].map((cat) => (
                      <label key={cat} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                        <input
                          type="checkbox"
                          value={cat}
                          checked={evento.categorias.includes(cat)}
                          onChange={handleCategoriaChange}
                          className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                        />
                        <span className="text-sm">{cat}</span>
                      </label>
                    ))}
                  </div>
                  {evento.categorias.length === 0 && (
                    <small className="text-red-500">Selecione pelo menos uma categoria</small>
                  )}
                </div>

                {/* Campo condicional para categorias customizadas */}
                {evento.categorias.includes('Outro') && (
                  <div className="space-y-3">
                    <label className="block text-sm font-medium mb-1">
                      Categorias Personalizadas * <span className="text-gray-500 text-xs">(ex: Festa, Casamento, Hackathon)</span>
                    </label>
                    
                    {/* Lista de categorias adicionadas */}
                    {evento.categorias_customizadas.length > 0 && (
                      <div className="space-y-2 mb-3">
                        {evento.categorias_customizadas.map((cat, index) => (
                          <div key={index} className="flex items-center justify-between bg-blue-50 px-3 py-2 rounded-lg">
                            <span className="text-sm font-medium text-blue-900">{cat}</span>
                            <button
                              type="button"
                              onClick={() => removerCategoriaCustomizada(index)}
                              className="text-red-600 hover:text-red-800 text-sm font-medium"
                            >
                              Remover
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {/* Input para adicionar nova categoria */}
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={novaCategoria}
                        onChange={(e) => setNovaCategoria(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            adicionarCategoriaCustomizada()
                          }
                        }}
                        maxLength={100}
                        placeholder="Digite uma categoria e clique em Adicionar"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        type="button"
                        onClick={adicionarCategoriaCustomizada}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium whitespace-nowrap"
                      >
                        Adicionar
                      </button>
                    </div>
                    
                    {evento.categorias_customizadas.length === 0 && (
                      <small className="text-red-500">Adicione pelo menos uma categoria personalizada</small>
                    )}
                  </div>
                )}

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
                    ref={enderecoInputRef}
                    type="text"
                    name="endereco"
                    value={evento.endereco}
                    onChange={handleChange}
                    required
                    maxLength={300}
                    placeholder="Digite o endereço e selecione uma opção"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    autoComplete="off"
                  />
                  <small className="text-gray-500">
                    Digite o endereço e selecione uma opção da lista. A latitude e longitude serão preenchidas automaticamente.
                  </small>
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

                <div>
                  <label className="block text-sm font-medium mb-1">QR Code PIX para Pagamento</label>
                  <input
                    type="file"
                    name="qr_code_pix"
                    accept="image/*"
                    onChange={(e) => setEvento(prev => ({ ...prev, qr_code_pix: e.target.files[0] }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <small className="text-gray-500">
                    Faça upload do QR Code PIX para que os participantes possam realizar o pagamento das inscrições
                  </small>
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