import { useState, useEffect } from 'react'
import { Calendar, MapPin, ChevronDown, Eye, Award, Download } from 'lucide-react'
import api from '../api'
import Modal from '../components/Modal'
import MeuEvento from '../components/MeuEvento'

export default function EventosPassados() {
  const [inscricoes, setInscricoes] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalAberto, setModalAberto] = useState(false)
  const [user, setUser] = useState(null)

  const fetchEventos = async () => {
    setLoading(true)
    try {
      const response = await api.get('/api/inscricoes/minhas/')
      const eventosPassados = response.data.filter(i => new Date(i.evento_data) < new Date())
      setInscricoes(eventosPassados)
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

  useEffect(() => {
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
        {user && (
          <div className="p-4 border-t">
            <div className="flex items-center gap-3">
              <img src={user.profile_photo || '/default-avatar.png'} alt="Profile" className="w-10 h-10 rounded-full" />
              <div className="flex-1">
                <p className="text-sm font-semibold">{user.username}</p>
                <p className="text-xs text-gray-600">{user.email}</p>
              </div>
            </div>
          </div>
        )}
      </aside>

      <main className="flex-1 overflow-auto bg-white p-8">
        <div className="flex justify-between items-center mb-6 border-b border-gray-300 pb-4">
            <h1 className="text-[34px] font-semibold">Meus Eventos</h1>
            <button
                onClick={fetchEventos}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
                Atualizar
             </button>
        </div>

  <h2 className="text-[24px] font-semibold text-black/80 mb-6">Passados</h2>


        {inscricoes.length === 0 ? (
          <p className="text-gray-500">Nenhum evento passado</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 max-w-7xl">
            {inscricoes.map(inscricao => (
              <EventCard key={inscricao.id} inscricao={inscricao} />
            ))}
          </div>
        )}
      </main>

      <Modal isOpen={modalAberto} setOpenModal={setModalAberto} user={user} />
    </div>
  )
}

function EventCard({ inscricao }) {
  const [expandido, setExpandido] = useState(false)

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
      {/* Imagem */}
      <div className="h-48 relative bg-gray-200">
        {inscricao.evento_foto_capa ? (
          <img src={inscricao.evento_foto_capa} alt={inscricao.evento_titulo} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-purple-400 to-blue-500" />
        )}

        <button onClick={() => setExpandido(!expandido)} className="absolute top-3 left-3 bg-white rounded-full p-1.5 shadow-md hover:bg-gray-100">
          <ChevronDown size={18} className={`transition-transform ${expandido ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Conteúdo */}
      <div className="p-4">
        {/* Título*/}
        <div className="flex items-center gap-2 mb-3">
          <h3 className="text-base font-semibold">{inscricao.evento_titulo}</h3>
          <span className="px-3 py-1 bg-white text-red-600 text-xs font-semibold rounded-full border border-red-600 whitespace-nowrap">
            EVENTO ENCERRADO
          </span>
        </div>

        {/* Info em linha horizontal */}
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="px-3 py-1 bg-white border border-black rounded-full">
            {new Date(inscricao.evento_data).toLocaleDateString('pt-BR', {
              day: '2-digit',
              month: 'short'
            }).replace('.', '').toUpperCase()}
          </span>
          
          <span className="px-3 py-1 bg-white border border-black rounded-full truncate flex-1">
            {inscricao.evento_endereco}
          </span>
          
          <span className={`px-3 py-1 rounded-full font-medium border ${
            inscricao.checkin_realizado
              ? 'bg-green-50 text-green-700 border-green-600'
              : 'bg-red-50 text-red-700 border-red-600'
          }`}>
            {inscricao.checkin_realizado ? 'Reembolsado' : 'Não reembolsado'}
          </span>
        </div>

        {expandido && (
          <div className="mt-4 pt-4 border-t space-y-2">
            <button className="w-full text-left px-3 py-2 hover:bg-gray-50 rounded-lg flex items-center gap-2 text-sm">
              <Eye size={16} /> Ver Detalhes
            </button>
            <button className="w-full text-left px-3 py-2 hover:bg-gray-50 rounded-lg flex items-center gap-2 text-sm">
              <Award size={16} /> Avaliar
            </button>
            <button className="w-full text-left px-3 py-2 hover:bg-gray-50 rounded-lg flex items-center gap-2 text-sm">
              <Download size={16} /> Certificado
            </button>
          </div>
        )}
      </div>
    </div>
  )
}