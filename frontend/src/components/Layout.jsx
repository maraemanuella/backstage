import { useState, useEffect } from 'react'
import Modal from './Modal'
import MeuEvento from './MeuEvento'
import api from '../api'

function Layout({ children }) {
  const [modalAberto, setModalAberto] = useState(false)
  const [user, setUser] = useState(null)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await api.get('/user/me/')
        setUser(response.data)
      } catch (error) {
        console.error('Erro ao buscar usuário:', error)
      }
    }
    fetchUser()
  }, [])

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className="w-[293px] bg-white border-r border-gray-300 shadow-lg">
        <div className="p-6">
          <h1 className="text-2xl font-bold">BACKSTAGE</h1>
        </div>
        
        <nav className="px-4">
          <MeuEvento />
          {/* Outros itens do menu */}
        </nav>
      </aside>

      {/* Conteúdo principal */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>

      <Modal isOpen={modalAberto} setOpenModal={setModalAberto} user={user} />
    </div>
  )
}

export default Layout