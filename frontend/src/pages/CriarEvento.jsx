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
  const [itensInclusos, setItensInclusos] = useState([{ id: 1, valor: '' }])
  const [politicaSelecionada, setPoliticaSelecionada] = useState('24h')
  const [mostrarPoliticaCustomizada, setMostrarPoliticaCustomizada] = useState(false)

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

    useEffect(() => {
  const verificarPermissao = async () => {
    try {
      const response = await api.get('/api/user/me/')
      setUser(response.data)

      if (!response.data?.documento_verificado) {
        navigate('/verificar-documento')
        return
      }

    } catch (error) {
      console.error('Erro ao verificar usuário:', error)
      navigate('/login')
    }
  }

  verificarPermissao()
}, [navigate])

  // Inicializar Google Places Autocomplete (método moderno)
  useEffect(() => {
    let autocomplete = null

    const initAutocomplete = async () => {
      try {
        // Verificar se a API Key está configurada
        if (!import.meta.env.VITE_GOOGLE_MAPS_API_KEY) {
          console.error('Google Maps API Key não configurada! Verifique o arquivo .env')
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
      
      return { ...prev, categorias: novasCategorias }
    })
  }

  const handlePoliticaChange = (tipo) => {
    setPoliticaSelecionada(tipo)
    
    if (tipo === 'customizada') {
      setMostrarPoliticaCustomizada(true)
    } else {
      setMostrarPoliticaCustomizada(false)
      
      const politicas = {
        '24h': 'Cancelamento gratuito até 24 horas antes do evento. Após este prazo, o depósito não será reembolsado.',
        '48h': 'Cancelamento gratuito até 48 horas antes do evento. Após este prazo, o depósito não será reembolsado.',
        '7dias': 'Cancelamento gratuito até 7 dias antes do evento. Após este prazo, o depósito não será reembolsado.',
        'flexivel': 'Cancelamento gratuito a qualquer momento antes do evento com reembolso integral do depósito.',
        'nao_reembolsavel': 'Inscrições não reembolsáveis. O depósito não será devolvido em caso de cancelamento.'
      }
      
      setEvento(prev => ({
        ...prev,
        politica_cancelamento: politicas[tipo] || politicas['24h']
      }))
    }
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

  // Funções para gerenciar itens inclusos
  const adicionarItemIncluso = () => {
    const novoId = itensInclusos.length > 0 ? Math.max(...itensInclusos.map(item => item.id)) + 1 : 1
    setItensInclusos([...itensInclusos, { id: novoId, valor: '' }])
  }

  const removerItemIncluso = (id) => {
    if (itensInclusos.length > 1) {
      setItensInclusos(itensInclusos.filter(item => item.id !== id))
    }
  }

  const atualizarItemIncluso = (id, valor) => {
    setItensInclusos(itensInclusos.map(item =>
      item.id === id ? { ...item, valor } : item
    ))
  }

  const handleFileChange = (e) => {
    setEvento(prev => ({
      ...prev,
      foto_capa: e.target.files[0]
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validar se pelo menos uma categoria foi selecionada OU há categoria customizada
    if (evento.categorias.length === 0 && evento.categorias_customizadas.length === 0) {
      alert('Por favor, selecione pelo menos uma categoria ou adicione uma categoria personalizada.')
      return
    }
    
    setLoading(true)

    try {
      const formData = new FormData()

      // Converter itens inclusos de array para string (um item por linha)
      const itensInclusosTexto = itensInclusos
        .map(item => item.valor.trim())
        .filter(valor => valor !== '')
        .join('\n')

      // Se há categorias customizadas, adicionar "Outro" automaticamente
      let categoriasFinais = [...evento.categorias]
      if (evento.categorias_customizadas.length > 0 && !categoriasFinais.includes('Outro')) {
        categoriasFinais.push('Outro')
      }

      formData.append('titulo', evento.titulo)
      formData.append('descricao', evento.descricao)
      formData.append('categorias', JSON.stringify(categoriasFinais))
      if (evento.categorias_customizadas.length > 0) {
        formData.append('categorias_customizadas', JSON.stringify(evento.categorias_customizadas))
      }
      formData.append('data_evento', evento.data_evento)
      formData.append('endereco', evento.endereco)
      formData.append('capacidade_maxima', evento.capacidade_maxima)
      formData.append('valor_deposito', evento.valor_deposito)
      formData.append('permite_transferencia', evento.permite_transferencia)
      formData.append('politica_cancelamento', evento.politica_cancelamento)

      if (evento.local_especifico) formData.append('local_especifico', evento.local_especifico)
      if (itensInclusosTexto) formData.append('itens_incluidos', itensInclusosTexto)
      if (evento.latitude) formData.append('latitude', evento.latitude)
      if (evento.longitude) formData.append('longitude', evento.longitude)
      if (evento.foto_capa) formData.append('foto_capa', evento.foto_capa)
      // QR Code PIX removido - pagamentos apenas via cartão

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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Header user={user} setOpenModal={setModalAberto} />

      <main className="w-full mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        {/* Header da Página */}
        <div className="pt-8 pb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Criar Evento</h1>
              <p className="text-sm text-gray-600">Preencha os detalhes do seu evento</p>
            </div>
          </div>
        </div>

        <div className="pb-12">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Informações Básicas */}
            <section className="bg-white rounded-2xl shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <span>Informações Básicas</span>
                </h2>
              </div>

              <div className="p-6 space-y-6">
                {/* Título */}
                <div className="space-y-2">
                  <label htmlFor="titulo" className="block text-sm font-medium text-gray-900">
                    Título do Evento
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <input
                    id="titulo"
                    type="text"
                    name="titulo"
                    value={evento.titulo}
                    onChange={handleChange}
                    required
                    maxLength={200}
                    placeholder="Digite o nome do seu evento"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-900 placeholder-gray-400"
                  />
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">Seja claro e descritivo</span>
                    <span className="text-xs text-gray-400">{evento.titulo.length}/200</span>
                  </div>
                </div>

                {/* Categorias */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-900">
                    Categorias
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <p className="text-xs text-gray-500 mb-3">Selecione as categorias que melhor descrevem seu evento</p>

                  <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
                    {/* Categorias Padrão */}
                    <div className="border-b border-gray-200">
                      <div className="px-4 py-3 bg-gray-50">
                        <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wider">Categorias Disponíveis</h3>
                      </div>
                      <div className="p-3 max-h-48 overflow-y-auto">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {['Workshop', 'Palestra', 'Networking', 'Curso', 'Conferência', 'Seminário', 'Hackathon', 'Meetup', 'Webinar', 'Treinamento', 'Festa', 'Show', 'Esporte', 'Cultural', 'Voluntariado'].map((cat) => (
                            <label key={cat} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors group">
                              <input
                                type="checkbox"
                                value={cat}
                                checked={evento.categorias.includes(cat)}
                                onChange={handleCategoriaChange}
                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                              />
                              <span className="text-sm text-gray-700 group-hover:text-gray-900">{cat}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Categorias Personalizadas */}
                    <div className="bg-blue-50/50">
                      <div className="px-4 py-3 border-b border-blue-100">
                        <h3 className="text-xs font-semibold text-blue-900 uppercase tracking-wider flex items-center gap-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                          Categoria Personalizada
                        </h3>
                        <p className="text-xs text-blue-700 mt-1">Adicione categorias que não estão na lista</p>
                      </div>

                      <div className="p-4 space-y-3">
                        {/* Lista de categorias customizadas */}
                        {evento.categorias_customizadas.length > 0 && (
                          <div className="space-y-2">
                            {evento.categorias_customizadas.map((cat, index) => (
                              <div key={index} className="flex items-center justify-between bg-white px-4 py-3 rounded-lg border border-blue-200 group hover:border-blue-300 transition-colors">
                                <div className="flex items-center gap-3">
                                  <div className="w-6 h-6 bg-blue-100 rounded flex items-center justify-center">
                                    <svg className="w-3 h-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                    </svg>
                                  </div>
                                  <span className="text-sm font-medium text-gray-900">{cat}</span>
                                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-md">Outros</span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => removerCategoriaCustomizada(index)}
                                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                  title="Remover"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                </button>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Input para adicionar */}
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
                            maxLength={50}
                            placeholder="Nome da categoria"
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                          />
                          <button
                            type="button"
                            onClick={adicionarCategoriaCustomizada}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm transition-colors flex items-center gap-2"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Adicionar
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {evento.categorias.length === 0 && evento.categorias_customizadas.length === 0 && (
                    <p className="text-xs text-red-600 mt-2">Selecione pelo menos uma categoria</p>
                  )}
                </div>

                {/* Descrição */}
                <div className="space-y-2">
                  <label htmlFor="descricao" className="block text-sm font-medium text-gray-900">
                    Descrição
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <textarea
                    id="descricao"
                    name="descricao"
                    value={evento.descricao}
                    onChange={handleChange}
                    required
                    rows={6}
                    placeholder="Descreva seu evento: o que será abordado, público-alvo, benefícios..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-900 placeholder-gray-400 resize-y"
                  />
                  <p className="text-xs text-gray-500">Seja detalhado para atrair mais participantes</p>
                </div>
              </div>
            </section>

            {/* Itens e Detalhes */}
            <section className="bg-white rounded-2xl shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                  </div>
                  <span>Itens e Benefícios</span>
                </h2>
              </div>

              <div className="p-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="block text-sm font-medium text-gray-900">Itens Incluídos</label>
                      <p className="text-xs text-gray-500 mt-1">O que está incluído na participação</p>
                    </div>
                    <button
                      type="button"
                      onClick={adicionarItemIncluso}
                      className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Adicionar
                    </button>
                  </div>

                  <div className="space-y-2">
                    {itensInclusos.map((item, index) => (
                      <div key={item.id} className="flex items-center gap-3 group">
                        <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-sm font-medium text-gray-600">
                          {index + 1}
                        </div>
                        <input
                          type="text"
                          value={item.valor}
                          onChange={(e) => atualizarItemIncluso(item.id, e.target.value)}
                          placeholder="Ex: Certificado digital"
                          className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                        />
                        {itensInclusos.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removerItemIncluso(item.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                            title="Remover"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* Localização */}
            <section className="bg-white rounded-2xl shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <span>Localização</span>
                </h2>
              </div>

              <div className="p-6 space-y-6">
                <div className="space-y-2">
                  <label htmlFor="endereco" className="block text-sm font-medium text-gray-900">
                    Endereço
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <input
                    id="endereco"
                    ref={enderecoInputRef}
                    type="text"
                    name="endereco"
                    value={evento.endereco}
                    onChange={handleChange}
                    required
                    maxLength={300}
                    placeholder="Digite e selecione o endereço"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all text-gray-900"
                    autoComplete="off"
                  />
                  <p className="text-xs text-gray-500">Use o autocomplete para garantir coordenadas precisas</p>
                </div>

                <div className="space-y-2">
                  <label htmlFor="local_especifico" className="block text-sm font-medium text-gray-900">
                    Local Específico
                  </label>
                  <input
                    id="local_especifico"
                    type="text"
                    name="local_especifico"
                    value={evento.local_especifico}
                    onChange={handleChange}
                    maxLength={100}
                    placeholder="Ex: Auditório 3, Sala 201"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all text-gray-900"
                  />
                </div>
              </div>
            </section>

            {/* Data e Valores */}
            <section className="bg-white rounded-2xl shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <span>Data e Valores</span>
                </h2>
              </div>

              <div className="p-6 space-y-6">
                <div className="space-y-2">
                  <label htmlFor="data_evento" className="block text-sm font-medium text-gray-900">
                    Data e Hora
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <input
                    id="data_evento"
                    type="datetime-local"
                    name="data_evento"
                    value={evento.data_evento}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all text-gray-900"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label htmlFor="capacidade_maxima" className="block text-sm font-medium text-gray-900">
                      Capacidade Máxima
                      <span className="text-red-500 ml-1">*</span>
                    </label>
                    <input
                      id="capacidade_maxima"
                      type="number"
                      name="capacidade_maxima"
                      value={evento.capacidade_maxima}
                      onChange={handleChange}
                      required
                      min="1"
                      placeholder="100"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all text-gray-900"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="valor_deposito" className="block text-sm font-medium text-gray-900">
                      Valor do Depósito (R$)
                      <span className="text-red-500 ml-1">*</span>
                    </label>
                    <input
                      id="valor_deposito"
                      type="number"
                      step="0.01"
                      name="valor_deposito"
                      value={evento.valor_deposito}
                      onChange={handleChange}
                      required
                      min="0"
                      placeholder="0.00"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all text-gray-900"
                    />
                    <p className="text-xs text-gray-500">Digite 0 para eventos gratuitos</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="foto_capa" className="block text-sm font-medium text-gray-900">
                    Foto de Capa
                  </label>
                  <input
                    id="foto_capa"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 transition-all text-gray-900 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
                  />
                  <p className="text-xs text-gray-500">Recomendado: 1200x630px (formato 16:9)</p>
                </div>
              </div>
            </section>

            {/* Políticas e Cancelamento */}
            <section className="bg-white rounded-2xl shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <span>Políticas e Regras</span>
                </h2>
              </div>

              <div className="p-6 space-y-6">
                {/* Transferência */}
                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <input
                    id="permite_transferencia"
                    type="checkbox"
                    name="permite_transferencia"
                    checked={evento.permite_transferencia}
                    onChange={handleChange}
                    className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 mt-0.5"
                  />
                  <label htmlFor="permite_transferencia" className="flex-1 cursor-pointer">
                    <div className="text-sm font-medium text-gray-900">Permitir transferência de inscrição</div>
                    <p className="text-xs text-gray-600 mt-1">Participantes poderão transferir suas vagas para outras pessoas</p>
                  </label>
                </div>

                {/* Política de Cancelamento */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-900">
                    Política de Cancelamento
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <p className="text-xs text-gray-500">Escolha a política que melhor se adequa ao seu evento</p>

                  <div className="space-y-2">
                    {/* Opção 24h */}
                    <label className="flex items-start gap-3 p-3 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-blue-300 hover:bg-blue-50/50 transition-all">
                      <input
                        type="radio"
                        name="politica"
                        value="24h"
                        checked={politicaSelecionada === '24h'}
                        onChange={() => handlePoliticaChange('24h')}
                        className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-gray-900 text-sm">Cancelamento até 24h antes</div>
                        <div className="text-xs text-gray-600 mt-1">Reembolso integral até 24 horas antes do evento</div>
                      </div>
                    </label>

                    {/* Opção 48h */}
                    <label className="flex items-start gap-3 p-3 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-blue-300 hover:bg-blue-50/50 transition-all">
                      <input
                        type="radio"
                        name="politica"
                        value="48h"
                        checked={politicaSelecionada === '48h'}
                        onChange={() => handlePoliticaChange('48h')}
                        className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-gray-900 text-sm">Cancelamento até 48h antes</div>
                        <div className="text-xs text-gray-600 mt-1">Reembolso integral até 48 horas antes do evento</div>
                      </div>
                    </label>

                    {/* Opção 7 dias */}
                    <label className="flex items-start gap-3 p-3 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-blue-300 hover:bg-blue-50/50 transition-all">
                      <input
                        type="radio"
                        name="politica"
                        value="7dias"
                        checked={politicaSelecionada === '7dias'}
                        onChange={() => handlePoliticaChange('7dias')}
                        className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-gray-900 text-sm">Cancelamento até 7 dias antes</div>
                        <div className="text-xs text-gray-600 mt-1">Reembolso integral até 7 dias antes do evento</div>
                      </div>
                    </label>

                    {/* Opção Flexível */}
                    <label className="flex items-start gap-3 p-3 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-blue-300 hover:bg-blue-50/50 transition-all">
                      <input
                        type="radio"
                        name="politica"
                        value="flexivel"
                        checked={politicaSelecionada === 'flexivel'}
                        onChange={() => handlePoliticaChange('flexivel')}
                        className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-gray-900 text-sm flex items-center gap-2">
                          Política Flexível
                          <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">Recomendado</span>
                        </div>
                        <div className="text-xs text-gray-600 mt-1">Cancelamento gratuito a qualquer momento com reembolso integral</div>
                      </div>
                    </label>

                    {/* Opção Não Reembolsável */}
                    <label className="flex items-start gap-3 p-3 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-orange-300 hover:bg-orange-50/50 transition-all">
                      <input
                        type="radio"
                        name="politica"
                        value="nao_reembolsavel"
                        checked={politicaSelecionada === 'nao_reembolsavel'}
                        onChange={() => handlePoliticaChange('nao_reembolsavel')}
                        className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-gray-900 text-sm flex items-center gap-2">
                          Não Reembolsável
                          <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-xs rounded-full">Restritivo</span>
                        </div>
                        <div className="text-xs text-gray-600 mt-1">Sem reembolso em caso de cancelamento</div>
                      </div>
                    </label>

                    {/* Opção Customizada */}
                    <label className="flex items-start gap-3 p-3 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-purple-300 hover:bg-purple-50/50 transition-all">
                      <input
                        type="radio"
                        name="politica"
                        value="customizada"
                        checked={politicaSelecionada === 'customizada'}
                        onChange={() => handlePoliticaChange('customizada')}
                        className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-gray-900 text-sm">Política Customizada</div>
                        <div className="text-xs text-gray-600 mt-1">Defina sua própria política de cancelamento</div>
                      </div>
                    </label>

                    {/* Campo Customizado (oculto por padrão) */}
                    {mostrarPoliticaCustomizada && (
                      <div className="mt-3 p-4 border-2 border-purple-200 rounded-lg bg-purple-50/30">
                        <label className="block text-sm font-medium mb-2 text-gray-900">
                          Descreva sua política de cancelamento
                        </label>
                        <textarea
                          name="politica_cancelamento"
                          value={evento.politica_cancelamento}
                          onChange={handleChange}
                          required
                          rows={4}
                          placeholder="Ex: Cancelamento gratuito até 3 dias antes do evento. Entre 3 dias e 24h antes, reembolso de 50%. Menos de 24h antes, sem reembolso."
                          className="w-full px-3 py-2.5 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-sm resize-y"
                        />

                        {/* Aviso Legal */}
                        <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                          <div className="flex items-start gap-2">
                            <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            <div className="flex-1">
                              <p className="text-xs font-semibold text-amber-900 mb-1">⚠️ Aviso Legal Importante</p>
                              <p className="text-xs text-amber-800 leading-relaxed">
                                Sua política de cancelamento deve estar em conformidade com a <strong>legislação vigente</strong> e respeitar o <strong>Código de Defesa do Consumidor (CDC)</strong>.
                                Políticas abusivas ou que violem direitos do consumidor podem ser consideradas nulas.
                                Recomendamos consultar um advogado para garantir a legalidade da política.
                              </p>
                              <a
                                href="https://www.planalto.gov.br/ccivil_03/leis/l8078compilado.htm"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-amber-700 hover:text-amber-900 underline mt-2 inline-block font-medium"
                              >
                                📖 Consultar Código de Defesa do Consumidor
                              </a>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <p className="text-xs text-gray-500 mt-2">A política será exibida aos participantes durante a inscrição</p>
                </div>
              </div>
            </section>

            {/* Botões de Ação */}
            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 sm:flex-none sm:px-8 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold text-base transition-all shadow-lg hover:shadow-xl disabled:shadow-none flex items-center justify-center gap-3"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Criando Evento...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Publicar Evento</span>
                  </>
                )}
              </button>
              
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="flex-1 sm:flex-none sm:px-8 py-4 bg-white border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-400 font-semibold text-base transition-all flex items-center justify-center gap-3"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span>Cancelar</span>
              </button>
            </div>
          </form>
        </div>
      </main>

      <Modal isOpen={modalAberto} setOpenModal={setModalAberto} user={user} />
    </div>
  )
}

export default CriarEvento