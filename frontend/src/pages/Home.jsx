import Header from "../components/Header";
import Busca from "../components/Busca";
import Filtro from "../components/Filtro";
import FiltrosAvancados from "../components/FiltrosAvancados";
import Eventos from "../components/Eventos";
import Modal from "../components/Modal";
import CompleteProfileModal from "../components/CompleteProfileModal";
import { useContext, useEffect, useState } from "react";
import api from "../api.js";
import { FavoritesContext } from "../contexts/FavoritesContext";
import { useProfile } from "../contexts/ProfileContext";

function Home() {
  const { user, isProfileComplete, refreshUser, loading: profileLoading } = useProfile();
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
  const [showCompleteProfileModal, setShowCompleteProfileModal] = useState(false);
  const [loadingEventos, setLoadingEventos] = useState(true);
  const { setFavorites } = useContext(FavoritesContext);

  const carregarEventos = async () => {
    try {
      setLoadingEventos(true);

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
      setLoadingEventos(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingEventos(true);

        const favoritesRes = await api.get("/api/favorites/").catch(() => null);

        if (favoritesRes) {
          const ids = favoritesRes.data.map(f => String(f.evento.id));
          setFavorites(ids);
        } else {
          setFavorites([]);
        }
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
        setFavorites([]);
      }

      // Carregar eventos separadamente
      carregarEventos();
    };

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setFavorites]);

  // Verificar se precisa mostrar o modal de completar perfil
  useEffect(() => {
    console.log('Home - useEffect modal:', { user, isProfileComplete });
    if (user && !isProfileComplete) {
      console.log('Home - Mostrando modal de completar perfil');
      setShowCompleteProfileModal(true);
    } else {
      console.log('Home - Escondendo modal de completar perfil');
      setShowCompleteProfileModal(false);
    }
  }, [user, isProfileComplete]);

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

  // Mostrar loading apenas se o perfil ainda está carregando
  if (profileLoading) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <Modal isOpen={openModal} setOpenModal={setOpenModal} user={user} />
      <CompleteProfileModal
        user={user}
        isOpen={showCompleteProfileModal}
        onComplete={() => {
          refreshUser();
          setShowCompleteProfileModal(false);
        }}
      />
      <Header user={user} setOpenModal={setOpenModal} />
      <Busca busca={busca} setBusca={setBusca} />
      <Filtro filtroAtivo={filtroAtivo} setFiltroAtivo={setFiltroAtivo} />
      <FiltrosAvancados
        filtrosAvancados={filtrosAvancados}
        setFiltrosAvancados={setFiltrosAvancados}
        onAplicarFiltros={handleAplicarFiltros}
      />
      {loadingEventos ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando eventos...</p>
          </div>
        </div>
      ) : (
        <Eventos eventos={eventosFiltrados} />
      )}
    </main>
  );
}

export default Home;
