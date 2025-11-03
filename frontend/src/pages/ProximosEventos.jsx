import { useState, useEffect } from 'react'
import { Calendar, MapPin, ChevronDown, QrCode, Eye, Send, X } from 'lucide-react'
import api from '../api'
import Modal from '../components/Modal'
import Header from '../components/Header'

function ProximosEventos() {
  const [inscricoes, setInscricoes] = useState([])
  const [loading, setLoading] = useState(true)
  const [openModal, setOpenModal] = useState(false)
  const [user, setUser] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        const [userRes, inscricoesRes] = await Promise.allSettled([
          api.get("/api/user/me/"),
          api.get('/api/inscricoes/minhas/')
        ]);

        if (userRes.status === 'fulfilled') {
          setUser(userRes.value.data);
        }

        if (inscricoesRes.status === 'fulfilled') {
          const eventosFuturos = inscricoesRes.value.data.filter(i => 
            new Date(i.evento_data) > new Date()
          );
          setInscricoes(eventosFuturos);
        } else {
          setInscricoes([]);
        }
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [])

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando eventos...</p>
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
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Meus Eventos</h1>
          <h2 className="text-xl md:text-2xl font-semibold text-gray-700">Próximos</h2>
          <div className="mt-4 h-px bg-gray-200"></div>
        </div>

        {inscricoes.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📅</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Nenhum evento próximo</h3>
            <p className="text-gray-500">Quando você se inscrever em eventos futuros, eles aparecerão aqui.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
            {inscricoes.map(inscricao => (
              <EventCard key={inscricao.id} inscricao={inscricao} />
            ))}
          </div>
        )}
      </div>
    </main>
  )
}

function EventCard({ inscricao }) {
  const [expandido, setExpandido] = useState(false)
  const [countdown, setCountdown] = useState('')

  // Countdown timer
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
    const intervalo = setInterval(calcularCountdown, 60000) // Atualiza a cada minuto

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
          <span className="inline-flex items-center px-3 py-1 bg-green-500 text-white text-xs font-semibold rounded-full">
            INSCRITO
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
          <span className="inline-flex items-center px-3 py-2 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg font-medium text-sm">
            ⏰ {countdown}
          </span>
        </div>

        {expandido && (
          <div className="mt-4 pt-4 border-t border-gray-100 space-y-2 animate-in slide-in-from-top duration-200">
            <button className="w-full text-left px-4 py-3 hover:bg-gray-50 rounded-lg flex items-center gap-3 text-sm font-medium transition-colors">
              <QrCode size={18} className="text-green-600" /> 
              QR Code Check-in
            </button>
            <button className="w-full text-left px-4 py-3 hover:bg-gray-50 rounded-lg flex items-center gap-3 text-sm font-medium transition-colors">
              <Eye size={18} className="text-blue-600" /> 
              Ver Detalhes
            </button>
            <button className="w-full text-left px-4 py-3 hover:bg-gray-50 rounded-lg flex items-center gap-3 text-sm font-medium transition-colors">
              <Send size={18} className="text-purple-600" /> 
              Transferir
            </button>
            <button className="w-full text-left px-4 py-3 hover:bg-red-50 text-red-600 rounded-lg flex items-center gap-3 text-sm font-medium transition-colors">
              <X size={18} /> 
              Cancelar Inscrição
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default ProximosEventos