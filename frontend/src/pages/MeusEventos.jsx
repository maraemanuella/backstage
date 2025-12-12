import { useState, useEffect, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { Calendar, MapPin, ChevronDown, QrCode, Eye, Send, X, Award, Download, Ticket, Heart, Edit, FileText, ArrowLeft } from 'lucide-react'
import { FavoritesContext } from "../contexts/FavoritesContext"
import api from '../api'
import Modal from '../components/Modal'
import Header from '../components/Header'

export default function MeusEventos() {
  const navigate = useNavigate()
  const { favorites, setFavorites } = useContext(FavoritesContext)
  const [inscricoesProximas, setInscricoesProximas] = useState([])
  const [inscricoesPassadas, setInscricoesPassadas] = useState([])
  const [eventosFavoritos, setEventosFavoritos] = useState([])
  const [eventosCriados, setEventosCriados] = useState([])
  const [loading, setLoading] = useState(true)
  const [openModal, setOpenModal] = useState(false)
  const [user, setUser] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        const [userRes, inscricoesRes, favoritesRes, criadosRes] = await Promise.allSettled([
          api.get("/api/user/me/"),
          api.get('/api/inscricoes/minhas/'),
          api.get("/api/favorites/"),
          api.get("/api/manage/")
        ]);

        if (userRes.status === 'fulfilled') {
          setUser(userRes.value.data);
        }

        // Inscrições próximas e passadas
        if (inscricoesRes.status === 'fulfilled') {
          const agora = new Date();
          const proximas = inscricoesRes.value.data.filter(i => 
            new Date(i.evento_data) > agora
          );
          const passadas = inscricoesRes.value.data.filter(i => 
            new Date(i.evento_data) < agora
          );
          setInscricoesProximas(proximas);
          setInscricoesPassadas(passadas);
        }

        // Favoritos
        if (favoritesRes.status === 'fulfilled') {
          const eventosFavs = favoritesRes.value.data.map((fav) => fav.evento);
          setEventosFavoritos(eventosFavs);
          setFavorites(eventosFavs.map((e) => String(e.id)));
        }

        // Eventos criados por mim
        if (criadosRes.status === 'fulfilled') {
          setEventosCriados(criadosRes.value.data);
        }
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [setFavorites])

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando seus eventos...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <Modal isOpen={openModal} setOpenModal={setOpenModal} user={user} />
      <Header user={user} setOpenModal={setOpenModal} />
      
      <div className="px-6 md:px-12 lg:px-24 py-8">
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="border-2 border-gray-300 font-poppins h-[40px] flex items-center justify-center p-2 rounded-full hover:text-white hover:bg-black hover:scale-108 transition-all cursor-pointer gap-2 mb-6"
          >
            <ArrowLeft size={20} /> Voltar
          </button>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Meus Eventos</h1>
          <p className="text-gray-600">Gerencie todas as suas atividades em um só lugar</p>
          <div className="mt-4 h-px bg-gray-200"></div>
        </div>

        {/* Eventos Próximos */}
        <section className="mb-12">
          <div className="flex items-center gap-2 mb-6">
            <Calendar className="w-6 h-6 text-lime-600" />
            <h2 className="text-2xl font-bold text-gray-900">Próximos Eventos</h2>
            <span className="bg-lime-100 text-lime-700 px-3 py-1 rounded-full text-sm font-semibold">
              {inscricoesProximas.length}
            </span>
          </div>
          {inscricoesProximas.length === 0 ? (
            <div className="text-center py-16 bg-gradient-to-br from-lime-50 to-green-50 rounded-xl border-2 border-dashed border-lime-200">
              <div className="flex items-center justify-center w-20 h-20 bg-white rounded-full mx-auto mb-4 shadow-sm">
                <Calendar className="w-10 h-10 text-lime-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Nenhum evento próximo</h3>
              <p className="text-gray-500 text-sm">Quando você se inscrever em eventos futuros, eles aparecerão aqui</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {inscricoesProximas.map(inscricao => (
                <EventCardProximo key={inscricao.id} inscricao={inscricao} />
              ))}
            </div>
          )}
        </section>

        {/* Eventos Passados */}
        <section className="mb-12">
          <div className="flex items-center gap-2 mb-6">
            <Award className="w-6 h-6 text-gray-600" />
            <h2 className="text-2xl font-bold text-gray-900">Eventos Passados</h2>
            <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-semibold">
              {inscricoesPassadas.length}
            </span>
          </div>
          {inscricoesPassadas.length === 0 ? (
            <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl border-2 border-dashed border-gray-200">
              <div className="flex items-center justify-center w-20 h-20 bg-white rounded-full mx-auto mb-4 shadow-sm">
                <Award className="w-10 h-10 text-gray-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Nenhum evento passado</h3>
              <p className="text-gray-500 text-sm">Quando você participar de eventos, eles aparecerão aqui</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {inscricoesPassadas.map(inscricao => (
                <EventCardPassado key={inscricao.id} inscricao={inscricao} />
              ))}
            </div>
          )}
        </section>

        {/* Eventos Favoritos */}
        <section className="mb-12">
          <div className="flex items-center gap-2 mb-6">
            <span className="text-2xl">❤️</span>
            <h2 className="text-2xl font-bold text-gray-900">Eventos Favoritos</h2>
            <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-semibold">
              {eventosFavoritos.length}
            </span>
          </div>
          {eventosFavoritos.length === 0 ? (
            <div className="text-center py-16 bg-gradient-to-br from-red-50 to-pink-50 rounded-xl border-2 border-dashed border-red-200">
              <div className="flex items-center justify-center w-20 h-20 bg-white rounded-full mx-auto mb-4 shadow-sm">
                <Heart className="w-10 h-10 text-red-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Nenhum favorito ainda</h3>
              <p className="text-gray-500 text-sm">Favorite eventos que você gostaria de acompanhar</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {eventosFavoritos.map(evento => (
                <EventCardFavorito key={evento.id} evento={evento} />
              ))}
            </div>
          )}
        </section>

        {/* Eventos Criados por Mim */}
        <section className="mb-12">
          <div className="flex items-center gap-2 mb-6">
            <Ticket className="w-6 h-6 text-purple-600" />
            <h2 className="text-2xl font-bold text-gray-900">Eventos Criados por Mim</h2>
            <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-semibold">
              {eventosCriados.length}
            </span>
          </div>
          {eventosCriados.length === 0 ? (
            <div className="text-center py-16 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl border-2 border-dashed border-purple-200">
              <div className="flex items-center justify-center w-20 h-20 bg-white rounded-full mx-auto mb-4 shadow-sm">
                <Ticket className="w-10 h-10 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Nenhum evento criado</h3>
              <p className="text-gray-500 text-sm">Crie seu primeiro evento e comece a organizar</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {eventosCriados.map(evento => (
                <EventCardCriado key={evento.id} evento={evento} />
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  )
}

// Componente para eventos próximos (com countdown)
function EventCardProximo({ inscricao }) {
  const navigate = useNavigate()
  const [expandido, setExpandido] = useState(false)
  const [countdown, setCountdown] = useState('')
  const [cancelando, setCancelando] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [showErrorModal, setShowErrorModal] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const handleCancelar = async () => {
    setShowConfirmModal(false);
    setCancelando(true);
    try {
      const response = await api.post(`/api/inscricoes/${inscricao.id}/cancelar/`);
      setCancelando(false);
      setShowSuccessModal(true);
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      console.error('Erro ao cancelar:', error);
      setErrorMessage(error.response?.data?.erro || 'Erro ao cancelar inscrição. Tente novamente.');
      setCancelando(false);
      setShowErrorModal(true);
    }
  }

  useEffect(() => {
    const calcularCountdown = () => {
      const dataEvento = new Date(inscricao.evento_data)
      const agora = new Date()
      const diferenca = dataEvento - agora

      if (diferenca <= 0) {
        setCountdown('Evento começou!')
        return
      }

      const dias = Math.floor(diferenca / (1000 * 60 * 60 * 24))
      const horas = Math.floor((diferenca % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutos = Math.floor((diferenca % (1000 * 60 * 60)) / (1000 * 60))

      if (dias > 0) {
        setCountdown(`${dias}d ${horas}h ${minutos}m`)
      } else if (horas > 0) {
        setCountdown(`${horas}h ${minutos}m`)
      } else {
        setCountdown(`${minutos}m`)
      }
    }

    calcularCountdown()
    const intervalo = setInterval(calcularCountdown, 60000)
    return () => clearInterval(intervalo)
  }, [inscricao.evento_data])

  const formatarData = (data) => {
    return new Date(data).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short'
    }).replace('.', '').toUpperCase()
  }

  const formatarEndereco = (endereco) => {
    return endereco && endereco.length > 20 ? endereco.substring(0, 20) + '...' : endereco
  }

  return (
    <>
      {/* Modal de Confirmação */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in zoom-in duration-200">
            <div className="flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mx-auto mb-4">
              <X size={32} className="text-red-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 text-center mb-2">
              Cancelar Inscrição?
            </h3>
            <p className="text-gray-600 text-center mb-6">
              Tem certeza que deseja cancelar sua inscrição em "{inscricao.evento_titulo}"? Esta ação não pode ser desfeita.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors"
              >
                Não, manter
              </button>
              <button
                onClick={handleCancelar}
                className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
              >
                Sim, cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Sucesso */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in zoom-in duration-200">
            <div className="flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 text-center mb-2">
              Inscrição Cancelada!
            </h3>
            <p className="text-gray-600 text-center mb-6">
              Sua inscrição foi cancelada com sucesso!
            </p>
          </div>
        </div>
      )}

      {/* Modal de Erro */}
      {showErrorModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in zoom-in duration-200">
            <div className="flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 text-center mb-2">
              Erro ao Cancelar
            </h3>
            <p className="text-gray-600 text-center mb-6">
              {errorMessage}
            </p>
            <button
              onClick={() => setShowErrorModal(false)}
              className="w-full px-4 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
            >
              Fechar
            </button>
          </div>
        </div>
      )}

    <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 h-fit">
      <div className="relative h-48 overflow-hidden">
        {inscricao.evento_foto_capa ? (
          <img 
            src={inscricao.evento_foto_capa}
            alt={inscricao.evento_titulo}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-purple-400 to-blue-500 flex items-center justify-center">
            <span className="text-white text-lg font-semibold">Sem imagem</span>
          </div>
        )}

        <button
          onClick={() => setExpandido(!expandido)}
          className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-lg hover:bg-white transition-colors"
        >
          <ChevronDown 
            size={18} 
            className={`transition-transform duration-200 ${expandido ? 'rotate-180' : ''}`} 
          />
        </button>

        <div className="absolute top-3 left-3">
          <span className="inline-flex items-center px-3 py-1 bg-lime-500 text-white text-xs font-semibold rounded-full">
            ⏰ {countdown}
          </span>
        </div>
      </div>

      <div className="p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-3 line-clamp-2">
          {inscricao.evento_titulo}
        </h3>

        <div className="flex flex-wrap gap-2 mb-4">
          <span className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
            <Calendar className="w-4 h-4 mr-1" />
            {formatarData(inscricao.evento_data)}
          </span>
          
          <span className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
            <MapPin className="w-4 h-4 mr-1" />
            {formatarEndereco(inscricao.evento_endereco)}
          </span>
        </div>

        <div className="mb-4">
          <span className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg ${
            inscricao.status === 'confirmado' 
              ? 'bg-green-100 text-green-700' 
              : inscricao.status === 'pendente'
              ? 'bg-yellow-100 text-yellow-700'
              : 'bg-gray-100 text-gray-700'
          }`}>
            {inscricao.status === 'confirmado' ? '✓ Confirmado' : 
             inscricao.status === 'pendente' ? '⏳ Pendente' : inscricao.status}
          </span>
        </div>

        {expandido && (
          <div className="mt-4 pt-4 border-t border-gray-200 space-y-3">
            {inscricao.qr_code && (
              <button 
                onClick={() => navigate(`/inscricao/${inscricao.id}`)}
                className="flex items-center justify-center gap-2 w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
              >
                <QrCode size={18} />
                QR Code Check-in
              </button>
            )}
            
            <button 
              onClick={() => navigate(`/evento/${inscricao.evento_id}`)}
              className="flex items-center justify-center gap-2 w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Eye size={18} />
              Ver Detalhes
            </button>

            <button 
              onClick={() => navigate(`/transferir-inscricao?inscricao=${inscricao.id}`)}
              className="flex items-center justify-center gap-2 w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Send size={18} />
              Transferir Inscrição
            </button>

            <button 
              onClick={() => setShowConfirmModal(true)}
              disabled={cancelando}
              className={`flex items-center justify-center gap-2 w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors ${cancelando ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <X size={18} />
              {cancelando ? 'Cancelando...' : 'Cancelar Inscrição'}
            </button>
          </div>
        )}
      </div>
    </div>
    </>
  )
}

// Componente para eventos passados
function EventCardPassado({ inscricao }) {
  const navigate = useNavigate()
  const [expandido, setExpandido] = useState(false)

  const formatarData = (data) => {
    return new Date(data).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short'
    }).replace('.', '').toUpperCase()
  }

  const formatarEndereco = (endereco) => {
    return endereco && endereco.length > 20 ? endereco.substring(0, 20) + '...' : endereco
  }

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 h-fit">
      <div className="relative h-48 overflow-hidden">
        {inscricao.evento_foto_capa ? (
          <img 
            src={inscricao.evento_foto_capa} 
            alt={inscricao.evento_titulo} 
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105 grayscale"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center">
            <span className="text-white text-lg font-semibold">Evento finalizado</span>
          </div>
        )}

        <button 
          onClick={() => setExpandido(!expandido)} 
          className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-lg hover:bg-white transition-colors"
        >
          <ChevronDown 
            size={18} 
            className={`transition-transform duration-200 ${expandido ? 'rotate-180' : ''}`} 
          />
        </button>

        <div className="absolute top-3 left-3">
          <span className="inline-flex items-center px-3 py-1 bg-gray-500 text-white text-xs font-semibold rounded-full">
            FINALIZADO
          </span>
        </div>
      </div>

      <div className="p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-3 line-clamp-2">
          {inscricao.evento_titulo}
        </h3>

        <div className="flex flex-wrap gap-2 mb-4">
          <span className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
            <Calendar className="w-4 h-4 mr-1" />
            {formatarData(inscricao.evento_data)}
          </span>
          
          <span className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
            <MapPin className="w-4 h-4 mr-1" />
            {formatarEndereco(inscricao.evento_endereco)}
          </span>
        </div>

        {/* Status de reembolso */}
        <div className="mb-4">
          <span className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg ${
            inscricao.reembolsado
              ? 'bg-green-50 text-green-700 border border-green-200'
              : 'bg-gray-50 text-gray-700 border border-gray-200'
          }`}>
            {inscricao.reembolsado ? '✅ Reembolsado' : '💰 Não reembolsado'}
          </span>
        </div>

        {expandido && (
          <div className="mt-4 pt-4 border-t border-gray-200 space-y-3">
            <button 
              onClick={() => navigate(`/evento/${inscricao.evento_id}`)}
              className="flex items-center justify-center gap-2 w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Eye size={18} />
              Ver Detalhes
            </button>

            <button 
              onClick={() => {
                // TODO: Implementar download de certificado
                console.log('Gerar certificado para:', inscricao.id);
              }}
              className="flex items-center justify-center gap-2 w-full bg-orange-600 text-white py-2 px-4 rounded-lg hover:bg-orange-700 transition-colors"
            >
              <FileText size={18} />
              Gerar Certificado
            </button>

            <button 
              onClick={() => {
                // TODO: Implementar avaliação
                console.log('Avaliar evento:', inscricao.evento_id);
              }}
              className="flex items-center justify-center gap-2 w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Award size={18} />
              Avaliar Evento
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// Componente para eventos favoritos
function EventCardFavorito({ evento }) {
  const navigate = useNavigate()
  const [expandido, setExpandido] = useState(false)

  const formatarData = (data) => {
    if (!data) return 'Data não disponível';
    const date = new Date(data);
    if (isNaN(date.getTime())) return 'Data inválida';
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }).replace('.', '').toUpperCase();
  }

  const formatarEndereco = (endereco) => {
    return endereco && endereco.length > 20 ? endereco.substring(0, 20) + '...' : endereco
  }

  const isFuturo = new Date(evento.data_evento) > new Date()

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 h-fit">
      <div className="relative h-48 overflow-hidden">
        {evento.foto_capa ? (
          <img 
            src={evento.foto_capa} 
            alt={evento.titulo} 
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-red-400 to-pink-500 flex items-center justify-center">
            <span className="text-white text-lg font-semibold">Sem imagem</span>
          </div>
        )}

        <button 
          onClick={() => setExpandido(!expandido)} 
          className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-lg hover:bg-white transition-colors"
        >
          <ChevronDown 
            size={18} 
            className={`transition-transform duration-200 ${expandido ? 'rotate-180' : ''}`} 
          />
        </button>

        <div className="absolute top-3 left-3">
          <span className="inline-flex items-center px-3 py-1 bg-red-500 text-white text-xs font-semibold rounded-full">
            <Heart size={14} className="mr-1 fill-white" />
            FAVORITO
          </span>
        </div>
      </div>

      <div className="p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-3 line-clamp-2">
          {evento.titulo}
        </h3>

        <div className="flex flex-wrap gap-2 mb-4">
          <span className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
            <Calendar className="w-4 h-4 mr-1" />
            {formatarData(evento.data_evento)}
          </span>
          
          <span className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
            <MapPin className="w-4 h-4 mr-1" />
            {formatarEndereco(evento.endereco)}
          </span>
        </div>

        {/* Mostrar categorias */}
        {evento.categorias && evento.categorias.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {evento.categorias.slice(0, 2).map((cat, idx) => (
              <span key={idx} className="inline-flex items-center px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                {cat}
              </span>
            ))}
            {evento.categorias.length > 2 && (
              <span className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                +{evento.categorias.length - 2}
              </span>
            )}
          </div>
        )}

        {expandido && (
          <div className="mt-4 pt-4 border-t border-gray-200 space-y-3">
            <button 
              onClick={() => navigate(`/evento/${evento.id}`)}
              className="flex items-center justify-center gap-2 w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors"
            >
              <Eye size={18} />
              Ver Evento
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// Componente para eventos criados por mim
function EventCardCriado({ evento }) {
  const navigate = useNavigate()
  const [expandido, setExpandido] = useState(false)

  const formatarData = (data) => {
    if (!data) return 'Data não disponível';
    const date = new Date(data);
    if (isNaN(date.getTime())) return 'Data inválida';
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }).replace('.', '').toUpperCase();
  }

  const formatarEndereco = (endereco) => {
    return endereco && endereco.length > 20 ? endereco.substring(0, 20) + '...' : endereco
  }

  const isFuturo = new Date(evento.data_evento) > new Date()

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 h-fit">
      <div className="relative h-48 overflow-hidden">
        {evento.foto_capa ? (
          <img 
            src={evento.foto_capa} 
            alt={evento.titulo} 
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-purple-400 to-indigo-500 flex items-center justify-center">
            <span className="text-white text-lg font-semibold">Sem imagem</span>
          </div>
        )}

        <button 
          onClick={() => setExpandido(!expandido)} 
          className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-lg hover:bg-white transition-colors"
        >
          <ChevronDown 
            size={18} 
            className={`transition-transform duration-200 ${expandido ? 'rotate-180' : ''}`} 
          />
        </button>

        <div className="absolute top-3 left-3">
          <span className="inline-flex items-center px-3 py-1 bg-purple-600 text-white text-xs font-semibold rounded-full">
            <Ticket size={14} className="mr-1" />
            ORGANIZADOR
          </span>
        </div>
      </div>

      <div className="p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-3 line-clamp-2">
          {evento.titulo}
        </h3>

        <div className="flex flex-wrap gap-2 mb-4">
          <span className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
            <Calendar className="w-4 h-4 mr-1" />
            {formatarData(evento.data_evento)}
          </span>
          
          <span className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
            <MapPin className="w-4 h-4 mr-1" />
            {formatarEndereco(evento.endereco)}
          </span>
        </div>

        {/* Mostrar status */}
        {evento.status && (
          <div className="mb-4">
            <span className={`inline-flex items-center px-3 py-1 text-xs font-medium rounded-full ${
              evento.status === 'publicado' ? 'bg-green-100 text-green-700' :
              evento.status === 'rascunho' ? 'bg-yellow-100 text-yellow-700' :
              evento.status === 'cancelado' ? 'bg-red-100 text-red-700' :
              'bg-gray-100 text-gray-700'
            }`}>
              {evento.status.toUpperCase()}
            </span>
          </div>
        )}

        {expandido && (
          <div className="mt-4 pt-4 border-t border-gray-200 space-y-3">
            <button 
              onClick={() => navigate(`/gerenciar/editar/${evento.id}`)}
              className="flex items-center justify-center gap-2 w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Edit size={18} />
              Editar Evento
            </button>
            
            <button 
              onClick={() => navigate(`/evento/${evento.id}`)}
              className="flex items-center justify-center gap-2 w-full bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors"
            >
              <Eye size={18} />
              Ver Evento
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
