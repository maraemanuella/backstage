import { useState, useEffect, useContext } from "react";
import { FavoritesContext } from "../contexts/FavoritesContext";
import api from "../api.js";
import Eventos from "../components/Eventos";
import Header from "../components/Header.jsx";
import Modal from "../components/Modal";

function HeartPage() {
  const { favorites, setFavorites } = useContext(FavoritesContext);
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        const [userRes, favoritesRes] = await Promise.allSettled([
          api.get("/api/user/me/"),
          api.get("/api/favorites/")
        ]);

        if (userRes.status === 'fulfilled') {
          setUser(userRes.value.data);
        }

        if (favoritesRes.status === 'fulfilled') {
          // Extrai apenas os eventos
          const eventosFavoritos = favoritesRes.value.data.map((fav) => fav.evento);
          setEventos(eventosFavoritos);

          // Atualiza o contexto de favorites com os IDs
          setFavorites(eventosFavoritos.map((e) => String(e.id)));
        } else {
          setEventos([]);
        }
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
        setEventos([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [setFavorites]);

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando favoritos...</p>
        </div>
      </main>
    );
  }

  if (eventos.length === 0) {
    return (
      <main className="min-h-screen bg-gray-50">
        <Modal isOpen={openModal} setOpenModal={setOpenModal} user={user} />
        <Header user={user} setOpenModal={setOpenModal} />
        
        <div className="px-6 md:px-12 lg:px-24 py-8">
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Meus Eventos</h1>
            <h2 className="text-xl md:text-2xl font-semibold text-gray-700">Favoritos</h2>
            <div className="mt-4 h-px bg-gray-200"></div>
          </div>

          <div className="text-center py-16">
            <div className="text-6xl mb-4">💔</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Nenhum favorito ainda</h3>
            <p className="text-gray-500">Quando você favoritar eventos, eles aparecerão aqui.</p>
          </div>
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
          <h2 className="text-xl md:text-2xl font-semibold text-gray-700">Favoritos</h2>
          <p className="text-gray-600 mt-2">Veja seus eventos favoritos.</p>
          <div className="mt-4 h-px bg-gray-200"></div>
        </div>

        <Eventos
          eventos={eventos}
          favorites={favorites}
          setFavorites={setFavorites}
        />
      </div>
    </main>
  );
}

export default HeartPage;
