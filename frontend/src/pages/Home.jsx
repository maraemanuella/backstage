import Header from "../components/Header";
import Busca from "../components/Busca";
import Filtro from "../components/Filtro";
import Eventos from "../components/Eventos";
import Score from "../components/Score";
import Modal from "../components/Modal";
import { useContext, useEffect, useState } from "react";
import api from "../api.js";
import { FavoritesContext } from "../contexts/FavoritesContext";

function Home() {
  const [user, setUser] = useState(null);
  const [eventos, setEventos] = useState([]);
  const [busca, setBusca] = useState("");
  const [filtroAtivo, setFiltroAtivo] = useState("Todos");
  const [openModal, setOpenModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const { favorites, setFavorites } = useContext(FavoritesContext);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        const [userRes, eventosRes, favoritesRes] = await Promise.allSettled([
          api.get("/api/user/me/"),
          api.get("/api/eventos/"),
          api.get("/api/favorites/")
        ]);

        if (userRes.status === 'fulfilled') {
          setUser(userRes.value.data);
        }

        if (eventosRes.status === 'fulfilled') {
          setEventos(eventosRes.value.data);
        } else {
          setEventos([]);
        }

        if (favoritesRes.status === 'fulfilled') {
          const ids = favoritesRes.value.data.map(f => String(f.evento.id));
          setFavorites(ids);
        } else {
          setFavorites([]);
        }
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [setFavorites]);

  const eventosFiltrados = eventos.filter(evento => {
    const filtroTipo = filtroAtivo.toLowerCase() === "todos" || 
                       evento.categoria?.toLowerCase() === filtroAtivo.toLowerCase();
    
    const filtroBusca = !busca || 
                        evento.titulo?.toLowerCase().includes(busca.toLowerCase()) ||
                        evento.endereco?.toLowerCase().includes(busca.toLowerCase());

    return filtroTipo && filtroBusca;
  });

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
      <Busca busca={busca} setBusca={setBusca} />
      <Score user={user} />
      <Filtro filtroAtivo={filtroAtivo} setFiltroAtivo={setFiltroAtivo} />
      <Eventos eventos={eventosFiltrados} />
    </main>
  );
}

export default Home;
