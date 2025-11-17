import Header from "../components/Header";
import Busca from "../components/Busca";
import Filtro from "../components/Filtro";
import FiltrosAvancados from "../components/FiltrosAvancados";
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
  const [filtrosAvancados, setFiltrosAvancados] = useState({
    depositoLivre: false,
    proximosSete: false,
    dataInicio: '',
    dataFim: '',
    ordenacao: 'data'
  });
  const [openModal, setOpenModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const { favorites, setFavorites } = useContext(FavoritesContext);

  const carregarEventos = async () => {
    try {
      setLoading(true);

      // Construir query params
      const params = new URLSearchParams();

      if (filtroAtivo && filtroAtivo !== "Todos") {
        params.append('categoria', filtroAtivo);
      }

      if (filtrosAvancados.depositoLivre) {
        params.append('deposito_livre', 'true');
      }

      if (filtrosAvancados.proximosSete) {
        params.append('proximos', 'true');
      }

      if (filtrosAvancados.dataInicio) {
        params.append('data_inicio', filtrosAvancados.dataInicio);
      }

      if (filtrosAvancados.dataFim) {
        params.append('data_fim', filtrosAvancados.dataFim);
      }

      if (filtrosAvancados.ordenacao) {
        params.append('ordenacao', filtrosAvancados.ordenacao);
      }

      const eventosRes = await api.get(`/api/eventos/?${params.toString()}`);
      setEventos(eventosRes.data);
    } catch (error) {
      console.error("Erro ao carregar eventos:", error);
      setEventos([]);
    } finally {
      setLoading(false);
    }
  };

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
          const ids = favoritesRes.value.data.map(f => String(f.evento.id));
          setFavorites(ids);
        } else {
          setFavorites([]);
        }
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      }

      // Carregar eventos separadamente
      carregarEventos();
    };

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setFavorites]);

  // Recarregar eventos quando filtro de categoria mudar
  useEffect(() => {
    carregarEventos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtroAtivo]);

  const eventosFiltrados = eventos.filter(evento => {
    return !busca ||
           evento.titulo?.toLowerCase().includes(busca.toLowerCase()) ||
           evento.endereco?.toLowerCase().includes(busca.toLowerCase());
  });

  const handleAplicarFiltros = () => {
    carregarEventos();
  };

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
      <FiltrosAvancados
        filtrosAvancados={filtrosAvancados}
        setFiltrosAvancados={setFiltrosAvancados}
        onAplicarFiltros={handleAplicarFiltros}
      />
      <Eventos eventos={eventosFiltrados} />
    </main>
  );
}

export default Home;
