import { useState, useEffect } from 'react'
import { Calendar, MapPin, ChevronDown, QrCode, Eye, Send, X } from 'lucide-react'
import api from '../api'
import Modal from '../components/Modal'
import MeuEvento from '../components/MeuEvento'

function ProximosEventos() {
  const [inscricoes, setInscricoes] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalAberto, setModalAberto] = useState(false)
  const [user, setUser] = useState(null)

  useEffect(() => {
    const fetchEventos = async () => {
      try {
        const response = await api.get('/api/inscricoes/minhas/')
        const eventosFuturos = response.data.filter(i => 
          new Date(i.evento_data) > new Date()
        )
        setInscricoes(eventosFuturos)
      } catch (error) {
        console.error('Erro ao buscar eventos:', error)
      } finally {
        setLoading(false)
      }
    }

    const fetchUser = async () => {
      try {
        const response = await api.get('/api/user/me/')
        setUser(response.data)
      } catch (error) {
        console.error('Erro ao buscar usuário:', error)
      }
    }

    fetchEventos()
    fetchUser()
  }, [])

  if (loading) return <div className="p-8">Carregando...</div>

  return (
    <div className="flex h-screen">
      <aside className="w-[293px] bg-white border-r border-gray-300 shadow-lg flex flex-col">
        <div className="p-6">
          <h1 className="text-[27px] font-script">BACKSTAGE</h1>
        </div>
        <nav className="px-4 flex-1">
          <MeuEvento />
        </nav>
      </aside>

      <main className="flex-1 overflow-auto bg-white">
        <div className="px-8 pt-8 pb-4">
          <h1 className="text-[34px] font-semibold">Meus Eventos</h1>
          <hr className="mt-4 border-black/20" />
        </div>

        <div className="px-8 pt-6 pb-8">
          <h2 className="text-[24px] font-semibold text-black/80 mb-6">Próximos</h2>

          {inscricoes.length === 0 ? (
            <p className="text-gray-500">Nenhum evento próximo</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 max-w-7xl">
              {inscricoes.map(inscricao => (
                <EventCard key={inscricao.id} inscricao={inscricao} />
              ))}
            </div>
          )}
        </div>
      </main>

      <Modal isOpen={modalAberto} setOpenModal={setModalAberto} user={user} />
    </div>
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

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
      <div className="h-48 relative bg-gray-200">
        {inscricao.evento_foto_capa ? (
          <img 
            src={inscricao.evento_foto_capa}
            alt={inscricao.evento_titulo}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-purple-400 to-blue-500" />
        )}

        <button
          onClick={() => setExpandido(!expandido)}
          className="absolute top-3 left-3 bg-white rounded-full p-1.5 shadow-md hover:bg-gray-100"
        >
          <ChevronDown 
            size={18} 
            className={`transition-transform ${expandido ? 'rotate-180' : ''}`}
          />
        </button>
      </div>

      <div className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <h3 className="text-base font-semibold">{inscricao.evento_titulo}</h3>
          <span className="px-3 py-1 bg-white text-green-600 text-xs font-semibold rounded-full border border-green-600 whitespace-nowrap">
            INSCRITO
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-sm mb-3">
          <span className="px-3 py-1 bg-white border border-black rounded-full">
            {new Date(inscricao.evento_data).toLocaleDateString('pt-BR', {
              day: '2-digit',
              month: 'short'
            }).replace('.', '').toUpperCase()}
          </span>
          
          <span className="px-3 py-1 bg-white border border-black rounded-full truncate flex-1">
            {inscricao.evento_endereco}
          </span>
          
          <span className="px-3 py-1 bg-blue-50 text-blue-700 border border-blue-600 rounded-full font-medium">
            {countdown}
          </span>
        </div>

        {expandido && (
          <div className="mt-4 pt-4 border-t space-y-2">
            <button className="w-full text-left px-3 py-2 hover:bg-gray-50 rounded-lg flex items-center gap-2 text-sm">
              <QrCode size={16} /> QR Code Check-in
            </button>
            <button className="w-full text-left px-3 py-2 hover:bg-gray-50 rounded-lg flex items-center gap-2 text-sm">
              <Eye size={16} /> Ver Detalhes
            </button>
            <button className="w-full text-left px-3 py-2 hover:bg-gray-50 rounded-lg flex items-center gap-2 text-sm">
              <Send size={16} /> Transferir
            </button>
            <button className="w-full text-left px-3 py-2 hover:bg-red-50 text-red-600 rounded-lg flex items-center gap-2 text-sm">
              <X size={16} /> Cancelar Inscrição
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default ProximosEventos